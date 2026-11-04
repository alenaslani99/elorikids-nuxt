import { createError, defineEventHandler } from 'h3'
import { useDb } from '../../../../utils/db'
import { requireElevated } from '../../../../utils/admin'
import { requireIdParam } from '../../../../utils/catalog'
import { toAdminImage, type AdminProductImage, type ProductImageRow } from '../../../../utils/media'

/** Gallery items of one product, in display order. Elevated owner only. */
export default defineEventHandler(async (event): Promise<{ images: AdminProductImage[] }> => {
  const db = useDb(event)
  await requireElevated(event, db)
  const id = requireIdParam(event)

  const product = await db.prepare('SELECT 1 FROM products WHERE id = ?').bind(id).first()
  if (!product) {
    throw createError({ statusCode: 404, statusMessage: 'Proizvod nije pronađen.' })
  }

  const result = await db
    .prepare('SELECT * FROM product_images WHERE product_id = ? ORDER BY sort_order, id')
    .bind(id)
    .all<ProductImageRow>()

  return { images: (result.results ?? []).map(toAdminImage) }
})
