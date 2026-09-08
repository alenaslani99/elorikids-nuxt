/**
 * Shared order/cart constants used across client and server.
 *
 * The server recomputes totals from these values (trust-but-verify),
 * so they MUST stay in sync between useCart.ts and order.post.ts.
 */

/** Orders at or above this amount ship for free (RSD). */
export const FREE_SHIPPING_THRESHOLD = 4500

/**
 * NOTE: there is intentionally no flat shipping fee. Below the
 * free-shipping threshold the courier charges by destination
 * ("+ dostava"), so shipping is NEVER added to online totals:
 * grandTotal = subtotal, and the stored order shipping is always 0.
 * (Historical orders placed before this change keep their 350 RSD fee.)
 */
