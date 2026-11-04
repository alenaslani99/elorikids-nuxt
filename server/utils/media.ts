/**
 * R2 media storage for product images/videos.
 *
 * Files are written through the `MEDIA` R2 binding (wrangler.toml) and
 * read publicly from https://media.elorikids.rs (R2 custom domain, edge
 * cached). Keys are `products/<productId>/<random>.<ext>`: unguessable,
 * and a replaced image always gets a new URL, so objects can be cached
 * as immutable.
 */
import type { R2Bucket } from '@cloudflare/workers-types'
import type { H3Event } from 'h3'
import { MEDIA_LIMITS, sniffMediaType, type MediaType } from '~~/shared/utils/media'

export function useMedia(event: H3Event): R2Bucket {
  const bucket = (event.context as any).cloudflare?.env?.MEDIA
  if (!bucket) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Skladište slika nije dostupno (R2 binding nije konfigurisan).',
    })
  }
  return bucket as R2Bucket
}

function randomId(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(9))
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_')
}

export function buildMediaKey(productId: number, ext: string): string {
  return `products/${productId}/${randomId()}.${ext}`
}

/**
 * Validate an uploaded file: real type from magic bytes, allowed kind,
 * and size limit for that kind. Throws 400 with a user-facing message.
 */
export async function validateUpload(file: File, allowed: MediaType['kind'][]): Promise<MediaType> {
  const head = new Uint8Array(await file.slice(0, 12).arrayBuffer())
  const type = sniffMediaType(head)
  if (!type || !allowed.includes(type.kind)) {
    const list = allowed.includes('video') ? 'JPG, PNG, WebP ili MP4' : 'JPG, PNG ili WebP'
    throw createError({ statusCode: 400, statusMessage: `Nepodržan format fajla. Dozvoljeno: ${list}.` })
  }
  const max = type.kind === 'video' ? MEDIA_LIMITS.videoBytes : MEDIA_LIMITS.imageBytes
  if (file.size === 0 || file.size > max) {
    throw createError({
      statusCode: 400,
      statusMessage: `Fajl je prevelik (najviše ${Math.round(max / (1024 * 1024))} MB).`,
    })
  }
  return type
}

export async function putMedia(bucket: R2Bucket, key: string, file: File, type: MediaType): Promise<void> {
  await bucket.put(key, await file.arrayBuffer(), {
    httpMetadata: {
      contentType: type.contentType,
      // Keys are never reused, so browsers and the edge may cache forever.
      cacheControl: 'public, max-age=31536000, immutable',
    },
  })
}

/** Best-effort delete: an orphaned object costs fractions of a cent, a failed request costs nothing. */
export async function deleteMedia(bucket: R2Bucket, keys: (string | null | undefined)[]): Promise<void> {
  const list = keys.filter((k): k is string => !!k)
  if (!list.length) return
  try {
    await bucket.delete(list)
  }
  catch (err) {
    console.error('[media] Failed to delete R2 objects:', list, err)
  }
}

export interface ProductImageRow {
  id: number
  product_id: number
  kind: MediaType['kind']
  r2_key: string
  poster_key: string | null
  alt: string | null
  content_type: string
  size_bytes: number
  sort_order: number
  created_at: string
}

export interface AdminProductImage {
  id: number
  kind: MediaType['kind']
  key: string
  posterKey: string | null
  alt: string | null
  contentType: string
  sizeBytes: number
  sortOrder: number
  createdAt: string
}

export function toAdminImage(row: ProductImageRow): AdminProductImage {
  return {
    id: row.id,
    kind: row.kind,
    key: row.r2_key,
    posterKey: row.poster_key,
    alt: row.alt,
    contentType: row.content_type,
    sizeBytes: row.size_bytes,
    sortOrder: row.sort_order,
    createdAt: row.created_at,
  }
}

export function validateAlt(value: unknown): string | null {
  const alt = typeof value === 'string' ? value.trim() : ''
  if (alt.length > MEDIA_LIMITS.alt) {
    throw createError({ statusCode: 400, statusMessage: `Opis slike je predug (najviše ${MEDIA_LIMITS.alt} karaktera).` })
  }
  return alt || null
}
