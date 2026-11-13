-- ═══════════════════════════════════════════════════════════════════
-- 0011 - Product purchase cost (profit statistics)
--
--   products.cost          - what one unit currently costs the shop (RSD).
--                            NULL = not entered yet.
--   order_items.unit_cost  - the cost at the time of the order, frozen
--                            next to the price snapshot. NULL = unknown.
--
-- Profit of a line = (price - unit_cost) * quantity. Because the cost is
-- frozen per line, changing a product's cost later only affects orders
-- placed after the change. The first time a cost is entered in the admin
-- panel it is copied to that product's lines that have none yet (all
-- past orders).
--
-- NOTE: the ALTER TABLE statements are not repeatable - run this file
-- once per database.
--
-- Run locally:
--   npx wrangler d1 execute elorikids-db --local --file server/db/migrations/0011-product-cost.sql
-- Run on production:
--   npx wrangler d1 execute elorikids-db --remote --file server/db/migrations/0011-product-cost.sql
-- ═══════════════════════════════════════════════════════════════════

ALTER TABLE products ADD COLUMN cost INTEGER;
ALTER TABLE order_items ADD COLUMN unit_cost INTEGER;
