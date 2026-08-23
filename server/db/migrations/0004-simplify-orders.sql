-- ═══════════════════════════════════════════════════════════════════
-- 0004 — Simplify orders schema
--
-- Replaces the seq/id/track_code three-column design with a clean
-- two-column design:
--   id           INTEGER PRIMARY KEY AUTOINCREMENT (internal PK)
--   track_number TEXT UNIQUE 'EK-YYYY-XXXXXX' (public tracking ID)
--
-- order_items now references orders.id directly via order_id.
--
-- This migration DROPS existing orders/order_items and recreates them.
-- Safe for this app because there are no production orders yet.
--
-- Run locally:
--   npx wrangler d1 execute elorikids-db --local --file server/db/migrations/0004-simplify-orders.sql
-- Run on production:
--   npx wrangler d1 execute elorikids-db --remote --file server/db/migrations/0004-simplify-orders.sql
-- ═══════════════════════════════════════════════════════════════════

DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;

CREATE TABLE orders (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  track_number  TEXT NOT NULL UNIQUE,
  user_id       INTEGER REFERENCES users(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  phone         TEXT NOT NULL,
  email         TEXT NOT NULL,
  address       TEXT NOT NULL,
  city          TEXT NOT NULL,
  postal        TEXT NOT NULL,
  note          TEXT,
  subtotal      INTEGER NOT NULL,
  shipping      INTEGER NOT NULL,
  grand_total   INTEGER NOT NULL,
  status        TEXT NOT NULL DEFAULT 'received',
  received_at   TEXT,
  preparing_at  TEXT,
  in_transit_at TEXT,
  delivered_at  TEXT,
  cancelled_at  TEXT,
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_orders_user         ON orders(user_id);
CREATE INDEX idx_orders_email        ON orders(email);
CREATE INDEX idx_orders_track_number ON orders(track_number);

CREATE TABLE order_items (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id  INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  slug      TEXT NOT NULL,
  title     TEXT NOT NULL,
  price     INTEGER NOT NULL,
  quantity  INTEGER NOT NULL
);

CREATE INDEX idx_order_items_order ON order_items(order_id);
