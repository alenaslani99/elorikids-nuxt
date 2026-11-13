import { defineEventHandler, getQuery, getRequestHeaders, sendRedirect, setCookie } from 'h3'
import { useDb } from '../../utils/db'
import { generateSessionToken } from '../../utils/crypto'
import { checkRateLimit, getClientIp, maybeCleanupRateLimits } from '../../utils/rateLimit'
import {
  OAUTH_COOKIE, OAUTH_COOKIE_MAX_AGE,
  buildAuthUrl, getGoogleConfig, getRedirectUri, safeRedirectPath,
  type OAuthCookie,
} from '../../utils/google'
import { RATE_LIMITS } from '~~/shared/utils/limits'

/**
 * Start Google sign-in: remember state/nonce/PKCE verifier in a
 * short-lived httpOnly cookie and send the browser to Google.
 *
 * Query: ?redirect=/some/path - where to land afterwards (same-site only).
 */
export default defineEventHandler(async (event) => {
  const config = getGoogleConfig(event)
  if (!config) {
    console.error('[auth/google] GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET are not set')
    return sendRedirect(event, '/auth/login?error=config', 302)
  }

  const db = useDb(event)
  const ip = getClientIp(getRequestHeaders(event))
  const rl = await checkRateLimit(db, `auth:${ip}`, 'auth', RATE_LIMITS.auth.maxAttempts, RATE_LIMITS.auth.windowMs)
  if (rl.limited) {
    return sendRedirect(event, '/auth/login?error=rate', 302)
  }
  await maybeCleanupRateLimits(db)

  const oauth: OAuthCookie = {
    state: generateSessionToken(),
    nonce: generateSessionToken(),
    verifier: generateSessionToken(),
    redirect: safeRedirectPath(getQuery(event).redirect),
  }

  // SameSite=Lax: the cookie must come back on Google's top-level
  // redirect to the callback.
  setCookie(event, OAUTH_COOKIE, JSON.stringify(oauth), {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    path: '/',
    maxAge: OAUTH_COOKIE_MAX_AGE,
  })

  return sendRedirect(event, await buildAuthUrl(config, getRedirectUri(event), oauth), 302)
})
