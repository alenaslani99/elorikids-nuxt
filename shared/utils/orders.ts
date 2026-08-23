/**
 * Shared order/cart constants used across client and server.
 *
 * The server recomputes totals from these values (trust-but-verify),
 * so they MUST stay in sync between useCart.ts and order.post.ts.
 */

/** Orders at or above this amount ship for free (RSD). */
export const FREE_SHIPPING_THRESHOLD = 5000

/** Flat shipping fee for orders below the free-shipping threshold (RSD). */
export const SHIPPING_FEE = 350
