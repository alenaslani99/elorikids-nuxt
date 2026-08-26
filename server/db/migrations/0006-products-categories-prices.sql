-- ═══════════════════════════════════════════════════════════════════
-- 0006 - Products, categories, and price history
--
-- Introduces a catalog layer so product data can eventually move out of
-- the hardcoded shared/utils/products.ts map. For now the 3 existing
-- books are seeded here; the frontend keeps reading the hardcoded map,
-- but order.post.ts now looks up the selling price from product_prices.
--
-- New tables:
--   categories     - self-referential tree (parent_id). Unlimited depth.
--   products       - slug is the public key (matches existing slugs).
--                    active=0 soft-hides a product without deleting it.
--   product_prices - append-only price history. The CURRENT selling
--                    price = newest row for a product whose
--                    effective_from <= now. is_sale=1 marks a sale.
--                    effective_from lets you schedule future changes.
--
-- order_items gains a nullable product_id FK (ON DELETE SET NULL) so
-- order history survives a product deletion (slug/title/price snapshot
-- stays), while future sales-by-product analytics can use the FK.
--
-- Run locally:
--   npx wrangler d1 execute elorikids-db --local --file server/db/migrations/0006-products-categories-prices.sql
-- Run on production:
--   npx wrangler d1 execute elorikids-db --remote --file server/db/migrations/0006-products-categories-prices.sql
-- ═══════════════════════════════════════════════════════════════════

-- ─── Categories (self-referential tree) ───────────────────────────
CREATE TABLE IF NOT EXISTS categories (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  slug       TEXT NOT NULL UNIQUE,
  name       TEXT NOT NULL,
  parent_id  INTEGER REFERENCES categories(id) ON DELETE CASCADE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_categories_parent ON categories(parent_id);

-- ─── Products ────────────────────────────────────────────────────
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

-- ─── Product prices (append-only history) ───────────────────────
-- Current price = newest row with effective_from <= datetime('now').
CREATE TABLE IF NOT EXISTS product_prices (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id     INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  amount         INTEGER NOT NULL,                  -- RSD, integer
  is_sale        INTEGER NOT NULL DEFAULT 0,        -- 1 = sale price
  effective_from TEXT NOT NULL DEFAULT (datetime('now')),
  created_at     TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Composite index optimized for the "latest price for a product" query.
CREATE INDEX IF NOT EXISTS idx_prices_current
  ON product_prices(product_id, effective_from DESC, id DESC);

-- ─── order_items: link to products (nullable, snapshot-safe) ────
ALTER TABLE order_items ADD COLUMN product_id INTEGER REFERENCES products(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_order_items_product ON order_items(product_id);

-- ═══ Seed data ═══════════════════════════════════════════════════
-- Top-level category "Knjige" (Books) - the only category for now.
INSERT INTO categories (slug, name, parent_id, sort_order)
VALUES ('knjige', 'Knjige', NULL, 0);

-- The 3 existing products, all under Knjige. Slugs match the hardcoded
-- shared/utils/products.ts map so the frontend and DB stay in sync.
INSERT INTO products (slug, title, category_id, active)
VALUES
  ('prvi-koraci',       'Prvi koraci',       1, 1),
  ('ucimo-kroz-igru',   'Učimo kroz igru',   1, 1),
  ('priprema-za-skolu', 'Priprema za školu', 1, 1);

-- Initial regular prices (2000 RSD), matching the hardcoded map.
INSERT INTO product_prices (product_id, amount, is_sale, effective_from)
VALUES
  (1, 2000, 0, datetime('now')),
  (2, 2000, 0, datetime('now')),
  (3, 2000, 0, datetime('now'));
