/**
 * Session management — opaque tokens stored in a `sessions` table.
 * Enables immediate server-side revocation (logout).
 */
import type { D1Database } from '@cloudflare/workers-types'
import { generateSessionToken } from './crypto'

export interface SessionUser {
  id: number
  name: string
  email: string
}

const SESSION_COOKIE = 'elorikids_session'
const SESSION_MAX_AGE_DAYS = 30

/**
 * Read the session token from the request cookie.
 */
export function getSessionToken(event: H3Event): string | null {
  return getCookie(event, SESSION_COOKIE) ?? null
}

/**
 * Create a new session in DB and set the cookie on the response.
 * Returns the opaque token.
 */
export async function createSession(event: H3Event, db: D1Database, userId: number): Promise<string> {
  const token = generateSessionToken()
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE_DAYS * 86400_000)
    .toISOString()
    .replace('T', ' ')
    .replace(/\.\d+Z$/, 'Z')

  await db
    .prepare('INSERT INTO sessions (user_id, token, expires_at) VALUES (?, ?, ?)')
    .bind(userId, token, expiresAt)
    .run()

  setCookie(event, SESSION_COOKIE, token, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE_DAYS * 86400,
  })

  return token
}

/**
 * Validate the current session from the cookie. Returns the user
 * if the session is valid and not expired, otherwise null.
 */
export async function getSessionUser(event: H3Event, db: D1Database): Promise<SessionUser | null> {
  const token = getSessionToken(event)
  if (!token) return null

  const result = await db
    .prepare(
      `SELECT u.id, u.name, u.email
       FROM sessions s
       JOIN users u ON u.id = s.user_id
       WHERE s.token = ? AND s.expires_at > datetime('now')
       LIMIT 1`,
    )
    .bind(token)
    .first<SessionUser>()

  return result ?? null
}

/**
 * Delete the current session (logout). Clears the DB row and cookie.
 */
export async function destroySession(event: H3Event, db: D1Database): Promise<void> {
  const token = getSessionToken(event)
  if (!token) return

  await db.prepare('DELETE FROM sessions WHERE token = ?').bind(token).run()
  deleteCookie(event, SESSION_COOKIE, { path: '/' })
}
