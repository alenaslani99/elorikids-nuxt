import { createError, defineEventHandler, readBody } from 'h3'
import { useDb } from '../../../../../utils/db'
import { requireElevated } from '../../../../../utils/admin'
import { requireIdParam } from '../../../../../utils/catalog'
import { validateAlt } from '../../../../../utils/media'

/** Update an image's alt text. Elevated owner only. */
export default defineEventHandler(async (event) => {
  const db = useDb(event)
  await requireElevated(event, db)
  const productId = requireIdParam(event)
  const imageId = requireIdParam(event, 'imageId')

  const body = await readBody<{ alt?: string }>(event)
  const alt = validateAlt(body?.alt)

  const result = await db
    .prepare('UPDATE product_images SET alt = ? WHERE id = ? AND product_id = ?')
    .bind(alt, imageId, productId)
    .run()
  if (!result.meta.changes) {
    throw createError({ statusCode: 404, statusMessage: 'Slika nije pronađena.' })
  }
  return { ok: true }
})
