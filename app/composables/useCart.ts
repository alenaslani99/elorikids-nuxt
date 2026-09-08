import { PRODUCTS } from '~~/shared/utils/products'

export interface CartItem {
  slug: string
  title: string
  price: number
  quantity: number
}

interface CartState {
  items: CartItem[]
}

const STORAGE_KEY = 'elorikids-cart'

// Canonical prices - re-syncs stored items so price changes (sales)
// apply to existing carts. Server re-validates from DB at checkout.
function syncPrices(items: CartItem[]): CartItem[] {
  return items.map(i => ({ ...i, price: PRODUCTS[i.slug]?.price ?? i.price }))
}

export function useCart() {
  const cart = useState<CartState>('cart', () => ({ items: [] }))

  // Hydrate from localStorage on client, after mount (avoids SSR hydration mismatch)
  onMounted(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        if (parsed?.items && Array.isArray(parsed.items)) {
          cart.value.items = syncPrices(parsed.items)
        }
      }
    }
    catch {
      // Corrupt storage - start fresh
      cart.value.items = []
    }

    // Watch and persist
    watch(cart.value, (val) => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(val))
    }, { deep: true })
  })

  const count = computed(() => cart.value.items.reduce((sum, i) => sum + i.quantity, 0))
  const total = computed(() => cart.value.items.reduce((sum, i) => sum + i.price * i.quantity, 0))

  const items = computed(() => cart.value.items)

  // No flat shipping fee: below FREE_SHIPPING_THRESHOLD the courier
  // charges by destination ("+ dostava"), so shipping is never added
  // to online totals. grandTotal = books subtotal, always.
  const shipping = computed(() => 0)
  const grandTotal = computed(() => total.value + shipping.value)

  function addItem(slug: string, title: string, price: number, quantity = 1) {
    const existing = cart.value.items.find(i => i.slug === slug)
    if (existing) {
      existing.price = price
      existing.quantity += quantity
    }
    else {
      cart.value.items.push({ slug, title, price, quantity })
    }
  }

  function removeItem(slug: string) {
    const idx = cart.value.items.findIndex(i => i.slug === slug)
    if (idx !== -1) {
      cart.value.items.splice(idx, 1)
    }
  }

  function updateQuantity(slug: string, quantity: number) {
    const item = cart.value.items.find(i => i.slug === slug)
    if (item) {
      if (quantity <= 0) {
        removeItem(slug)
      }
      else {
        item.quantity = quantity
      }
    }
  }

  function increment(slug: string) {
    const item = cart.value.items.find(i => i.slug === slug)
    if (item) {
      item.quantity += 1
    }
  }

  function decrement(slug: string) {
    const item = cart.value.items.find(i => i.slug === slug)
    if (item) {
      if (item.quantity <= 1) {
        removeItem(slug)
      }
      else {
        item.quantity -= 1
      }
    }
  }

  function clear() {
    cart.value.items = []
  }

  return {
    cart,
    items,
    count,
    total,
    shipping,
    grandTotal,
    addItem,
    removeItem,
    updateQuantity,
    increment,
    decrement,
    clear,
  }
}
