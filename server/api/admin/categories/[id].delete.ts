import { createError, defineEventHandler } from 'h3'
import { useDb } from '../../../utils/db'
import { requireElevated } from '../../../utils/admin'
import { requireIdParam } from '../../../utils/catalog'

/**
 * Delete a category. Only empty categories can be deleted: the schema
 * would CASCADE subcategories away (and RESTRICT on their products), so
 * we refuse up front with a clear message instead of a silent cascade.
 * Requires an elevated owner session.
 */
export default defineEventHandler(async (event) => {
  const db = useDb(event)
  const user = await requireElevated(event, db)
  const id = requireIdParam(event)

  const row = await db
    .prepare(
      `SELECT slug,
              (SELECT COUNT(*) FROM categories WHERE parent_id = ?) AS child_count,
              (SELECT COUNT(*) FROM products WHERE category_id = ?) AS product_count
       FROM categories WHERE id = ?`,
    )
    .bind(id, id, id)
    .first<{ slug: string, child_count: number, product_count: number }>()

  if (!row) {
    throw createError({ statusCode: 404, statusMessage: 'Kategorija nije pronađena.' })
  }
  if (row.child_count > 0) {
    throw createError({ statusCode: 409, statusMessage: 'Kategorija ima podkategorije. Prvo ih premestite ili obrišite.' })
  }
  if (row.product_count > 0) {
    throw createError({ statusCode: 409, statusMessage: 'Kategorija ima proizvode. Prvo ih premestite u drugu kategoriju.' })
  }

  await db.prepare('DELETE FROM categories WHERE id = ?').bind(id).run()

  console.log(`[admin/categories] ${user.email} deleted #${id} "${row.slug}"`)
  return { ok: true }
})
