import { defineEventHandler } from 'h3'
import { useDb } from '../../utils/db'
import { requireOwner, isElevated } from '../../utils/admin'

/**
 * Returns the admin status for the current owner session:
 *   - isOwner:     always true here (requireOwner throws otherwise)
 *   - securitySet: whether the security question has been configured
 *   - question:    the question text (only if set)
 *   - elevated:    whether the session has an active admin elevation
 */
export default defineEventHandler(async (event) => {
  const db = useDb(event)
  const user = await requireOwner(event, db)

  const userData = await db
    .prepare('SELECT security_question, security_answer_hash FROM users WHERE id = ?')
    .bind(user.id)
    .first<{ security_question: string | null, security_answer_hash: string | null }>()

  const securitySet = !!(userData?.security_question && userData?.security_answer_hash)
  const elevated = await isElevated(event, db)

  return {
    isOwner: true,
    securitySet,
    question: securitySet ? userData!.security_question : null,
    elevated,
  }
})
