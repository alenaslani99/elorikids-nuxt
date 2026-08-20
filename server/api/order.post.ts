import { createError, defineEventHandler, readBody } from 'h3'

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

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const phoneRegex = /^\+?\d[\d\s/-]{6,}$/

export default defineEventHandler(async (event) => {
  const body = await readBody<OrderBody>(event)

  // --- Validate customer ---
  const name = body?.customer?.name?.trim()
  const phone = body?.customer?.phone?.trim()
  const email = body?.customer?.email?.trim().toLowerCase()
  const address = body?.customer?.address?.trim()
  const city = body?.customer?.city?.trim()
  const postal = body?.customer?.postal?.trim()
  const note = body?.customer?.note?.trim()

  if (!name) {
    throw createError({ statusCode: 400, statusMessage: 'Ime i prezime je obavezno.' })
  }
  if (!phone || !phoneRegex.test(phone)) {
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
  if (!postal) {
    throw createError({ statusCode: 400, statusMessage: 'Poštanski broj je obavezan.' })
  }

  // --- Validate items ---
  const items = body?.items
  if (!items || !Array.isArray(items) || items.length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'Korpa je prazna.' })
  }

  // --- Recompute totals server-side (trust but verify) ---
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0)
  const FREE_SHIPPING_THRESHOLD = 5000
  const SHIPPING_FEE = 350
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE
  const grandTotal = subtotal + shipping

  // Sanity check against client-sent total (allow rounding tolerance)
  if (body?.totals && Math.abs(body.totals.grandTotal - grandTotal) > 1) {
    throw createError({ statusCode: 400, statusMessage: 'Ukupan iznos se ne slaže. Osvežite stranicu i pokušajte ponovo.' })
  }

  // --- Generate order id ---
  const orderId = `EK-${Date.now().toString().slice(-6)}`

  // --- Compose readable order email ---
  const itemList = items
    .map(i => `  • ${i.title} — ${i.quantity} × ${i.price.toLocaleString('sr-RS')} RSD = ${(i.price * i.quantity).toLocaleString('sr-RS')} RSD`)
    .join('\n')

  const mailBody = [
    `Nova porudžbina — ${orderId}`,
    ``,
    `Kupac:`,
    `  Ime: ${name}`,
    `  Telefon: ${phone}`,
    `  E-pošta: ${email}`,
    `  Adresa: ${address}`,
    `  ${postal} ${city}`,
    note ? `\nNapomena: ${note}` : '',
    ``,
    `Stavke:`,
    itemList,
    ``,
    `Rezime:`,
    `  Knjige: ${subtotal.toLocaleString('sr-RS')} RSD`,
    `  Dostava: ${shipping === 0 ? 'Besplatno' : `${shipping.toLocaleString('sr-RS')} RSD`}`,
    `  UKUPNO: ${grandTotal.toLocaleString('sr-RS')} RSD`,
    ``,
    `Plaćanje: Pouzeće (prijem robe)`,
  ].filter(Boolean).join('\n')

  // TODO: wire a real provider (Resend / Mailgun / Postmark) before launch.
  // For now we log the order so the flow works end-to-end.
  console.log(`[order] ${orderId}\n${mailBody}`)

  return { ok: true, orderId }
})
