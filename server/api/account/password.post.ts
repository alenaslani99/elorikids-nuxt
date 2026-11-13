import { createError, defineEventHandler, readBody } from 'h3'
import { useDb } from '../../utils/db'
import { hashPassword, verifyPassword } from '../../utils/crypto'
import { createSession, getSessionUser } from '../../utils/session'
import { passwordRegex } from '~~/shared/utils/validation'
import { LIMITS, RATE_LIMITS } from '~~/shared/utils/limits'
import { checkRateLimit, maybeCleanupRateLimits } from '../../utils/rateLimit'

interface PasswordBody {
  currentPassword?: string
  newPassword?: string
}

/**
 * Change the password of the logged-in user.
 *
 * Safety measures:
 *  - Requires a valid session AND the current password. The session
 *    cookie alone is not enough, so a stolen session, an unattended
 *    device or a forged cross-site request cannot change the password.
 *  - Rate limited per user, so the current password can't be guessed
 *    through this endpoint (logging in again does not reset the limit).
 *  - The new password follows the same policy as registration.
 *  - Every session of the user is revoked in the same transaction as the
 *    hash update; this device then gets a fresh session. Anyone else who
 *    was logged in (e.g. an attacker) is logged out.
 *  - The account owner is notified by email.
 *  - Passwords are never logged or returned.
 */
export default defineEventHandler(async (event) => {
  const db = useDb(event)

  const sessionUser = await getSessionUser(event, db)
  if (!sessionUser) {
    throw createError({ statusCode: 401, statusMessage: 'Morate biti prijavljeni.' })
  }

  const rl = await checkRateLimit(
    db, `password:user:${sessionUser.id}`, 'password',
    RATE_LIMITS.passwordChange.maxAttempts, RATE_LIMITS.passwordChange.windowMs,
  )
  if (rl.limited) {
    throw createError({
      statusCode: 429,
      statusMessage: `Preveliki broj pokušaja. Pokušajte ponovo za ${Math.ceil(rl.retryAfterSec / 60)} minuta.`,
    })
  }
  await maybeCleanupRateLimits(db)

  const body = await readBody<PasswordBody>(event)
  const currentPassword = body?.currentPassword
  const newPassword = body?.newPassword

  if (typeof currentPassword !== 'string' || !currentPassword || currentPassword.length > LIMITS.password) {
    throw createError({ statusCode: 400, statusMessage: 'Unesite trenutnu lozinku.' })
  }
  if (typeof newPassword !== 'string' || !passwordRegex.test(newPassword) || newPassword.length > LIMITS.password) {
    throw createError({ statusCode: 400, statusMessage: 'Nova lozinka mora imati najmanje 8 karaktera i sadržati bar jednu cifru.' })
  }
  if (newPassword === currentPassword) {
    throw createError({ statusCode: 400, statusMessage: 'Nova lozinka mora biti različita od trenutne.' })
  }

  const row = await db
    .prepare('SELECT password_hash FROM users WHERE id = ?')
    .bind(sessionUser.id)
    .first<{ password_hash: string }>()

  // 400 (not 401): the session is fine, only the typed password is wrong
  if (!row || !(await verifyPassword(currentPassword, row.password_hash))) {
    throw createError({ statusCode: 400, statusMessage: 'Trenutna lozinka nije ispravna.' })
  }

  const passwordHash = await hashPassword(newPassword)

  // Atomic: new hash + revoke every session of this user
  await db.batch([
    db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').bind(passwordHash, sessionUser.id),
    db.prepare('DELETE FROM sessions WHERE user_id = ?').bind(sessionUser.id),
  ])

  // Keep this device logged in with a brand-new session token
  await createSession(event, db, sessionUser.id)

  console.log(`[account/password] #${sessionUser.id} <${sessionUser.email}> changed password`)

  // Best-effort notice - a mail failure must not undo the change
  try {
    const { sendEmail, buildPasswordChangedMail } = await import('../../utils/mail')
    const { subject, html, text } = buildPasswordChangedMail({ name: sessionUser.name })
    await sendEmail(event, sessionUser.email, subject, html, { text })
  }
  catch (err) {
    console.error(`[account/password] Failed to send notice to ${sessionUser.email}:`, err)
  }

  return { ok: true }
})
