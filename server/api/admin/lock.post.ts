import { defineEventHandler } from 'h3'
import { useDb } from '../../utils/db'
import { requireOwner, clearElevated } from '../../utils/admin'

/**
 * Clear the admin elevation on the current session (lock panel).
 * Requires owner session but NOT elevation (so you can lock even
 * if elevation already expired).
 */
export default defineEventHandler(async (event) => {
  const db = useDb(event)
  await requireOwner(event, db)
  await clearElevated(event, db)
  return { ok: true }
})
