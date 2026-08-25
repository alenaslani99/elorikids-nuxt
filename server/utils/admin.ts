/**
 * Admin authorization helpers.
 *
 * The "owner" is identified by the OWNER_EMAIL env var - no role column
 * needed for a one-man shop. Admin routes require two layers:
 *
 *   1. requireOwner()   - valid session + email matches OWNER_EMAIL
 *   2. requireElevated() - owner + recent security-question verification
 *
 * Elevation is stored as `elevated_until` on the session row (1-hour
 * window), so it is automatically revoked on logout / session expiry.
 */
import type { D1Database } from '@cloudflare/workers-types'
import type { H3Event } from 'h3'
import { getSessionUser, getSessionToken, type SessionUser } from './session'

/**
 * Read the owner email from the Cloudflare env (production) or
 * process.env (local dev with `nuxt dev`).
 */
function getOwnerEmail(event: H3Event): string {
  const cloudflare = (event.context as any).cloudflare
  // process.env is only available during local dev (nuxt dev on Node).
  // On Cloudflare Workers, only cloudflare.env is available - globalThis
  // avoids importing Node types into the worker bundle.
  return cloudflare?.env?.OWNER_EMAIL
    || (globalThis as any).process?.env?.OWNER_EMAIL
    || ''
}

/**
 * Check if an email belongs to the owner (OWNER_EMAIL env var).
 */
export function isOwnerEmail(event: H3Event, email: string): boolean {
  const ownerEmail = getOwnerEmail(event)
  return !!ownerEmail && email.toLowerCase() === ownerEmail.toLowerCase()
}

/**
 * Require a valid session whose email matches OWNER_EMAIL.
 * Throws 401 if not logged in, 403 if not the owner.
 */
export async function requireOwner(event: H3Event, db: D1Database): Promise<SessionUser> {
  const user = await getSessionUser(event, db)
  if (!user) {
    throw createError({ statusCode: 401, statusMessage: 'Morate biti prijavljeni.' })
  }
  const ownerEmail = getOwnerEmail(event)
  if (!ownerEmail || user.email !== ownerEmail) {
    throw createError({ statusCode: 403, statusMessage: 'Pristup odbijen.' })
  }
  return user
}

/**
 * Check whether the current session has an active admin elevation.
 */
export async function isElevated(event: H3Event, db: D1Database): Promise<boolean> {
  const token = getSessionToken(event)
  if (!token) return false

  const result = await db
    .prepare("SELECT 1 FROM sessions WHERE token = ? AND elevated_until > datetime('now') LIMIT 1")
    .bind(token)
    .first()

  return !!result
}

/**
 * Require an elevated owner session (recent security-question verification).
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
 * Set the admin elevation on the current session (1-hour window).
 */
export async function setElevated(event: H3Event, db: D1Database): Promise<void> {
  const token = getSessionToken(event)
  if (!token) return

  await db
    .prepare("UPDATE sessions SET elevated_until = datetime('now', '+1 hour') WHERE token = ?")
    .bind(token)
    .run()
}

/**
 * Clear the admin elevation on the current session (lock panel).
 */
export async function clearElevated(event: H3Event, db: D1Database): Promise<void> {
  const token = getSessionToken(event)
  if (!token) return

  await db
    .prepare('UPDATE sessions SET elevated_until = NULL WHERE token = ?')
    .bind(token)
    .run()
}
