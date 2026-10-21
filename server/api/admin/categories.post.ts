import { createError, defineEventHandler, readBody } from 'h3'
import { useDb } from '../../utils/db'
import { requireElevated } from '../../utils/admin'
import {
  isUniqueViolation, requireCategoryExists, validateOptionalId, validateSlug, validateSortOrder, validateText,
} from '../../utils/catalog'
import { CATALOG_LIMITS } from '~~/shared/utils/catalog'

interface CategoryBody {
  name?: string
  slug?: string
  parentId?: number | null
  sortOrder?: number
}

/**
 * Create a category. Requires an elevated owner session.
 */
export default defineEventHandler(async (event) => {
  const db = useDb(event)
  const user = await requireElevated(event, db)

  const body = await readBody<CategoryBody>(event)
  const name = validateText(body?.name, CATALOG_LIMITS.categoryName, 'Naziv kategorije je obavezan.')
  const slug = validateSlug(body?.slug)
  const parentId = validateOptionalId(body?.parentId, 'Neispravna nadređena kategorija.')
  const sortOrder = validateSortOrder(body?.sortOrder)

  if (parentId !== null) await requireCategoryExists(db, parentId)

  try {
    const result = await db
      .prepare('INSERT INTO categories (slug, name, parent_id, sort_order) VALUES (?, ?, ?, ?)')
      .bind(slug, name, parentId, sortOrder)
      .run()

    console.log(`[admin/categories] ${user.email} created #${result.meta.last_row_id} "${slug}"`)
    return { ok: true, id: result.meta.last_row_id as number }
  }
  catch (err) {
    if (isUniqueViolation(err)) {
      throw createError({ statusCode: 409, statusMessage: 'Kategorija sa tim slugom već postoji.' })
    }
    throw err
  }
})
