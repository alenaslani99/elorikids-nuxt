import { defineEventHandler, deleteCookie, getCookie, getQuery, sendRedirect } from 'h3'
import { useDb } from '../../../utils/db'
import { timingSafeEqual } from '../../../utils/crypto'
import { createSession, destroySession, type UserRole } from '../../../utils/session'
import {
  OAUTH_COOKIE,
  exchangeCodeForProfile, getGoogleConfig, getRedirectUri, safeRedirectPath,
  type OAuthCookie,
} from '../../../utils/google'
import { LIMITS } from '~~/shared/utils/limits'

function readOAuthCookie(raw: string | undefined): OAuthCookie | null {
  if (!raw) return null
  try {
    const v = JSON.parse(raw)
    if (
      typeof v?.state === 'string' && typeof v?.nonce === 'string'
      && typeof v?.verifier === 'string' && typeof v?.redirect === 'string'
    ) {
      return v as OAuthCookie
    }
  }
  catch {
    // malformed cookie - treated as missing
  }
  return null
}

/**
 * Google redirects here after the user picks an account.
 *
 * Every failure ends in a redirect to the login page with a short error
 * code - no session is created unless the whole chain checks out:
 * state matches the cookie, the code exchanges (PKCE), and the ID token
 * claims are valid with a verified email.
 */
export default defineEventHandler(async (event) => {
  const fail = (code: string) => sendRedirect(event, `/auth/login?error=${code}`, 302)

  const oauth = readOAuthCookie(getCookie(event, OAUTH_COOKIE))
  // One-time use: gone whether or not the rest succeeds
  deleteCookie(event, OAUTH_COOKIE, { path: '/', secure: true })

  const query = getQuery(event)
  if (typeof query.error === 'string') return fail('cancelled')

  const state = typeof query.state === 'string' ? query.state : ''
  const code = typeof query.code === 'string' ? query.code : ''
  if (!oauth || !state || !code || !timingSafeEqual(state, oauth.state)) {
    return fail('state')
  }

  const config = getGoogleConfig(event)
  if (!config) return fail('config')

  let profile
  try {
    profile = await exchangeCodeForProfile(config, getRedirectUri(event), code, oauth)
  }
  catch (err) {
    console.error('[auth/google] sign-in rejected:', err instanceof Error ? err.message : err)
    return fail('google')
  }

  const db = useDb(event)

  // Identity is Google's stable `sub`, not the email (which can change).
  // New users always start as 'customer'; the role is never touched here.
  const user = await db
    .prepare(
      `INSERT INTO users (google_sub, email, name, last_login_at)
       VALUES (?, ?, ?, datetime('now'))
       ON CONFLICT(google_sub) DO UPDATE SET
         email = excluded.email,
         name = excluded.name,
         last_login_at = excluded.last_login_at
       RETURNING id, role`,
    )
    .bind(profile.sub, profile.email.slice(0, LIMITS.email), profile.name.slice(0, LIMITS.name))
    .first<{ id: number, role: UserRole }>()

  if (!user) return fail('google')

  // Replace whatever session this browser had with a brand-new one.
  // The owner gets the 1-hour admin window from this fresh sign-in.
  await destroySession(event, db)
  await createSession(event, db, user.id, { elevated: user.role === 'owner' })

  console.log(`[auth/google] user #${user.id} signed in (${user.role})`)

  return sendRedirect(event, safeRedirectPath(oauth.redirect), 302)
})
