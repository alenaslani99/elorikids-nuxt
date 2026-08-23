/**
 * D1-backed rate limiter for public endpoints.
 *
 * Stores attempts in a `rate_limits` table. Each row tracks an
 * (identifier, action) pair with a count and expiry timestamp.
 *
 * Workers are stateless across requests, so we can't use in-memory maps.
 * D1 is the shared state. The overhead is one SELECT + one UPSERT per
 * check, which is acceptable for this app's traffic.
 *
 * Cleanup of expired rows is done lazily by `cleanupExpiredRateLimits()`
 * on a small fraction of requests (probabilistic).
 */
import type { D1Database } from '@cloudflare/workers-types'

interface RateLimitRow {
  count: number
  expires_at: string
}

/**
 * Check if an action is rate-limited for the given identifier.
 * Returns { limited: true, retryAfterSec } if blocked, or { limited: false }
 * if allowed. Also increments the attempt counter.
 *
 * @param identifier  e.g. "login:1.2.3.4" or "elevate:<token>"
 * @param action      e.g. "login", "register"
 * @param maxAttempts max attempts within the window
 * @param windowMs    the rolling window in milliseconds
 */
export async function checkRateLimit(
  db: D1Database,
  identifier: string,
  action: string,
  maxAttempts: number,
  windowMs: number,
): Promise<{ limited: false } | { limited: true, retryAfterSec: number }> {
  const now = Date.now()
  const expiresAt = new Date(now + windowMs)
    .toISOString()
    .replace('T', ' ')
    .replace(/\.\d+Z$/, 'Z')

  const row = await db
    .prepare('SELECT count, expires_at FROM rate_limits WHERE identifier = ? AND action = ?')
    .bind(identifier, action)
    .first<RateLimitRow>()

  // No existing record → first attempt
  if (!row) {
    await db
      .prepare(
        `INSERT INTO rate_limits (identifier, action, count, expires_at)
         VALUES (?, ?, 1, ?)`,
      )
      .bind(identifier, action, expiresAt)
      .run()
    return { limited: false }
  }

  // Parse the existing expiry. D1 stores as UTC string.
  const rowExpiry = new Date(row.expires_at.replace(' ', 'T')).getTime()

  // Window expired → reset the counter
  if (rowExpiry <= now) {
    await db
      .prepare('UPDATE rate_limits SET count = 1, expires_at = ? WHERE identifier = ? AND action = ?')
      .bind(expiresAt, identifier, action)
      .run()
    return { limited: false }
  }

  // Within window and over the limit → block
  if (row.count >= maxAttempts) {
    const retryAfterSec = Math.ceil((rowExpiry - now) / 1000)
    return { limited: true, retryAfterSec }
  }

  // Within window and under the limit → increment
  await db
    .prepare('UPDATE rate_limits SET count = count + 1 WHERE identifier = ? AND action = ?')
    .bind(identifier, action)
    .run()

  return { limited: false }
}

/**
 * Get the client IP from an H3Event. Falls back to 'unknown' if
 * headers are not present (e.g. local dev without proxy headers).
 *
 * On Cloudflare, the connecting IP is in `CF-Connecting-IP`.
 */
export function getClientIp(headers: Headers): string {
  return (
    headers.get('cf-connecting-ip')
    || headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || 'unknown'
  )
}

/**
 * Lazily delete expired rate-limit rows. Called with a small probability
 * to avoid adding DB overhead to every request.
 */
export async function maybeCleanupRateLimits(db: D1Database): Promise<void> {
  // ~1 in 50 requests triggers cleanup
  if (Math.random() > 0.02) return
  await db
    .prepare("DELETE FROM rate_limits WHERE expires_at <= datetime('now')")
    .run()
}
