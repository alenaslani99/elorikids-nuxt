export interface SavedItem {
  slug: string
  title: string
  price: number
  img: string
  ageRange: string
  accent: string
}

interface SavedState {
  items: SavedItem[]
}

const STORAGE_KEY = 'elorikids-saved'

export function useSaved() {
  const saved = useState<SavedState>('saved', () => ({ items: [] }))

  // Hydrate from localStorage on client only
  if (import.meta.client) {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        if (parsed?.items && Array.isArray(parsed.items)) {
          saved.value.items = parsed.items
        }
      }
    }
    catch {
      // Corrupt storage — start fresh
      saved.value.items = []
    }

    // Watch and persist
    watch(saved.value, (val) => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(val))
    }, { deep: true })
  }

  const items = computed(() => saved.value.items)
  const count = computed(() => saved.value.items.length)

  function isSaved(slug: string) {
    return saved.value.items.some(i => i.slug === slug)
  }

  function toggle(item: SavedItem) {
    const existing = saved.value.items.find(i => i.slug === item.slug)
    if (existing) {
      saved.value.items = saved.value.items.filter(i => i.slug !== item.slug)
    }
    else {
      saved.value.items.push(item)
    }
  }

  function remove(slug: string) {
    saved.value.items = saved.value.items.filter(i => i.slug !== slug)
  }

  function clear() {
    saved.value.items = []
  }

  return {
    saved,
    items,
    count,
    isSaved,
    toggle,
    remove,
    clear,
  }
}
