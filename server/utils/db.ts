/**
 * D1 database accessor.
 *
 * On Cloudflare Workers, the D1 binding is available at
 * `event.context.cloudflare.env.DB` (cloudflare-module preset).
 *
 * During local dev with `nuxt dev`, Nitro simulates the server
 * environment. The binding comes from wrangler.toml when running
 * `wrangler dev`, or can be stubbed.
 */
import type { D1Database } from '@cloudflare/workers-types'
import type { H3Event } from 'h3'

export function useDb(event: H3Event): D1Database {
  // cloudflare-module preset: bindings live under context.cloudflare.env
  const cloudflare = (event.context as any).cloudflare
  const db = cloudflare?.env?.DB

  if (!db) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Baza podataka nije dostupna (D1 binding nije konfigurisan).',
    })
  }

  return db as D1Database
}
