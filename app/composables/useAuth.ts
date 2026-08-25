export interface User {
  name: string
  email: string
  isOwner?: boolean
}

interface AuthState {
  user: User | null
  /** Prevents flash of logged-out state while validating session */
  initialized: boolean
}

export function useAuth() {
  const auth = useState<AuthState>('auth', () => ({ user: null, initialized: false }))

  const isLoggedIn = computed(() => !!auth.value.user)
  const isReady = computed(() => auth.value.initialized)
  const isOwner = computed(() => !!auth.value.user?.isOwner)

  /**
   * Validate the existing session cookie against the server.
   * Called once on app init (client-only plugin). No localStorage - the
   * httpOnly cookie is the single source of truth.
   */
  async function init() {
    if (auth.value.initialized) return
    try {
      const res = await $fetch<{ user: User | null }>('/api/me')
      auth.value.user = res.user ?? null
    }
    catch {
      auth.value.user = null
    }
    finally {
      auth.value.initialized = true
    }
  }

  function setUser(user: User) {
    auth.value.user = user
  }

  async function logout() {
    try {
      await $fetch('/api/logout', { method: 'POST' })
    }
    catch {
      // ignore network errors - cookie may already be invalid
    }
    auth.value.user = null
  }

  return {
    auth,
    user: computed(() => auth.value.user),
    isLoggedIn,
    isReady,
    isOwner,
    init,
    setUser,
    logout,
  }
}
