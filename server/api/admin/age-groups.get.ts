import { defineEventHandler } from 'h3'
import { useDb } from '../../utils/db'
import { requireElevated } from '../../utils/admin'

export interface AdminAgeGroup {
  id: number
  slug: string
  label: string
  sortOrder: number
}

/** Age groups for the product form select. Elevated owner only. */
export default defineEventHandler(async (event): Promise<{ ageGroups: AdminAgeGroup[] }> => {
  const db = useDb(event)
  await requireElevated(event, db)

  const result = await db
    .prepare('SELECT id, slug, label, sort_order FROM age_groups ORDER BY sort_order, id')
    .all<{ id: number, slug: string, label: string, sort_order: number }>()

  return {
    ageGroups: (result.results ?? []).map(r => ({ id: r.id, slug: r.slug, label: r.label, sortOrder: r.sort_order })),
  }
})
