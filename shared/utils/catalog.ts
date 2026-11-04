/**
 * Catalog (categories + products) validation shared between the admin
 * UI and the admin API. The server re-validates everything - the client
 * copies only exist for instant form feedback.
 */

/** URL slug: lowercase a-z, digits, single dashes, no leading/trailing dash. */
export const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export const CATALOG_LIMITS = {
  slug: 80,
  categoryName: 80,
  productTitle: 120,
  sortOrder: 9999,
  /** RSD, integer. Upper bound guards against typos (an extra zero). */
  priceMin: 1,
  priceMax: 1_000_000,
  // ── Product page content ──
  subtitle: 160,
  description: 2000,
  badge: 40,
  ageLabel: 40,
  featureLabel: 60,
  itemTitle: 80,
  activityDescription: 300,
  sellingPointText: 600,
  /** Max rows per list (features, activities, selling points). */
  listItems: 12,
} as const

/** Card/accent colors available on the storefront (see useAccent). */
export const PRODUCT_ACCENTS = ['mint', 'purple', 'coral'] as const
export type ProductAccent = typeof PRODUCT_ACCENTS[number]

export const ACCENT_LABELS: Record<ProductAccent, string> = {
  mint: 'Mint',
  purple: 'Ljubičasta',
  coral: 'Koral',
}

/** Product page content as edited in the admin panel. */
export interface ProductContent {
  subtitle: string
  description: string
  badge: string
  accent: ProductAccent
  ageGroupId: number | null
  sortOrder: number
  features: string[]
  activities: { title: string, description: string }[]
  sellingPoints: { title: string, text: string }[]
}

/**
 * Build a slug from a display name: transliterates Serbian diacritics,
 * lowercases, and collapses everything else into single dashes.
 */
export function slugify(input: string): string {
  const map: Record<string, string> = { š: 's', đ: 'dj', č: 'c', ć: 'c', ž: 'z' }
  return input
    .toLowerCase()
    .replace(/[šđčćž]/g, ch => map[ch] ?? ch)
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, CATALOG_LIMITS.slug)
    .replace(/-+$/, '')
}
