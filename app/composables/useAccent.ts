export interface AccentStyle {
  /** Solid background, e.g. `bg-mint`. */
  bg: string
  /** Text color, e.g. `text-mint`. */
  text: string
  /** Soft background tint, e.g. `bg-mint/15`. */
  soft: string
  /** Ring color, e.g. `ring-mint`. */
  ring: string
  /** Badge background + text combo, e.g. `bg-mint/20 text-navy`. */
  badge: string
}

/**
 * Shared accent color map used across books, saved, blog, and about-us pages.
 * Each page picks only the properties it needs.
 */
export const accentClasses: Record<string, AccentStyle> = {
  mint: { bg: 'bg-mint', text: 'text-mint', soft: 'bg-mint/15', ring: 'ring-mint', badge: 'bg-mint/20 text-navy' },
  purple: { bg: 'bg-purple', text: 'text-purple', soft: 'bg-purple/15', ring: 'ring-purple', badge: 'bg-purple/20 text-navy' },
  coral: { bg: 'bg-coral', text: 'text-coral', soft: 'bg-coral/15', ring: 'ring-coral', badge: 'bg-coral/20 text-navy' },
  sky: { bg: 'bg-sky', text: 'text-sky', soft: 'bg-sky/40', ring: 'ring-sky', badge: 'bg-sky/40 text-navy' },
  yellow: { bg: 'bg-yellow', text: 'text-yellow', soft: 'bg-yellow/15', ring: 'ring-yellow', badge: 'bg-yellow/20 text-navy' },
  blue: { bg: 'bg-blue', text: 'text-blue', soft: 'bg-blue/10', ring: 'ring-blue', badge: 'bg-blue/10 text-blue' },
}

export function useAccent() {
  return { accentClasses }
}
