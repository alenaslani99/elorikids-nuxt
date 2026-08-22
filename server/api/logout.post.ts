import { defineEventHandler } from 'h3'
import { useDb } from '../utils/db'
import { destroySession } from '../utils/session'

export default defineEventHandler(async (event) => {
  const db = useDb(event)
  await destroySession(event, db)

  return { ok: true }
})
