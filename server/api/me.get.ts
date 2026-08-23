import { defineEventHandler } from 'h3'
import { useDb } from '../utils/db'
import { getSessionUser } from '../utils/session'
import { isOwnerEmail } from '../utils/admin'

/**
 * Returns the currently authenticated user, or null if not logged in.
 * Called on app init to validate the session cookie.
 * Includes `isOwner` so the client middleware can gate /admin without a flash.
 */
export default defineEventHandler(async (event) => {
  const db = useDb(event)
  const user = await getSessionUser(event, db)

  return {
    user: user
      ? { name: user.name, email: user.email, isOwner: isOwnerEmail(event, user.email) }
      : null,
  }
})
