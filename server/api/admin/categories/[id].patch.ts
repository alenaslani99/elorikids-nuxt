import { createError, defineEventHandler, readBody } from 'h3'
import { useDb } from '../../../utils/db'
import { requireElevated } from '../../../utils/admin'
import {
  isUniqueViolation, requireCategoryExists, requireIdParam, validateOptionalId, validateSlug, validateSortOrder, validateText,
} from '../../../utils/catalog'
import { CATALOG_LIMITS } from '~~/shared/utils/catalog'

interface CategoryBody {
  name?: string
  slug?: string
  parentId?: number | null
  sortOrder?: number
}

/**
 * Update a category (name, slug, parent, sort order). Rejects moving a
 * category under itself or one of its descendants, which would create a
 * cycle in the tree. Requires an elevated owner session.
 */
export default defineEventHandler(async (event) => {
  const db = useDb(event)
  const user = await requireElevated(event, db)
  const id = requireIdParam(event)

  const body = await readBody<CategoryBody>(event)
  const name = validateText(body?.name, CATALOG_LIMITS.categoryName, 'Naziv kategorije je obavezan.')
  const slug = validateSlug(body?.slug)
  const parentId = validateOptionalId(body?.parentId, 'Neispravna nadređena kategorija.')
  const sortOrder = validateSortOrder(body?.sortOrder)

  const existing = await db.prepare('SELECT 1 FROM categories WHERE id = ?').bind(id).first()
  if (!existing) {
    throw createError({ statusCode: 404, statusMessage: 'Kategorija nije pronađena.' })
  }

  if (parentId !== null) {
    await requireCategoryExists(db, parentId)

    // The new parent must not be this category or any of its descendants
    const cycle = await db
      .prepare(
        `WITH RECURSIVE subtree(id) AS (
           SELECT ?
           UNION
           SELECT c.id FROM categories c JOIN subtree s ON c.parent_id = s.id
         )
         SELECT 1 FROM subtree WHERE id = ? LIMIT 1`,
      )
      .bind(id, parentId)
      .first()
    if (cycle) {
      throw createError({ statusCode: 400, statusMessage: 'Kategorija ne može biti podkategorija same sebe.' })
    }
  }

  try {
    await db
      .prepare('UPDATE categories SET name = ?, slug = ?, parent_id = ?, sort_order = ? WHERE id = ?')
      .bind(name, slug, parentId, sortOrder, id)
      .run()
  }
  catch (err) {
    if (isUniqueViolation(err)) {
      throw createError({ statusCode: 409, statusMessage: 'Kategorija sa tim slugom već postoji.' })
    }
    throw err
  }

  console.log(`[admin/categories] ${user.email} updated #${id} "${slug}"`)
  return { ok: true }
})
