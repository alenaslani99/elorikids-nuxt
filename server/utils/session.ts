/**
 * Session management - opaque tokens, validated against the `sessions`
 * table on every request (immediate server-side revocation on logout).
 *
 * - The cookie holds the raw token; the DB stores only its SHA-256, so
 *   a leaked database does not hand out usable sessions.
 * - Sessions end 30 days after sign-in, or after 14 days without use.
 * - The user's role is read from the DB on each request, never from the
 *   client, so a role change takes effect immediately.
 */
import type { D1Database } from '@cloudflare/workers-types'
import type { H3Event } from 'h3'
import { generateSessionToken, sha256Base64Url } from './crypto'

export type UserRole = 'owner' | 'customer'

export interface SessionUser {
  id: number
  name: string
  email: string
  role: UserRole
}

// `__Host-` pins the cookie to this exact host over HTTPS (no Domain
// attribute), so a sibling subdomain cannot plant a session cookie.
// Browsers reject the prefix on plain-http localhost, hence the dev name.
const SESSION_COOKIE = import.meta.dev ? 'elorikids_session' : '__Host-elorikids_session'
const SESSION_MAX_AGE_DAYS = 30
const SESSION_IDLE_DAYS = 14

/**
 * Read the raw session token from the request cookie.
 */
export function getSessionToken(event: H3Event): string | null {
  return getCookie(event, SESSION_COOKIE) ?? null
}

/**
 * Hash of the current session token (the value stored in the DB),
 * or null when there is no session cookie.
 */
export async function getSessionTokenHash(event: H3Event): Promise<string | null> {
  const token = getSessionToken(event)
  return token ? sha256Base64Url(token) : null
}

/**
 * Create a new session in DB and set the cookie on the response.
 * `elevated` opens the 1-hour admin window (owner, right after sign-in).
 */
export async function createSession(
  event: H3Event,
  db: D1Database,
  userId: number,
  options: { elevated?: boolean } = {},
): Promise<void> {
  const token = generateSessionToken()
  const tokenHash = await sha256Base64Url(token)

  await db
    .prepare(
      `INSERT INTO sessions (user_id, token_hash, expires_at, elevated_until)
       VALUES (?, ?, datetime('now', '+${SESSION_MAX_AGE_DAYS} days'),
               CASE WHEN ? THEN datetime('now', '+1 hour') ELSE NULL END)`,
    )
    .bind(userId, tokenHash, options.elevated ? 1 : 0)
    .run()

  // Lazily purge expired sessions (~1 in 50 sign-ins)
  await maybeCleanupExpiredSessions(db)

  setCookie(event, SESSION_COOKIE, token, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE_DAYS * 86400,
  })
}

/**
 * Validate the current session from the cookie. Returns the user
 * if the session is valid, not expired and not idle, otherwise null.
 */
export async function getSessionUser(event: H3Event, db: D1Database): Promise<SessionUser | null> {
  const tokenHash = await getSessionTokenHash(event)
  if (!tokenHash) return null

  const row = await db
    .prepare(
      `SELECT u.id, u.name, u.email, u.role,
              (s.last_used_at < datetime('now', '-1 hour')) AS stale
       FROM sessions s
       JOIN users u ON u.id = s.user_id
       WHERE s.token_hash = ?
         AND s.expires_at > datetime('now')
         AND s.last_used_at > datetime('now', '-${SESSION_IDLE_DAYS} days')
       LIMIT 1`,
    )
    .bind(tokenHash)
    .first<SessionUser & { stale: number }>()

  if (!row) return null

  // Keep the idle timer fresh, but write at most once an hour per session.
  if (row.stale) {
    await db
      .prepare("UPDATE sessions SET last_used_at = datetime('now') WHERE token_hash = ?")
      .bind(tokenHash)
      .run()
  }

  return { id: row.id, name: row.name, email: row.email, role: row.role }
}

/**
 * Delete the current session (logout). Clears the DB row and cookie.
 */
export async function destroySession(event: H3Event, db: D1Database): Promise<void> {
  const tokenHash = await getSessionTokenHash(event)
  if (!tokenHash) return

  await db.prepare('DELETE FROM sessions WHERE token_hash = ?').bind(tokenHash).run()
  deleteCookie(event, SESSION_COOKIE, { path: '/', secure: true })
}

/**
 * Lazily delete expired or idle sessions. Called with a small
 * probability to keep the sessions table from growing unboundedly.
 */
export async function maybeCleanupExpiredSessions(db: D1Database): Promise<void> {
  if (Math.random() > 0.02) return
  await db
    .prepare(
      `DELETE FROM sessions
       WHERE expires_at <= datetime('now')
          OR last_used_at <= datetime('now', '-${SESSION_IDLE_DAYS} days')`,
    )
    .run()
}
