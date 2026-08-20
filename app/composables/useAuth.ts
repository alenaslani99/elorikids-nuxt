export interface User {
  name: string
  email: string
}

interface AuthState {
  user: User | null
}

const STORAGE_KEY = 'elorikids-auth'

export function useAuth() {
  const auth = useState<AuthState>('auth', () => ({ user: null }))

  // Hydrate from localStorage on client only
  if (import.meta.client) {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        if (parsed?.user) {
          auth.value.user = parsed.user
        }
      }
    }
    catch {
      auth.value.user = null
    }

    watch(auth.value, (val) => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(val))
    }, { deep: true })
  }

  const isLoggedIn = computed(() => !!auth.value.user)

  function setUser(user: User) {
    auth.value.user = user
  }

  function logout() {
    auth.value.user = null
  }

  return {
    auth,
    user: computed(() => auth.value.user),
    isLoggedIn,
    setUser,
    logout,
  }
}
