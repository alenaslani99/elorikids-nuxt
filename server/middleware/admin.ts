/**
 * Cross-site write protection for the API + server-side guard for /admin.
 *
 * 1. Every mutating /api/** request must carry an Origin header matching
 *    this host (CSRF defense in depth on top of the SameSite=Lax session
 *    cookie). All our forms post from the site itself, so legitimate
 *    requests always pass.
 *
 * 2. /admin is SPA-only (ssr: false), so Nitro would normally serve the
 *    HTML shell with a 200 for everyone - leaking that the page exists.
 *    This middleware checks the session on the server and returns a real
 *    404 before the shell is served, so the network tab shows nothing.
 *    The API endpoints (requireOwner / requireElevated) remain the real
 *    security boundary; this is about the HTTP response code for the page.
 */
const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS'])

export default defineEventHandler(async (event) => {
  const url = getRequestURL(event)

  if (url.pathname.startsWith('/api/') && !SAFE_METHODS.has(event.method)) {
    const origin = getRequestHeader(event, 'origin')
    let originHost: string | null = null
    try {
      originHost = origin ? new URL(origin).host : null
    }
    catch {
      // malformed Origin - treated as missing
    }
    if (!originHost || originHost !== url.host) {
      throw createError({ statusCode: 403, statusMessage: 'Pristup odbijen.' })
    }
    return
  }

  // Guard any /admin page navigation (exact or sub-paths)
  if (url.pathname !== '/admin' && !url.pathname.startsWith('/admin/')) return

  const { useDb } = await import('~~/server/utils/db')
  const { getSessionUser } = await import('~~/server/utils/session')

  let user
  try {
    const db = useDb(event)
    user = await getSessionUser(event, db)
  }
  catch {
    // D1 not available. In local dev (no binding) fall through to the
    // client-side guard; in production fail closed.
    if (import.meta.dev) return
    throw createError({ statusCode: 404, statusMessage: 'Not Found' })
  }

  if (!user || user.role !== 'owner') {
    throw createError({ statusCode: 404, statusMessage: 'Not Found' })
  }
})
