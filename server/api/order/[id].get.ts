import { createError, defineEventHandler, getRouterParam } from 'h3'
import { useDb } from '../../utils/db'

export interface OrderTrackingResponse {
  id: string
  status: string
  createdAt: string
  customer: {
    name: string
    city: string
  }
  totals: {
    subtotal: number
    shipping: number
    grandTotal: number
  }
  items: {
    slug: string
    title: string
    price: number
    quantity: number
  }[]
  events: {
    status: string
    label: string
    description: string
    createdAt: string
  }[]
}

export default defineEventHandler(async (event): Promise<OrderTrackingResponse> => {
  const db = useDb(event)
  const orderId = String(getRouterParam(event, 'id') ?? '').trim().toUpperCase()

  if (!orderId) {
    throw createError({ statusCode: 400, statusMessage: 'Broj porudžbine je obavezan.' })
  }

  const order = await db
    .prepare(
      `SELECT id, status, customer_name, city, subtotal, shipping, grand_total, created_at
       FROM orders WHERE id = ?`,
    )
    .bind(orderId)
    .first<{
      id: string
      status: string
      customer_name: string
      city: string
      subtotal: number
      shipping: number
      grand_total: number
      created_at: string
    }>()

  if (!order) {
    throw createError({ statusCode: 404, statusMessage: 'Porudžbina nije pronađena. Proverite broj i pokušajte ponovo.' })
  }

  const [itemsResult, eventsResult] = await Promise.all([
    db
      .prepare('SELECT slug, title, price, quantity FROM order_items WHERE order_id = ?')
      .bind(orderId)
      .all<{ slug: string, title: string, price: number, quantity: number }>(),
    db
      .prepare(
        `SELECT status, label, description, created_at
         FROM order_events WHERE order_id = ? ORDER BY id ASC`,
      )
      .bind(orderId)
      .all<{ status: string, label: string, description: string, created_at: string }>(),
  ])

  return {
    id: order.id,
    status: order.status,
    createdAt: order.created_at,
    customer: {
      name: order.customer_name,
      city: order.city,
    },
    totals: {
      subtotal: order.subtotal,
      shipping: order.shipping,
      grandTotal: order.grand_total,
    },
    items: itemsResult.results ?? [],
    events: eventsResult.results ?? [],
  }
})
