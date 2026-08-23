import { createError, defineEventHandler, readBody, getRequestHeaders } from 'h3'
import { useDb } from '../utils/db'
import { emailRegex } from '~~/shared/utils/validation'
import { LIMITS, RATE_LIMITS } from '~~/shared/utils/limits'
import { checkRateLimit, getClientIp, maybeCleanupRateLimits } from '../utils/rateLimit'

interface ContactBody {
  name?: string
  email?: string
  message?: string
}

export default defineEventHandler(async (event) => {
  const db = useDb(event)

  // ── Rate limiting (per IP) ────────────────────────────────────
  const headers = getRequestHeaders(event)
  const ip = getClientIp(headers)
  const rl = await checkRateLimit(db, `contact:${ip}`, 'contact', RATE_LIMITS.contact.maxAttempts, RATE_LIMITS.contact.windowMs)
  if (rl.limited) {
    throw createError({
      statusCode: 429,
      statusMessage: `Preveliki broj pokušaja. Pokušajte ponovo za ${Math.ceil(rl.retryAfterSec / 60)} minuta.`,
    })
  }
  await maybeCleanupRateLimits(db)

  const body = await readBody<ContactBody>(event)

  const name = body?.name?.trim()
  const email = body?.email?.trim().toLowerCase()
  const message = body?.message?.trim()

  if (!name || name.length > LIMITS.name) {
    throw createError({ statusCode: 400, statusMessage: 'Ime je obavezno.' })
  }

  if (!email || !emailRegex.test(email) || email.length > LIMITS.email) {
    throw createError({ statusCode: 400, statusMessage: 'Ispravna adresa e-pošte je obavezna.' })
  }

  if (!message) {
    throw createError({ statusCode: 400, statusMessage: 'Poruka je obavezna.' })
  }

  if (message.length < 10) {
    throw createError({ statusCode: 400, statusMessage: 'Poruka je prekratka (minimum 10 karaktera).' })
  }
  if (message.length > LIMITS.message) {
    throw createError({ statusCode: 400, statusMessage: 'Poruka je preduga (maksimum 5000 karaktera).' })
  }

  await db
    .prepare('INSERT INTO contact_messages (name, email, message) VALUES (?, ?, ?)')
    .bind(name, email, message)
    .run()

  console.log(`[contact] From: ${name} <${email}>`)

  return { ok: true, message: 'Hvala na poruci! Javićemo se uskoro.' }
})
