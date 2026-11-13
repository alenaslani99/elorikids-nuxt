/**
 * Edge-compatible crypto helpers (Web Crypto API only - no Node-only
 * dependencies, works on Cloudflare Workers).
 */

// ── Base64URL helpers ──────────────────────────────────────────
export function toBase64Url(bytes: ArrayBuffer | Uint8Array): string {
  const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes)
  let str = ''
  for (const code of arr) str += String.fromCharCode(code)
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

export function fromBase64Url(b64url: string): Uint8Array<ArrayBuffer> {
  const b64 = b64url.replace(/-/g, '+').replace(/_/g, '/')
  const pad = b64.length % 4 === 0 ? '' : '='.repeat(4 - (b64.length % 4))
  const binary = atob(b64 + pad)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes
}

// ── Hashing ────────────────────────────────────────────────────
/**
 * SHA-256 of a string, base64url encoded. Used to store session tokens
 * (only the hash is in the DB) and for the PKCE code challenge.
 */
export async function sha256Base64Url(input: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input))
  return toBase64Url(digest)
}

// ── Random tokens ──────────────────────────────────────────────
/** 32 random bytes, base64url. Used for session tokens and OAuth state/nonce/PKCE. */
export function generateSessionToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32))
  return toBase64Url(bytes)
}

// ── Order track number ────────────────────────────────────────
/**
 * Generate a public tracking number: 'EK-YYYY-XXXXXX'
 * where XXXXXX is 6 random lowercase alphanumeric characters.
 * 36^6 ≈ 2.2 billion combinations → unguessable by enumeration.
 */
export function generateTrackNumber(year: number): string {
  const alphabet = 'abcdefghijklmnopqrstuvwxyz0123456789'
  const bytes = crypto.getRandomValues(new Uint8Array(6))
  let suffix = ''
  for (let i = 0; i < 6; i++) {
    suffix += alphabet[bytes[i]! % alphabet.length]
  }
  return `EK-${year}-${suffix}`
}

// ── Constant-time string compare ──────────────────────────────
export function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return diff === 0
}
