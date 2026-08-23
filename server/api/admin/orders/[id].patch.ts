import { createError, defineEventHandler, getRouterParam, readBody } from 'h3'
import { useDb } from '../../../utils/db'
import { requireElevated } from '../../../utils/admin'
import { ORDER_STATUSES, STATUS_TIMESTAMP_COLUMNS, type OrderStatus } from '~~/shared/utils/order-status'

interface UpdateStatusBody {
  status?: string
}

/**
 * Update an order's status. Sets the corresponding timestamp column
 * and updates `updated_at`. Requires an elevated owner session.
 */
export default defineEventHandler(async (event) => {
  const db = useDb(event)
  await requireElevated(event, db)

  const orderId = String(getRouterParam(event, 'id') ?? '').trim()
  if (!orderId) {
    throw createError({ statusCode: 400, statusMessage: 'Broj porudžbine je obavezan.' })
  }

  const body = await readBody<UpdateStatusBody>(event)
  const status = body?.status as OrderStatus | undefined

  if (!status || !ORDER_STATUSES.includes(status)) {
    throw createError({ statusCode: 400, statusMessage: 'Neispravan status.' })
  }

  const timestampColumn = STATUS_TIMESTAMP_COLUMNS[status]

  await db
    .prepare(
      `UPDATE orders
       SET status = ?, ${timestampColumn} = datetime('now'), updated_at = datetime('now')
       WHERE track_number = ?`,
    )
    .bind(status, orderId)
    .run()

  console.log(`[admin/orders] ${orderId} → ${status}`)

  return { ok: true }
})
