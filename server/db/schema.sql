-- ═══════════════════════════════════════════════════════════════════
-- elorikids D1 schema — Cloudflare D1 (SQLite)
-- Apply with: npx wrangler d1 execute elorikids-db --file server/db/schema.sql
-- ═══════════════════════════════════════════════════════════════════

-- ─── Users (auth) ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  name          TEXT NOT NULL,
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,           -- PBKDF2 (Web Crypto, edge-safe)
  created_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ─── Sessions (opaque token revocation) ───────────────────────
CREATE TABLE IF NOT EXISTS sessions (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token      TEXT NOT NULL UNIQUE,        -- 32-byte random, base64url
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  expires_at TEXT NOT NULL DEFAULT (datetime('now', '+30 days'))
);

CREATE INDEX IF NOT EXISTS idx_sessions_token   ON sessions(token);
CREATE INDEX IF NOT EXISTS idx_sessions_user   ON sessions(user_id);

-- ─── Orders ────────────────────────────────────────────────────
-- `seq`   is the internal auto-increment PK (assigned by SQLite, no race).
-- `id`    is the human-readable display ID ('EK-2026-000001') derived from seq.
-- `track_code` is the public tracking ID with a random suffix (unguessable).
-- Customers use `track_code` to look up their order; `id` is for display.
CREATE TABLE IF NOT EXISTS orders (
  seq           INTEGER PRIMARY KEY AUTOINCREMENT,
  id            TEXT NOT NULL UNIQUE,     -- 'EK-2026-000001' (display)
  track_code    TEXT NOT NULL UNIQUE,     -- 'EK-2026-000001-a3f9c2' (tracking)
  user_id       INTEGER REFERENCES users(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  phone         TEXT NOT NULL,
  email         TEXT NOT NULL,
  address       TEXT NOT NULL,
  city          TEXT NOT NULL,
  postal        TEXT NOT NULL,
  note          TEXT,
  subtotal      INTEGER NOT NULL,        -- RSD, integer
  shipping      INTEGER NOT NULL,
  grand_total   INTEGER NOT NULL,
  status        TEXT NOT NULL DEFAULT 'received',  -- received|preparing|in_transit|delivered|cancelled
  received_at    TEXT,              -- set when order is placed
  preparing_at   TEXT,              -- set when being packed
  in_transit_at  TEXT,              -- set when handed to courier
  delivered_at   TEXT,              -- set when delivered
  cancelled_at   TEXT,              -- set if cancelled
  created_at    TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_orders_user       ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_email      ON orders(email);
CREATE INDEX IF NOT EXISTS idx_orders_track_code ON orders(track_code);

-- ─── Order items (line items per order) ────────────────────────
-- `order_seq` references orders.seq (the integer PK).
CREATE TABLE IF NOT EXISTS order_items (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  order_seq INTEGER NOT NULL REFERENCES orders(seq) ON DELETE CASCADE,
  slug      TEXT NOT NULL,
  title     TEXT NOT NULL,
  price     INTEGER NOT NULL,
  quantity  INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_seq);

-- ─── Newsletter subscribers ────────────────────────────────────
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  email      TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ─── Contact messages (log) ───────────────────────────────────
CREATE TABLE IF NOT EXISTS contact_messages (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  name       TEXT NOT NULL,
  email      TEXT NOT NULL,
  message    TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ─── Rate limits (D1-backed throttling for public endpoints) ──
CREATE TABLE IF NOT EXISTS rate_limits (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  identifier  TEXT NOT NULL,              -- e.g. 'login:1.2.3.4'
  action      TEXT NOT NULL,              -- e.g. 'login', 'register'
  count       INTEGER NOT NULL DEFAULT 1,
  expires_at  TEXT NOT NULL,
  UNIQUE(identifier, action)
);

CREATE INDEX IF NOT EXISTS idx_rate_limits_lookup ON rate_limits(identifier, action);
CREATE INDEX IF NOT EXISTS idx_rate_limits_expiry  ON rate_limits(expires_at);
