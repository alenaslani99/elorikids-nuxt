import { defineEventHandler, getQuery } from 'h3'
import { useDb } from '../../utils/db'
import { requireElevated } from '../../utils/admin'

export interface AdminOrderItem {
  slug: string
  title: string
  price: number
  quantity: number
}

export interface AdminOrder {
  id: string
  status: string
  customerName: string
  email: string
  phone: string
  address: string
  city: string
  postal: string
  note: string | null
  subtotal: number
  shipping: number
  grandTotal: number
  createdAt: string
  items: AdminOrderItem[]
}

export interface AdminOrdersResponse {
  orders: AdminOrder[]
  total: number
  statusCounts: Record<string, number>
}

const DEFAULT_PAGE_SIZE = 10

/**
 * Returns paginated orders with line items — admin/owner view.
 * Supports server-side filtering by status and search query.
 * Requires an elevated owner session.
 *
 * Query params: page, limit, status, search
 */
export default defineEventHandler(async (event): Promise<AdminOrdersResponse> => {
  const db = useDb(event)
  await requireElevated(event, db)

  const query = getQuery(event)
  const page = Math.max(1, Number(query.page) || 1)
  const limit = Math.min(100, Math.max(1, Number(query.limit) || DEFAULT_PAGE_SIZE))
  const offset = (page - 1) * limit
  const status = (query.status as string | undefined) || undefined
  const search = (query.search as string | undefined)?.trim().toLowerCase()

  // ── Build WHERE clause + params for filtering ───────────────────
  const conditions: string[] = []
  const params: (string | number)[] = []

  if (status && status !== 'all') {
    conditions.push('status = ?')
    params.push(status)
  }

  if (search) {
    const pattern = `%${search}%`
    conditions.push('(LOWER(id) LIKE ? OR LOWER(customer_name) LIKE ? OR LOWER(email) LIKE ? OR LOWER(phone) LIKE ? OR LOWER(city) LIKE ?)')
    params.push(pattern, pattern, pattern, pattern, pattern)
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

  // ── Fetch orders for current page ───────────────────────────────
  const ordersResult = await db
    .prepare(
      `SELECT id, status, customer_name, email, phone, address, city, postal, note,
              subtotal, shipping, grand_total, created_at
       FROM orders
       ${whereClause}
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`,
    )
    .bind(...params, limit, offset)
    .all<{
      id: string
      status: string
      customer_name: string
      email: string
      phone: string
      address: string
      city: string
      postal: string
      note: string | null
      subtotal: number
      shipping: number
      grand_total: number
      created_at: string
    }>()

  // ── Total count for pagination (with same filters) ───────────────
  const countSql = `SELECT COUNT(*) as total FROM orders ${whereClause}`.trim()
  const totalResult = params.length > 0
    ? await db.prepare(countSql).bind(...params).first<{ total: number }>()
    : await db.prepare(countSql).first<{ total: number }>()

  // ── Status counts (ALL orders, for filter tabs) ─────────────────
  const countsResult = await db
    .prepare('SELECT status, COUNT(*) as count FROM orders GROUP BY status')
    .all<{ status: string, count: number }>()

  const statusCounts: Record<string, number> = {
    received: 0, preparing: 0, in_transit: 0, delivered: 0, cancelled: 0,
  }
  for (const row of countsResult.results ?? []) {
    if (row.status in statusCounts) statusCounts[row.status] = row.count
  }

  // ── Fetch items for current page only ────────────────────────────
  const pageOrders = ordersResult.results ?? []
  const itemsByOrder = new Map<string, AdminOrderItem[]>()

  if (pageOrders.length > 0) {
    const orderIds = pageOrders.map(o => o.id)
    const placeholders = orderIds.map(() => '?').join(',')
    const itemsResult = await db
      .prepare(`SELECT order_id, slug, title, price, quantity FROM order_items WHERE order_id IN (${placeholders})`)
      .bind(...orderIds)
      .all<{
        order_id: string
        slug: string
        title: string
        price: number
        quantity: number
      }>()

    for (const item of itemsResult.results ?? []) {
      const list = itemsByOrder.get(item.order_id) ?? []
      list.push({
        slug: item.slug,
        title: item.title,
        price: item.price,
        quantity: item.quantity,
      })
      itemsByOrder.set(item.order_id, list)
    }
  }

  const orders: AdminOrder[] = pageOrders.map(row => ({
    id: row.id,
    status: row.status,
    customerName: row.customer_name,
    email: row.email,
    phone: row.phone,
    address: row.address,
    city: row.city,
    postal: row.postal,
    note: row.note,
    subtotal: row.subtotal,
    shipping: row.shipping,
    grandTotal: row.grand_total,
    createdAt: row.created_at,
    items: itemsByOrder.get(row.id) ?? [],
  }))

  return {
    orders,
    total: totalResult?.total ?? 0,
    statusCounts,
  }
})
