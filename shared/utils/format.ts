/**
 * Shared date/time formatting utilities used across the app.
 *
 * Serbian locale formatting (Latin script).
 * Used by: admin panel, account page, track-order page.
 */

const MONTHS_SHORT = [
  'jan', 'feb', 'mar', 'apr', 'maj', 'jun',
  'jul', 'avg', 'sep', 'okt', 'nov', 'dec',
] as const

const MONTHS_LONG = [
  'januar', 'februar', 'mart', 'april', 'maj', 'jun',
  'jul', 'avgust', 'septembar', 'oktobar', 'novembar', 'decembar',
] as const

function parseDate(iso: string): Date | null {
  const d = new Date(iso)
  return isNaN(d.getTime()) ? null : d
}

/**
 * Format an ISO date string as "15. avgust 2025.".
 * Returns the original string if parsing fails.
 */
export function formatDateLong(iso: string): string {
  const d = parseDate(iso)
  if (!d) return iso
  return `${d.getDate()}. ${MONTHS_LONG[d.getMonth()]} ${d.getFullYear()}.`
}

/** Alias for formatDateLong - kept for backward compatibility. */
export const formatDate = formatDateLong

/**
 * Format an ISO date string as "15. avg 2025.".
 * Returns the original string if parsing fails.
 */
export function formatDateShort(iso: string): string {
  const d = parseDate(iso)
  if (!d) return iso
  return `${d.getDate()}. ${MONTHS_SHORT[d.getMonth()]} ${d.getFullYear()}.`
}

/**
 * Format an ISO date string as "15. avg 2025. 14:30".
 * Returns the original string if parsing fails.
 */
export function formatDateTimeShort(iso: string): string {
  const d = parseDate(iso)
  if (!d) return iso
  const h = String(d.getHours()).padStart(2, '0')
  const m = String(d.getMinutes()).padStart(2, '0')
  return `${d.getDate()}. ${MONTHS_SHORT[d.getMonth()]} ${d.getFullYear()}. ${h}:${m}`
}
