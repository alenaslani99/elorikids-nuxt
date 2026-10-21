import { createError, defineEventHandler } from 'h3'
import { useDb } from '../../../utils/db'
import { requireElevated } from '../../../utils/admin'
import { requireIdParam } from '../../../utils/catalog'

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

  await db.prepare('DELETE FROM products WHERE id = ?').bind(id).run()

  console.log(`[admin/products] ${user.email} deleted #${id} "${product.slug}"`)
  return { ok: true }
})
