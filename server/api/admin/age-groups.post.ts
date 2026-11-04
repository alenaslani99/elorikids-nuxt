import { createError, defineEventHandler, readBody } from 'h3'
import { useDb } from '../../utils/db'
import { requireElevated } from '../../utils/admin'
import { isUniqueViolation, validateText } from '../../utils/catalog'
import { CATALOG_LIMITS, slugify } from '~~/shared/utils/catalog'

/**
 * Create an age group from a label ('5–7 godina'); the slug is derived.
 * Elevated owner only.
 */
export default defineEventHandler(async (event) => {
  const db = useDb(event)
  const user = await requireElevated(event, db)

  const body = await readBody<{ label?: string }>(event)
  const label = validateText(body?.label, CATALOG_LIMITS.ageLabel, 'Unesite uzrast (npr. 5–7 godina).')
  const slug = slugify(label)
  if (!slug) {
    throw createError({ statusCode: 400, statusMessage: 'Uzrast mora sadržati slova ili brojeve.' })
  }

  try {
    const row = await db
      .prepare(`INSERT INTO age_groups (slug, label, sort_order)
                VALUES (?, ?, (SELECT COALESCE(MAX(sort_order), -1) + 1 FROM age_groups))
                RETURNING id`)
      .bind(slug, label)
      .first<{ id: number }>()
    console.log(`[admin/age-groups] ${user.email} created "${label}"`)
    return { ok: true, id: row!.id }
  }
  catch (err) {
    if (isUniqueViolation(err)) {
      throw createError({ statusCode: 409, statusMessage: 'Taj uzrast već postoji.' })
    }
    throw err
  }
})
