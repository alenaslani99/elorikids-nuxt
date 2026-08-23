import { createError, defineEventHandler, readBody } from 'h3'
import type { D1Database } from '@cloudflare/workers-types'
import { useDb } from '../utils/db'
import { getSessionUser } from '../utils/session'
import { emailRegex, serbianPhoneRegex, nameRegex, postalRegex } from '~~/shared/utils/validation'
import { FREE_SHIPPING_THRESHOLD, SHIPPING_FEE } from '~~/shared/utils/orders'

interface OrderItem {
  slug: string
  title: string
  price: number
  quantity: number
}

interface Customer {
  name: string
  phone: string
  email: string
  address: string
  city: string
  postal: string
  note?: string
}

interface OrderBody {
  customer?: Customer
  items?: OrderItem[]
  totals?: {
    subtotal: number
    shipping: number
    grandTotal: number
  }
}

export default defineEventHandler(async (event) => {
  const db = useDb(event)
  const body = await readBody<OrderBody>(event)

  // --- Validate customer ---
  const name = body?.customer?.name?.trim()
  const phone = body?.customer?.phone?.trim()
  const email = body?.customer?.email?.trim().toLowerCase()
  const address = body?.customer?.address?.trim()
  const city = body?.customer?.city?.trim()
  const postal = body?.customer?.postal?.trim()
  const note = body?.customer?.note?.trim() || null

  if (!name || !nameRegex.test(name)) {
    throw createError({ statusCode: 400, statusMessage: 'Ime i prezime je obavezno.' })
  }
  if (!phone || !serbianPhoneRegex.test(phone)) {
    throw createError({ statusCode: 400, statusMessage: 'Ispravan broj telefona je obavezan.' })
  }
  if (!email || !emailRegex.test(email)) {
    throw createError({ statusCode: 400, statusMessage: 'Ispravna adresa e-pošte je obavezna.' })
  }
  if (!address) {
    throw createError({ statusCode: 400, statusMessage: 'Adresa dostave je obavezna.' })
  }
  if (!city) {
    throw createError({ statusCode: 400, statusMessage: 'Grad je obavezan.' })
  }
  if (!postal || !postalRegex.test(postal)) {
    throw createError({ statusCode: 400, statusMessage: 'Poštanski broj je obavezan.' })
  }

  // --- Validate items ---
  const items = body?.items
  if (!items || !Array.isArray(items) || items.length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'Korpa je prazna.' })
  }

  // --- Recompute totals server-side (trust but verify) ---
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0)
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE
  const grandTotal = subtotal + shipping

  if (body?.totals && Math.abs(body.totals.grandTotal - grandTotal) > 1) {
    throw createError({ statusCode: 400, statusMessage: 'Ukupan iznos se ne slaže. Osvežite stranicu i pokušajte ponovo.' })
  }

  // --- Determine if user is logged in ---
  const sessionUser = await getSessionUser(event, db)
  const userId = sessionUser?.id ?? null

  // --- Generate order ID: EK-YYYY-NNNNNN ---
  const year = new Date().getFullYear()
  const orderId = await generateOrderId(db, year)

  // --- Persist order + items (single transaction) ---
  const stmts = [
    db
      .prepare(
        `INSERT INTO orders (id, user_id, customer_name, phone, email, address, city, postal, note, subtotal, shipping, grand_total, status, received_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'received', datetime('now'))`,
      )
      .bind(
        orderId, userId, name, phone, email, address, city, postal, note,
        subtotal, shipping, grandTotal,
      ),
    // Order items
    ...items.map((item) =>
      db
        .prepare('INSERT INTO order_items (order_id, slug, title, price, quantity) VALUES (?, ?, ?, ?, ?)')
        .bind(orderId, item.slug, item.title, item.price, item.quantity),
    ),
  ]

  await db.batch(stmts)

  console.log(`[order] ${orderId} — ${name} <${email}> — ${grandTotal} RSD (${items.length} items)`)

  return { ok: true, orderId }
})

/**
 * Generate a sequential order ID within the current year.
 * Format: EK-2026-000001
 * Counts existing orders for the year, then +1.
 */
async function generateOrderId(db: D1Database, year: number): Promise<string> {
  const result = await db
    .prepare(
      `SELECT COUNT(*) as count FROM orders WHERE id LIKE ?`,
    )
    .bind(`EK-${year}-%`)
    .first<{ count: number }>()

  const seq = (result?.count ?? 0) + 1
  return `EK-${year}-${String(seq).padStart(6, '0')}`
}
