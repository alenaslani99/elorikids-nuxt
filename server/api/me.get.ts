import { defineEventHandler } from 'h3'
import { useDb } from '../utils/db'
import { getSessionUser } from '../utils/session'

/**
 * Returns the currently authenticated user, or null if not logged in.
 * Called on app init to validate the session cookie.
 * Includes `role` so the client middleware can gate /admin without a
 * flash (a UI hint only - the server re-checks the role on every call).
 */
export default defineEventHandler(async (event) => {
  const db = useDb(event)
  const user = await getSessionUser(event, db)

  return {
    user: user
      ? { name: user.name, email: user.email, role: user.role }
      : null,
  }
})
