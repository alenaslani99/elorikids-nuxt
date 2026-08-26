import { createError, defineEventHandler, getRouterParam, setHeader } from 'h3'
import { useDb } from '../../../../utils/db'
import { requireElevated } from '../../../../utils/admin'
import { getLabel } from '../../../../utils/bex'

/**
 * Download the Bex PDF label (A6) for an order's shipment.
 *
 * Loads bex_shipment_id from the order, fetches the label from Bex, marks
 * the order's label-printed flag, and streams the PDF back. The client
 * opens it in a new tab / downloads it.
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

  const order = await db
    .prepare('SELECT bex_shipment_id FROM orders WHERE track_number = ?')
    .bind(trackNumber)
    .first<{ bex_shipment_id: number | null }>()

  if (!order) {
    throw createError({ statusCode: 404, statusMessage: 'Porudžbina nije pronađena.' })
  }
  if (!order.bex_shipment_id) {
    throw createError({
      statusCode: 409,
      statusMessage: 'Pošiljka još nije kreirana u Bex.',
    })
  }

  const pdfBytes = await getLabel(event, order.bex_shipment_id)

  await db
    .prepare('UPDATE orders SET bex_label_printed = 1, updated_at = datetime(\'now\') WHERE track_number = ?')
    .bind(trackNumber)
    .run()

  setHeader(event, 'Content-Type', 'application/pdf')
  setHeader(event, 'Content-Disposition', `inline; filename="bex-${trackNumber}.pdf"`)
  return pdfBytes
})
