<script setup lang="ts">
import type { AdminStatsResponse, StatsRange, StatsTotals } from '~~/server/api/admin/stats.get'
import { getOrderStatusMeta, ORDER_STATUSES } from '~~/shared/utils/order-status'
import { MONTHS_SHORT } from '~~/shared/utils/format'

// Gate, header and nav live in the parent pages/admin.vue
useHead({ title: 'Statistika - Admin panel - elorikids' })

const { errorMessage } = useAdmin()

const EMPTY_TOTALS: StatsTotals = { revenue: 0, orders: 0, cancelled: 0, itemsSold: 0 }

const rangeOptions: { key: StatsRange, label: string }[] = [
  { key: '7d', label: '7 dana' },
  { key: '30d', label: '30 dana' },
  { key: '90d', label: '90 dana' },
  { key: '12m', label: '12 meseci' },
]
const range = ref<StatsRange>('30d')

const { data, status, error } = await useAsyncData<AdminStatsResponse>(
  'admin-stats',
  () => $fetch<AdminStatsResponse>('/api/admin/stats', { params: { range: range.value } }),
  { watch: [range] },
)

// A 403 (elevation expired) sends the parent back to the gate
const loadError = computed(() =>
  error.value ? errorMessage(error.value, 'Učitavanje statistike nije uspelo.') : '',
)

const current = computed(() => data.value?.current ?? EMPTY_TOTALS)
const previous = computed(() => data.value?.previous ?? EMPTY_TOTALS)
const series = computed(() => data.value?.series ?? [])
const isMonthly = computed(() => data.value?.granularity === 'month')
const hasOrders = computed(() => current.value.orders + current.value.cancelled > 0)

// ── Formatting ───────────────────────────────────────────────────
const num = (n: number) => Math.round(n).toLocaleString('sr-RS')
const rsd = (n: number) => `${num(n)} RSD`

/** '2026-11-13' → '13. nov', '2026-11' → 'nov 26' */
function bucketLabel(key: string, long = false): string {
  const [y, m, d] = key.split('-')
  const month = MONTHS_SHORT[Number(m) - 1]
  if (!d) return long ? `${month} ${y}` : `${month} ${y!.slice(2)}`
  return long ? `${Number(d)}. ${month} ${y}.` : `${Number(d)}. ${month}`
}

// ── KPI tiles ────────────────────────────────────────────────────
const avgOrder = (t: StatsTotals) => (t.orders > 0 ? t.revenue / t.orders : 0)

/** Percent change vs the comparison period; null when there is no baseline. */
function change(now: number, before: number): number | null {
  if (before <= 0) return null
  return Math.round(((now - before) / before) * 100)
}

const comparisonLabel = computed(() =>
  range.value === '12m' ? 'u odnosu na isti period lane' : 'u odnosu na prethodni period',
)

const tiles = computed(() => [
  {
    label: 'Prihod',
    icon: 'lucide:banknote',
    value: rsd(current.value.revenue),
    change: change(current.value.revenue, previous.value.revenue),
  },
  {
    label: 'Porudžbine',
    icon: 'lucide:package',
    value: num(current.value.orders),
    change: change(current.value.orders, previous.value.orders),
  },
  {
    label: 'Prosečna porudžbina',
    icon: 'lucide:receipt',
    value: rsd(avgOrder(current.value)),
    change: change(avgOrder(current.value), avgOrder(previous.value)),
  },
  {
    label: 'Prodato artikala',
    icon: 'lucide:layers',
    value: num(current.value.itemsSold),
    change: change(current.value.itemsSold, previous.value.itemsSold),
  },
])

// ── Chart (one measure at a time - never two y-scales) ───────────
const metric = ref<'revenue' | 'orders'>('revenue')
const hovered = ref<number | null>(null)
watch([range, metric], () => { hovered.value = null })

/** Round the axis top up to a 1/2/4/5 × 10ⁿ value. */
const axisMax = computed(() => {
  const max = Math.max(0, ...series.value.map(b => b[metric.value]))
  if (max <= 0) return metric.value === 'orders' ? 2 : 1000
  const pow = 10 ** Math.floor(Math.log10(max))
  let nice = [1, 2, 4, 5, 10].map(s => s * pow).find(v => v >= max)!
  // Keep the midpoint tick a whole number of orders
  if (metric.value === 'orders' && nice % 2 === 1) nice += 1
  return nice
})

function axisTick(value: number): string {
  if (metric.value === 'orders' || value < 1000) return num(value)
  return `${(value / 1000).toLocaleString('sr-RS', { maximumFractionDigits: 1 })}k`
}
const axisTicks = computed(() => [axisMax.value, axisMax.value / 2, 0].map(axisTick))

const barHeight = (value: number) => (value / axisMax.value) * 100

/** Label every Nth bucket, counted from the newest so "today" is always labeled. */
const labelStep = computed(() => (series.value.length <= 7 ? 1 : Math.ceil(series.value.length / 6)))
const xLabels = computed(() => {
  const n = series.value.length
  return series.value
    .map((b, i) => ({ key: b.key, i }))
    .filter(({ i }) => (n - 1 - i) % labelStep.value === 0)
    .map(({ key, i }) => ({
      key,
      text: bucketLabel(key),
      // Pin the newest label to the right edge so it never overflows
      style: i === n - 1 && n > 7
        ? { right: '0' }
        : { left: `${((i + 0.5) / n) * 100}%`, transform: 'translateX(-50%)' },
    }))
})

const tooltip = computed(() => {
  const i = hovered.value
  const bucket = i === null ? undefined : series.value[i]
  if (i === null || !bucket) return null
  const pos = (i + 0.5) / series.value.length
  return {
    bucket,
    style: {
      left: `${pos * 100}%`,
      bottom: `calc(${barHeight(bucket[metric.value])}% + 8px)`,
      // Flip the anchor near the edges so the box stays inside the plot
      transform: pos < 0.2 ? 'translateX(-12px)' : pos > 0.8 ? 'translateX(calc(-100% + 12px))' : 'translateX(-50%)',
    },
  }
})

// ── Breakdowns ───────────────────────────────────────────────────
const topProducts = computed(() => data.value?.topProducts ?? [])
const maxQuantity = computed(() => Math.max(1, ...topProducts.value.map(p => p.quantity)))

const statusRows = computed(() => {
  const counts = data.value?.statusCounts ?? {}
  const total = ORDER_STATUSES.reduce((sum, key) => sum + (counts[key] ?? 0), 0)
  return ORDER_STATUSES.map((key) => {
    const count = counts[key] ?? 0
    return {
      key,
      label: getOrderStatusMeta(key).label,
      dotClass: getOrderStatusMeta(key).dotClass,
      count,
      share: total > 0 ? Math.round((count / total) * 100) : 0,
    }
  })
})

const topCities = computed(() => data.value?.topCities ?? [])
</script>

<template>
  <div class="mx-auto max-w-7xl space-y-6 px-4 py-6 pb-16 sm:px-6 lg:px-8">
    <!-- Period filter -->
    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 class="font-unbounded text-base font-bold text-navy">
          Statistika prodaje
        </h2>
        <p class="mt-1 text-xs text-navy/50">
          Otkazane porudžbine se ne računaju u prihod i prodaju.
        </p>
      </div>
      <div class="flex flex-wrap gap-2" role="group" aria-label="Period">
        <button
          v-for="option in rangeOptions"
          :key="option.key"
          type="button"
          class="rounded-full px-3 py-1.5 text-sm font-semibold transition-colors"
          :class="range === option.key
            ? 'bg-navy text-white'
            : 'bg-white text-navy/60 hover:text-navy'"
          :aria-pressed="range === option.key"
          @click="range = option.key"
        >
          {{ option.label }}
        </button>
      </div>
    </div>

    <div
      v-if="loadError"
      class="flex items-start gap-2 rounded-xl bg-coral/10 p-3 text-sm text-coral-dark"
      role="alert"
    >
      <Icon name="lucide:alert-circle" class="mt-0.5 size-4 shrink-0" />
      <span>{{ loadError }}</span>
    </div>

    <div
      class="space-y-6 transition-opacity duration-200"
      :class="status === 'pending' ? 'opacity-50' : 'opacity-100'"
    >
      <!-- KPI tiles -->
      <section class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div
          v-for="tile in tiles"
          :key="tile.label"
          class="rounded-2xl border-2 border-cloud/40 bg-white p-5 shadow-sm"
        >
          <div class="flex items-center gap-2 text-xs font-semibold text-navy/50">
            <Icon :name="tile.icon" class="size-4" />
            {{ tile.label }}
          </div>
          <p class="mt-3 font-unbounded text-xl font-extrabold text-navy xl:text-2xl">
            {{ tile.value }}
          </p>
          <p class="mt-2 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs text-navy/50">
            <span
              v-if="tile.change !== null"
              class="inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-semibold"
              :class="tile.change > 0
                ? 'bg-mint/25 text-mint-dark'
                : tile.change < 0 ? 'bg-coral/15 text-coral-dark' : 'bg-cloud/40 text-navy/70'"
            >
              <Icon
                :name="tile.change > 0 ? 'lucide:trending-up' : tile.change < 0 ? 'lucide:trending-down' : 'lucide:minus'"
                class="size-3.5"
              />
              {{ tile.change > 0 ? '+' : '' }}{{ tile.change }}%
            </span>
            <span>{{ tile.change !== null ? comparisonLabel : 'Nema podataka za poređenje' }}</span>
          </p>
        </div>
      </section>

      <!-- Sales over time -->
      <section class="rounded-2xl border-2 border-cloud/40 bg-white p-5 shadow-sm">
        <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h3 class="font-unbounded text-sm font-bold text-navy">
            {{ metric === 'revenue' ? 'Prihod' : 'Porudžbine' }} {{ isMonthly ? 'po mesecima' : 'po danima' }}
          </h3>
          <div class="flex gap-2" role="group" aria-label="Prikaz">
            <button
              v-for="option in ([{ key: 'revenue', label: 'Prihod' }, { key: 'orders', label: 'Porudžbine' }] as const)"
              :key="option.key"
              type="button"
              class="rounded-full px-3 py-1 text-xs font-semibold transition-colors"
              :class="metric === option.key
                ? 'bg-navy text-white'
                : 'bg-cream text-navy/60 hover:text-navy'"
              :aria-pressed="metric === option.key"
              @click="metric = option.key"
            >
              {{ option.label }}
            </button>
          </div>
        </div>

        <div class="mt-6 flex gap-3" aria-hidden="true">
          <!-- Y axis -->
          <div class="flex h-56 w-10 shrink-0 flex-col justify-between text-right text-[10px] leading-none text-navy/40">
            <span v-for="(tick, i) in axisTicks" :key="i" :class="i === 0 ? '-mt-1' : i === 2 ? '-mb-1' : ''">{{ tick }}</span>
          </div>

          <div class="min-w-0 flex-1">
            <!-- Plot -->
            <div class="relative h-56" @mouseleave="hovered = null">
              <div class="pointer-events-none absolute inset-0 flex flex-col justify-between">
                <div class="border-t border-dashed border-cloud/60" />
                <div class="border-t border-dashed border-cloud/60" />
                <div class="border-t border-cloud" />
              </div>

              <!-- Each column is a full-height hit target; the bar sits on the baseline -->
              <div class="absolute inset-0 flex items-end">
                <div
                  v-for="(bucket, i) in series"
                  :key="bucket.key"
                  class="flex h-full flex-1 items-end justify-center"
                  :class="series.length > 31 ? 'px-px' : 'px-0.5 sm:px-1'"
                  @mouseenter="hovered = i"
                >
                  <div
                    class="w-full max-w-10 rounded-t transition-colors"
                    :class="hovered === i ? 'bg-navy' : 'bg-blue'"
                    :style="{
                      height: `${barHeight(bucket[metric])}%`,
                      minHeight: bucket[metric] > 0 ? '2px' : '0',
                    }"
                  />
                </div>
              </div>

              <!-- Tooltip -->
              <div
                v-if="tooltip"
                class="pointer-events-none absolute z-10 whitespace-nowrap rounded-xl bg-navy px-3 py-2 text-xs text-white shadow-lg"
                :style="tooltip.style"
              >
                <p class="font-semibold">
                  {{ bucketLabel(tooltip.bucket.key, true) }}
                </p>
                <p class="mt-1 text-white/80">
                  {{ rsd(tooltip.bucket.revenue) }} · {{ num(tooltip.bucket.orders) }} por.
                </p>
              </div>
            </div>

            <!-- X axis -->
            <div class="relative mt-2 h-4 text-[10px] leading-none text-navy/40">
              <span
                v-for="label in xLabels"
                :key="label.key"
                class="absolute whitespace-nowrap"
                :style="label.style"
              >{{ label.text }}</span>
            </div>
          </div>
        </div>

        <!-- Table view of the chart for screen readers -->
        <table class="sr-only">
          <caption>Prihod i porudžbine {{ isMonthly ? 'po mesecima' : 'po danima' }}</caption>
          <thead>
            <tr>
              <th scope="col">
                Period
              </th>
              <th scope="col">
                Prihod
              </th>
              <th scope="col">
                Porudžbine
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="bucket in series" :key="bucket.key">
              <th scope="row">
                {{ bucketLabel(bucket.key, true) }}
              </th>
              <td>{{ rsd(bucket.revenue) }}</td>
              <td>{{ bucket.orders }}</td>
            </tr>
          </tbody>
        </table>
      </section>

      <div class="grid gap-6 lg:grid-cols-[1fr_380px]">
        <!-- Top products -->
        <section class="rounded-2xl border-2 border-cloud/40 bg-white p-5 shadow-sm">
          <h3 class="font-unbounded text-sm font-bold text-navy">
            Najprodavaniji proizvodi
          </h3>

          <div v-if="topProducts.length === 0" class="py-10 text-center">
            <Icon name="lucide:package-x" class="mx-auto mb-3 size-8 text-navy/30" />
            <p class="text-sm text-navy/60">
              Nema prodaje u ovom periodu.
            </p>
          </div>

          <ol v-else class="mt-4 space-y-4">
            <li
              v-for="(product, i) in topProducts"
              :key="product.slug"
              class="flex items-center gap-3"
            >
              <span class="w-5 shrink-0 text-center text-xs font-bold text-navy/40">{{ i + 1 }}</span>
              <div class="relative size-11 shrink-0 overflow-hidden rounded-xl bg-cream">
                <NuxtImg
                  v-if="product.coverKey"
                  provider="media"
                  :src="product.coverKey"
                  alt=""
                  width="44"
                  height="44"
                  fit="cover"
                  format="webp"
                  class="size-full object-cover"
                />
                <Icon v-else name="lucide:image-off" class="absolute inset-0 m-auto size-5 text-navy/30" />
              </div>
              <div class="min-w-0 flex-1">
                <div class="flex items-baseline justify-between gap-3">
                  <p class="truncate text-sm font-semibold text-navy">
                    {{ product.title }}
                  </p>
                  <p class="shrink-0 text-sm font-bold text-navy">
                    {{ num(product.quantity) }} kom
                  </p>
                </div>
                <div class="mt-1.5 h-2 overflow-hidden rounded-full bg-cream">
                  <div
                    class="h-full rounded-full bg-blue"
                    :style="{ width: `${(product.quantity / maxQuantity) * 100}%` }"
                  />
                </div>
                <p class="mt-1.5 text-xs text-navy/50">
                  {{ rsd(product.revenue) }} · {{ num(product.orders) }} porudžbina
                </p>
              </div>
            </li>
          </ol>
        </section>

        <div class="space-y-6">
          <!-- Status breakdown -->
          <section class="rounded-2xl border-2 border-cloud/40 bg-white p-5 shadow-sm">
            <h3 class="font-unbounded text-sm font-bold text-navy">
              Status porudžbina
            </h3>
            <p v-if="!hasOrders" class="mt-4 text-sm text-navy/60">
              Nema porudžbina u ovom periodu.
            </p>
            <ul v-else class="mt-4 space-y-3">
              <li v-for="row in statusRows" :key="row.key">
                <div class="flex items-center justify-between gap-3 text-sm">
                  <span class="flex min-w-0 items-center gap-2 text-navy/70">
                    <span class="size-2 shrink-0 rounded-full" :class="row.dotClass" />
                    <span class="truncate">{{ row.label }}</span>
                  </span>
                  <span class="shrink-0 font-bold text-navy">
                    {{ row.count }} <span class="font-normal text-navy/40">· {{ row.share }}%</span>
                  </span>
                </div>
                <div class="mt-1.5 h-1.5 overflow-hidden rounded-full bg-cream">
                  <div class="h-full rounded-full bg-navy/60" :style="{ width: `${row.share}%` }" />
                </div>
              </li>
            </ul>
          </section>

          <!-- Top cities -->
          <section class="rounded-2xl border-2 border-cloud/40 bg-white p-5 shadow-sm">
            <h3 class="font-unbounded text-sm font-bold text-navy">
              Gradovi
            </h3>
            <p v-if="topCities.length === 0" class="mt-4 text-sm text-navy/60">
              Nema porudžbina u ovom periodu.
            </p>
            <ul v-else class="mt-4 space-y-3">
              <li
                v-for="city in topCities"
                :key="city.city"
                class="flex items-center justify-between gap-3 text-sm"
              >
                <span class="flex min-w-0 items-center gap-2 text-navy/70">
                  <Icon name="lucide:map-pin" class="size-4 shrink-0 text-navy/40" />
                  <span class="truncate">{{ city.city }}</span>
                </span>
                <span class="shrink-0 text-right">
                  <span class="font-bold text-navy">{{ num(city.orders) }} por.</span>
                  <span class="text-navy/40"> · {{ rsd(city.revenue) }}</span>
                </span>
              </li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  </div>
</template>
