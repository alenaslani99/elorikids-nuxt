/**
 * Storefront catalog: every active product with its content, prices and
 * gallery, read from D1 (v_storefront_products + child tables) and cached.
 *
 * Cache layers, cheapest first:
 *   1. In-isolate memory (same Worker instance, zero cost)
 *   2. Cloudflare Cache API (per data center, free)
 *   3. D1 (5 queries in one batch) - only after a catalog change
 *
 * Every layer is keyed by `settings.catalog_version`, so a normal request
 * costs one 1-row D1 read. Admin writes call bumpCatalogVersion(), which
 * makes the next request rebuild the catalog - edits show up immediately,
 * with no TTL to wait out.
 *
 * Checkout never uses this: order.post.ts reads prices from D1 directly.
 */
import type { D1Database } from '@cloudflare/workers-types'
import type { H3Event } from 'h3'
import { useDb } from './db'
import type { MediaKind, PublicProductMedia } from '~~/shared/utils/media'

export interface StorefrontProduct {
  id: number
  slug: string
  title: string
  subtitle: string
  description: string
  badge: string
  accent: 'mint' | 'purple' | 'coral'
  categoryName: string | null
  ageSlug: string | null
  ageLabel: string | null
  /** What checkout charges now. */
  price: number
  /** Crossed-out regular price while on sale; equals `price` otherwise. */
  oldPrice: number
  isSale: boolean
  coverKey: string | null
  features: string[]
  activities: { title: string, description: string }[]
  sellingPoints: { title: string, text: string }[]
  media: PublicProductMedia[]
}

let memo: { version: string, products: StorefrontProduct[] } | null = null

export async function getCatalogVersion(db: D1Database): Promise<string> {
  const row = await db
    .prepare("SELECT value FROM settings WHERE key = 'catalog_version'")
    .first<{ value: string }>()
  return row?.value ?? '0'
}

/** Invalidate every cache layer. Call after any admin catalog write. */
export async function bumpCatalogVersion(db: D1Database): Promise<void> {
  await db
    .prepare(`INSERT INTO settings (key, value, updated_at) VALUES ('catalog_version', '1', datetime('now'))
              ON CONFLICT(key) DO UPDATE SET value = CAST(value AS INTEGER) + 1, updated_at = datetime('now')`)
    .run()
  memo = null
}

export async function getStorefrontCatalog(event: H3Event): Promise<StorefrontProduct[]> {
  const db = useDb(event)
  const version = await getCatalogVersion(db)

  if (memo?.version === version) return memo.products

  // Cache API exists on Workers only (not in `nuxt dev`).
  const cache: Cache | undefined = (globalThis as any).caches?.default
  const cacheKey = new Request(`${getRequestURL(event).origin}/__cache/catalog/v${version}`)

  if (cache) {
    const hit = await cache.match(cacheKey)
    if (hit) {
      const products = await hit.json() as StorefrontProduct[]
      memo = { version, products }
      return products
    }
  }

  const products = await loadCatalog(db)
  memo = { version, products }

  if (cache) {
    // Versioned key: safe to keep for a long time, old versions just expire.
    const put = cache.put(cacheKey, new Response(JSON.stringify(products), {
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'public, max-age=86400' },
    }))
    const waitUntil = (event.context as any).cloudflare?.context?.waitUntil
    if (typeof waitUntil === 'function') waitUntil.call((event.context as any).cloudflare.context, put)
    else await put
  }

  return products
}

async function loadCatalog(db: D1Database): Promise<StorefrontProduct[]> {
  const activeOnly = 'JOIN products p ON p.id = x.product_id AND p.active = 1'
  const [main, features, activities, points, images] = await db.batch([
    db.prepare(`SELECT * FROM v_storefront_products
                WHERE active = 1 AND price IS NOT NULL
                ORDER BY sort_order, id`),
    db.prepare(`SELECT x.product_id, x.label FROM product_features x ${activeOnly}
                ORDER BY x.product_id, x.sort_order, x.id`),
    db.prepare(`SELECT x.product_id, x.title, x.description FROM product_activities x ${activeOnly}
                ORDER BY x.product_id, x.sort_order, x.id`),
    db.prepare(`SELECT x.product_id, x.title, x.body FROM product_selling_points x ${activeOnly}
                ORDER BY x.product_id, x.sort_order, x.id`),
    db.prepare(`SELECT x.product_id, x.kind, x.r2_key, x.poster_key, x.alt FROM product_images x ${activeOnly}
                ORDER BY x.product_id, x.sort_order, x.id`),
  ])

  const group = <T extends { product_id: number }>(rows: unknown[] | undefined) => {
    const map = new Map<number, T[]>()
    for (const row of (rows ?? []) as T[]) {
      const list = map.get(row.product_id)
      if (list) list.push(row)
      else map.set(row.product_id, [row])
    }
    return map
  }
  const featureMap = group<{ product_id: number, label: string }>(features?.results)
  const activityMap = group<{ product_id: number, title: string, description: string }>(activities?.results)
  const pointMap = group<{ product_id: number, title: string, body: string }>(points?.results)
  const imageMap = group<{ product_id: number, kind: MediaKind, r2_key: string, poster_key: string | null, alt: string | null }>(images?.results)

  return ((main?.results ?? []) as any[]).map((p): StorefrontProduct => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    subtitle: p.subtitle ?? '',
    description: p.description ?? '',
    badge: p.badge ?? '',
    accent: p.accent,
    categoryName: p.category_name,
    ageSlug: p.age_slug,
    ageLabel: p.age_label,
    price: p.price,
    oldPrice: p.is_sale === 1 && p.regular_price ? p.regular_price : p.price,
    isSale: p.is_sale === 1,
    coverKey: p.cover_key,
    features: (featureMap.get(p.id) ?? []).map(r => r.label),
    activities: (activityMap.get(p.id) ?? []).map(r => ({ title: r.title, description: r.description })),
    sellingPoints: (pointMap.get(p.id) ?? []).map(r => ({ title: r.title, text: r.body })),
    media: (imageMap.get(p.id) ?? []).map(r => ({ kind: r.kind, key: r.r2_key, posterKey: r.poster_key, alt: r.alt })),
  }))
}
