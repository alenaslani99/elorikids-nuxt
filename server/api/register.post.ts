import { createError, defineEventHandler, readBody } from 'h3'

interface RegisterBody {
  name?: string
  email?: string
  password?: string
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default defineEventHandler(async (event) => {
  const body = await readBody<RegisterBody>(event)

  const name = body?.name?.trim()
  const email = body?.email?.trim().toLowerCase()
  const password = body?.password

  if (!name) {
    throw createError({ statusCode: 400, statusMessage: 'Ime i prezime je obavezno.' })
  }
  if (!email || !emailRegex.test(email)) {
    throw createError({ statusCode: 400, statusMessage: 'Ispravna adresa e-pošte je obavezna.' })
  }
  if (!password || password.length < 6) {
    throw createError({ statusCode: 400, statusMessage: 'Lozinka mora imati najmanje 6 karaktera.' })
  }

  // TODO: wire a real auth provider (nuxt-auth, Supabase, Auth.js) before launch.
  // For now we just return the user so the flow works end-to-end.
  console.log(`[register] ${name} <${email}>`)

  return {
    ok: true,
    user: {
      name,
      email,
    },
  }
})

