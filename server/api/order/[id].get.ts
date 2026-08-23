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
  timeline: {
    status: string
    at: string
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
      `SELECT id, status, customer_name, city, subtotal, shipping, grand_total, created_at,
              received_at, preparing_at, in_transit_at, delivered_at, cancelled_at
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
      received_at: string | null
      preparing_at: string | null
      in_transit_at: string | null
      delivered_at: string | null
      cancelled_at: string | null
    }>()

  if (!order) {
    throw createError({ statusCode: 404, statusMessage: 'Porudžbina nije pronađena. Proverite broj i pokušajte ponovo.' })
  }

  const itemsResult = await db
    .prepare('SELECT slug, title, price, quantity FROM order_items WHERE order_id = ?')
    .bind(orderId)
    .all<{ slug: string, title: string, price: number, quantity: number }>()

  // Build timeline from timestamp columns (only non-null phases, in lifecycle order)
  const phases: Array<[string, string | null]> = [
    ['received', order.received_at],
    ['preparing', order.preparing_at],
    ['in_transit', order.in_transit_at],
    ['delivered', order.delivered_at],
    ['cancelled', order.cancelled_at],
  ]
  const timeline = phases
    .filter(([, at]) => !!at)
    .map(([status, at]) => ({ status, at: at as string }))

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
    timeline,
  }
})
