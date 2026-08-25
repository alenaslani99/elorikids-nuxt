/**
 * Order status metadata - shared between client and server.
 *
 * Single source of truth for status labels, badge styling classes,
 * and icon names. Used by: track-order, admin panel, account page.
 */

export type OrderStatus = 'received' | 'preparing' | 'in_transit' | 'delivered' | 'cancelled'

/** All valid order statuses, in lifecycle order (cancelled is terminal). */
export const ORDER_STATUSES: readonly OrderStatus[] = [
  'received', 'preparing', 'in_transit', 'delivered', 'cancelled',
] as const

/** Maps each status to its timestamp column in the orders table. */
export const STATUS_TIMESTAMP_COLUMNS: Record<OrderStatus, string> = {
  received: 'received_at',
  preparing: 'preparing_at',
  in_transit: 'in_transit_at',
  delivered: 'delivered_at',
  cancelled: 'cancelled_at',
}

export interface OrderStatusMeta {
  /** Human-readable Serbian label for badges/chips. */
  label: string
  /** Description shown in the tracking timeline. */
  description: string
  /** Tailwind classes for the badge background + text color. */
  badgeClass: string
  /** Tailwind class for the status dot indicator. */
  dotClass: string
  /** Background tint class (for account page order cards). */
  bgClass: string
  /** Text color class. */
  textClass: string
  /** Lucide icon name. */
  icon: string
}

const STATUS_META: Record<OrderStatus, OrderStatusMeta> = {
  received: {
    label: 'Porudžbina primljena',
    description: 'Vaša porudžbina je uspešno kreirana i čeka obradu.',
    badgeClass: 'bg-yellow/20 text-navy',
    dotClass: 'bg-yellow',
    bgClass: 'bg-yellow/15',
    textClass: 'text-yellow',
    icon: 'lucide:clock',
  },
  preparing: {
    label: 'U pripremi',
    description: 'Naš tim priprema vaše knjige za slanje.',
    badgeClass: 'bg-yellow/20 text-navy',
    dotClass: 'bg-yellow',
    bgClass: 'bg-yellow/15',
    textClass: 'text-yellow',
    icon: 'lucide:clock',
  },
  in_transit: {
    label: 'U transportu',
    description: 'Vaša porudžbina je predata kuriru i kreće ka vama.',
    badgeClass: 'bg-blue/10 text-blue',
    dotClass: 'bg-blue',
    bgClass: 'bg-blue/15',
    textClass: 'text-blue',
    icon: 'lucide:truck',
  },
  delivered: {
    label: 'Isporučeno',
    description: 'Vaša porudžbina je uspešno isporučena. Hvala na poverenju!',
    badgeClass: 'bg-mint/20 text-navy',
    dotClass: 'bg-mint',
    bgClass: 'bg-mint/15',
    textClass: 'text-mint',
    icon: 'lucide:check-circle',
  },
  cancelled: {
    label: 'Otkazano',
    description: 'Ova porudžbina je otkazana.',
    badgeClass: 'bg-coral/20 text-coral',
    dotClass: 'bg-coral',
    bgClass: 'bg-coral/15',
    textClass: 'text-coral',
    icon: 'lucide:x-circle',
  },
}

/**
 * Get status metadata for a status string (may be unknown).
 * Returns a fallback with a generic grey style for unknown statuses.
 */
export function getOrderStatusMeta(status: string): OrderStatusMeta {
  return STATUS_META[status as OrderStatus] ?? {
    label: status,
    description: '',
    badgeClass: 'bg-cloud/40 text-navy',
    dotClass: 'bg-cloud',
    bgClass: 'bg-cloud/40',
    textClass: 'text-navy/60',
    icon: 'lucide:circle',
  }
}

/** The forward lifecycle steps (excluding cancelled, which is terminal). */
export const LIFECYCLE_STEPS: readonly OrderStatus[] = [
  'received', 'preparing', 'in_transit', 'delivered',
] as const
