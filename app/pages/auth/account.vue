<script setup lang="ts">
useHead({
  title: 'Moj nalog - elorikids',
  meta: [
    { name: 'description', content: 'Vaš elorikids nalog - pregledajte porudžbine, sačuvane knjige i podatke profila.' },
    { name: 'robots', content: 'noindex, nofollow' },
  ],
})

const { user, logout, isLoggedIn, isReady } = useAuth()
const { count: cartCount } = useCart()
const { count: savedCount } = useSaved()
const router = useRouter()

// Redirect to login if not authenticated; fetch orders if logged in
onMounted(async () => {
  // The auth plugin validates the session on first load.
  // If the user navigated here client-side, isReady is already true.
  if (isReady.value && !isLoggedIn.value) {
    router.replace('/auth/login?redirect=/auth/account')
    return
  }
  if (isLoggedIn.value) {
    fetchOrders()
  }
  else {
    ordersLoading.value = false
  }
})

const displayUser = computed(() => user.value ?? { name: '', email: '' })

const initials = computed(() => {
  const name = displayUser.value?.name ?? ''
  return name
    .split(' ')
    .map(w => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || '?'
})

async function handleLogout() {
  await logout()
  router.push('/')
}

// --- Fetch real orders for logged-in user ---
interface OrderSummary {
  id: string
  status: string
  grandTotal: number
  itemCount: number
  createdAt: string
}

const orders = ref<OrderSummary[]>([])
const ordersLoading = ref(true)

async function fetchOrders() {
  if (!isLoggedIn.value) {
    ordersLoading.value = false
    return
  }
  try {
    orders.value = await $fetch<OrderSummary[]>('/api/orders')
  }
  catch {
    orders.value = []
  }
  finally {
    ordersLoading.value = false
  }
}

// Map DB status to Serbian label + styling
const statusStyles: Record<string, { label: string, bg: string, text: string, icon: string }> = {
  received:    { label: 'U obradi',      bg: 'bg-yellow/15', text: 'text-yellow', icon: 'lucide:clock' },
  preparing:   { label: 'U pripremi',    bg: 'bg-yellow/15', text: 'text-yellow', icon: 'lucide:clock' },
  in_transit:  { label: 'U transportu',  bg: 'bg-blue/15',   text: 'text-blue',  icon: 'lucide:truck' },
  delivered:   { label: 'Isporučeno',    bg: 'bg-mint/15',   text: 'text-mint',  icon: 'lucide:check-circle' },
  cancelled:   { label: 'Otkazano',      bg: 'bg-coral/15',  text: 'text-coral', icon: 'lucide:x-circle' },
}

const months = [
  'jan', 'feb', 'mar', 'apr', 'maj', 'jun',
  'jul', 'avg', 'sep', 'okt', 'nov', 'dec',
]
function formatDate(iso: string): string {
  const d = new Date(iso)
  if (isNaN(d.getTime())) return iso
  return `${d.getDate()}. ${months[d.getMonth()]} ${d.getFullYear()}.`
}

const quickLinks = computed(() => [
  { label: 'Sačuvane knjige', desc: `${savedCount.value} knjiga`, to: '/shop/saved', icon: 'lucide:heart', accent: 'bg-coral/10 text-coral' },
  { label: 'Korpa', desc: `${cartCount.value} artikala`, to: '/shop/cart', icon: 'lucide:shopping-bag', accent: 'bg-blue/10 text-blue' },
  { label: 'Početna', desc: 'Nazad na prodavnicu', to: '/', icon: 'lucide:home', accent: 'bg-mint/15 text-mint' },
])
</script>

<template>
  <div class="bg-cream">
    <!-- Page header -->
    <section class="bg-gradient-to-b from-sky/30 to-cream py-12 lg:py-16">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <AppBreadcrumb :items="[{ label: 'Početna', to: '/' }, { label: 'Moj nalog' }]" nav-class="mb-4" />
        <h1 class="font-unbounded text-4xl font-extrabold text-navy md:text-5xl">
          Moj nalog
        </h1>
        <p class="mt-3 text-lg text-navy/70">
          Dobrodošli nazad! Pregledajte vaše porudžbine i podatke.
        </p>
      </div>
    </section>

    <!-- Account content -->
    <section class="py-12 lg:py-16">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="grid gap-8 lg:grid-cols-5 lg:gap-10">
          <!-- Main column (3 cols) -->
          <div class="space-y-8 lg:col-span-3">
            <!-- Profile card -->
            <div class="flex flex-col gap-6 rounded-3xl border-2 border-cloud/40 bg-white p-8 shadow-sm sm:flex-row sm:items-center">
              <!-- Avatar -->
              <div class="flex size-20 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-navy to-navy-dark text-2xl font-extrabold text-white">
                {{ initials }}
              </div>

              <!-- Info -->
              <div class="min-w-0 flex-1">
                <h2 class="font-unbounded text-2xl font-bold text-navy">
                  {{ displayUser?.name }}
                </h2>
                <p class="mt-1 flex items-center gap-2 text-navy/60">
                  <Icon name="lucide:mail" class="size-4 shrink-0" />
                  {{ displayUser?.email }}
                </p>
                <p class="mt-1 flex items-center gap-2 text-sm text-navy/50">
                  <Icon name="lucide:calendar" class="size-4 shrink-0" />
                  Član od januara 2025.
                </p>
              </div>

              <!-- Logout -->
              <button
                type="button"
                class="inline-flex shrink-0 items-center justify-center gap-2 rounded-full border-2 border-cloud px-5 py-2.5 text-sm font-semibold text-navy/70 transition-colors hover:border-coral hover:text-coral"
                @click="handleLogout"
              >
                <Icon name="lucide:log-out" class="size-4" />
                Odjava
              </button>
            </div>

            <!-- Order history -->
            <div class="rounded-3xl border-2 border-cloud/40 bg-white p-8 shadow-sm">
              <div class="mb-6 flex items-center gap-3">
                <div class="flex size-10 items-center justify-center rounded-xl bg-blue/10">
                  <Icon name="lucide:package" class="size-5 text-blue" />
                </div>
                <h2 class="font-unbounded text-xl font-bold text-navy">
                  Istorija porudžbina
                </h2>
              </div>

              <!-- Orders list -->
              <div v-if="ordersLoading" class="py-8 text-center text-navy/40">
                <Icon name="lucide:loader-2" class="mx-auto mb-2 size-6 animate-spin" />
                <p class="text-sm">Učitavanje porudžbina...</p>
              </div>

              <div v-else-if="orders.length === 0" class="rounded-2xl border border-dashed border-cloud/60 bg-cream p-8 text-center">
                <Icon name="lucide:package-x" class="mx-auto mb-3 size-8 text-navy/30" />
                <p class="text-navy/60">Nemate porudžbina još.</p>
                <NuxtLink to="/knjige" class="mt-3 inline-block font-semibold text-blue hover:text-navy">
                  Pogledajte knjige →
                </NuxtLink>
              </div>

              <div v-else class="space-y-3">
                <NuxtLink
                  v-for="order in orders"
                  :key="order.id"
                  :to="`/pratite-porudzbinu?id=${order.id}`"
                  class="flex flex-col gap-3 rounded-2xl border border-cloud/40 bg-cream p-5 transition-colors hover:border-blue/40 sm:flex-row sm:items-center sm:justify-between"
                >
                  <!-- Order info -->
                  <div class="flex items-center gap-4">
                    <div class="flex size-11 shrink-0 items-center justify-center rounded-xl bg-navy/5">
                      <Icon name="lucide:book-open" class="size-5 text-navy/60" />
                    </div>
                    <div>
                      <p class="font-semibold text-navy">
                        {{ order.id }}
                      </p>
                      <p class="text-sm text-navy/50">
                        {{ formatDate(order.createdAt) }} · {{ order.itemCount }} {{ order.itemCount === 1 ? 'artikal' : 'artikla' }}
                      </p>
                    </div>
                  </div>

                  <!-- Total + status -->
                  <div class="flex flex-nowrap items-center gap-4">
                    <p class="whitespace-nowrap font-bold tabular-nums text-navy">
                      {{ order.grandTotal.toLocaleString('sr-RS') }} RSD
                    </p>
                    <span
                      class="inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1 text-sm font-semibold"
                      :class="statusStyles[order.status]?.bg ?? 'bg-cloud/40'"
                    >
                      <Icon :name="statusStyles[order.status]?.icon ?? 'lucide:circle'" class="size-3.5 shrink-0" :class="statusStyles[order.status]?.text" />
                      <span :class="statusStyles[order.status]?.text">{{ statusStyles[order.status]?.label ?? order.status }}</span>
                    </span>
                  </div>
                </NuxtLink>
              </div>
            </div>
          </div>

          <!-- Sidebar (2 cols) -->
          <div class="space-y-6 lg:col-span-2">
            <!-- Quick actions -->
            <div class="rounded-3xl border-2 border-cloud/40 bg-white p-8 shadow-sm">
              <h2 class="font-unbounded mb-6 text-xl font-bold text-navy">
                Brze akcije
              </h2>
              <div class="space-y-3">
                <NuxtLink
                  v-for="link in quickLinks"
                  :key="link.label"
                  :to="link.to"
                  class="flex items-center gap-4 rounded-2xl border border-cloud/40 bg-cream p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-blue/40 hover:shadow-md"
                >
                  <div
                    class="flex size-11 shrink-0 items-center justify-center rounded-xl"
                    :class="link.accent"
                  >
                    <Icon :name="link.icon" class="size-5" />
                  </div>
                  <div class="min-w-0 flex-1">
                    <p class="font-semibold text-navy">
                      {{ link.label }}
                    </p>
                    <p class="text-sm text-navy/50">
                      {{ link.desc }}
                    </p>
                  </div>
                  <Icon name="lucide:chevron-right" class="size-5 shrink-0 text-navy/30" />
                </NuxtLink>
              </div>
            </div>

            <!-- Help nudge -->
            <div class="rounded-2xl bg-navy p-6 text-white">
              <div class="flex items-center gap-3">
                <div class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-yellow/20">
                  <Icon name="lucide:headset" class="size-5 text-yellow" />
                </div>
                <div>
                  <p class="font-semibold">
                    Potrebna pomoć?
                  </p>
                  <p class="text-sm text-cloud/80">
                    <NuxtLink to="/legal/contact" class="underline transition-colors hover:text-sky">Kontaktirajte nas</NuxtLink> za pitanja o porudžbinama.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
