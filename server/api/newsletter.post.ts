import { createError, defineEventHandler, readBody, getRequestHeaders } from 'h3'
import { useDb } from '../utils/db'
import { emailRegex } from '~~/shared/utils/validation'
import { LIMITS, RATE_LIMITS } from '~~/shared/utils/limits'
import { checkRateLimit, getClientIp, maybeCleanupRateLimits } from '../utils/rateLimit'

interface NewsletterBody {
  email?: string
}

export default defineEventHandler(async (event) => {
  const db = useDb(event)

  // ── Rate limiting (per IP) ────────────────────────────────────
  const headers = getRequestHeaders(event)
  const ip = getClientIp(headers)
  const rl = await checkRateLimit(db, `newsletter:${ip}`, 'newsletter', RATE_LIMITS.newsletter.maxAttempts, RATE_LIMITS.newsletter.windowMs)
  if (rl.limited) {
    throw createError({
      statusCode: 429,
      statusMessage: `Preveliki broj pokušaja. Pokušajte ponovo za ${Math.ceil(rl.retryAfterSec / 60)} minuta.`,
    })
  }
  await maybeCleanupRateLimits(db)

  const body = await readBody<NewsletterBody>(event)
  const email = body?.email?.trim().toLowerCase()

  if (!email) {
    throw createError({ statusCode: 400, statusMessage: 'Adresa e-pošte je obavezna.' })
  }

  if (!emailRegex.test(email) || email.length > LIMITS.email) {
    throw createError({ statusCode: 400, statusMessage: 'Neispravna adresa e-pošte.' })
  }

  // Insert OR IGNORE - duplicate emails are silently accepted (idempotent)
  await db
    .prepare('INSERT OR IGNORE INTO newsletter_subscribers (email) VALUES (?)')
    .bind(email)
    .run()

  console.log(`[newsletter] New subscription: ${email}`)

  // ── Send thank-you email (no double opt-in, just a welcome) ──────
  // Email is best-effort: a failure must never block the subscription
  // or surface to the user. We log it so we notice in production.
  try {
    const { sendEmail, buildNewsletterMail } = await import('../utils/mail')
    const { subject, html, text } = buildNewsletterMail({ email })
    await sendEmail(event, email, subject, html, { text })
    console.log(`[newsletter] Welcome email sent to ${email}`)
  } catch (err) {
    console.error(`[newsletter] Failed to send welcome email to ${email}:`, err)
  }

  return { ok: true, message: 'Hvala na prijavi! 📚' }
})
