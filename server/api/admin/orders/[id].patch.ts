import { createError, defineEventHandler, getRouterParam, readBody } from 'h3'
import { useDb } from '../../../utils/db'
import { requireElevated } from '../../../utils/admin'

interface UpdateStatusBody {
  status?: string
}

const VALID_STATUSES = ['received', 'preparing', 'in_transit', 'delivered', 'cancelled'] as const

/** Maps a status to its timestamp column on the orders table. */
const STATUS_TIMESTAMPS: Record<string, string> = {
  received: 'received_at',
  preparing: 'preparing_at',
  in_transit: 'in_transit_at',
  delivered: 'delivered_at',
  cancelled: 'cancelled_at',
}

/**
 * Update an order's status. Sets the corresponding timestamp column
 * and updates `updated_at`. Requires an elevated owner session.
 */
export default defineEventHandler(async (event) => {
  const db = useDb(event)
  await requireElevated(event, db)

  const orderId = String(getRouterParam(event, 'id') ?? '').trim().toUpperCase()
  if (!orderId) {
    throw createError({ statusCode: 400, statusMessage: 'Broj porudžbine je obavezan.' })
  }

  const body = await readBody<UpdateStatusBody>(event)
  const status = body?.status

  if (!status || !VALID_STATUSES.includes(status as typeof VALID_STATUSES[number])) {
    throw createError({ statusCode: 400, statusMessage: 'Neispravan status.' })
  }

  const timestampColumn = STATUS_TIMESTAMPS[status]

  await db
    .prepare(
      `UPDATE orders
       SET status = ?, ${timestampColumn} = datetime('now'), updated_at = datetime('now')
       WHERE id = ?`,
    )
    .bind(status, orderId)
    .run()

  console.log(`[admin/orders] ${orderId} → ${status}`)

  return { ok: true }
})
