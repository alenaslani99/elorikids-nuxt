import { defineEventHandler } from 'h3'
import { useDb } from '../utils/db'
import { getSessionUser } from '../utils/session'

/**
 * Returns the currently authenticated user, or null if not logged in.
 * Called on app init to validate the session cookie.
 */
export default defineEventHandler(async (event) => {
  const db = useDb(event)
  const user = await getSessionUser(event, db)

  return { user }
})
