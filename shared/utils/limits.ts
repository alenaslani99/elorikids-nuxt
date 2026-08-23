/**
 * Input length limits shared between client and server.
 *
 * Server-side these are enforced before any DB write. Client-side they
 * can be used for maxlength attributes and pre-submit validation.
 */

export const LIMITS = {
  name: 100,
  email: 254, // RFC 5321 max
  password: 128,
  phone: 30,
  address: 200,
  city: 100,
  postal: 10,
  note: 500,
  message: 5000, // contact form
  securityQuestion: 200,
  securityAnswer: 100,
} as const

/**
 * Rate-limiting configuration (D1-backed, per-identifier).
 * Used by server/utils/rateLimit.ts.
 */
export const RATE_LIMITS = {
  login: { maxAttempts: 5, windowMs: 15 * 60_000 }, // 5 per 15 min per email+ip
  register: { maxAttempts: 3, windowMs: 60 * 60_000 }, // 3 per hour per ip
  elevate: { maxAttempts: 5, windowMs: 15 * 60_000 }, // 5 per 15 min per session
  contact: { maxAttempts: 5, windowMs: 15 * 60_000 }, // 5 per 15 min per ip
  newsletter: { maxAttempts: 5, windowMs: 60 * 60_000 }, // 5 per hour per ip
  order: { maxAttempts: 10, windowMs: 60 * 60_000 }, // 10 per hour per ip
} as const
