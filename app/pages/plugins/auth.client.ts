/**
 * Validates the existing session cookie on app startup.
 * Sets `auth.initialized = true` once done, so the UI can avoid
 * a flash of logged-out state before the /api/me check resolves.
 */
export default defineNuxtPlugin(async () => {
  const { init } = useAuth()
  await init()
})
