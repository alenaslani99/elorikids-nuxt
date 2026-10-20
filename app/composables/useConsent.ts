export interface ConsentChoice {
  analytics: boolean
  marketing: boolean
}

// Raw cookie value. Older versions of the banner stored the plain strings
// 'accepted' / 'declined', so those are still understood and mapped below.
type StoredConsent = ConsentChoice | 'accepted' | 'declined' | null

function normalize(value: StoredConsent): ConsentChoice | null {
  if (value === 'accepted') return { analytics: true, marketing: true }
  if (value === 'declined') return { analytics: false, marketing: false }
  if (value && typeof value === 'object') {
    return { analytics: !!value.analytics, marketing: !!value.marketing }
  }
  return null
}

export function useConsent() {
  // Persists the visitor's choice for 1 year. `useCookie` is SSR-safe,
  // so there is no hydration mismatch and the bar stays hidden on return visits.
  const cookie = useCookie<StoredConsent>('cookie-consent', {
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax',
  })
  // Separate useCookie refs don't reliably sync, so share one reactive copy
  // between the banner, the GTM plugin and the tracking composable.
  const stored = useState<StoredConsent>('cookie-consent', () => cookie.value ?? null)

  // Shared so the footer link can reopen the settings panel.
  const settingsOpen = useState('cookie-settings-open', () => false)

  const choice = computed(() => normalize(stored.value))
  const decided = computed(() => choice.value !== null)

  function save(next: ConsentChoice) {
    const value = { analytics: next.analytics, marketing: next.marketing }
    cookie.value = value
    stored.value = value
    settingsOpen.value = false
  }

  return {
    choice,
    decided,
    settingsOpen,
    save,
    acceptAll: () => save({ analytics: true, marketing: true }),
    rejectAll: () => save({ analytics: false, marketing: false }),
    openSettings: () => { settingsOpen.value = true },
  }
}
