/**
 * Product media (images/videos stored in R2) - rules shared between the
 * admin UI and the server. The server re-checks everything, including
 * the real file type from its first bytes (never trusts the filename or
 * the browser-supplied Content-Type).
 */

export type MediaKind = 'image' | 'video'

export interface MediaType {
  kind: MediaKind
  contentType: string
  ext: string
}

export const MEDIA_TYPES: MediaType[] = [
  { kind: 'image', contentType: 'image/jpeg', ext: 'jpg' },
  { kind: 'image', contentType: 'image/png', ext: 'png' },
  { kind: 'image', contentType: 'image/webp', ext: 'webp' },
  { kind: 'video', contentType: 'video/mp4', ext: 'mp4' },
]

/** One gallery item of a product in the storefront catalog (/api/products). */
export interface PublicProductMedia {
  kind: MediaKind
  /** R2 object key, relative to the media domain. */
  key: string
  posterKey: string | null
  alt: string | null
}

export const MEDIA_LIMITS = {
  /** Originals; Cloudflare resizes on delivery, so ~2-3000px is plenty. */
  imageBytes: 10 * 1024 * 1024,
  /** Worker request bodies are capped at 100 MB on the free plan. */
  videoBytes: 50 * 1024 * 1024,
  alt: 200,
  perProduct: 20,
} as const

/** `accept` attribute values for the admin file inputs. */
export const IMAGE_ACCEPT = 'image/jpeg,image/png,image/webp'
export const VIDEO_ACCEPT = 'video/mp4'

/**
 * Detect the real file type from its magic bytes (first 12 are enough).
 * Returns undefined for anything that is not an allowed type.
 */
export function sniffMediaType(head: Uint8Array): MediaType | undefined {
  const at = (offset: number, bytes: number[]) => bytes.every((b, i) => head[offset + i] === b)
  const ascii = (offset: number, text: string) => at(offset, [...text].map(c => c.charCodeAt(0)))
  const byType = (contentType: string) => MEDIA_TYPES.find(t => t.contentType === contentType)

  if (at(0, [0xFF, 0xD8, 0xFF])) return byType('image/jpeg')
  if (at(0, [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A])) return byType('image/png')
  if (ascii(0, 'RIFF') && ascii(8, 'WEBP')) return byType('image/webp')
  if (ascii(4, 'ftyp')) return byType('video/mp4')
  return undefined
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
