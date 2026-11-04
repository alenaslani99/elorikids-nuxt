-- ═══════════════════════════════════════════════════════════════════
-- 0010 - Product content in the database (replaces useBooks.ts data)
--
-- Moves the storefront content of each product out of the hardcoded
-- app/composables/useBooks.ts into relational tables:
--
--   age_groups              - '2–3 godine' etc. (was ageRange/ageSlug/category)
--   products (+ columns)    - subtitle, description, badge, accent,
--                             age_group_id, sort_order
--   product_features        - short tags ('24 stranice', 'Laminirano')
--   product_activities      - title + description
--   product_selling_points  - title + body
--   settings                - key/value; `catalog_version` is bumped on
--                             every admin change to invalidate the
--                             storefront catalog cache
--
--   v_storefront_products   - one row per product with category, age
--                             group, current/regular price and cover key
--
-- Seeds the current content of the 3 books so the site is unchanged.
--
-- NOTE: the ALTER TABLE statements are not repeatable - run this file
-- once per database. The seed inserts/updates are guarded and would not
-- overwrite admin edits.
--
-- Run locally:
--   npx wrangler d1 execute elorikids-db --local --file server/db/migrations/0010-product-content.sql
-- Run on production:
--   npx wrangler d1 execute elorikids-db --remote --file server/db/migrations/0010-product-content.sql
-- ═══════════════════════════════════════════════════════════════════

-- ─── Age groups ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS age_groups (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  slug       TEXT NOT NULL UNIQUE,
  label      TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);

-- ─── Products: content columns ────────────────────────────────────
ALTER TABLE products ADD COLUMN subtitle TEXT;
ALTER TABLE products ADD COLUMN description TEXT;
ALTER TABLE products ADD COLUMN badge TEXT;
ALTER TABLE products ADD COLUMN accent TEXT NOT NULL DEFAULT 'mint'
  CHECK (accent IN ('mint', 'purple', 'coral'));
ALTER TABLE products ADD COLUMN age_group_id INTEGER REFERENCES age_groups(id) ON DELETE SET NULL;
ALTER TABLE products ADD COLUMN sort_order INTEGER NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_products_age_group ON products(age_group_id);
CREATE INDEX IF NOT EXISTS idx_products_sort      ON products(sort_order, id);

-- ─── Product lists (ordered child rows) ───────────────────────────
CREATE TABLE IF NOT EXISTS product_features (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  label      TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_product_features_product ON product_features(product_id, sort_order);

CREATE TABLE IF NOT EXISTS product_activities (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id  INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  description TEXT NOT NULL,
  sort_order  INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_product_activities_product ON product_activities(product_id, sort_order);

CREATE TABLE IF NOT EXISTS product_selling_points (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  title      TEXT NOT NULL,
  body       TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_product_selling_points_product ON product_selling_points(product_id, sort_order);

-- ─── Settings (cache version) ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS settings (
  key        TEXT PRIMARY KEY,
  value      TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
INSERT OR IGNORE INTO settings (key, value) VALUES ('catalog_version', '1');

-- ─── Storefront view ──────────────────────────────────────────────
-- price         = what checkout charges now (newest effective row)
-- regular_price = newest effective non-sale row (crossed-out price)
-- cover_key     = first gallery image in R2 (NULL if none)
DROP VIEW IF EXISTS v_storefront_products;
CREATE VIEW v_storefront_products AS
SELECT
  p.id,
  p.slug,
  p.title,
  p.subtitle,
  p.description,
  p.badge,
  p.accent,
  p.active,
  p.sort_order,
  c.slug  AS category_slug,
  c.name  AS category_name,
  ag.slug AS age_slug,
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

-- ═══ Seed: current content of the 3 books ════════════════════════

INSERT OR IGNORE INTO age_groups (slug, label, sort_order) VALUES
  ('2-3-godine', '2–3 godine', 0),
  ('3-4-godine', '3–4 godine', 1),
  ('4-6-godine', '4–6 godine', 2);

UPDATE products SET
  subtitle     = 'Boje, veličine i životinje za najmlađe istraživače',
  description  = 'Idealna prva radna sveska za najmlađe. Kroz šarene ilustracije i jednostavne zadatke, dete upoznaje boje, veličine i životinje. Svaka stranica je prilagođena malim rukama i razvija osnove logičkog razmišljanja kroz igru.',
  badge        = 'Najmlađima',
  accent       = 'mint',
  age_group_id = (SELECT id FROM age_groups WHERE slug = '2-3-godine'),
  sort_order   = 0
WHERE slug = 'prvi-koraci' AND description IS NULL;

UPDATE products SET
  subtitle     = 'Sortiranje, grupisanje i logičke veze',
  description  = 'Knjiga koja razvija sposobnost sortiranja, grupisanja i povezivanja. Kroz zanimljive zadatke sa voćem, povrćem, igračkama i životinjama, dete uči da prepoznaje šta pripada gde i kako stvari idu zajedno.',
  badge        = 'Razvoj logike',
  accent       = 'purple',
  age_group_id = (SELECT id FROM age_groups WHERE slug = '3-4-godine'),
  sort_order   = 1
WHERE slug = 'ucimo-kroz-igru' AND description IS NULL;

UPDATE products SET
  subtitle     = 'Lavirinti, logika i koncentracija za buduće đake',
  description  = 'Poslednja knjiga u seriji - priprema za polazak u školu. Lavirinti, pronalaženje razlika i asocijacije razvijaju strpljenje, pažnju i logičko razmišljanje. Sve što dete treba da savlada pre prvog školskog zvona.',
  badge        = 'Školski start',
  accent       = 'coral',
  age_group_id = (SELECT id FROM age_groups WHERE slug = '4-6-godine'),
  sort_order   = 2
WHERE slug = 'priprema-za-skolu' AND description IS NULL;

-- Features: the same 4 tags for every book.
-- Guard: only seeds a product that has no features yet.
WITH f(label, sort_order) AS (VALUES
  ('24 stranice', 0),
  ('Laminirano', 1),
  ('Vodootporno', 2),
  ('Piši-briši', 3)
)
INSERT INTO product_features (product_id, label, sort_order)
SELECT p.id, f.label, f.sort_order
FROM products p CROSS JOIN f
WHERE p.slug IN ('prvi-koraci', 'ucimo-kroz-igru', 'priprema-za-skolu')
  AND NOT EXISTS (SELECT 1 FROM product_features x WHERE x.product_id = p.id);

-- Activities (4 per book).
WITH a(slug, title, description, sort_order) AS (VALUES
  ('prvi-koraci', 'Svet boja', 'Uparivanje predmeta sa bojama (sunce je žuto, list je zelen).', 0),
  ('prvi-koraci', 'Veliko i malo', 'Poređenje veličina kroz svakodnevne i životinjske primere.', 1),
  ('prvi-koraci', 'Životinje', 'Domaće i divlje životinje, uparivanje roditelja i mladunaca.', 2),
  ('prvi-koraci', 'Uparivanje', 'Pronalaženje parova i uparivanje sličnih predmeta za logiku.', 3),
  ('ucimo-kroz-igru', 'Sortiranje', 'Sortiranje voća i povrća, prepoznavanje šta pripada gde.', 0),
  ('ucimo-kroz-igru', 'Kategorije', 'Grupisanje predmeta po tipu (igračke, odeća, hrana, ...).', 1),
  ('ucimo-kroz-igru', 'Povezivanje', 'Uparivanje parova životinja, predmeta i pojmova.', 2),
  ('ucimo-kroz-igru', 'Logika', 'Zadaci zaključivanja, pronalaženje šema za razvoj mišljenja.', 3),
  ('priprema-za-skolu', 'Lavirinti', 'Pronalaženje pravog puta razvija strpljenje i logičko razmišljanje.', 0),
  ('priprema-za-skolu', 'Pronađi razlike', 'Upoređivanje slika jača pažnju i vizuelnu percepciju.', 1),
  ('priprema-za-skolu', 'Asocijacije', 'Povezivanje predmeta koji idu zajedno (četkica+pasta, ključ+vrata).', 2),
  ('priprema-za-skolu', 'Koncentracija', 'Zadaci fokusa koji pripremaju za školske obaveze.', 3)
)
INSERT INTO product_activities (product_id, title, description, sort_order)
SELECT p.id, a.title, a.description, a.sort_order
FROM a JOIN products p ON p.slug = a.slug
WHERE NOT EXISTS (SELECT 1 FROM product_activities x WHERE x.product_id = p.id);

-- Selling points: the same 4 for every book.
WITH s(title, body, sort_order) AS (VALUES
  ('Piši-briši sistem', 'Laminirane, vodootporne stranice omogućavaju višestruko korišćenje. Dete može da vežba isti zadatak bezbroj puta, bez straha od greške. Jednostavno obrišite i počnite ispočetka!', 0),
  ('Originalni sadržaj', 'Svaki zadatak je pažljivo osmišljen i ručno ilustrovan. Nema kopiranih materijala - sve je kreirano sa ljubavlju, prilagođeno našoj deci i njihovim potrebama.', 1),
  ('Učenje kroz igru', 'Zabava je na prvom mestu - učenje dolazi prirodno. Šareni zadaci, simpatične ilustracije i raznovrsne aktivnosti drže pažnju mališana dok nesvesno usvajaju nova znanja.', 2),
  ('24 stranice', 'Raznovrsni zadaci koji podstiču kreativnost i radoznalost.', 3)
)
INSERT INTO product_selling_points (product_id, title, body, sort_order)
SELECT p.id, s.title, s.body, s.sort_order
FROM products p CROSS JOIN s
WHERE p.slug IN ('prvi-koraci', 'ucimo-kroz-igru', 'priprema-za-skolu')
  AND NOT EXISTS (SELECT 1 FROM product_selling_points x WHERE x.product_id = p.id);
