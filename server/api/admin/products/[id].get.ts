import { createError, defineEventHandler } from 'h3'
import { useDb } from '../../../utils/db'
import { requireElevated } from '../../../utils/admin'
import { getProductContent, requireIdParam } from '../../../utils/catalog'
import type { ProductContent } from '~~/shared/utils/catalog'

/** Page content of one product, for the admin edit form. Elevated owner only. */
export default defineEventHandler(async (event): Promise<{ content: ProductContent }> => {
  const db = useDb(event)
  await requireElevated(event, db)
  const id = requireIdParam(event)

  const content = await getProductContent(db, id)
  if (!content) {
    throw createError({ statusCode: 404, statusMessage: 'Proizvod nije pronađen.' })
  }
  return { content }
})
