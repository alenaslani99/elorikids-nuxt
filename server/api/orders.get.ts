import { createError, defineEventHandler, getQuery } from 'h3'
import { useDb } from '../utils/db'
import { getSessionUser } from '../utils/session'

export interface OrderListItem {
  id: string
  status: string
  grandTotal: number
  itemCount: number
  createdAt: string
}

export interface OrdersResponse {
  orders: OrderListItem[]
  total: number
}

const DEFAULT_PAGE_SIZE = 5

/**
 * Returns paginated orders for the currently authenticated user.
 * Protected — requires a valid session.
 *
 * Query params: page, limit
 */
export default defineEventHandler(async (event): Promise<OrdersResponse> => {
  const db = useDb(event)
  const sessionUser = await getSessionUser(event, db)

  if (!sessionUser) {
    throw createError({ statusCode: 401, statusMessage: 'Morate biti prijavljeni.' })
  }

  const query = getQuery(event)
  const page = Math.max(1, Number(query.page) || 1)
  const limit = Math.min(50, Math.max(1, Number(query.limit) || DEFAULT_PAGE_SIZE))
  const offset = (page - 1) * limit

  const result = await db
    .prepare(
      `SELECT
         o.id, o.status, o.grand_total, o.created_at,
         (SELECT COUNT(*) FROM order_items oi WHERE oi.order_id = o.id) as item_count
       FROM orders o
       WHERE o.user_id = ?
       ORDER BY o.created_at DESC
       LIMIT ? OFFSET ?`,
    )
    .bind(sessionUser.id, limit, offset)
    .all<{
      id: string
      status: string
      grand_total: number
      item_count: number
      created_at: string
    }>()

  const totalResult = await db
    .prepare('SELECT COUNT(*) as total FROM orders WHERE user_id = ?')
    .bind(sessionUser.id)
    .first<{ total: number }>()

  return {
    orders: (result.results ?? []).map(row => ({
      id: row.id,
      status: row.status,
      grandTotal: row.grand_total,
      itemCount: row.item_count,
      createdAt: row.created_at,
    })),
    total: totalResult?.total ?? 0,
  }
})
