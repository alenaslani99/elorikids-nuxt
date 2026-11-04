import { createError, defineEventHandler, getRouterParam, setResponseHeaders } from 'h3'
import { useMedia } from '../../utils/media'

/**
 * DEV ONLY: serves objects from the local (emulated) R2 bucket at
 * /media/<key>, standing in for https://media.elorikids.rs during
 * `nuxt dev`. In production the custom domain serves R2 directly and
 * this route always returns 404, so the Worker never proxies media.
 */
export default defineEventHandler(async (event) => {
  if (!import.meta.dev) {
    throw createError({ statusCode: 404, statusMessage: 'Not Found' })
  }

  const key = getRouterParam(event, 'key') ?? ''
  if (!key || key.split('/').includes('..')) {
    throw createError({ statusCode: 404, statusMessage: 'Not Found' })
  }

  const object = await useMedia(event).get(key)
  if (!object) {
    throw createError({ statusCode: 404, statusMessage: 'Not Found' })
  }

  setResponseHeaders(event, {
    'Content-Type': object.httpMetadata?.contentType ?? 'application/octet-stream',
    'Content-Length': String(object.size),
    'Cache-Control': 'no-store',
  })
  return new Uint8Array(await object.arrayBuffer())
})
