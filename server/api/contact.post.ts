import { createError, defineEventHandler, readBody } from 'h3'

interface ContactBody {
  name?: string
  email?: string
  message?: string
}

export default defineEventHandler(async (event) => {
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

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    throw createError({ statusCode: 400, statusMessage: 'Neispravna adresa e-pošte.' })
  }

  if (!message) {
    throw createError({ statusCode: 400, statusMessage: 'Poruka je obavezna.' })
  }

  if (message.length < 10) {
    throw createError({ statusCode: 400, statusMessage: 'Poruka je prekratka (minimum 10 karaktera).' })
  }

  // TODO: wire a real provider (Resend / Mailgun / Postmark) before launch.
  // For now we just log the submission so the flow works end-to-end.
  console.log(`[contact] From: ${name} <${email}> — ${message}`)

  return { ok: true, message: 'Hvala na poruci! Javićemo se uskoro.' }
})
