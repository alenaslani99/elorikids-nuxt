<script setup lang="ts">
import type { AdminOrder, AdminOrdersResponse } from '~~/server/api/admin/orders.get'

useHead({
  title: 'Admin panel - elorikids',
  meta: [
    { name: 'description', content: 'Admin panel - pregled i upravljanje porudžbinama.' },
    { name: 'robots', content: 'noindex, nofollow' },
  ],
})

interface AdminStatus {
  isOwner: boolean
  securitySet: boolean
  question: string | null
  elevated: boolean
}

const { user, logout } = useAuth()
const router = useRouter()

// ── Data fetched via useAsyncData (client-side, /admin is SPA-only) ──
const { data: adminStatus, refresh: refreshStatus } = await useAsyncData<AdminStatus>(
  'admin-status',
  () => $fetch<AdminStatus>('/api/admin/me'),
)

// Session expired or not owner → 404 (middleware is the primary guard)
if (!adminStatus.value) {
  throw createError({ statusCode: 404, statusMessage: 'Not Found', fatal: true })
}

// ── Pagination + filtering state ──────────────────────────────────
const currentPage = ref(1)
const pageSize = 10
const statusFilter = ref<string>('all')
const searchQuery = ref('')
const searchInput = ref('')

// Debounced search: update searchQuery 400ms after the user stops typing
let searchTimer: ReturnType<typeof setTimeout> | null = null
watch(searchInput, (val) => {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    if (searchQuery.value !== val.trim()) {
      searchQuery.value = val.trim()
      currentPage.value = 1
    }
  }, 400)
})

const { data: ordersData, refresh: refreshOrders } = await useAsyncData<AdminOrdersResponse>(
  'admin-orders',
  async () => adminStatus.value?.elevated
    ? await $fetch<AdminOrdersResponse>('/api/admin/orders', {
        params: {
          page: currentPage.value,
          limit: pageSize,
          status: statusFilter.value,
          search: searchQuery.value || undefined,
        },
      })
    : { orders: [], total: 0, statusCounts: { received: 0, preparing: 0, in_transit: 0, delivered: 0, cancelled: 0 } },
  {
    watch: [currentPage, statusFilter, searchQuery],
    default: () => ({ orders: [], total: 0, statusCounts: { received: 0, preparing: 0, in_transit: 0, delivered: 0, cancelled: 0 } }),
  },
)

// Non-null after the 404 guard above — safe to access in template
const status = computed(() => adminStatus.value!)

// Derived data from the paginated response
const orders = computed(() => ordersData.value?.orders ?? [])
const totalCount = computed(() => ordersData.value?.total ?? 0)
const serverStatusCounts = computed(() => ordersData.value?.statusCounts ?? {
  received: 0, preparing: 0, in_transit: 0, delivered: 0, cancelled: 0,
})

const totalPages = computed(() => Math.max(1, Math.ceil(totalCount.value / pageSize)))

const allCount = computed(() => {
  const c = serverStatusCounts.value
  return (c.received ?? 0) + (c.preparing ?? 0) + (c.in_transit ?? 0) + (c.delivered ?? 0) + (c.cancelled ?? 0)
})

// Reset to page 1 when filter changes
watch(statusFilter, () => { currentPage.value = 1 })

// Pagination controls
function goToPage(page: number) {
  if (page < 1 || page > totalPages.value || page === currentPage.value) return
  currentPage.value = page
  if (import.meta.client) window.scrollTo({ top: 0, behavior: 'smooth' })
}

// Pages to show in the pagination control (window of 5 around current)
const visiblePages = computed(() => {
  const pages: number[] = []
  const start = Math.max(1, currentPage.value - 2)
  const end = Math.min(totalPages.value, start + 4)
  for (let i = Math.max(1, end - 4); i <= end; i++) pages.push(i)
  return pages
})

import { getOrderStatusMeta, ORDER_STATUSES } from '~~/shared/utils/order-status'
import { formatDateShort as formatDate, formatDateTimeShort as formatDateTime } from '~~/shared/utils/format'

// ── Status update ────────────────────────────────────────────────
const updatingOrderId = ref<string | null>(null)

async function updateStatus(order: AdminOrder, newStatus: string) {
  updatingOrderId.value = order.id
  try {
    await $fetch(`/api/admin/orders/${order.id}`, {
      method: 'PATCH',
      body: { status: newStatus },
    })
    // Re-fetch to get updated counts + page in sync
    await refreshOrders()
  }
  catch (e: any) {
    // Revert is implicit — refresh didn't happen on failure
  }
  finally {
    updatingOrderId.value = null
  }
}

// ── Lock panel ───────────────────────────────────────────────────
async function lockPanel() {
  try {
    await $fetch('/api/admin/lock', { method: 'POST' })
  }
  catch {
    // ignore
  }
  adminStatus.value = { ...adminStatus.value!, elevated: false }
  ordersData.value = { orders: [], total: 0, statusCounts: { received: 0, preparing: 0, in_transit: 0, delivered: 0, cancelled: 0 } }
}

async function handleLogout() {
  await lockPanel()
  await logout()
  router.push('/')
}

// Re-fetch status + orders after gate is passed (setup or verify done)
async function onGateDone() {
  await refreshStatus()
  await refreshOrders()
}

// Filter tabs — counts come from the server (all orders, not just current page)
const filterTabs = computed(() => [
  { key: 'all', label: 'Sve', count: allCount.value },
  { key: 'received', label: 'Primljene', count: serverStatusCounts.value.received },
  { key: 'preparing', label: 'U pripremi', count: serverStatusCounts.value.preparing },
  { key: 'in_transit', label: 'U transportu', count: serverStatusCounts.value.in_transit },
  { key: 'delivered', label: 'Isporučene', count: serverStatusCounts.value.delivered },
  { key: 'cancelled', label: 'Otkazane', count: serverStatusCounts.value.cancelled },
])
</script>

<template>
  <div class="min-h-screen bg-cream">
    <!-- Gate: security question not set up yet -->
    <AdminGate
      v-if="!status.securitySet"
      mode="setup"
      @done="onGateDone"
    />

    <!-- Gate: needs elevation -->
    <AdminGate
      v-else-if="!status.elevated"
      mode="verify"
      :question="status.question ?? undefined"
      @done="onGateDone"
    />

    <!-- Admin panel -->
    <div v-else>
      <!-- Header bar -->
      <header class="border-b-2 border-cloud/40 bg-white">
        <div class="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div class="flex items-center gap-3">
            <div class="flex size-10 items-center justify-center rounded-xl bg-navy text-white">
              <Icon name="lucide:shield-check" class="size-5" />
            </div>
            <div>
              <h1 class="font-unbounded text-lg font-bold text-navy">
                Admin panel
              </h1>
              <p class="text-xs text-navy/50">
                Prijavljeni kao {{ user?.email }}
              </p>
            </div>
          </div>

          <div class="flex items-center gap-2">
            <button
              type="button"
              class="inline-flex items-center gap-2 rounded-full border-2 border-cloud px-4 py-2 text-sm font-semibold text-navy/70 transition-colors hover:border-coral hover:text-coral"
              @click="lockPanel"
            >
              <Icon name="lucide:lock" class="size-4" />
              Zaključaj
            </button>
            <button
              type="button"
              class="inline-flex items-center gap-2 rounded-full border-2 border-cloud px-4 py-2 text-sm font-semibold text-navy/70 transition-colors hover:border-coral hover:text-coral"
              @click="handleLogout"
            >
              <Icon name="lucide:log-out" class="size-4" />
              Odjava
            </button>
          </div>
        </div>
      </header>

      <!-- Stats row -->
      <section class="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <div
            v-for="tab in filterTabs"
            :key="tab.key"
            class="rounded-2xl border-2 border-cloud/40 bg-white p-4 text-center shadow-sm"
          >
            <p class="font-unbounded text-2xl font-extrabold text-navy">
              {{ tab.count }}
            </p>
            <p class="text-xs text-navy/50">
              {{ tab.label }}
            </p>
          </div>
        </div>
      </section>

      <!-- Controls bar -->
      <section class="mx-auto max-w-7xl px-4 pb-4 sm:px-6 lg:px-8">
        <div class="flex flex-col gap-3 rounded-2xl border-2 border-cloud/40 bg-white p-4 shadow-sm sm:flex-row sm:items-center">
          <!-- Search -->
          <div class="relative flex-1">
            <Icon name="lucide:search" class="absolute left-3 top-1/2 size-5 -translate-y-1/2 text-navy/40" />
            <input
              v-model="searchInput"
              type="text"
              placeholder="Pretraga po broju, imenu, emailu, telefonu, gradu..."
              class="w-full rounded-xl border-2 border-cloud/50 bg-cream py-2.5 pl-11 pr-4 text-navy placeholder:text-navy/40 focus:border-blue focus:outline-none focus:ring-2 focus:ring-blue/20"
            >
          </div>

          <!-- Status filter -->
          <div class="flex flex-wrap gap-2">
            <button
              v-for="tab in filterTabs"
              :key="tab.key"
              type="button"
              class="rounded-full px-3 py-1.5 text-sm font-semibold transition-colors"
              :class="statusFilter === tab.key
                ? 'bg-navy text-white'
                : 'bg-cream text-navy/60 hover:text-navy'"
              @click="statusFilter = tab.key"
            >
              {{ tab.label }}
              <span class="ml-1 opacity-60">{{ tab.count }}</span>
            </button>
          </div>
        </div>
      </section>

      <!-- Orders list -->
      <section class="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <!-- Empty -->
        <div v-if="orders.length === 0" class="rounded-2xl border border-dashed border-cloud/60 bg-white p-12 text-center">
          <Icon name="lucide:package-x" class="mx-auto mb-3 size-8 text-navy/30" />
          <p class="text-navy/60">
            {{ totalCount === 0 ? 'Nema porudžbina još.' : 'Nema porudžbina koje odgovaraju filteru.' }}
          </p>
        </div>

        <!-- Orders table -->
        <div v-else class="space-y-3">
          <div
            v-for="order in orders"
            :key="order.id"
            class="rounded-2xl border-2 border-cloud/40 bg-white p-5 shadow-sm transition-colors hover:border-blue/40"
          >
            <div class="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <!-- Left: order info -->
              <div class="flex-1">
                <div class="flex flex-wrap items-center gap-3">
                  <span class="font-unbounded font-bold text-navy">{{ order.id }}</span>
                  <span
                    class="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold"
                    :class="getOrderStatusMeta(order.status).badgeClass"
                  >
                    <span class="size-1.5 rounded-full" :class="getOrderStatusMeta(order.status).dotClass" />
                    {{ getOrderStatusMeta(order.status).label }}
                  </span>
                  <span class="text-sm text-navy/40">{{ formatDateTime(order.createdAt) }}</span>
                </div>

                <div class="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                  <p class="flex items-center gap-2 text-navy/70">
                    <Icon name="lucide:user" class="size-4 shrink-0 text-navy/40" />
                    {{ order.customerName }}
                  </p>
                  <p class="flex items-center gap-2 text-navy/70">
                    <Icon name="lucide:mail" class="size-4 shrink-0 text-navy/40" />
                    {{ order.email }}
                  </p>
                  <p class="flex items-center gap-2 text-navy/70">
                    <Icon name="lucide:phone" class="size-4 shrink-0 text-navy/40" />
                    {{ order.phone }}
                  </p>
                  <p class="flex items-center gap-2 text-navy/70">
                    <Icon name="lucide:map-pin" class="size-4 shrink-0 text-navy/40" />
                    {{ order.address }}, {{ order.postal }} {{ order.city }}
                  </p>
                </div>

                <!-- Items -->
                <div class="mt-3 rounded-xl bg-cream p-3">
                  <ul class="space-y-1">
                    <li
                      v-for="item in order.items"
                      :key="item.slug"
                      class="flex items-center justify-between text-sm"
                    >
                      <span class="text-navy/70">{{ item.title }} <span class="text-navy/40">× {{ item.quantity }}</span></span>
                      <span class="font-medium text-navy">{{ (item.price * item.quantity).toLocaleString('sr-RS') }} RSD</span>
                    </li>
                  </ul>
                  <div class="mt-2 flex items-center justify-between border-t border-cloud/40 pt-2 text-sm">
                    <span class="text-navy/50">
                      Dostava: {{ order.shipping === 0 ? 'Besplatno' : `${order.shipping.toLocaleString('sr-RS')} RSD` }}
                    </span>
                    <span class="font-bold text-navy">
                      {{ order.grandTotal.toLocaleString('sr-RS') }} RSD
                    </span>
                  </div>
                </div>

                <!-- Note -->
                <div v-if="order.note" class="mt-2 rounded-lg bg-yellow/10 p-3 text-sm text-navy/70">
                  <p class="flex items-start gap-2">
                    <Icon name="lucide:sticky-note" class="mt-0.5 size-4 shrink-0 text-yellow" />
                    <span>{{ order.note }}</span>
                  </p>
                </div>
              </div>

              <!-- Right: status actions -->
              <div class="shrink-0 lg:w-56">
                <p class="mb-2 text-xs font-semibold uppercase tracking-wide text-navy/40">
                  Promeni status
                </p>
                <div class="flex flex-wrap gap-2 lg:flex-col">
                  <button
                    v-for="key in ORDER_STATUSES"
                    :key="key"
                    type="button"
                    :disabled="order.status === key || updatingOrderId === order.id"
                    class="inline-flex items-center gap-2 rounded-full border-2 px-3 py-1.5 text-xs font-semibold transition-all disabled:opacity-40"
                    :class="order.status === key
                      ? 'border-navy bg-navy text-white'
                      : 'border-cloud/50 text-navy/70 hover:border-navy/40'"
                    @click="updateStatus(order, key)"
                  >
                    <span class="size-1.5 rounded-full" :class="getOrderStatusMeta(key).dotClass" />
                    {{ getOrderStatusMeta(key).label }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Pagination -->
        <div v-if="totalPages > 1" class="mt-8 flex items-center justify-center gap-2">
          <button
            type="button"
            :disabled="currentPage === 1"
            class="inline-flex size-10 items-center justify-center rounded-full border-2 border-cloud/50 text-navy/70 transition-colors hover:border-navy disabled:opacity-30 disabled:hover:border-cloud/50"
            @click="goToPage(currentPage - 1)"
          >
            <Icon name="lucide:chevron-left" class="size-5" />
          </button>

          <button
            v-for="page in visiblePages"
            :key="page"
            type="button"
            class="inline-flex size-10 items-center justify-center rounded-full text-sm font-semibold transition-colors"
            :class="page === currentPage
              ? 'bg-navy text-white'
              : 'border-2 border-cloud/50 text-navy/70 hover:border-navy'"
            @click="goToPage(page)"
          >
            {{ page }}
          </button>

          <button
            type="button"
            :disabled="currentPage === totalPages"
            class="inline-flex size-10 items-center justify-center rounded-full border-2 border-cloud/50 text-navy/70 transition-colors hover:border-navy disabled:opacity-30 disabled:hover:border-cloud/50"
            @click="goToPage(currentPage + 1)"
          >
            <Icon name="lucide:chevron-right" class="size-5" />
          </button>
        </div>
      </section>
    </div>
  </div>
</template>
