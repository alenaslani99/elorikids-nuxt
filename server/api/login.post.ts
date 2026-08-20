import { createError, defineEventHandler, readBody } from 'h3'

interface LoginBody {
  email?: string
  password?: string
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default defineEventHandler(async (event) => {
  const body = await readBody<LoginBody>(event)

  const email = body?.email?.trim().toLowerCase()
  const password = body?.password

  if (!email || !emailRegex.test(email)) {
    throw createError({ statusCode: 400, statusMessage: 'Ispravna adresa e-pošte je obavezna.' })
  }
  if (!password || password.length < 6) {
    throw createError({ statusCode: 400, statusMessage: 'Lozinka mora imati najmanje 6 karaktera.' })
  }

  // TODO: wire a real auth provider (nuxt-auth, Supabase, Auth.js) before launch.
  // For now we derive a user from the email so the flow works end-to-end.
  const name = email.split('@')[0]
    .replace(/[._-]+/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase())

  console.log(`[login] ${email}`)

  return {
    ok: true,
    user: {
      name,
      email,
    },
  }
})
