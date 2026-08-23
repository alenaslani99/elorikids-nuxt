/**
 * Canonical product data — single source of truth for prices and titles.
 *
 * The server uses this to validate order items (never trusts client-provided
 * prices). The client can import the same data for display consistency.
 *
 * Lives in `shared/` so both the Nuxt app and Nitro server can import it.
 */

export interface ProductInfo {
  slug: string
  title: string
  price: number
}

export const PRODUCTS: Record<string, ProductInfo> = {
  'prvi-koraci': { slug: 'prvi-koraci', title: 'Prvi koraci', price: 2000 },
  'ucimo-kroz-igru': { slug: 'ucimo-kroz-igru', title: 'Učimo kroz igru', price: 2000 },
  'priprema-za-skolu': { slug: 'priprema-za-skolu', title: 'Priprema za školu', price: 2000 },
}

/** Look up a product by slug. Returns undefined if not found. */
export function getProduct(slug: string): ProductInfo | undefined {
  return PRODUCTS[slug]
}

/** Maximum number of distinct items allowed in a single order. */
export const MAX_ORDER_ITEMS = 50
