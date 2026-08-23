import { createError, defineEventHandler, readBody, getRequestHeaders } from 'h3'
import { useDb } from '../utils/db'
import { hashPassword } from '../utils/crypto'
import { createSession } from '../utils/session'
import { isOwnerEmail } from '../utils/admin'
import { emailRegex, nameRegex } from '~~/shared/utils/validation'
import { LIMITS, RATE_LIMITS } from '~~/shared/utils/limits'
import { checkRateLimit, getClientIp, maybeCleanupRateLimits } from '../utils/rateLimit'

interface RegisterBody {
  name?: string
  email?: string
  password?: string
}

export default defineEventHandler(async (event) => {
  const db = useDb(event)

  // ── Rate limiting (per IP) ────────────────────────────────────
  const headers = getRequestHeaders(event)
  const ip = getClientIp(headers)
  const rl = await checkRateLimit(db, `register:${ip}`, 'register', RATE_LIMITS.register.maxAttempts, RATE_LIMITS.register.windowMs)
  if (rl.limited) {
    throw createError({
      statusCode: 429,
      statusMessage: `Preveliki broj pokušaja. Pokušajte ponovo za ${Math.ceil(rl.retryAfterSec / 60)} minuta.`,
    })
  }
  await maybeCleanupRateLimits(db)

  const body = await readBody<RegisterBody>(event)

  const name = body?.name?.trim()
  const email = body?.email?.trim().toLowerCase()
  const password = body?.password

  if (!name || !nameRegex.test(name) || name.length > LIMITS.name) {
    throw createError({ statusCode: 400, statusMessage: 'Ime i prezime je obavezno.' })
  }
  if (!email || !emailRegex.test(email) || email.length > LIMITS.email) {
    throw createError({ statusCode: 400, statusMessage: 'Ispravna adresa e-pošte je obavezna.' })
  }
  if (!password || password.length < 6 || password.length > LIMITS.password) {
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
