-- ═══════════════════════════════════════════════════════════════════
-- elorikids D1 schema - Cloudflare D1 (SQLite)
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

-- ─── Categories (self-referential tree) ────────────────────────
-- parent_id → categories.id for nested categories (unlimited depth).
CREATE TABLE IF NOT EXISTS categories (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  slug       TEXT NOT NULL UNIQUE,
  name       TEXT NOT NULL,
  parent_id  INTEGER REFERENCES categories(id) ON DELETE CASCADE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_categories_parent ON categories(parent_id);

-- ─── Products ──────────────────────────────────────────────────
-- slug is the public key (matches shared/utils/products.ts).
-- active=0 soft-hides a product without deleting it.
CREATE TABLE IF NOT EXISTS products (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  slug        TEXT NOT NULL UNIQUE,
  title       TEXT NOT NULL,
  category_id INTEGER REFERENCES categories(id) ON DELETE RESTRICT,
  active      INTEGER NOT NULL DEFAULT 1,
  created_at  TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_active   ON products(active);

-- ─── Product prices (append-only history) ──────────────────────
-- Current selling price = newest row with effective_from <= now.
-- is_sale=1 marks a sale price. effective_from allows scheduling.
CREATE TABLE IF NOT EXISTS product_prices (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id     INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  amount         INTEGER NOT NULL,                  -- RSD, integer
  is_sale        INTEGER NOT NULL DEFAULT 0,        -- 1 = sale price
  effective_from TEXT NOT NULL DEFAULT (datetime('now')),
  created_at     TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Optimized for the "latest price for a product" query.
CREATE INDEX IF NOT EXISTS idx_prices_current
  ON product_prices(product_id, effective_from DESC, id DESC);

-- ─── Orders ────────────────────────────────────────────────────
-- `id`           is the auto-increment integer PK (internal).
-- `track_number` is the public tracking ID: 'EK-2026-a3f9c2' (unguessable).
-- Customers use `track_number` to look up their order.
CREATE TABLE IF NOT EXISTS orders (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  track_number  TEXT NOT NULL UNIQUE,     -- 'EK-2026-a3f9c2' (tracking)
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

CREATE INDEX IF NOT EXISTS idx_orders_user         ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_email        ON orders(email);
CREATE INDEX IF NOT EXISTS idx_orders_track_number ON orders(track_number);

-- ─── Order items (line items per order) ────────────────────────
-- `order_id` references orders.id (the integer PK).
-- `product_id` optionally links to products for sales analytics. It is
-- nullable + ON DELETE SET NULL so order history survives a product
-- deletion; the slug/title/price snapshot always stays.
CREATE TABLE IF NOT EXISTS order_items (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id   INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
  slug       TEXT NOT NULL,
  title      TEXT NOT NULL,
  price      INTEGER NOT NULL,
  quantity   INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_order_items_order   ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product ON order_items(product_id);

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
