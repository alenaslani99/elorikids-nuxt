import { joinURL } from 'ufo'
import { defineProvider } from '@nuxt/image/runtime'

/**
 * DEV ONLY image provider for R2 media: returns the original file from
 * the local /media route (Cloudflare Image Transformations only exist on
 * the real zone). Production uses the built-in `cloudflare` provider -
 * see `image.providers.media` in nuxt.config.ts.
 */
export default defineProvider<{ baseURL?: string }>({
  getImage: (src, { baseURL = '/media' }) => ({ url: joinURL(baseURL, src) }),
})
