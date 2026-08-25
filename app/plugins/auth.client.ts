/**
 * Validates the existing session cookie on app startup (client-only).
 *
 * /admin is SPA-only (ssr: false in nuxt.config), so the middleware
 * runs on the client after this plugin resolves the session. Non-owners
 * get a 404 before the page ever renders - no flash, no loader.
 */
export default defineNuxtPlugin(async () => {
  const { init } = useAuth()
  await init()
})
