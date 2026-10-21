import { createError, defineEventHandler, readBody } from 'h3'
import { useDb } from '../../../utils/db'
import { requireElevated } from '../../../utils/admin'
import {
  getCurrentPrices, requireCategoryExists, requireIdParam, validateOptionalId, validatePricePair, validateText,
} from '../../../utils/catalog'
import { CATALOG_LIMITS } from '~~/shared/utils/catalog'

interface ProductBody {
  title?: string
  categoryId?: number | null
  active?: boolean
  price?: number
  salePrice?: number | null
}

/**
 * Update a product. The slug is immutable after creation (it is the
 * public key used in URLs, carts and order snapshots).
 *
 * Prices are append-only: a new product_prices row is added only when
 * the requested regular/sale price differs from what is in effect now,
 * so the history stays meaningful. Requires an elevated owner session.
 */
export default defineEventHandler(async (event) => {
  const db = useDb(event)
  const user = await requireElevated(event, db)
  const id = requireIdParam(event)

  const body = await readBody<ProductBody>(event)
  const title = validateText(body?.title, CATALOG_LIMITS.productTitle, 'Naziv proizvoda je obavezan.')
  const categoryId = validateOptionalId(body?.categoryId, 'Neispravna kategorija.')
  const active = body?.active === false ? 0 : 1
  const { price, salePrice } = validatePricePair(body ?? {})

  const product = await db.prepare('SELECT slug FROM products WHERE id = ?').bind(id).first<{ slug: string }>()
  if (!product) {
    throw createError({ statusCode: 404, statusMessage: 'Proizvod nije pronađen.' })
  }
  if (categoryId !== null) await requireCategoryExists(db, categoryId)

  const stmts = [
    db.prepare(`UPDATE products SET title = ?, category_id = ?, active = ?, updated_at = datetime('now')
                WHERE id = ?`)
      .bind(title, categoryId, active, id),
  ]

  // ── Append price rows only when something actually changed ────────
  const { current, regular } = await getCurrentPrices(db, id)
  const regularChanged = regular !== price
  if (regularChanged) {
    stmts.push(
      db.prepare('INSERT INTO product_prices (product_id, amount, is_sale) VALUES (?, ?, 0)').bind(id, price),
    )
  }
  if (salePrice !== null) {
    // A new regular row would supersede the sale, so re-append the sale after it
    if (regularChanged || !current?.isSale || current.amount !== salePrice) {
      stmts.push(
        db.prepare('INSERT INTO product_prices (product_id, amount, is_sale) VALUES (?, ?, 1)').bind(id, salePrice),
      )
    }
  }
  else if (!regularChanged && current?.isSale) {
    // Sale ended: put the regular price back on top
    stmts.push(
      db.prepare('INSERT INTO product_prices (product_id, amount, is_sale) VALUES (?, ?, 0)').bind(id, price),
    )
  }

  await db.batch(stmts)

  console.log(`[admin/products] ${user.email} updated #${id} "${product.slug}" @ ${salePrice ?? price} RSD (active=${active})`)
  return { ok: true }
})
