import { createError, defineEventHandler } from 'h3'
import { useDb } from '../utils/db'
import { getSessionUser } from '../utils/session'

export interface OrderListItem {
  id: string
  status: string
  grandTotal: number
  itemCount: number
  createdAt: string
}

/**
 * Returns orders for the currently authenticated user.
 * Protected — requires a valid session.
 */
export default defineEventHandler(async (event): Promise<OrderListItem[]> => {
  const db = useDb(event)
  const sessionUser = await getSessionUser(event, db)

  if (!sessionUser) {
    throw createError({ statusCode: 401, statusMessage: 'Morate biti prijavljeni.' })
  }

  const result = await db
    .prepare(
      `SELECT
         o.id, o.status, o.grand_total, o.created_at,
         (SELECT COUNT(*) FROM order_items oi WHERE oi.order_id = o.id) as item_count
       FROM orders o
       WHERE o.user_id = ?
       ORDER BY o.created_at DESC`,
    )
    .bind(sessionUser.id)
    .all<{
      id: string
      status: string
      grand_total: number
      item_count: number
      created_at: string
    }>()

  return (result.results ?? []).map(row => ({
    id: row.id,
    status: row.status,
    grandTotal: row.grand_total,
    itemCount: row.item_count,
    createdAt: row.created_at,
  }))
})
