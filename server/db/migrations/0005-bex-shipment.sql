-- ═══════════════════════════════════════════════════════════════════
-- 0005 - Bex Express shipment tracking columns
--
-- Adds three columns to `orders` to store the Bex shipment reference
-- once a shipment is created from the admin panel:
--   bex_shipment_id   - the shipmentId returned by postShipments (null until sent)
--   bex_label_printed  - 0/1 flag for UI state (label downloaded?)
--   bex_sent_at       - timestamp when the shipment was created in Bex
--
-- Run locally:
--   npx wrangler d1 execute elorikids-db --local --file server/db/migrations/0005-bex-shipment.sql
-- Run on production:
--   npx wrangler d1 execute elorikids-db --remote --file server/db/migrations/0005-bex-shipment.sql
-- ═══════════════════════════════════════════════════════════════════

ALTER TABLE orders ADD COLUMN bex_shipment_id INTEGER;
ALTER TABLE orders ADD COLUMN bex_label_printed INTEGER NOT NULL DEFAULT 0;
ALTER TABLE orders ADD COLUMN bex_sent_at TEXT;
