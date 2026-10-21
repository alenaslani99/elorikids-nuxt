import { defineEventHandler } from 'h3'
import { useDb } from '../../utils/db'
import { requireElevated } from '../../utils/admin'

export interface AdminCategory {
  id: number
  slug: string
  name: string
  parentId: number | null
  sortOrder: number
  productCount: number
  childCount: number
  createdAt: string
}

/**
 * Returns all categories (flat list; the client builds the tree from
 * parentId). Includes product/child counts so the UI can explain why a
 * category can't be deleted. Requires an elevated owner session.
 */
export default defineEventHandler(async (event): Promise<{ categories: AdminCategory[] }> => {
  const db = useDb(event)
  await requireElevated(event, db)

  const result = await db
    .prepare(
      `SELECT c.id, c.slug, c.name, c.parent_id, c.sort_order, c.created_at,
              (SELECT COUNT(*) FROM products p WHERE p.category_id = c.id) AS product_count,
              (SELECT COUNT(*) FROM categories ch WHERE ch.parent_id = c.id) AS child_count
       FROM categories c
       ORDER BY c.sort_order ASC, c.name ASC`,
    )
    .all<{
      id: number
      slug: string
      name: string
      parent_id: number | null
      sort_order: number
      created_at: string
      product_count: number
      child_count: number
    }>()

  return {
    categories: (result.results ?? []).map(row => ({
      id: row.id,
      slug: row.slug,
      name: row.name,
      parentId: row.parent_id,
      sortOrder: row.sort_order,
      productCount: row.product_count,
      childCount: row.child_count,
      createdAt: row.created_at,
    })),
  }
})
