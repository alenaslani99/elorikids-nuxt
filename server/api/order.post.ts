import { createError, defineEventHandler, readBody, getRequestHeaders } from 'h3'
import { useDb } from '../utils/db'
import { getSessionUser } from '../utils/session'
import { emailRegex, serbianPhoneRegex, nameRegex, postalRegex, streetNumberRegex } from '~~/shared/utils/validation'
import { FREE_SHIPPING_THRESHOLD, SHIPPING_FEE } from '~~/shared/utils/orders'
import { MAX_ORDER_ITEMS } from '~~/shared/utils/products'
import { LIMITS, RATE_LIMITS } from '~~/shared/utils/limits'
import { checkRateLimit, getClientIp, maybeCleanupRateLimits } from '../utils/rateLimit'
import { generateTrackNumber } from '../utils/crypto'

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
  street: string
  streetNumber: string
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
  const street = body?.customer?.street?.trim()
  const streetNumber = body?.customer?.streetNumber?.trim()
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
  if (!street || street.length > LIMITS.street) {
    throw createError({ statusCode: 400, statusMessage: 'Ulica je obavezna.' })
  }
  if (!streetNumber || !streetNumberRegex.test(streetNumber) || streetNumber.length > LIMITS.streetNumber) {
    throw createError({ statusCode: 400, statusMessage: 'Broj je obavezan. Format: broj, broj/broj ili BB.' })
  }
  // Normalize "bb" -> "BB" for consistent display/storage.
  const normalizedStreetNumber = streetNumber.toUpperCase()
  const address = `${street} ${normalizedStreetNumber}`
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

  // --- Look up canonical prices/titles from the DB ---
  // Never trust client-provided prices. The client `price` field is ignored.
  // The current price = newest product_prices row with effective_from <= now.
  const slugs = items.map((i) => String(i.slug))
  const placeholders = slugs.map(() => '?').join(', ')
  const priceRows = await db
    .prepare(
      `SELECT p.id, p.slug, p.title, pr.amount AS price, pr.is_sale
       FROM products p
       LEFT JOIN product_prices pr ON pr.product_id = p.id
         AND pr.id = (
           SELECT id FROM product_prices
           WHERE product_id = p.id AND effective_from <= datetime('now')
           ORDER BY effective_from DESC, id DESC LIMIT 1
         )
       WHERE p.slug IN (${placeholders}) AND p.active = 1`,
    )
    .bind(...slugs)
    .all<{ id: number, slug: string, title: string, price: number | null, is_sale: number }>()

  const priceMap = new Map(priceRows.results?.map((r) => [r.slug, r]) ?? [])

  const validatedItems = items.map((item) => {
    const product = priceMap.get(String(item.slug))
    if (!product || product.price == null) {
      throw createError({ statusCode: 400, statusMessage: `Nepoznat proizvod: ${item.slug}` })
    }
    const quantity = Math.max(1, Math.floor(Number(item.quantity) || 1))
    return {
      id: product.id,
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

  // --- Insert order ---
  // `id` is auto-increment (SQLite assigns it). `track_number` is the
  // public tracking ID, generated up front so there's no second UPDATE step.
  const year = new Date().getFullYear()
  const trackNumber = generateTrackNumber(year)

  const insertResult = await db
    .prepare(
      `INSERT INTO orders (track_number, user_id, customer_name, phone, email, address, city, postal, note, subtotal, shipping, grand_total, received_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
    )
    .bind(
      trackNumber, userId, name, phone, email, address, city, postal, note,
      subtotal, shipping, grandTotal,
    )
    .run()

  const orderId = insertResult.meta.last_row_id as number

  // --- Insert order items ---
  // Stores product_id for analytics; slug/title/price are a snapshot
  // so the order history stays intact if a product is later deleted.
  const itemStmts = validatedItems.map((item) =>
    db
      .prepare('INSERT INTO order_items (order_id, product_id, slug, title, price, quantity) VALUES (?, ?, ?, ?, ?, ?)')
      .bind(orderId, item.id, item.slug, item.title, item.price, item.quantity),
  )

  await db.batch(itemStmts)

  console.log(`[order] #${orderId} (track: ${trackNumber}) - ${name} <${email}> - ${grandTotal} RSD (${validatedItems.length} items)`)

  // ── Send order confirmation email ─────────────────────────────────
  // Best-effort: an email failure must never break a successful order.
  // The order is already in the DB; we log the error instead of failing.
  try {
    const { sendEmail, buildOrderMail } = await import('../utils/mail')
    const { subject, html, text } = buildOrderMail({
      customerName: name,
      email,
      phone,
      trackNumber,
      items: validatedItems.map((i) => ({
        title: i.title,
        quantity: i.quantity,
        price: i.price,
      })),
      subtotal,
      shipping,
      grandTotal,
      address,
      city,
      postal,
      note,
    })
    await sendEmail(event, email, subject, html, {
      text,
      from: 'porudzbine@elorikids.rs',
    })
    console.log(`[order] Confirmation email sent to ${email} (track: ${trackNumber})`)
  } catch (err) {
    console.error(`[order] Failed to send confirmation email to ${email}:`, err)
  }

  // Return the track_number as the customer-facing "orderId"
  return { ok: true, orderId: trackNumber }
})
