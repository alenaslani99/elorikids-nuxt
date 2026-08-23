import { createError, defineEventHandler, readBody } from 'h3'
import { useDb } from '../../utils/db'
import { requireOwner, setElevated } from '../../utils/admin'
import { verifyPassword } from '../../utils/crypto'

interface ElevateBody {
  answer?: string
}

/**
 * Verify the security answer and elevate the session for 1 hour.
 */
export default defineEventHandler(async (event) => {
  const db = useDb(event)
  const user = await requireOwner(event, db)

  const body = await readBody<ElevateBody>(event)
  const answer = body?.answer?.trim().toLowerCase()

  if (!answer) {
    throw createError({ statusCode: 400, statusMessage: 'Odgovor je obavezan.' })
  }

  const userData = await db
    .prepare('SELECT security_answer_hash FROM users WHERE id = ?')
    .bind(user.id)
    .first<{ security_answer_hash: string | null }>()

  if (!userData?.security_answer_hash) {
    throw createError({ statusCode: 400, statusMessage: 'Sigurnosno pitanje nije postavljeno.' })
  }

  const valid = await verifyPassword(answer, userData.security_answer_hash)
  if (!valid) {
    throw createError({ statusCode: 401, statusMessage: 'Netačan odgovor.' })
  }

  await setElevated(event, db)

  console.log(`[admin/elevate] Owner ${user.email} elevated`)

  return { ok: true }
})
