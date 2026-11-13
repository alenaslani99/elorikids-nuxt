/**
 * Server-side helpers for the admin catalog API (categories + products).
 * All input coming from the admin UI is re-validated here.
 */
import type { D1Database, D1PreparedStatement } from '@cloudflare/workers-types'
import type { H3Event } from 'h3'
import {
  CATALOG_LIMITS, PRODUCT_ACCENTS, slugRegex, type ProductAccent, type ProductContent,
} from '~~/shared/utils/catalog'

/** Parse a route param (default `[id]`) as a positive integer or throw 400. */
export function requireIdParam(event: H3Event, name = 'id'): number {
  const raw = String(getRouterParam(event, name) ?? '')
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

/**
 * Unit purchase cost from an admin form. `undefined` means "not sent"
 * (leave the stored cost alone); null/'' clears it; 0 is a valid cost.
 */
export function validateCost(value: unknown): number | null | undefined {
  if (value === undefined) return undefined
  if (value === null || value === '') return null
  const amount = Number(value)
  if (!Number.isInteger(amount) || amount < 0 || amount > CATALOG_LIMITS.priceMax) {
    throw createError({ statusCode: 400, statusMessage: 'Nabavna cena mora biti ceo broj (RSD).' })
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

// ── Product page content ─────────────────────────────────────────

function optionalText(value: unknown, max: number, message: string): string {
  const text = typeof value === 'string' ? value.trim() : ''
  if (text.length > max) throw createError({ statusCode: 400, statusMessage: message })
  return text
}

function requiredItemText(value: unknown, max: number, message: string): string {
  const text = typeof value === 'string' ? value.trim() : ''
  if (!text || text.length > max) throw createError({ statusCode: 400, statusMessage: message })
  return text
}

function validateList<T>(value: unknown, label: string, map: (row: any, n: number) => T): T[] {
  if (value === undefined || value === null) return []
  if (!Array.isArray(value)) throw createError({ statusCode: 400, statusMessage: `Neispravna lista: ${label}.` })
  if (value.length > CATALOG_LIMITS.listItems) {
    throw createError({ statusCode: 400, statusMessage: `${label}: najviše ${CATALOG_LIMITS.listItems} stavki.` })
  }
  return value.map((row, i) => map(row ?? {}, i + 1))
}

/** Validate the `content` part of an admin product create/update body. */
export function validateProductContent(raw: unknown): ProductContent {
  const c = (raw ?? {}) as Record<string, unknown>
  const L = CATALOG_LIMITS

  const accent = (c.accent ?? 'mint') as ProductAccent
  if (!PRODUCT_ACCENTS.includes(accent)) {
    throw createError({ statusCode: 400, statusMessage: 'Neispravna boja.' })
  }

  return {
    subtitle: optionalText(c.subtitle, L.subtitle, `Podnaslov: najviše ${L.subtitle} karaktera.`),
    description: optionalText(c.description, L.description, `Opis: najviše ${L.description} karaktera.`),
    badge: optionalText(c.badge, L.badge, `Oznaka: najviše ${L.badge} karaktera.`),
    accent,
    ageGroupId: validateOptionalId(c.ageGroupId, 'Neispravan uzrast.'),
    sortOrder: validateSortOrder(c.sortOrder),
    features: validateList(c.features, 'Karakteristike', (row, n) =>
      requiredItemText(typeof row === 'string' ? row : row.label, L.featureLabel,
        `Karakteristika ${n}: unesite tekst (najviše ${L.featureLabel} karaktera).`)),
    activities: validateList(c.activities, 'Aktivnosti', (row, n) => ({
      title: requiredItemText(row.title, L.itemTitle, `Aktivnost ${n}: naslov je obavezan (najviše ${L.itemTitle}).`),
      description: requiredItemText(row.description, L.activityDescription,
        `Aktivnost ${n}: opis je obavezan (najviše ${L.activityDescription}).`),
    })),
    sellingPoints: validateList(c.sellingPoints, 'Prednosti', (row, n) => ({
      title: requiredItemText(row.title, L.itemTitle, `Prednost ${n}: naslov je obavezan (najviše ${L.itemTitle}).`),
      text: requiredItemText(row.text, L.sellingPointText, `Prednost ${n}: tekst je obavezan (najviše ${L.sellingPointText}).`),
    })),
  }
}

export async function requireAgeGroupExists(db: D1Database, id: number): Promise<void> {
  const row = await db.prepare('SELECT 1 FROM age_groups WHERE id = ?').bind(id).first()
  if (!row) throw createError({ statusCode: 400, statusMessage: 'Izabrani uzrast ne postoji.' })
}

/**
 * Statements that write a product's content: the columns on `products`
 * and a full replace of its three ordered lists. The product is referenced
 * by slug so they can run in the same batch as the product INSERT.
 */
export function productContentStatements(db: D1Database, slug: string, c: ProductContent): D1PreparedStatement[] {
  const productId = '(SELECT id FROM products WHERE slug = ?)'
  const stmts: D1PreparedStatement[] = [
    db.prepare(`UPDATE products SET subtitle = ?, description = ?, badge = ?, accent = ?, age_group_id = ?, sort_order = ?
                WHERE slug = ?`)
      .bind(c.subtitle || null, c.description || null, c.badge || null, c.accent, c.ageGroupId, c.sortOrder, slug),
    db.prepare(`DELETE FROM product_features WHERE product_id = ${productId}`).bind(slug),
    db.prepare(`DELETE FROM product_activities WHERE product_id = ${productId}`).bind(slug),
    db.prepare(`DELETE FROM product_selling_points WHERE product_id = ${productId}`).bind(slug),
  ]
  c.features.forEach((label, i) => stmts.push(
    db.prepare('INSERT INTO product_features (product_id, label, sort_order) SELECT id, ?, ? FROM products WHERE slug = ?')
      .bind(label, i, slug),
  ))
  c.activities.forEach((a, i) => stmts.push(
    db.prepare('INSERT INTO product_activities (product_id, title, description, sort_order) SELECT id, ?, ?, ? FROM products WHERE slug = ?')
      .bind(a.title, a.description, i, slug),
  ))
  c.sellingPoints.forEach((s, i) => stmts.push(
    db.prepare('INSERT INTO product_selling_points (product_id, title, body, sort_order) SELECT id, ?, ?, ? FROM products WHERE slug = ?')
      .bind(s.title, s.text, i, slug),
  ))
  return stmts
}

/** Load a product's content for the admin form. */
export async function getProductContent(db: D1Database, id: number): Promise<ProductContent | null> {
  const [main, features, activities, points] = await db.batch([
    db.prepare('SELECT subtitle, description, badge, accent, age_group_id, sort_order FROM products WHERE id = ?').bind(id),
    db.prepare('SELECT label FROM product_features WHERE product_id = ? ORDER BY sort_order, id').bind(id),
    db.prepare('SELECT title, description FROM product_activities WHERE product_id = ? ORDER BY sort_order, id').bind(id),
    db.prepare('SELECT title, body FROM product_selling_points WHERE product_id = ? ORDER BY sort_order, id').bind(id),
  ])
  const p = (main?.results?.[0] ?? null) as any
  if (!p) return null
  return {
    subtitle: p.subtitle ?? '',
    description: p.description ?? '',
    badge: p.badge ?? '',
    accent: p.accent,
    ageGroupId: p.age_group_id,
    sortOrder: p.sort_order,
    features: ((features?.results ?? []) as any[]).map(r => r.label),
    activities: ((activities?.results ?? []) as any[]).map(r => ({ title: r.title, description: r.description })),
    sellingPoints: ((points?.results ?? []) as any[]).map(r => ({ title: r.title, text: r.body })),
  }
}
