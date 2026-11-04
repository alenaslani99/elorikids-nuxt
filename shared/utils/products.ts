/**
 * Order limits shared by the cart UI and the order API.
 *
 * Product data (titles, prices, content) lives in D1 and is served by the
 * cached storefront catalog - see server/utils/storefront.ts.
 */

/** Maximum number of distinct items allowed in a single order. */
export const MAX_ORDER_ITEMS = 50
