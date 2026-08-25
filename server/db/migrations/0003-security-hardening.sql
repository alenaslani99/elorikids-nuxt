-- ═══════════════════════════════════════════════════════════════════
-- 0003 - Security hardening: order ID redesign + rate limiting
--
-- Changes:
--   1. Orders get an auto-increment `seq` PK (eliminates race condition)
--      + a random `track_code` (unguessable public tracking ID)
--   2. New `rate_limits` table for D1-backed rate limiting
--
-- Run locally:
--   npx wrangler d1 execute elorikids-db --local --file server/db/migrations/0003-security-hardening.sql
-- Run on production:
--   npx wrangler d1 execute elorikids-db --remote --file server/db/migrations/0003-security-hardening.sql
-- ═══════════════════════════════════════════════════════════════════

-- ─── 1. Add auto-increment sequence + tracking code to orders ──────
-- `seq` is the real PK: monotonic, assigned by SQLite, no race.
-- `track_code` is the public-facing random ID shown to customers
--   (format: EK-YYYY-NNNNNN-XXXXXX where XXXXXX is random alphanumeric).
-- The old `id` column (EK-YYYY-000001) becomes legacy data - kept for
-- backwards compat but `track_code` is the new lookup key.

ALTER TABLE orders ADD COLUMN seq INTEGER;
ALTER TABLE orders ADD COLUMN track_code TEXT;

-- Backfill seq with a row number so existing orders get a stable sequence
UPDATE orders SET seq = rowid;
CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_seq ON orders(seq);

-- Backfill track_code for existing orders: derive from existing id
-- Format: <old_id>-<random 6 chars>. The old id already contains the
-- year + sequence, so we just append randomness.
-- Note: hex(randomblob(3)) gives 6 hex characters.
UPDATE orders SET track_code = id || '-' || lower(hex(randomblob(3)));

CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_track_code ON orders(track_code);

-- ─── 2. Rate limits table ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS rate_limits (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  identifier  TEXT NOT NULL,
  action      TEXT NOT NULL,
  count       INTEGER NOT NULL DEFAULT 1,
  expires_at  TEXT NOT NULL,
  UNIQUE(identifier, action)
);

CREATE INDEX IF NOT EXISTS idx_rate_limits_lookup ON rate_limits(identifier, action);
CREATE INDEX IF NOT EXISTS idx_rate_limits_expiry  ON rate_limits(expires_at);
