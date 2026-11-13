export interface User {
  name: string
  email: string
  role: 'owner' | 'customer'
}

interface AuthState {
  user: User | null
  /** Prevents flash of logged-out state while validating session */
  initialized: boolean
}

/**
 * Start Google sign-in. `redirect` is the same-site path to land on
 * afterwards (validated again on the server). This is a full-page
 * navigation to an API route, so use it in a plain <a href>.
 */
export function googleSignInUrl(redirect?: string): string {
  return redirect
    ? `/api/auth/google?redirect=${encodeURIComponent(redirect)}`
    : '/api/auth/google'
}

export function useAuth() {
  const auth = useState<AuthState>('auth', () => ({ user: null, initialized: false }))

  const isLoggedIn = computed(() => !!auth.value.user)
  const isReady = computed(() => auth.value.initialized)
  // UI hint only - the server checks the role on every admin request
  const isOwner = computed(() => auth.value.user?.role === 'owner')

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
    logout,
  }
}
