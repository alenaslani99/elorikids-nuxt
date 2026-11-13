/**
 * Input length limits shared between client and server.
 *
 * Server-side these are enforced before any DB write. Client-side they
 * can be used for maxlength attributes and pre-submit validation.
 */

export const LIMITS = {
  name: 100,
  email: 254, // RFC 5321 max
  phone: 30,
  street: 150,
  streetNumber: 20,
  address: 200,
  city: 100,
  postal: 10,
  note: 500,
  message: 5000, // contact form
} as const

/**
 * Rate-limiting configuration (D1-backed, per-identifier).
 * Used by server/utils/rateLimit.ts.
 */
export const RATE_LIMITS = {
  auth: { maxAttempts: 20, windowMs: 15 * 60_000 }, // 20 Google sign-in starts per 15 min per ip
  contact: { maxAttempts: 5, windowMs: 15 * 60_000 }, // 5 per 15 min per ip
  newsletter: { maxAttempts: 5, windowMs: 60 * 60_000 }, // 5 per hour per ip
  order: { maxAttempts: 10, windowMs: 60 * 60_000 }, // 10 per hour per ip
  track: { maxAttempts: 30, windowMs: 15 * 60_000 }, // 30 per 15 min per ip (GET lookup, unguessable id)
} as const
