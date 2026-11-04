import { joinURL } from 'ufo'
import type { StorefrontProduct } from '~~/server/utils/storefront'

export interface BookActivity {
  title: string;
  description: string;
}

export interface MediaItem {
  type: "video" | "image";
  src: string;
  alt?: string;
  poster?: string;
  /** NuxtImg provider: 'media' for R2 images (src is the R2 key). */
  provider?: 'media';
}

export interface CoverImage {
  /** R2 key - use with <NuxtImg provider="media">. */
  src: string;
  provider: 'media';
}

export interface Book {
  slug: string;
  title: string;
  subtitle: string;
  ageRange: string;
  ageSlug: string;
  category: string;
  price: number;
  oldPrice: number;
  description: string;
  features: string[];
  activities: BookActivity[];
  sellingPoints: { title: string; text: string }[];
  accent: string;
  badge: string;
  /** First gallery image (cards, thumbnails); null until one is uploaded. */
  cover: CoverImage | null;
  /** Gallery for MediaGallery, in admin order. */
  media: MediaItem[];
  /** Absolute image URL for og:image / JSON-LD. */
  shareImage: string;
}

/** Bundled fallback for share previews of products without images. */
const DEFAULT_SHARE_IMAGE = 'https://elorikids.rs/elorikids-1.jpg';

/**
 * Storefront products from the database (admin-managed), via the cached
 * /api/products endpoint. One shared request per app load: the result is
 * reused by every component and across client-side navigations.
 *
 * `books` is reactive. Pages that need the data during SSR (e.g. for a
 * 404 or meta tags) should `await ready` first.
 */
export function useBooks() {
  // Composables first - none may run after an await.
  const img = useImage();
  const mediaBaseUrl = useRuntimeConfig().public.mediaBaseUrl as string;
  // During SSR this is event.$fetch, which keeps the Cloudflare bindings
  // (a plain $fetch would reach the API without D1 on Workers).
  const requestFetch = useRequestFetch();

  const asyncData = useAsyncData(
    'catalog',
    () => requestFetch<{ products: StorefrontProduct[] }>('/api/products'),
    {
      default: () => ({ products: [] as StorefrontProduct[] }),
      getCachedData: (key, nuxtApp) => nuxtApp.payload.data[key] ?? nuxtApp.static.data[key],
    },
  );

  const imageUrl = (key: string, width: number, format = 'webp') =>
    img(key, { width, format }, { provider: 'media' as any });

  function toBook(p: StorefrontProduct): Book {
    const firstImage = p.media.find((m) => m.kind === 'image');
    const media = p.media.map((m): MediaItem => {
      if (m.kind === 'video') {
        const posterKey = m.posterKey ?? firstImage?.key;
        return {
          type: 'video',
          src: joinURL(mediaBaseUrl, m.key),
          poster: posterKey ? imageUrl(posterKey, 800) : undefined,
          alt: m.alt ?? `Video - ${p.title}`,
        };
      }
      return { type: 'image', src: m.key, provider: 'media', alt: m.alt ?? p.title };
    });

    return {
      slug: p.slug,
      title: p.title,
      subtitle: p.subtitle,
      ageRange: p.ageLabel ?? '',
      ageSlug: p.ageSlug ?? '',
      category: p.ageLabel ?? p.categoryName ?? '',
      price: p.price,
      oldPrice: p.oldPrice,
      description: p.description,
      features: p.features,
      activities: p.activities,
      sellingPoints: p.sellingPoints,
      accent: p.accent,
      badge: p.badge,
      cover: p.coverKey ? { src: p.coverKey, provider: 'media' } : null,
      media,
      shareImage: p.coverKey ? imageUrl(p.coverKey, 1200, 'jpeg') : DEFAULT_SHARE_IMAGE,
    };
  }

  const books = computed(() => (asyncData.data.value?.products ?? []).map(toBook));

  const getBook = (slug: string) => books.value.find((b) => b.slug === slug);
  const getRelatedBooks = (slug: string) => books.value.filter((b) => b.slug !== slug);

  const ready = Promise.resolve(asyncData).then(() => undefined);

  return { books, getBook, getRelatedBooks, ready };
}
