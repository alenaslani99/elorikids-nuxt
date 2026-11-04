import { createError, defineEventHandler, readFormData } from 'h3'
import { useDb } from '../../../../utils/db'
import { bumpCatalogVersion } from '../../../../utils/storefront'
import { requireElevated } from '../../../../utils/admin'
import { requireIdParam } from '../../../../utils/catalog'
import {
  buildMediaKey, deleteMedia, putMedia, toAdminImage, useMedia, validateAlt, validateUpload,
  type ProductImageRow,
} from '../../../../utils/media'
import { MEDIA_LIMITS } from '~~/shared/utils/media'

/**
 * Upload one gallery item (multipart/form-data):
 *   file    - required: JPG/PNG/WebP image or MP4 video
 *   poster  - optional, videos only: still image shown before playback
 *   alt     - optional description (accessibility + SEO)
 *
 * The file goes to R2 first, then the row is inserted; if the insert
 * fails the uploaded objects are removed again. Elevated owner only.
 */
export default defineEventHandler(async (event) => {
  const db = useDb(event)
  const user = await requireElevated(event, db)
  const id = requireIdParam(event)
  const bucket = useMedia(event)

  const product = await db
    .prepare(`SELECT p.slug,
                     (SELECT COUNT(*) FROM product_images WHERE product_id = p.id) AS image_count,
                     (SELECT COALESCE(MAX(sort_order), -1) FROM product_images WHERE product_id = p.id) AS max_sort
              FROM products p WHERE p.id = ?`)
    .bind(id)
    .first<{ slug: string, image_count: number, max_sort: number }>()
  if (!product) {
    throw createError({ statusCode: 404, statusMessage: 'Proizvod nije pronađen.' })
  }
  if (product.image_count >= MEDIA_LIMITS.perProduct) {
    throw createError({ statusCode: 400, statusMessage: `Najviše ${MEDIA_LIMITS.perProduct} fajlova po proizvodu.` })
  }

  let form: FormData
  try {
    form = await readFormData(event)
  }
  catch {
    throw createError({ statusCode: 400, statusMessage: 'Neispravan zahtev za otpremanje.' })
  }

  const file = form.get('file')
  if (!(file instanceof File)) {
    throw createError({ statusCode: 400, statusMessage: 'Izaberite fajl.' })
  }
  const type = await validateUpload(file, ['image', 'video'])
  const alt = validateAlt(form.get('alt'))

  const posterEntry = form.get('poster')
  const posterFile = posterEntry instanceof File && posterEntry.size > 0 ? posterEntry : null
  if (posterFile && type.kind !== 'video') {
    throw createError({ statusCode: 400, statusMessage: 'Naslovna slika (poster) se dodaje samo uz video.' })
  }
  const posterType = posterFile ? await validateUpload(posterFile, ['image']) : null

  const key = buildMediaKey(id, type.ext)
  const posterKey = posterType ? buildMediaKey(id, posterType.ext) : null

  await putMedia(bucket, key, file, type)
  try {
    if (posterFile && posterKey && posterType) await putMedia(bucket, posterKey, posterFile, posterType)

    const row = await db
      .prepare(`INSERT INTO product_images (product_id, kind, r2_key, poster_key, alt, content_type, size_bytes, sort_order)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?) RETURNING *`)
      .bind(id, type.kind, key, posterKey, alt, type.contentType, file.size, product.max_sort + 1)
      .first<ProductImageRow>()

    console.log(`[admin/media] ${user.email} uploaded ${type.kind} ${key} (${file.size} B) to "${product.slug}"`)
    await bumpCatalogVersion(db)
    return { ok: true, image: toAdminImage(row!) }
  }
  catch (err) {
    await deleteMedia(bucket, [key, posterKey])
    throw err
  }
})
