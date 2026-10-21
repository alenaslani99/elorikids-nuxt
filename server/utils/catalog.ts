/**
 * Server-side helpers for the admin catalog API (categories + products).
 * All input coming from the admin UI is re-validated here.
 */
import type { D1Database } from '@cloudflare/workers-types'
import type { H3Event } from 'h3'
import { CATALOG_LIMITS, slugRegex } from '~~/shared/utils/catalog'

/** Parse the `[id]` route param as a positive integer or throw 400. */
export function requireIdParam(event: H3Event): number {
  const raw = String(getRouterParam(event, 'id') ?? '')
  const id = Number(raw)
  if (!/^\d+$/.test(raw) || !Number.isSafeInteger(id) || id < 1) {
    throw createError({ statusCode: 400, statusMessage: 'Neispravan ID.' })
  }
  return id
}

export function validateSlug(value: unknown): string {
  const slug = typeof value === 'string' ? value.trim() : ''
  if (!slug || slug.length > CATALOG_LIMITS.slug || !slugRegex.test(slug)) {
    throw createError({ statusCode: 400, statusMessage: 'Slug sme sadržati samo mala slova, brojeve i crtice.' })
  }
  return slug
}

export function validateText(value: unknown, max: number, message: string): string {
  const text = typeof value === 'string' ? value.trim() : ''
  if (!text || text.length > max) {
    throw createError({ statusCode: 400, statusMessage: message })
  }
  return text
}

/** Optional FK id: null/undefined/'' → null, otherwise a positive integer. */
export function validateOptionalId(value: unknown, message: string): number | null {
  if (value === null || value === undefined || value === '') return null
  const id = Number(value)
  if (!Number.isSafeInteger(id) || id < 1) {
    throw createError({ statusCode: 400, statusMessage: message })
  }
  return id
}

export function validatePrice(value: unknown, message: string): number {
  const amount = Number(value)
  if (!Number.isInteger(amount) || amount < CATALOG_LIMITS.priceMin || amount > CATALOG_LIMITS.priceMax) {
    throw createError({ statusCode: 400, statusMessage: message })
  }
  return amount
}

export function validateSortOrder(value: unknown): number {
  if (value === null || value === undefined || value === '') return 0
  const n = Number(value)
  if (!Number.isInteger(n) || Math.abs(n) > CATALOG_LIMITS.sortOrder) {
    throw createError({ statusCode: 400, statusMessage: 'Neispravan redosled.' })
  }
  return n
}

/** True when a D1 error is a UNIQUE constraint violation. */
export function isUniqueViolation(err: unknown): boolean {
  return String((err as any)?.message ?? err).includes('UNIQUE constraint failed')
}

export async function requireCategoryExists(db: D1Database, id: number): Promise<void> {
  const row = await db.prepare('SELECT 1 FROM categories WHERE id = ?').bind(id).first()
  if (!row) {
    throw createError({ statusCode: 400, statusMessage: 'Izabrana kategorija ne postoji.' })
  }
}

export interface CurrentPrices {
  /** Newest effective row (what checkout charges). */
  current: { amount: number, isSale: boolean } | null
  /** Newest effective non-sale row (the "regular" / crossed-out price). */
  regular: number | null
}

/** Current selling price + regular price for one product. */
export async function getCurrentPrices(db: D1Database, productId: number): Promise<CurrentPrices> {
  const current = await db
    .prepare(
      `SELECT amount, is_sale FROM product_prices
       WHERE product_id = ? AND effective_from <= datetime('now')
       ORDER BY effective_from DESC, id DESC LIMIT 1`,
    )
    .bind(productId)
    .first<{ amount: number, is_sale: number }>()
  const regular = await db
    .prepare(
      `SELECT amount FROM product_prices
       WHERE product_id = ? AND is_sale = 0 AND effective_from <= datetime('now')
       ORDER BY effective_from DESC, id DESC LIMIT 1`,
    )
    .bind(productId)
    .first<{ amount: number }>()
  return {
    current: current ? { amount: current.amount, isSale: current.is_sale === 1 } : null,
    regular: regular?.amount ?? null,
  }
}

/**
 * Validate the price pair from an admin form. A sale price is optional
 * but must be lower than the regular price.
 */
export function validatePricePair(body: { price?: unknown, salePrice?: unknown }) {
  const price = validatePrice(body.price, 'Redovna cena mora biti ceo broj (RSD).')
  const salePrice = body.salePrice === null || body.salePrice === undefined || body.salePrice === ''
    ? null
    : validatePrice(body.salePrice, 'Akcijska cena mora biti ceo broj (RSD).')
  if (salePrice !== null && salePrice >= price) {
    throw createError({ statusCode: 400, statusMessage: 'Akcijska cena mora biti niža od redovne.' })
  }
  return { price, salePrice }
}
