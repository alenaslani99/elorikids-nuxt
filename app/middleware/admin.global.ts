/**
 * Route guard for /admin.
 *
 * /admin is SPA-only (ssr: false in nuxt.config), so this runs on the
 * client after the auth plugin has resolved the session. Non-owners get
 * a 404 here — the page never renders for them.
 *
 * Not logged in → redirect to login.
 * Logged in but not owner → 404 (page doesn't exist for them).
 *
 * The real security still lives server-side in requireOwner /
 * requireElevated on each API endpoint.
 */
export default defineNuxtRouteMiddleware((to) => {
  if (!to.path.startsWith('/admin')) return

  const { isLoggedIn, isReady, isOwner } = useAuth()

  if (!isReady.value) return

  if (!isLoggedIn.value) {
    return navigateTo('/auth/login?redirect=/admin')
  }

  if (!isOwner.value) {
    throw createError({ statusCode: 404, statusMessage: 'Not Found', fatal: true })
  }
})
