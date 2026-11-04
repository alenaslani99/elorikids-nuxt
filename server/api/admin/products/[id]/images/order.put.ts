import { createError, defineEventHandler, readBody } from 'h3'
import { useDb } from '../../../../../utils/db'
import { requireElevated } from '../../../../../utils/admin'
import { requireIdParam } from '../../../../../utils/catalog'

/**
 * Reorder a product's gallery. Body: { ids: number[] } listing every
 * image of the product exactly once, in the new order. The first image
 * becomes the product cover. Elevated owner only.
 */
export default defineEventHandler(async (event) => {
  const db = useDb(event)
  await requireElevated(event, db)
  const productId = requireIdParam(event)

  const body = await readBody<{ ids?: unknown }>(event)
  const ids = Array.isArray(body?.ids) ? body.ids.map(Number) : []

  const current = await db
    .prepare('SELECT id FROM product_images WHERE product_id = ?')
    .bind(productId)
    .all<{ id: number }>()
  const existing = new Set((current.results ?? []).map(r => r.id))

  const sameSet = ids.length === existing.size
    && new Set(ids).size === ids.length
    && ids.every(id => existing.has(id))
  if (!sameSet) {
    throw createError({ statusCode: 400, statusMessage: 'Neispravan redosled - osvežite stranicu i pokušajte ponovo.' })
  }
  if (!ids.length) return { ok: true }

  await db.batch(ids.map((id, index) =>
    db.prepare('UPDATE product_images SET sort_order = ? WHERE id = ? AND product_id = ?').bind(index, id, productId),
  ))
  return { ok: true }
})
