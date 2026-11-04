import { joinURL } from 'ufo'
import type { Book, MediaItem } from '~/composables/useBooks'
import type { PublicProductMedia } from '~~/shared/utils/media'

export interface CoverImage {
  src: string
  /** 'media' for R2 images (Cloudflare-resized); undefined for /public files. */
  provider?: 'media'
}

/**
 * Product galleries managed in the admin panel (R2 + product_images).
 *
 * One request (`/api/products/media`) covers every product and is shared
 * across components and client-side navigations. A product without R2
 * media falls back to its bundled /public images from useBooks, so the
 * storefront keeps working before/without any uploads.
 */
export async function useProductMedia() {
  // Composables first: the Nuxt context is lost after the `await` below.
  const img = useImage()
  const mediaBaseUrl = useRuntimeConfig().public.mediaBaseUrl as string
  // During SSR this is event.$fetch, which carries the request context -
  // a plain $fetch would reach the API without the Cloudflare bindings
  // (no D1 on Workers) and silently fall back to the bundled images.
  const requestFetch = useRequestFetch()

  const { data } = await useAsyncData(
    'product-media',
    () => requestFetch<{ media: Record<string, PublicProductMedia[]> }>('/api/products/media'),
    {
      default: () => ({ media: {} as Record<string, PublicProductMedia[]> }),
      // Reuse across client navigations instead of refetching per page.
      getCachedData: (key, nuxtApp) => nuxtApp.payload.data[key] ?? nuxtApp.static.data[key],
    },
  )

  const itemsFor = (slug: string) => data.value?.media[slug] ?? []
  const imageUrl = (key: string, width: number, format = 'webp') =>
    img(key, { width, format }, { provider: 'media' as any })

  /** Gallery items for MediaGallery (video first if the admin ordered it so). */
  function gallery(book: Book): MediaItem[] {
    const items = itemsFor(book.slug)
    if (!items.length) return book.media

    const firstImage = items.find(i => i.kind === 'image')
    return items.map((i): MediaItem => {
      if (i.kind === 'video') {
        const posterKey = i.posterKey ?? firstImage?.key
        return {
          type: 'video',
          src: joinURL(mediaBaseUrl, i.key),
          poster: posterKey ? imageUrl(posterKey, 800) : undefined,
          alt: i.alt ?? `Video - ${book.title}`,
        }
      }
      return { type: 'image', src: i.key, provider: 'media', alt: i.alt ?? book.title }
    })
  }

  /** Cover for cards/thumbnails: first R2 image, else the bundled one. */
  function cover(book: Book): CoverImage {
    const first = itemsFor(book.slug).find(i => i.kind === 'image')
    return first ? { src: first.key, provider: 'media' } : { src: `/${book.img}` }
  }

  /** Absolute image URL for og:image / JSON-LD. */
  function shareImage(book: Book): string {
    const first = itemsFor(book.slug).find(i => i.kind === 'image')
    return first ? imageUrl(first.key, 1200, 'jpeg') : `https://elorikids.rs/${book.img}`
  }

  return { gallery, cover, shareImage }
}
