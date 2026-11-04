import { createError, defineEventHandler } from 'h3'
import { useDb } from '../../../utils/db'
import { requireElevated } from '../../../utils/admin'
import { requireIdParam } from '../../../utils/catalog'
import { deleteMedia, useMedia } from '../../../utils/media'

/**
 * Permanently delete a product. Its price history cascades away; past
 * orders keep their slug/title/price snapshot (order_items.product_id is
 * set to NULL). Deactivating is usually the better option - the UI says
 * so before calling this. Requires an elevated owner session.
 */
export default defineEventHandler(async (event) => {
  const db = useDb(event)
  const user = await requireElevated(event, db)
  const id = requireIdParam(event)

  const product = await db.prepare('SELECT slug FROM products WHERE id = ?').bind(id).first<{ slug: string }>()
  if (!product) {
    throw createError({ statusCode: 404, statusMessage: 'Proizvod nije pronađen.' })
  }

  // Collect R2 keys before the cascade removes the product_images rows.
  const media = await db
    .prepare('SELECT r2_key, poster_key FROM product_images WHERE product_id = ?')
    .bind(id)
    .all<{ r2_key: string, poster_key: string | null }>()
  const keys = (media.results ?? []).flatMap(r => [r.r2_key, r.poster_key])

  await db.prepare('DELETE FROM products WHERE id = ?').bind(id).run()
  if (keys.length) await deleteMedia(useMedia(event), keys)

  console.log(`[admin/products] ${user.email} deleted #${id} "${product.slug}" (${keys.filter(Boolean).length} media files)`)
  return { ok: true }
})
