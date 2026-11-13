import { defineEventHandler } from 'h3'
import { useDb } from '../../utils/db'
import { requireOwner, isElevated } from '../../utils/admin'

/**
 * Returns the admin status for the current owner session:
 *   - isOwner:  always true here (requireOwner throws otherwise)
 *   - elevated: whether the session has an active admin window
 *               (Google sign-in within the last hour)
 */
export default defineEventHandler(async (event) => {
  const db = useDb(event)
  await requireOwner(event, db)

  return {
    isOwner: true,
    elevated: await isElevated(event, db),
  }
})
