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

-- ─── Age groups ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS age_groups (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  slug       TEXT NOT NULL UNIQUE,            -- '2-3-godine'
  label      TEXT NOT NULL,                   -- '2–3 godine'
  sort_order INTEGER NOT NULL DEFAULT 0
);

-- ─── Products ──────────────────────────────────────────────────
-- slug is the public key (URLs, carts, order snapshots).
-- active=0 soft-hides a product without deleting it.
CREATE TABLE IF NOT EXISTS products (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  slug         TEXT NOT NULL UNIQUE,
  title        TEXT NOT NULL,
  category_id  INTEGER REFERENCES categories(id) ON DELETE RESTRICT,
  active       INTEGER NOT NULL DEFAULT 1,
  created_at   TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at   TEXT NOT NULL DEFAULT (datetime('now')),
  subtitle     TEXT,
  description  TEXT,
  badge        TEXT,                          -- 'Najmlađima'
  accent       TEXT NOT NULL DEFAULT 'mint' CHECK (accent IN ('mint', 'purple', 'coral')),
  age_group_id INTEGER REFERENCES age_groups(id) ON DELETE SET NULL,
  sort_order   INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_products_category  ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_active    ON products(active);
CREATE INDEX IF NOT EXISTS idx_products_age_group ON products(age_group_id);
CREATE INDEX IF NOT EXISTS idx_products_sort      ON products(sort_order, id);

-- ─── Product content lists (ordered child rows) ────────────────
CREATE TABLE IF NOT EXISTS product_features (        -- '24 stranice'
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  label      TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_product_features_product ON product_features(product_id, sort_order);

CREATE TABLE IF NOT EXISTS product_activities (      -- 'Svet boja' + description
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id  INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  description TEXT NOT NULL,
  sort_order  INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_product_activities_product ON product_activities(product_id, sort_order);

CREATE TABLE IF NOT EXISTS product_selling_points (  -- 'Piši-briši sistem' + body
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  title      TEXT NOT NULL,
  body       TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_product_selling_points_product ON product_selling_points(product_id, sort_order);

-- ─── Settings (key/value) ──────────────────────────────────────
-- catalog_version is bumped on every admin catalog change; the
-- storefront cache key includes it, so edits show up immediately.
CREATE TABLE IF NOT EXISTS settings (
  key        TEXT PRIMARY KEY,
  value      TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
INSERT OR IGNORE INTO settings (key, value) VALUES ('catalog_version', '1');

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

-- ─── Product images (files in R2, metadata here) ───────────────
-- File lives in R2 bucket `elorikids-media` at r2_key, served from
-- https://media.elorikids.rs/<r2_key>. First image by sort_order = cover.
CREATE TABLE IF NOT EXISTS product_images (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id   INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  kind         TEXT NOT NULL DEFAULT 'image' CHECK (kind IN ('image', 'video')),
  r2_key       TEXT NOT NULL UNIQUE,
  poster_key   TEXT,                           -- optional still for a video
  alt          TEXT,
  content_type TEXT NOT NULL,
  size_bytes   INTEGER NOT NULL,
  sort_order   INTEGER NOT NULL DEFAULT 0,
  created_at   TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_product_images_product ON product_images(product_id, sort_order);

-- ─── Storefront view ───────────────────────────────────────────
-- One row per product: category, age group, current price (what
-- checkout charges), regular price (crossed out) and cover image key.
DROP VIEW IF EXISTS v_storefront_products;
CREATE VIEW v_storefront_products AS
SELECT
  p.id, p.slug, p.title, p.subtitle, p.description, p.badge, p.accent,
  p.active, p.sort_order,
  c.slug   AS category_slug,
  c.name   AS category_name,
  ag.slug  AS age_slug,
  ag.label AS age_label,
  cur.amount  AS price,
  cur.is_sale AS is_sale,
  (SELECT amount FROM product_prices
   WHERE product_id = p.id AND is_sale = 0 AND effective_from <= datetime('now')
   ORDER BY effective_from DESC, id DESC LIMIT 1) AS regular_price,
  (SELECT r2_key FROM product_images
   WHERE product_id = p.id AND kind = 'image'
   ORDER BY sort_order, id LIMIT 1) AS cover_key
FROM products p
LEFT JOIN categories c  ON c.id = p.category_id
LEFT JOIN age_groups ag ON ag.id = p.age_group_id
LEFT JOIN product_prices cur ON cur.id = (
  SELECT id FROM product_prices
  WHERE product_id = p.id AND effective_from <= datetime('now')
  ORDER BY effective_from DESC, id DESC LIMIT 1
);

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
