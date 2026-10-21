/**
 * Server-side guard for /admin routes.
 *
 * /admin is SPA-only (ssr: false), so Nitro would normally serve the
 * HTML shell with a 200 for everyone - leaking that the page exists.
 * This middleware checks the session on the server and returns a real
 * 404 before the shell is served, so the network tab shows nothing.
 *
 * The API endpoints (requireOwner / requireElevated) remain the real
 * security boundary; this is about the HTTP response code for the page.
 *
 * It also rejects cross-origin writes to /api/admin/** (CSRF defense in
 * depth on top of the SameSite=Lax session cookie): every mutating admin
 * request must carry an Origin header matching this host.
 */
const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS'])

export default defineEventHandler(async (event) => {
  const url = getRequestURL(event)

  if (url.pathname.startsWith('/api/admin/') && !SAFE_METHODS.has(event.method)) {
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
  const { isOwnerEmail } = await import('~~/server/utils/admin')

  let user
  try {
    const db = useDb(event)
    user = await getSessionUser(event, db)
  }
  catch {
    // D1 not available (local dev without binding) - fall through to
    // the client-side guard. Production always has the binding.
    return
  }

  if (!user || !isOwnerEmail(event, user.email)) {
    throw createError({ statusCode: 404, statusMessage: 'Not Found' })
  }
})
