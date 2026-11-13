/**
 * Admin authorization helpers.
 *
 * The owner is the user whose `users.role` is 'owner' (set by hand in
 * the database - there is no way to gain it through the site). Admin
 * routes require two layers:
 *
 *   1. requireOwner()    - valid session + role 'owner'
 *   2. requireElevated() - owner + a Google sign-in within the last hour
 *
 * Elevation is stored as `elevated_until` on the session row. It is set
 * only by the Google sign-in callback, so a stolen session cookie alone
 * cannot open the admin panel once the hour has passed. It is revoked
 * on logout / lock / session expiry.
 */
import type { D1Database } from '@cloudflare/workers-types'
import type { H3Event } from 'h3'
import { getSessionUser, getSessionTokenHash, type SessionUser } from './session'

/**
 * Require a valid session with the owner role.
 * Throws 401 if not logged in, 403 if not the owner.
 */
export async function requireOwner(event: H3Event, db: D1Database): Promise<SessionUser> {
  const user = await getSessionUser(event, db)
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Morate biti prijavljeni.' })
  }
  if (user.role !== 'owner') {
    throw createError({ statusCode: 403, statusMessage: 'Pristup odbijen.' })
  }
  return user
}

/**
 * Check whether the current session has an active admin elevation.
 */
export async function isElevated(event: H3Event, db: D1Database): Promise<boolean> {
  const tokenHash = await getSessionTokenHash(event)
  if (!tokenHash) return false

  const result = await db
    .prepare("SELECT 1 FROM sessions WHERE token_hash = ? AND elevated_until > datetime('now') LIMIT 1")
    .bind(tokenHash)
    .first()

  return !!result
}

/**
 * Require an elevated owner session (recent Google sign-in).
 * Throws 401/403 if not owner, 403 if not elevated.
 */
export async function requireElevated(event: H3Event, db: D1Database): Promise<SessionUser> {
  const user = await requireOwner(event, db)
  const elevated = await isElevated(event, db)
  if (!elevated) {
    throw createError({ statusCode: 403, statusMessage: 'Potrebna je potvrda identiteta.' })
  }
  return user
}

/**
 * Clear the admin elevation on the current session (lock panel).
 */
export async function clearElevated(event: H3Event, db: D1Database): Promise<void> {
  const tokenHash = await getSessionTokenHash(event)
  if (!tokenHash) return

  await db
    .prepare('UPDATE sessions SET elevated_until = NULL WHERE token_hash = ?')
    .bind(tokenHash)
    .run()
}
