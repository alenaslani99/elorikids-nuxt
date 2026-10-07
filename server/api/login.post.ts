import { createError, defineEventHandler, readBody, getRequestHeaders } from 'h3'
import { useDb } from '../utils/db'
import { verifyPassword } from '../utils/crypto'
import { createSession } from '../utils/session'
import { isOwnerEmail } from '../utils/admin'
import { emailRegex } from '~~/shared/utils/validation'
import { LIMITS, RATE_LIMITS } from '~~/shared/utils/limits'
import { checkRateLimit, getClientIp, maybeCleanupRateLimits } from '../utils/rateLimit'

interface LoginBody {
  email?: string
  password?: string
}

export default defineEventHandler(async (event) => {
  const db = useDb(event)

  // ── Rate limiting (per email + IP) ────────────────────────────
  const headers = getRequestHeaders(event)
  const ip = getClientIp(headers)

  const body = await readBody<LoginBody>(event)
  const email = body?.email?.trim().toLowerCase()
  const password = body?.password

  const rlId = `login:${email ?? 'unknown'}:${ip}`
  const rl = await checkRateLimit(db, rlId, 'login', RATE_LIMITS.login.maxAttempts, RATE_LIMITS.login.windowMs)
  if (rl.limited) {
    throw createError({
      statusCode: 429,
      statusMessage: `Preveliki broj pokušaja. Pokušajte ponovo za ${Math.ceil(rl.retryAfterSec / 60)} minuta.`,
    })
  }
  // Per-email cap across all IPs, so rotating IPs can't brute-force one account.
  if (email) {
    const rlEmail = await checkRateLimit(db, `login-email:${email}`, 'login', RATE_LIMITS.loginEmail.maxAttempts, RATE_LIMITS.loginEmail.windowMs)
    if (rlEmail.limited) {
      throw createError({
        statusCode: 429,
        statusMessage: `Preveliki broj pokušaja. Pokušajte ponovo za ${Math.ceil(rlEmail.retryAfterSec / 60)} minuta.`,
      })
    }
  }
  await maybeCleanupRateLimits(db)

  if (!email || !emailRegex.test(email) || email.length > LIMITS.email) {
    throw createError({ statusCode: 400, statusMessage: 'Ispravna adresa e-pošte je obavezna.' })
  }
  if (!password || password.length < 6 || password.length > LIMITS.password) {
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
