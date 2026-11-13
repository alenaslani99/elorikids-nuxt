/**
 * Google sign-in (OAuth 2.0 authorization code flow with PKCE).
 *
 * The only way to sign in to the site. Flow:
 *   1. /api/auth/google          -> redirect to Google (state + nonce + PKCE)
 *   2. /api/auth/google/callback -> exchange the code, validate the ID
 *      token, upsert the user, create our own session.
 *
 * The ID token is received directly from Google's token endpoint over
 * TLS in exchange for our client secret, so its claims are validated
 * but its signature is not re-verified (allowed by OpenID Connect Core
 * 3.1.3.7 for the code flow). Never accept an ID token from the browser
 * with this code.
 */
import type { H3Event } from 'h3'
import { fromBase64Url, sha256Base64Url } from './crypto'

const AUTH_ENDPOINT = 'https://accounts.google.com/o/oauth2/v2/auth'
const TOKEN_ENDPOINT = 'https://oauth2.googleapis.com/token'
const VALID_ISSUERS = new Set(['https://accounts.google.com', 'accounts.google.com'])

/** Short-lived cookie that carries state/nonce/PKCE across the redirect. */
export const OAUTH_COOKIE = import.meta.dev ? 'elorikids_oauth' : '__Host-elorikids_oauth'
export const OAUTH_COOKIE_MAX_AGE = 600 // 10 minutes

/** Where to land after sign-in when no (valid) redirect was requested. */
export const DEFAULT_REDIRECT = '/auth/account'

export interface GoogleConfig {
  clientId: string
  clientSecret: string
}

export interface OAuthCookie {
  state: string
  nonce: string
  verifier: string
  redirect: string
}

export interface GoogleProfile {
  sub: string
  email: string
  name: string
}

/**
 * Read Google OAuth config from the Cloudflare env (production) or
 * process.env (local dev). Returns null if either value is unset.
 */
export function getGoogleConfig(event: H3Event): GoogleConfig | null {
  const cloudflare = (event.context as any).cloudflare
  const env = cloudflare?.env ?? (globalThis as any).process?.env ?? {}

  const clientId = env.GOOGLE_CLIENT_ID
  const clientSecret = env.GOOGLE_CLIENT_SECRET
  if (!clientId || !clientSecret) return null

  return { clientId, clientSecret }
}

/**
 * The redirect URI registered in the Google Cloud console. Derived from
 * the request host; always https outside local dev.
 */
export function getRedirectUri(event: H3Event): string {
  const url = getRequestURL(event)
  const origin = import.meta.dev ? url.origin : `https://${url.host}`
  return `${origin}/api/auth/google/callback`
}

/**
 * Only allow redirects to a path on this site. Rejects absolute URLs,
 * protocol-relative ("//host") and backslash variants that browsers
 * treat as another origin.
 */
export function safeRedirectPath(input: unknown): string {
  if (typeof input !== 'string' || input.length > 500) return DEFAULT_REDIRECT
  if (!input.startsWith('/') || input.startsWith('//')) return DEFAULT_REDIRECT
  if (/[\\\u0000-\u001F]/.test(input)) return DEFAULT_REDIRECT
  return input
}

export async function buildAuthUrl(
  config: GoogleConfig,
  redirectUri: string,
  oauth: OAuthCookie,
): Promise<string> {
  const params = new URLSearchParams({
    client_id: config.clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: 'openid email profile',
    state: oauth.state,
    nonce: oauth.nonce,
    code_challenge: await sha256Base64Url(oauth.verifier),
    code_challenge_method: 'S256',
    prompt: 'select_account',
  })
  return `${AUTH_ENDPOINT}?${params}`
}

function decodeJwtPayload(jwt: string): Record<string, unknown> {
  const payload = jwt.split('.')[1]
  if (!payload) throw new Error('malformed id_token')
  // TextDecoder: names contain non-ASCII characters (č, ć, š, ž, đ...)
  return JSON.parse(new TextDecoder().decode(fromBase64Url(payload)))
}

/**
 * Exchange the authorization code for tokens and return the validated
 * Google profile. Throws on any failure - callers must not sign the
 * user in unless this resolves.
 */
export async function exchangeCodeForProfile(
  config: GoogleConfig,
  redirectUri: string,
  code: string,
  oauth: OAuthCookie,
): Promise<GoogleProfile> {
  const res = await fetch(TOKEN_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      client_id: config.clientId,
      client_secret: config.clientSecret,
      redirect_uri: redirectUri,
      code_verifier: oauth.verifier,
    }),
  })
  if (!res.ok) throw new Error(`token endpoint returned ${res.status}`)

  const tokens = await res.json() as { id_token?: string }
  if (!tokens.id_token) throw new Error('no id_token in token response')

  const claims = decodeJwtPayload(tokens.id_token)

  if (typeof claims.iss !== 'string' || !VALID_ISSUERS.has(claims.iss)) throw new Error('bad iss')
  if (claims.aud !== config.clientId) throw new Error('bad aud')
  if (typeof claims.exp !== 'number' || claims.exp * 1000 <= Date.now()) throw new Error('expired id_token')
  if (claims.nonce !== oauth.nonce) throw new Error('bad nonce')
  if (typeof claims.sub !== 'string' || !claims.sub) throw new Error('no sub')
  if (typeof claims.email !== 'string' || !claims.email) throw new Error('no email')
  if (claims.email_verified !== true) throw new Error('email not verified')

  const email = claims.email.trim().toLowerCase()
  const name = typeof claims.name === 'string' && claims.name.trim()
    ? claims.name.trim()
    : email.split('@')[0]!

  return { sub: claims.sub, email, name }
}
