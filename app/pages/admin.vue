<script setup lang="ts">
/**
 * Admin shell (parent route for /admin/**).
 *
 * Owns the owner status check, the security-question gate and the
 * header/nav. Child pages (<NuxtPage />) only mount once the session is
 * elevated, so they never fire API calls that would 403.
 */
useHead({
  title: 'Admin panel - elorikids',
  meta: [
    { name: 'description', content: 'Admin panel - upravljanje prodavnicom.' },
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
const { data: adminStatus, refresh } = await useAsyncData<AdminStatus>(
  'admin-status',
  () => $fetch<AdminStatus>('/api/admin/me'),
)

// Session expired or not owner → 404 (middleware is the primary guard)
if (!adminStatus.value) {
  throw createError({ statusCode: 404, statusMessage: 'Not Found', fatal: true })
}

// Non-null after the 404 guard above - safe to access in template
const status = computed(() => adminStatus.value!)

async function refreshStatus() {
  await refresh()
}
provide(ADMIN_REFRESH_STATUS, refreshStatus)

const navItems = [
  { to: '/admin', label: 'Porudžbine', icon: 'lucide:package' },
  { to: '/admin/products', label: 'Proizvodi', icon: 'lucide:book-open' },
  { to: '/admin/categories', label: 'Kategorije', icon: 'lucide:folder-tree' },
]

// ── Lock panel ───────────────────────────────────────────────────
async function lockPanel() {
  try {
    await $fetch('/api/admin/lock', { method: 'POST' })
  }
  catch {
    // ignore
  }
  // Unmounts the child page, discarding any loaded admin data
  adminStatus.value = { ...adminStatus.value!, elevated: false }
}

async function handleLogout() {
  await lockPanel()
  await logout()
  router.push('/')
}
</script>

<template>
  <div class="min-h-screen bg-cream">
    <!-- Gate: security question not set up yet -->
    <AdminGate
      v-if="!status.securitySet"
      mode="setup"
      @done="refreshStatus"
    />

    <!-- Gate: needs elevation -->
    <AdminGate
      v-else-if="!status.elevated"
      mode="verify"
      :question="status.question ?? undefined"
      @done="refreshStatus"
    />

    <!-- Admin panel -->
    <div v-else>
      <!-- Header bar -->
      <header class="border-b-2 border-cloud/40 bg-white">
        <div class="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <div class="flex items-center gap-3">
            <div class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-navy text-white">
              <Icon name="lucide:shield-check" class="size-5" />
            </div>
            <div class="min-w-0">
              <h1 class="font-unbounded text-lg font-bold text-navy">
                Admin panel
              </h1>
              <p class="truncate text-xs text-navy/50">
                Prijavljeni kao {{ user?.email }}
              </p>
            </div>
          </div>

          <div class="flex shrink-0 items-center gap-2">
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

        <!-- Section nav -->
        <nav class="mx-auto flex max-w-7xl gap-2 overflow-x-auto px-4 pb-4 sm:px-6 lg:px-8" aria-label="Admin sekcije">
          <NuxtLink
            v-for="item in navItems"
            :key="item.to"
            :to="item.to"
            class="inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors"
            :class="$route.path === item.to
              ? 'bg-navy text-white'
              : 'bg-cream text-navy/60 hover:text-navy'"
          >
            <Icon :name="item.icon" class="size-4" />
            {{ item.label }}
          </NuxtLink>
        </nav>
      </header>

      <NuxtPage />
    </div>
  </div>
</template>
