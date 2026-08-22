import { createError, defineEventHandler, readBody } from 'h3'
import { useDb } from '../utils/db'

interface NewsletterBody {
  email?: string
}

export default defineEventHandler(async (event) => {
  const db = useDb(event)
  const body = await readBody<NewsletterBody>(event)
  const email = body?.email?.trim().toLowerCase()

  if (!email) {
    throw createError({ statusCode: 400, statusMessage: 'Adresa e-pošte je obavezna.' })
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    throw createError({ statusCode: 400, statusMessage: 'Neispravna adresa e-pošte.' })
  }

  // Insert OR IGNORE — duplicate emails are silently accepted (idempotent)
  await db
    .prepare('INSERT OR IGNORE INTO newsletter_subscribers (email) VALUES (?)')
    .bind(email)
    .run()

  console.log(`[newsletter] New subscription: ${email}`)

  return { ok: true, message: 'Hvala na prijavi!' }
})
