import { createError, defineEventHandler } from 'h3'
import { useDb } from '../../../../../utils/db'
import { bumpCatalogVersion } from '../../../../../utils/storefront'
import { requireElevated } from '../../../../../utils/admin'
import { requireIdParam } from '../../../../../utils/catalog'
import { deleteMedia, useMedia } from '../../../../../utils/media'

/** Remove a gallery item: DB row first, then its R2 object(s). Elevated owner only. */
export default defineEventHandler(async (event) => {
  const db = useDb(event)
  const user = await requireElevated(event, db)
  const productId = requireIdParam(event)
  const imageId = requireIdParam(event, 'imageId')
  const bucket = useMedia(event)

  const row = await db
    .prepare('DELETE FROM product_images WHERE id = ? AND product_id = ? RETURNING r2_key, poster_key')
    .bind(imageId, productId)
    .first<{ r2_key: string, poster_key: string | null }>()
  if (!row) {
    throw createError({ statusCode: 404, statusMessage: 'Slika nije pronađena.' })
  }

  await deleteMedia(bucket, [row.r2_key, row.poster_key])
  console.log(`[admin/media] ${user.email} deleted ${row.r2_key} from product #${productId}`)
  await bumpCatalogVersion(db)
  return { ok: true }
})
