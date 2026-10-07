import { createError, defineEventHandler, readBody } from 'h3'
import { useDb } from '../../utils/db'
import { requireOwner } from '../../utils/admin'
import { hashPassword } from '../../utils/crypto'
import { LIMITS } from '~~/shared/utils/limits'

interface SetupBody {
  question?: string
  answer?: string
}

/**
 * First-time setup of the owner's security question.
 * Only callable once (throws 409 if already set).
 */
export default defineEventHandler(async (event) => {
  const db = useDb(event)
  const user = await requireOwner(event, db)

  const body = await readBody<SetupBody>(event)
  const question = body?.question?.trim()
  const answer = body?.answer?.trim().toLowerCase()

  if (!question || question.length < 5 || question.length > LIMITS.securityQuestion) {
    throw createError({ statusCode: 400, statusMessage: 'Pitanje mora imati najmanje 5 karaktera.' })
  }
  if (!answer || answer.length < LIMITS.securityAnswerMin || answer.length > LIMITS.securityAnswer) {
    throw createError({ statusCode: 400, statusMessage: `Odgovor mora imati najmanje ${LIMITS.securityAnswerMin} karaktera.` })
  }

  // Only allow setup if not already set
  const existing = await db
    .prepare('SELECT security_answer_hash FROM users WHERE id = ?')
    .bind(user.id)
    .first<{ security_answer_hash: string | null }>()

  if (existing?.security_answer_hash) {
    throw createError({ statusCode: 409, statusMessage: 'Sigurnosno pitanje je već postavljeno.' })
  }

  const answerHash = await hashPassword(answer)

  await db
    .prepare('UPDATE users SET security_question = ?, security_answer_hash = ? WHERE id = ?')
    .bind(question, answerHash, user.id)
    .run()

  console.log(`[admin/setup] Owner ${user.email} set security question`)

  return { ok: true }
})
