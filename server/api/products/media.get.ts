import { defineEventHandler, setResponseHeader } from 'h3'
import { useDb } from '../../utils/db'
import type { PublicProductMedia } from '~~/shared/utils/media'

/**
 * Public: gallery items for every product, keyed by slug, in display
 * order. Only R2 keys are returned; the client builds URLs against the
 * media domain. Products without rows are simply absent, and the
 * storefront falls back to the bundled /public images for them.
 *
 * Never fails the page: if D1 or the table is unavailable (e.g. the
 * 0008 migration has not run yet) it returns an empty map.
 */
export default defineEventHandler(async (event): Promise<{ media: Record<string, PublicProductMedia[]> }> => {
  setResponseHeader(event, 'Cache-Control', 'public, max-age=60')

  try {
    const db = useDb(event)
    const result = await db
      .prepare(`SELECT p.slug, i.kind, i.r2_key, i.poster_key, i.alt
                FROM product_images i
                JOIN products p ON p.id = i.product_id
                ORDER BY p.id, i.sort_order, i.id`)
      .all<{ slug: string, kind: 'image' | 'video', r2_key: string, poster_key: string | null, alt: string | null }>()

    const media: Record<string, PublicProductMedia[]> = {}
    for (const row of result.results ?? []) {
      (media[row.slug] ??= []).push({ kind: row.kind, key: row.r2_key, posterKey: row.poster_key, alt: row.alt })
    }
    return { media }
  }
  catch (err) {
    console.error('[products/media] Falling back to bundled images:', err)
    return { media: {} }
  }
})
