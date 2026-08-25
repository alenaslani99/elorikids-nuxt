-- ═══════════════════════════════════════════════════════════════════
-- 0001 - Replace order_events with status timestamps on orders
--
-- Run locally:
--   npx wrangler d1 execute elorikids-db --local --file server/db/migrations/0001-order-status-timestamps.sql
-- Run on production:
--   npx wrangler d1 execute elorikids-db --remote --file server/db/migrations/0001-order-status-timestamps.sql
-- ═══════════════════════════════════════════════════════════════════

-- ─── 1. Add timestamp columns to orders ─────────────────────────
ALTER TABLE orders ADD COLUMN received_at   TEXT;
ALTER TABLE orders ADD COLUMN preparing_at  TEXT;
ALTER TABLE orders ADD COLUMN in_transit_at  TEXT;
ALTER TABLE orders ADD COLUMN delivered_at   TEXT;
ALTER TABLE orders ADD COLUMN cancelled_at   TEXT;

-- ─── 2. Migrate old status vocabulary ───────────────────────────
--   processed → received
--   shipped   → in_transit
--   delivered → delivered  (no change)
--   cancelled → cancelled  (no change)
UPDATE orders SET status = 'received'    WHERE status = 'processed';
UPDATE orders SET status = 'in_transit'  WHERE status = 'shipped';

-- ─── 3. Backfill timestamps for existing orders ─────────────────
-- Every order was "received" at creation time
UPDATE orders SET received_at = created_at WHERE received_at IS NULL;

-- Orders that were already shipped/delivered/cancelled get their
-- timestamp from updated_at (best approximation available)
UPDATE orders SET in_transit_at = updated_at WHERE status = 'in_transit' AND in_transit_at IS NULL;
UPDATE orders SET delivered_at  = updated_at WHERE status = 'delivered'  AND delivered_at IS NULL;
UPDATE orders SET cancelled_at  = updated_at WHERE status = 'cancelled'  AND cancelled_at IS NULL;

-- ─── 4. Drop the old order_events table ─────────────────────────
DROP TABLE IF EXISTS order_events;
