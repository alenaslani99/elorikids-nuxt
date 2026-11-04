-- ═══════════════════════════════════════════════════════════════════
-- 0009 - Register the original books' media (uploaded to R2 by hand)
--
-- The video, poster and cover of the 3 original books were uploaded to
-- the root of the `elorikids-media` bucket via the Cloudflare dashboard.
-- This links them to their products so they show on the storefront and
-- are manageable in the admin panel. Gallery order matches the old
-- hardcoded media arrays: video first (with poster), then the cover.
--
-- Idempotent: each row is guarded by its unique r2_key. Requires 0008.
--
-- Run locally:
--   npx wrangler d1 execute elorikids-db --local --file server/db/migrations/0009-register-book-media.sql
-- Run on production:
--   npx wrangler d1 execute elorikids-db --remote --file server/db/migrations/0009-register-book-media.sql
-- ═══════════════════════════════════════════════════════════════════

-- ─── Prvi koraci ──────────────────────────────────────────────────
INSERT INTO product_images (product_id, kind, r2_key, poster_key, alt, content_type, size_bytes, sort_order)
SELECT id, 'video', 'prvi-koraci.mp4', 'prvi-koraci-poster.jpg', 'Pregled knjige Prvi koraci', 'video/mp4', 5236704, 0
FROM products WHERE slug = 'prvi-koraci'
  AND NOT EXISTS (SELECT 1 FROM product_images WHERE r2_key = 'prvi-koraci.mp4');

INSERT INTO product_images (product_id, kind, r2_key, poster_key, alt, content_type, size_bytes, sort_order)
SELECT id, 'image', 'prvi-koraci.jpeg', NULL, 'Naslovna strana - Prvi koraci', 'image/jpeg', 310515, 1
FROM products WHERE slug = 'prvi-koraci'
  AND NOT EXISTS (SELECT 1 FROM product_images WHERE r2_key = 'prvi-koraci.jpeg');

-- ─── Učimo kroz igru ──────────────────────────────────────────────
INSERT INTO product_images (product_id, kind, r2_key, poster_key, alt, content_type, size_bytes, sort_order)
SELECT id, 'video', 'ucimo-kroz-igru.mp4', 'ucimo-kroz-igru-poster.jpg', 'Pregled knjige Učimo kroz igru', 'video/mp4', 5162355, 0
FROM products WHERE slug = 'ucimo-kroz-igru'
  AND NOT EXISTS (SELECT 1 FROM product_images WHERE r2_key = 'ucimo-kroz-igru.mp4');

INSERT INTO product_images (product_id, kind, r2_key, poster_key, alt, content_type, size_bytes, sort_order)
SELECT id, 'image', 'ucimo-kroz-igru.jpeg', NULL, 'Naslovna strana - Učimo kroz igru', 'image/jpeg', 307413, 1
FROM products WHERE slug = 'ucimo-kroz-igru'
  AND NOT EXISTS (SELECT 1 FROM product_images WHERE r2_key = 'ucimo-kroz-igru.jpeg');

-- ─── Priprema za školu ────────────────────────────────────────────
INSERT INTO product_images (product_id, kind, r2_key, poster_key, alt, content_type, size_bytes, sort_order)
SELECT id, 'video', 'priprema-za-skolu.mp4', 'priprema-za-skolu-poster.jpg', 'Pregled knjige Priprema za školu', 'video/mp4', 4755582, 0
FROM products WHERE slug = 'priprema-za-skolu'
  AND NOT EXISTS (SELECT 1 FROM product_images WHERE r2_key = 'priprema-za-skolu.mp4');

INSERT INTO product_images (product_id, kind, r2_key, poster_key, alt, content_type, size_bytes, sort_order)
SELECT id, 'image', 'priprema-za-skolu.jpeg', NULL, 'Naslovna strana - Priprema za školu', 'image/jpeg', 301665, 1
FROM products WHERE slug = 'priprema-za-skolu'
  AND NOT EXISTS (SELECT 1 FROM product_images WHERE r2_key = 'priprema-za-skolu.jpeg');
