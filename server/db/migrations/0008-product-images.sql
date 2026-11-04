-- ═══════════════════════════════════════════════════════════════════
-- 0008 - Product images (files live in R2, metadata here)
--
-- Each row is one gallery item for a product. The file itself is stored
-- in the R2 bucket `elorikids-media` under `r2_key` and served publicly
-- from https://media.elorikids.rs/<r2_key>. Images are resized on the
-- fly by Cloudflare Image Transformations, so only the original is kept.
--
--   kind       - 'image' | 'video'
--   poster_key - optional still image for a video (separate R2 object)
--   sort_order - gallery order; the first image is the product cover
--
-- ON DELETE CASCADE drops the rows with the product; the admin delete
-- endpoint removes the R2 objects itself.
--
-- Run locally:
--   npx wrangler d1 execute elorikids-db --local --file server/db/migrations/0008-product-images.sql
-- Run on production:
--   npx wrangler d1 execute elorikids-db --remote --file server/db/migrations/0008-product-images.sql
-- ═══════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS product_images (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id   INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  kind         TEXT NOT NULL DEFAULT 'image' CHECK (kind IN ('image', 'video')),
  r2_key       TEXT NOT NULL UNIQUE,
  poster_key   TEXT,
  alt          TEXT,
  content_type TEXT NOT NULL,
  size_bytes   INTEGER NOT NULL,
  sort_order   INTEGER NOT NULL DEFAULT 0,
  created_at   TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_product_images_product ON product_images(product_id, sort_order);
