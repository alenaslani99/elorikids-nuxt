/**
 * Shared validation patterns used across client and server.
 *
 * Lives in `shared/` so it is auto-imported by both the Nuxt app
 * (client) and the Nitro server - single source of truth.
 */

/** Basic email format check (RFC 5322 simplified). */
export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** Permissive phone format: optional + prefix, digits, spaces, dashes, slashes. */
export const phoneRegex = /^\+?\d[\d\s/-]{6,}$/

/** Serbian mobile phone format: +381 6X XXX XXXX */
export const serbianPhoneRegex = /^\+381\s?6[1-9](\s?\d){6,7}$/

/** Serbian postal code: 6 digits, cannot start with zero. */
export const postalRegex = /^[1-9]\d{4}$/

/** Full name: at least two words of Serbian/Latin letters. */
export const nameRegex = /^[a-zA-ZšđčćžŠĐČĆŽ]+(?:\s+[a-zA-ZšđčćžŠĐČĆŽ]+)+$/

/** Street number: digits, digits/digits, or BB (case-insensitive). */
export const streetNumberRegex = /^(\d+|\d+\/\d+|bb)$/i

/**
 * Password policy: at least 8 characters including at least one digit.
 * The lookahead (?=.*\d) requires a digit anywhere; .{8,} enforces length.
 * Enforced on register; login only checks length as a pre-DB sanity filter
 * so existing users with older 6-char passwords can still sign in.
 */
export const passwordRegex = /^(?=.*\d).{8,}$/
