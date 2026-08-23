/**
 * Server-side guard for /admin routes.
 *
 * /admin is SPA-only (ssr: false), so Nitro would normally serve the
 * HTML shell with a 200 for everyone — leaking that the page exists.
 * This middleware checks the session on the server and returns a real
 * 404 before the shell is served, so the network tab shows nothing.
 *
 * The API endpoints (requireOwner / requireElevated) remain the real
 * security boundary; this is about the HTTP response code for the page.
 */
export default defineEventHandler(async (event) => {
  const url = getRequestURL(event)

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
    // D1 not available (local dev without binding) — fall through to
    // the client-side guard. Production always has the binding.
    return
  }

  if (!user || !isOwnerEmail(event, user.email)) {
    throw createError({ statusCode: 404, statusMessage: 'Not Found' })
  }
})
