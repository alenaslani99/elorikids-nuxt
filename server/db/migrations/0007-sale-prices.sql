-- ═══════════════════════════════════════════════════════════════════
-- 0007 - Sale prices: 1800 RSD (was 2000 RSD)
--
-- Appends one sale row (is_sale=1) per product to the append-only
-- product_prices history. The order API always charges the newest row
-- with effective_from <= now, so this takes effect immediately.
--
-- Slug-based lookup (no hardcoded ids) + NOT EXISTS guard, so running
-- the file twice does NOT create duplicate sale rows.
--
-- Rollback: delete these rows -
--   DELETE FROM product_prices WHERE amount = 1800 AND is_sale = 1;
--
-- Run locally:
--   npx wrangler d1 execute elorikids-db --local --file server/db/migrations/0007-sale-prices.sql
-- Run on production:
--   npx wrangler d1 execute elorikids-db --remote --file server/db/migrations/0007-sale-prices.sql
-- Verify current selling prices:
--   SELECT p.slug, pr.amount, pr.is_sale, pr.effective_from
--   FROM products p
--   LEFT JOIN product_prices pr ON pr.product_id = p.id
--     AND pr.id = (SELECT id FROM product_prices
--                  WHERE product_id = p.id AND effective_from <= datetime('now')
--                  ORDER BY effective_from DESC, id DESC LIMIT 1);
-- ═══════════════════════════════════════════════════════════════════

INSERT INTO product_prices (product_id, amount, is_sale, effective_from)
SELECT p.id, 1800, 1, datetime('now')
FROM products p
WHERE p.slug IN ('prvi-koraci', 'ucimo-kroz-igru', 'priprema-za-skolu')
  AND NOT EXISTS (
    SELECT 1 FROM product_prices pr
    WHERE pr.product_id = p.id AND pr.amount = 1800 AND pr.is_sale = 1
  );
