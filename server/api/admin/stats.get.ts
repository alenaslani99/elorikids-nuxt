import { defineEventHandler, getQuery } from 'h3'
import { useDb } from '../../utils/db'
import { requireElevated } from '../../utils/admin'

export type StatsRange = '7d' | '30d' | '90d' | '12m'

export interface StatsTotals {
  /** Sum of grand_total over non-cancelled orders (RSD). */
  revenue: number
  /** Non-cancelled orders. */
  orders: number
  /** Cancelled orders (not counted in revenue/orders). */
  cancelled: number
  /** Units sold in non-cancelled orders. */
  itemsSold: number
  /** Sum of (price - unit_cost) × quantity over lines with a known cost. */
  profit: number
  /** Sales value of those same lines - the base for the margin. */
  costedRevenue: number
  /** Units sold without a recorded cost (left out of profit). */
  itemsWithoutCost: number
}

export interface StatsBucket {
  /** 'YYYY-MM-DD' (day) or 'YYYY-MM' (month), shop-local time. */
  key: string
  revenue: number
  orders: number
  profit: number
}

export interface StatsTopProduct {
  slug: string
  title: string
  coverKey: string | null
  quantity: number
  revenue: number
  orders: number
  /** null when none of its sold units have a recorded cost. */
  profit: number | null
}

export interface StatsCity {
  city: string
  orders: number
  revenue: number
}

export interface AdminStatsResponse {
  range: StatsRange
  granularity: 'day' | 'month'
  current: StatsTotals
  /** Same-length period right before (12m: same months a year earlier). */
  previous: StatsTotals
  series: StatsBucket[]
  topProducts: StatsTopProduct[]
  statusCounts: Record<string, number>
  topCities: StatsCity[]
}

const DAY_RANGES: Record<string, number> = { '7d': 7, '30d': 30, '90d': 90 }

// Days/months are bucketed in shop-local time, not UTC - otherwise an
// order placed at 00:30 would land on the previous day.
const SHOP_TZ = 'Europe/Belgrade'
const partsFormat = new Intl.DateTimeFormat('en-CA', {
  timeZone: SHOP_TZ,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  hourCycle: 'h23',
})

function shopParts(date: Date) {
  const p: Record<string, string> = {}
  for (const part of partsFormat.formatToParts(date)) p[part.type] = part.value
  return { y: Number(p.year), m: Number(p.month), d: Number(p.day), h: Number(p.hour) }
}

/**
 * UTC instant of shop-local midnight for a calendar date (month is
 * 1-based; out-of-range day/month values roll over like Date.UTC).
 * At 00:00 UTC the shop clock reads 01:00 or 02:00 of that same date and
 * DST only switches at 01:00 UTC, so stepping back by the local hour
 * lands exactly on local midnight.
 */
function shopMidnightUtc(y: number, m: number, d: number): Date {
  const utcMidnight = new Date(Date.UTC(y, m - 1, d))
  return new Date(utcMidnight.getTime() - shopParts(utcMidnight).h * 3_600_000)
}

/** D1 stores datetime('now') as 'YYYY-MM-DD HH:MM:SS' in UTC. */
function toSql(date: Date): string {
  return date.toISOString().slice(0, 19).replace('T', ' ')
}

const pad = (n: number) => String(n).padStart(2, '0')

interface TotalsRow { orders: number, revenue: number | null, cancelled: number | null }
interface ItemsRow { items: number, profit: number, costed_revenue: number, items_without_cost: number }

/** Profit of the lines that have a cost snapshot; NULL when none do. */
const PROFIT_SUM = 'SUM(CASE WHEN oi.unit_cost IS NOT NULL THEN (oi.price - oi.unit_cost) * oi.quantity END)'

/**
 * Sales statistics for the admin dashboard.
 * Revenue and order counts exclude cancelled orders. Profit is selling
 * price minus the purchase cost frozen on each order line; lines without
 * a cost are reported separately instead of counting as pure profit.
 * Requires an elevated owner session.
 *
 * Query params: range = 7d | 30d | 90d | 12m (default 30d)
 */
export default defineEventHandler(async (event): Promise<AdminStatsResponse> => {
  const db = useDb(event)
  await requireElevated(event, db)

  const rawRange = String(getQuery(event).range ?? '')
  const range: StatsRange = rawRange in DAY_RANGES || rawRange === '12m' ? rawRange as StatsRange : '30d'
  const granularity = range === '12m' ? 'month' : 'day'

  // ── Period bounds (shop-local calendar, converted to UTC) ────────
  const today = shopParts(new Date())
  const bucketKeys: string[] = []
  let start: Date, end: Date, prevStart: Date, prevEnd: Date

  if (range === '12m') {
    // Current month + the 11 before it, compared with the same span a year earlier
    start = shopMidnightUtc(today.y, today.m - 11, 1)
    end = shopMidnightUtc(today.y, today.m, today.d + 1)
    prevStart = shopMidnightUtc(today.y - 1, today.m - 11, 1)
    prevEnd = shopMidnightUtc(today.y - 1, today.m, today.d + 1)
    for (let i = 11; i >= 0; i--) {
      bucketKeys.push(new Date(Date.UTC(today.y, today.m - 1 - i, 1)).toISOString().slice(0, 7))
    }
  }
  else {
    const days = DAY_RANGES[range]!
    start = shopMidnightUtc(today.y, today.m, today.d - (days - 1))
    end = shopMidnightUtc(today.y, today.m, today.d + 1)
    prevStart = shopMidnightUtc(today.y, today.m, today.d - (2 * days - 1))
    prevEnd = start
    for (let i = days - 1; i >= 0; i--) {
      bucketKeys.push(new Date(Date.UTC(today.y, today.m - 1, today.d - i)).toISOString().slice(0, 10))
    }
  }

  const cur = [toSql(start), toSql(end)] as const
  const prev = [toSql(prevStart), toSql(prevEnd)] as const

  const totalsSql = `
    SELECT SUM(status != 'cancelled') AS orders,
           SUM(CASE WHEN status != 'cancelled' THEN grand_total ELSE 0 END) AS revenue,
           SUM(status = 'cancelled') AS cancelled
    FROM orders WHERE created_at >= ? AND created_at < ?`
  const itemsSql = `
    SELECT COALESCE(SUM(oi.quantity), 0) AS items,
           COALESCE(${PROFIT_SUM}, 0) AS profit,
           COALESCE(SUM(CASE WHEN oi.unit_cost IS NOT NULL THEN oi.price * oi.quantity END), 0) AS costed_revenue,
           COALESCE(SUM(CASE WHEN oi.unit_cost IS NULL THEN oi.quantity END), 0) AS items_without_cost
    FROM order_items oi JOIN orders o ON o.id = oi.order_id
    WHERE o.created_at >= ? AND o.created_at < ? AND o.status != 'cancelled'`

  // One round trip to D1 for the whole dashboard
  const [curTotals, prevTotals, curItems, prevItems, hourly, hourlyProfit, products, statuses, cities] = await db.batch<any>([
    db.prepare(totalsSql).bind(...cur),
    db.prepare(totalsSql).bind(...prev),
    db.prepare(itemsSql).bind(...cur),
    db.prepare(itemsSql).bind(...prev),
    // Grouped by UTC hour; re-bucketed into shop-local days/months below
    db.prepare(
      `SELECT strftime('%Y-%m-%d %H', created_at) AS hour, COUNT(*) AS orders, SUM(grand_total) AS revenue
       FROM orders
       WHERE created_at >= ? AND created_at < ? AND status != 'cancelled'
       GROUP BY hour`,
    ).bind(...cur),
    db.prepare(
      `SELECT strftime('%Y-%m-%d %H', o.created_at) AS hour, COALESCE(${PROFIT_SUM}, 0) AS profit
       FROM order_items oi JOIN orders o ON o.id = oi.order_id
       WHERE o.created_at >= ? AND o.created_at < ? AND o.status != 'cancelled'
       GROUP BY hour`,
    ).bind(...cur),
    // Grouped by product when still linked, by slug snapshot otherwise
    db.prepare(
      `SELECT COALESCE(p.slug, MAX(oi.slug)) AS slug,
              COALESCE(p.title, MAX(oi.title)) AS title,
              (SELECT r2_key FROM product_images
               WHERE product_id = p.id AND kind = 'image'
               ORDER BY sort_order, id LIMIT 1) AS cover_key,
              SUM(oi.quantity) AS quantity,
              SUM(oi.price * oi.quantity) AS revenue,
              ${PROFIT_SUM} AS profit,
              COUNT(DISTINCT oi.order_id) AS orders
       FROM order_items oi
       JOIN orders o ON o.id = oi.order_id
       LEFT JOIN products p ON p.id = oi.product_id
       WHERE o.created_at >= ? AND o.created_at < ? AND o.status != 'cancelled'
       GROUP BY COALESCE('p' || oi.product_id, 's' || oi.slug)
       ORDER BY quantity DESC, revenue DESC
       LIMIT 10`,
    ).bind(...cur),
    db.prepare(
      'SELECT status, COUNT(*) AS count FROM orders WHERE created_at >= ? AND created_at < ? GROUP BY status',
    ).bind(...cur),
    db.prepare(
      `SELECT MAX(TRIM(city)) AS city, COUNT(*) AS orders, SUM(grand_total) AS revenue
       FROM orders
       WHERE created_at >= ? AND created_at < ? AND status != 'cancelled'
       GROUP BY LOWER(TRIM(city))
       ORDER BY orders DESC, revenue DESC
       LIMIT 5`,
    ).bind(...cur),
  ])

  const totals = (row: TotalsRow | undefined, items: ItemsRow | undefined): StatsTotals => ({
    revenue: row?.revenue ?? 0,
    orders: row?.orders ?? 0,
    cancelled: row?.cancelled ?? 0,
    itemsSold: items?.items ?? 0,
    profit: items?.profit ?? 0,
    costedRevenue: items?.costed_revenue ?? 0,
    itemsWithoutCost: items?.items_without_cost ?? 0,
  })

  // ── Series: zero-filled buckets so quiet days still show up ──────
  const buckets = new Map<string, StatsBucket>(
    bucketKeys.map(key => [key, { key, revenue: 0, orders: 0, profit: 0 }]),
  )
  /** Shop-local bucket for a UTC 'YYYY-MM-DD HH' hour. */
  const bucketFor = (hour: string) => {
    const local = shopParts(new Date(`${hour.replace(' ', 'T')}:00:00Z`))
    return buckets.get(granularity === 'month'
      ? `${local.y}-${pad(local.m)}`
      : `${local.y}-${pad(local.m)}-${pad(local.d)}`)
  }
  for (const row of (hourly!.results ?? []) as { hour: string, orders: number, revenue: number }[]) {
    const bucket = bucketFor(row.hour)
    if (!bucket) continue
    bucket.revenue += row.revenue
    bucket.orders += row.orders
  }
  for (const row of (hourlyProfit!.results ?? []) as { hour: string, profit: number }[]) {
    const bucket = bucketFor(row.hour)
    if (bucket) bucket.profit += row.profit
  }

  const statusCounts: Record<string, number> = {
    received: 0, preparing: 0, in_transit: 0, delivered: 0, cancelled: 0,
  }
  for (const row of (statuses!.results ?? []) as { status: string, count: number }[]) {
    if (row.status in statusCounts) statusCounts[row.status] = row.count
  }

  return {
    range,
    granularity,
    current: totals(curTotals!.results?.[0], curItems!.results?.[0]),
    previous: totals(prevTotals!.results?.[0], prevItems!.results?.[0]),
    series: [...buckets.values()],
    topProducts: ((products!.results ?? []) as any[]).map(row => ({
      slug: row.slug,
      title: row.title,
      coverKey: row.cover_key,
      quantity: row.quantity,
      revenue: row.revenue,
      profit: row.profit,
      orders: row.orders,
    })),
    statusCounts,
    topCities: ((cities!.results ?? []) as StatsCity[]).map(row => ({
      city: row.city,
      orders: row.orders,
      revenue: row.revenue,
    })),
  }
})
