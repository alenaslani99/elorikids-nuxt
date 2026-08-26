import { createError, defineEventHandler, getRouterParam } from 'h3'
import { useDb } from '../../../../utils/db'
import { requireElevated } from '../../../../utils/admin'
import { createShipment } from '../../../../utils/bex'

/**
 * Create a Bex shipment for an order.
 *
 * Loads the order by track_number, maps its fields to the postShipments
 * `tasks[]` request (COD: payType=2, payToSender=grandTotal), creates the
 * shipment in Bex, and stores the returned shipmentId.
 *
 * Requires an elevated owner session.
 */
export default defineEventHandler(async (event) => {
  const db = useDb(event)
  await requireElevated(event, db)

  const trackNumber = String(getRouterParam(event, 'id') ?? '').trim()
  if (!trackNumber) {
    throw createError({ statusCode: 400, statusMessage: 'Broj porudžbine je obavezan.' })
  }

  // Load the order. We need the customer + address + grand_total.
  const order = await db
    .prepare(
      `SELECT track_number, customer_name, phone, address, city, grand_total, note,
              bex_shipment_id
       FROM orders WHERE track_number = ?`,
    )
    .bind(trackNumber)
    .first<{
      track_number: string
      customer_name: string
      phone: string
      address: string
      city: string
      grand_total: number
      note: string | null
      bex_shipment_id: number | null
    }>()

  if (!order) {
    throw createError({ statusCode: 404, statusMessage: 'Porudžbina nije pronađena.' })
  }

  // Idempotent: refuse to re-send an order that already has a Bex shipment.
  if (order.bex_shipment_id) {
    throw createError({
      statusCode: 409,
      statusMessage: 'Pošiljka je već kreirana u Bex.',
    })
  }

  const shipmentId = await createShipment(event, {
    trackNumber: order.track_number,
    customerName: order.customer_name,
    phone: order.phone,
    address: order.address,
    city: order.city,
    grandTotal: order.grand_total,
    note: order.note,
  })

  await db
    .prepare(
      `UPDATE orders
       SET bex_shipment_id = ?, bex_sent_at = datetime('now'), updated_at = datetime('now')
       WHERE track_number = ?`,
    )
    .bind(shipmentId, trackNumber)
    .run()

  console.log(`[bex] ${trackNumber} → shipment ${shipmentId}`)

  return { ok: true, shipmentId }
})
