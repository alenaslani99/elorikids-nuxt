/**
 * Validates the existing session cookie on app startup (client-only).
 *
 * /admin is SPA-only (ssr: false in nuxt.config), so the middleware
 * runs on the client after this plugin resolves the session. Non-owners
 * get a 404 before the page ever renders - no flash, no loader.
 */
export default defineNuxtPlugin(() => {
  const { init } = useAuth()
  // Fire-and-forget: awaiting /api/me here blocks client hydration and
  // inflates TTI. Header gates logged-in UI behind mounted+isReady, so
  // resolving in background causes no flash or mismatch.
  void init()
})
