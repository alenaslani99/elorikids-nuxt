import { createError, defineEventHandler, readBody } from 'h3'
import { useDb } from '../../utils/db'
import { requireElevated } from '../../utils/admin'
import {
  isUniqueViolation, requireCategoryExists, validateOptionalId, validatePricePair, validateSlug, validateText,
} from '../../utils/catalog'
import { CATALOG_LIMITS } from '~~/shared/utils/catalog'

interface ProductBody {
  slug?: string
  title?: string
  categoryId?: number | null
  active?: boolean
  price?: number
  salePrice?: number | null
}

/**
 * Create a product with its initial price (and optional sale price).
 * Product + price rows are written in one D1 batch (atomic).
 * Requires an elevated owner session.
 */
export default defineEventHandler(async (event) => {
  const db = useDb(event)
  const user = await requireElevated(event, db)

  const body = await readBody<ProductBody>(event)
  const slug = validateSlug(body?.slug)
  const title = validateText(body?.title, CATALOG_LIMITS.productTitle, 'Naziv proizvoda je obavezan.')
  const categoryId = validateOptionalId(body?.categoryId, 'Neispravna kategorija.')
  const active = body?.active === false ? 0 : 1
  const { price, salePrice } = validatePricePair(body ?? {})

  if (categoryId !== null) await requireCategoryExists(db, categoryId)

  // Price rows reference the new product by slug, so the whole create
  // is a single transaction - no orphan product without a price.
  const stmts = [
    db.prepare('INSERT INTO products (slug, title, category_id, active) VALUES (?, ?, ?, ?)')
      .bind(slug, title, categoryId, active),
    db.prepare(`INSERT INTO product_prices (product_id, amount, is_sale)
                SELECT id, ?, 0 FROM products WHERE slug = ?`)
      .bind(price, slug),
  ]
  if (salePrice !== null) {
    stmts.push(
      db.prepare(`INSERT INTO product_prices (product_id, amount, is_sale)
                  SELECT id, ?, 1 FROM products WHERE slug = ?`)
        .bind(salePrice, slug),
    )
  }

  try {
    const results = await db.batch(stmts)
    const id = results[0]?.meta.last_row_id as number
    console.log(`[admin/products] ${user.email} created #${id} "${slug}" @ ${salePrice ?? price} RSD`)
    return { ok: true, id }
  }
  catch (err) {
    if (isUniqueViolation(err)) {
      throw createError({ statusCode: 409, statusMessage: 'Proizvod sa tim slugom već postoji.' })
    }
    throw err
  }
})
