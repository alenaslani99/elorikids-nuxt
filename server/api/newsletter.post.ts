import { createError, defineEventHandler, readBody } from 'h3'

interface NewsletterBody {
  email?: string
}

export default defineEventHandler(async (event) => {
  const body = await readBody<NewsletterBody>(event)
  const email = body?.email?.trim().toLowerCase()

  if (!email) {
    throw createError({ statusCode: 400, statusMessage: 'Adresa e-pošte je obavezna.' })
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    throw createError({ statusCode: 400, statusMessage: 'Neispravna adresa e-pošte.' })
  }

  // TODO: wire a real provider (Resend / Mailgun / Postmark) before launch.
  // For now we just log the subscription so the flow works end-to-end.
  console.log(`[newsletter] New subscription: ${email}`)

  return { ok: true, message: 'Hvala na prijavi!' }
})
