import { createError, defineEventHandler, readBody } from 'h3'
import { useDb } from '../utils/db'
import { emailRegex } from '~~/shared/utils/validation'

interface ContactBody {
  name?: string
  email?: string
  message?: string
}

export default defineEventHandler(async (event) => {
  const db = useDb(event)
  const body = await readBody<ContactBody>(event)

  const name = body?.name?.trim()
  const email = body?.email?.trim().toLowerCase()
  const message = body?.message?.trim()

  if (!name) {
    throw createError({ statusCode: 400, statusMessage: 'Ime je obavezno.' })
  }

  if (!email) {
    throw createError({ statusCode: 400, statusMessage: 'Adresa e-pošte je obavezna.' })
  }

  if (!emailRegex.test(email)) {
    throw createError({ statusCode: 400, statusMessage: 'Neispravna adresa e-pošte.' })
  }

  if (!message) {
    throw createError({ statusCode: 400, statusMessage: 'Poruka je obavezna.' })
  }

  if (message.length < 10) {
    throw createError({ statusCode: 400, statusMessage: 'Poruka je prekratka (minimum 10 karaktera).' })
  }

  await db
    .prepare('INSERT INTO contact_messages (name, email, message) VALUES (?, ?, ?)')
    .bind(name, email, message)
    .run()

  console.log(`[contact] From: ${name} <${email}> — ${message}`)

  return { ok: true, message: 'Hvala na poruci! Javićemo se uskoro.' }
})
