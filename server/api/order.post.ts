import { createError, defineEventHandler, readBody, getRequestHeaders } from 'h3'
import { useDb } from '../utils/db'
import { getSessionUser } from '../utils/session'
import { emailRegex, serbianPhoneRegex, nameRegex, postalRegex } from '~~/shared/utils/validation'
import { FREE_SHIPPING_THRESHOLD, SHIPPING_FEE } from '~~/shared/utils/orders'
import { getProduct, MAX_ORDER_ITEMS } from '~~/shared/utils/products'
import { LIMITS, RATE_LIMITS } from '~~/shared/utils/limits'
import { checkRateLimit, getClientIp, maybeCleanupRateLimits } from '../utils/rateLimit'
import { generateTrackSuffix } from '../utils/crypto'

interface OrderItemInput {
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
  items?: OrderItemInput[]
  totals?: {
    subtotal: number
    shipping: number
    grandTotal: number
  }
}

export default defineEventHandler(async (event) => {
  const db = useDb(event)

  // ── Rate limiting ──────────────────────────────────────────────
  const headers = getRequestHeaders(event)
  const ip = getClientIp(headers)
  const rl = await checkRateLimit(db, `order:${ip}`, 'order', RATE_LIMITS.order.maxAttempts, RATE_LIMITS.order.windowMs)
  if (rl.limited) {
    throw createError({
      statusCode: 429,
      statusMessage: `Preveliki broj pokušaja. Pokušajte ponovo za ${Math.ceil(rl.retryAfterSec / 60)} minuta.`,
    })
  }
  await maybeCleanupRateLimits(db)

  const body = await readBody<OrderBody>(event)

  // --- Validate customer fields (with length limits) ---
  const name = body?.customer?.name?.trim()
  const phone = body?.customer?.phone?.trim()
  const email = body?.customer?.email?.trim().toLowerCase()
  const address = body?.customer?.address?.trim()
  const city = body?.customer?.city?.trim()
  const postal = body?.customer?.postal?.trim()
  const note = body?.customer?.note?.trim() || null

  if (!name || !nameRegex.test(name) || name.length > LIMITS.name) {
    throw createError({ statusCode: 400, statusMessage: 'Ime i prezime je obavezno.' })
  }
  if (!phone || !serbianPhoneRegex.test(phone) || phone.length > LIMITS.phone) {
    throw createError({ statusCode: 400, statusMessage: 'Ispravan broj telefona je obavezan.' })
  }
  if (!email || !emailRegex.test(email) || email.length > LIMITS.email) {
    throw createError({ statusCode: 400, statusMessage: 'Ispravna adresa e-pošte je obavezna.' })
  }
  if (!address || address.length > LIMITS.address) {
    throw createError({ statusCode: 400, statusMessage: 'Adresa dostave je obavezna.' })
  }
  if (!city || city.length > LIMITS.city) {
    throw createError({ statusCode: 400, statusMessage: 'Grad je obavezan.' })
  }
  if (!postal || !postalRegex.test(postal) || postal.length > LIMITS.postal) {
    throw createError({ statusCode: 400, statusMessage: 'Poštanski broj je obavezan.' })
  }
  if (note && note.length > LIMITS.note) {
    throw createError({ statusCode: 400, statusMessage: 'Napomena je preduga.' })
  }

  // --- Validate items ---
  const items = body?.items
  if (!items || !Array.isArray(items) || items.length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'Korpa je prazna.' })
  }
  if (items.length > MAX_ORDER_ITEMS) {
    throw createError({ statusCode: 400, statusMessage: 'Previše artikala u porudžbini.' })
  }

  // --- Look up canonical prices from server-side product table ---
  // Never trust client-provided prices. The client `price` field is ignored.
  const validatedItems = items.map((item) => {
    const product = getProduct(item.slug)
    if (!product) {
      throw createError({ statusCode: 400, statusMessage: `Nepoznat proizvod: ${item.slug}` })
    }
    const quantity = Math.max(1, Math.floor(Number(item.quantity) || 1))
    return {
      slug: product.slug,
      title: product.title,
      price: product.price,
      quantity,
    }
  })

  // --- Recompute totals server-side ---
  const subtotal = validatedItems.reduce((sum, i) => sum + i.price * i.quantity, 0)
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE
  const grandTotal = subtotal + shipping

  // --- Determine if user is logged in ---
  const sessionUser = await getSessionUser(event, db)
  const userId = sessionUser?.id ?? null

  // --- Insert order (auto-increment seq via SQLite) ---
  // The INSERT returns last_row_id (the seq), which we use to build the
  // human-readable `id` and the random `track_code`.
  const insertResult = await db
    .prepare(
      `INSERT INTO orders (id, track_code, user_id, customer_name, phone, email, address, city, postal, note, subtotal, shipping, grand_total, status, received_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'received', datetime('now'))`,
    )
    .bind(
      'PENDING', 'PENDING', userId, name, phone, email, address, city, postal, note,
      subtotal, shipping, grandTotal,
    )
    .run()

  const seq = insertResult.meta.last_row_id as number
  const year = new Date().getFullYear()
  const orderId = `EK-${year}-${String(seq).padStart(6, '0')}`
  const trackCode = `${orderId}-${generateTrackSuffix()}`

  // Update the placeholder id + track_code with the real values
  await db
    .prepare('UPDATE orders SET id = ?, track_code = ? WHERE seq = ?')
    .bind(orderId, trackCode, seq)
    .run()

  // --- Insert order items ---
  const itemStmts = validatedItems.map((item) =>
    db
      .prepare('INSERT INTO order_items (order_seq, slug, title, price, quantity) VALUES (?, ?, ?, ?, ?)')
      .bind(seq, item.slug, item.title, item.price, item.quantity),
  )

  await db.batch(itemStmts)

  console.log(`[order] ${orderId} (track: ${trackCode}) — ${name} <${email}> — ${grandTotal} RSD (${validatedItems.length} items)`)

  // Return the track_code as the customer-facing "orderId"
  return { ok: true, orderId: trackCode }
})
