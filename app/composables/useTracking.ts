/**
 * E-commerce events for GTM, in GA4's standard format so the same events
 * feed GA4 directly and map 1:1 to Meta Pixel events inside GTM:
 *   view_item -> ViewContent, add_to_cart -> AddToCart,
 *   begin_checkout -> InitiateCheckout, purchase -> Purchase.
 * Events are dropped when the visitor has not consented to any tracking.
 */
const CURRENCY = 'RSD'

export interface TrackedItem {
  slug: string
  title: string
  price: number
  quantity: number
}

function toGaItem(i: TrackedItem) {
  return { item_id: i.slug, item_name: i.title, price: i.price, quantity: i.quantity }
}

const sum = (items: TrackedItem[]) => items.reduce((s, i) => s + i.price * i.quantity, 0)

export function useTracking() {
  const { choice } = useConsent()

  function push(event: string, ecommerce: Record<string, unknown>) {
    if (import.meta.server) return
    const c = choice.value
    if (!c || (!c.analytics && !c.marketing)) return
    window.dataLayer = window.dataLayer || []
    // Clear the previous ecommerce object so GTM doesn't merge stale items.
    window.dataLayer.push({ ecommerce: null })
    window.dataLayer.push({ event, ecommerce })
  }

  function list(event: string, items: TrackedItem[], extra: Record<string, unknown> = {}) {
    push(event, { currency: CURRENCY, value: sum(items), items: items.map(toGaItem), ...extra })
  }

  return {
    viewItem: (item: TrackedItem) => list('view_item', [item]),
    addToCart: (item: TrackedItem) => list('add_to_cart', [item]),
    beginCheckout: (items: TrackedItem[]) => list('begin_checkout', items),
    purchase: (orderId: string, items: TrackedItem[]) =>
      list('purchase', items, { transaction_id: orderId }),
  }
}
