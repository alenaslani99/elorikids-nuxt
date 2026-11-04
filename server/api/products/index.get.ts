import { defineEventHandler, setResponseHeader } from 'h3'
import { getStorefrontCatalog, type StorefrontProduct } from '../../utils/storefront'

/**
 * Public storefront catalog: active products with content, prices and
 * gallery (R2 keys). Server-side cached by catalog version - see
 * server/utils/storefront.ts. Short browser cache on top.
 */
export default defineEventHandler(async (event): Promise<{ products: StorefrontProduct[] }> => {
  setResponseHeader(event, 'Cache-Control', 'public, max-age=60')
  return { products: await getStorefrontCatalog(event) }
})
