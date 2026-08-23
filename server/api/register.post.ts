import { createError, defineEventHandler, readBody } from 'h3'
import { useDb } from '../utils/db'
import { hashPassword } from '../utils/crypto'
import { createSession } from '../utils/session'
import { isOwnerEmail } from '../utils/admin'

interface RegisterBody {
  name?: string
  email?: string
  password?: string
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default defineEventHandler(async (event) => {
  const db = useDb(event)
  const body = await readBody<RegisterBody>(event)

  const name = body?.name?.trim()
  const email = body?.email?.trim().toLowerCase()
  const password = body?.password

  if (!name) {
    throw createError({ statusCode: 400, statusMessage: 'Ime i prezime je obavezno.' })
  }
  if (!email || !emailRegex.test(email)) {
    throw createError({ statusCode: 400, statusMessage: 'Ispravna adresa e-pošte je obavezna.' })
  }
  if (!password || password.length < 6) {
    throw createError({ statusCode: 400, statusMessage: 'Lozinka mora imati najmanje 6 karaktera.' })
  }

  // Check if email already exists
  const existing = await db
    .prepare('SELECT id FROM users WHERE email = ?')
    .bind(email)
    .first<{ id: number }>()

  if (existing) {
    throw createError({ statusCode: 409, statusMessage: 'Nalog sa ovom adresom e-pošte već postoji.' })
  }

  const passwordHash = await hashPassword(password)

  const result = await db
    .prepare('INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)')
    .bind(name, email, passwordHash)
    .run()

  const userId = result.meta.last_row_id as number

  // Create session (sets httpOnly cookie)
  await createSession(event, db, userId)

  console.log(`[register] #${userId} ${name} <${email}>`)

  return {
    ok: true,
    user: {
      name,
      email,
      isOwner: isOwnerEmail(event, email),
    },
  }
})
