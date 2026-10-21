import { defineEventHandler } from 'h3'
import { useDb } from '../../utils/db'
import { requireElevated } from '../../utils/admin'

export interface AdminProduct {
  id: number
  slug: string
  title: string
  categoryId: number | null
  categoryName: string | null
  active: boolean
  /** Regular price - newest effective non-sale row. */
  price: number | null
  /** Sale price, only when the newest effective row is a sale row. */
  salePrice: number | null
  /** What checkout charges right now (newest effective row). */
  currentPrice: number | null
  orderCount: number
  createdAt: string
  updatedAt: string
}

/**
 * Returns the full product catalog with current prices - admin view.
 * The catalog is small, so search/filter happen client-side.
 * Requires an elevated owner session.
 */
export default defineEventHandler(async (event): Promise<{ products: AdminProduct[] }> => {
  const db = useDb(event)
  await requireElevated(event, db)

  const result = await db
    .prepare(
      `SELECT p.id, p.slug, p.title, p.category_id, c.name AS category_name, p.active,
              p.created_at, p.updated_at,
              cur.amount AS current_price, cur.is_sale AS current_is_sale,
              (SELECT amount FROM product_prices
               WHERE product_id = p.id AND is_sale = 0 AND effective_from <= datetime('now')
               ORDER BY effective_from DESC, id DESC LIMIT 1) AS regular_price,
              (SELECT COUNT(*) FROM order_items oi WHERE oi.product_id = p.id) AS order_count
       FROM products p
       LEFT JOIN categories c ON c.id = p.category_id
       LEFT JOIN product_prices cur ON cur.id = (
         SELECT id FROM product_prices
         WHERE product_id = p.id AND effective_from <= datetime('now')
         ORDER BY effective_from DESC, id DESC LIMIT 1
       )
       ORDER BY p.created_at DESC, p.id DESC`,
    )
    .all<{
      id: number
      slug: string
      title: string
      category_id: number | null
      category_name: string | null
      active: number
      created_at: string
      updated_at: string
      current_price: number | null
      current_is_sale: number | null
      regular_price: number | null
      order_count: number
    }>()

  return {
    products: (result.results ?? []).map(row => ({
      id: row.id,
      slug: row.slug,
      title: row.title,
      categoryId: row.category_id,
      categoryName: row.category_name,
      active: row.active === 1,
      price: row.regular_price,
      salePrice: row.current_is_sale === 1 ? row.current_price : null,
      currentPrice: row.current_price,
      orderCount: row.order_count,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    })),
  }
})
