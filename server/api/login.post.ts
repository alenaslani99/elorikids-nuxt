import { createError, defineEventHandler, readBody } from 'h3'
import { useDb } from '../utils/db'
import { verifyPassword } from '../utils/crypto'
import { createSession } from '../utils/session'
import { isOwnerEmail } from '../utils/admin'
import { emailRegex } from '~~/shared/utils/validation'

interface LoginBody {
  email?: string
  password?: string
}

export default defineEventHandler(async (event) => {
  const db = useDb(event)
  const body = await readBody<LoginBody>(event)

  const email = body?.email?.trim().toLowerCase()
  const password = body?.password

  if (!email || !emailRegex.test(email)) {
    throw createError({ statusCode: 400, statusMessage: 'Ispravna adresa e-pošte je obavezna.' })
  }
  if (!password || password.length < 6) {
    throw createError({ statusCode: 400, statusMessage: 'Lozinka mora imati najmanje 6 karaktera.' })
  }

  const user = await db
    .prepare('SELECT id, name, email, password_hash FROM users WHERE email = ?')
    .bind(email)
    .first<{ id: number, name: string, email: string, password_hash: string }>()

  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Neispravan email ili lozinka.' })
  }

  const valid = await verifyPassword(password, user.password_hash)
  if (!valid) {
    throw createError({ statusCode: 401, statusMessage: 'Neispravan email ili lozinka.' })
  }

  await createSession(event, db, user.id)

  console.log(`[login] #${user.id} ${user.name} <${user.email}>`)

  return {
    ok: true,
    user: {
      name: user.name,
      email: user.email,
      isOwner: isOwnerEmail(event, user.email),
    },
  }
})
