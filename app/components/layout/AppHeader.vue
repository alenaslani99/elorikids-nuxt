<script setup lang="ts">
const search = ref('');
const { count: cartCount } = useCart()
const { count: savedCount } = useSaved()
const { isLoggedIn, isReady, user, logout } = useAuth()
const router = useRouter()

async function handleLogout() {
  await logout()
  router.push('/')
}
</script>

<template>
  <header class="sticky top-0 z-50 bg-white shadow-sm">
    <!-- Layer 1: announcement + login/register -->
    <div class="bg-navy-dark text-white">
      <div class="mx-auto flex h-9 max-w-7xl items-center justify-between px-4 text-xs sm:px-6 lg:px-8">
        <p class="flex items-center gap-1.5 font-medium">
          <span>🚚</span>
          <span class="hidden sm:inline">Besplatna dostava za porudžbine preko 5.000 RSD</span>
          <span class="sm:hidden">Besplatna dostava preko 5.000 RSD</span>
        </p>
        <nav class="flex items-center gap-4">
          <!-- Auth-aware UI: render a stable logged-out state during SSR and
               until the client-only auth plugin confirms the session. This
               avoids hydration mismatches (server=logged-out, client=logged-in). -->
          <template v-if="isLoggedIn && isReady">
            <NuxtLink to="/auth/account" class="font-medium transition-colors hover:text-sky">
              <span class="hidden sm:inline">Zdravo, </span>{{ user?.name?.split(' ')[0] }}
            </NuxtLink>
            <span class="text-cloud/50">|</span>
            <button type="button" class="font-medium text-coral transition-colors hover:text-coral/80" @click="handleLogout">
              Odjava
            </button>
          </template>
          <template v-else>
            <NuxtLink to="/auth/login" class="font-medium transition-colors hover:text-sky">Prijava</NuxtLink>
            <span class="text-cloud/50">|</span>
            <NuxtLink to="/auth/register" class="font-medium transition-colors hover:text-sky">Registracija</NuxtLink>
          </template>
        </nav>
      </div>
    </div>

    <!-- Layer 2: site name + search + icons -->
    <div class="bg-navy">
      <div class="mx-auto flex h-20 max-w-7xl items-center gap-6 px-4 sm:px-6 lg:px-8">

        <!-- Site name -->
        <NuxtLink to="/" class="shrink-0 font-unbounded text-2xl font-extrabold tracking-tight text-white">
          elori<span class="text-yellow">kids</span>
        </NuxtLink>

        <!-- Search -->
        <div class="relative hidden flex-1 md:block">
          <input
            v-model="search"
            type="search"
            placeholder="Pretražite knjige i školski pribor..."
            class="w-full rounded-full border border-white/10 bg-white/10 py-2.5 pl-12 pr-4 text-sm text-white placeholder:text-cloud/70 transition-colors focus:border-sky focus:bg-white/15 focus:outline-none focus:ring-2 focus:ring-sky/30"
          >
          <span class="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-cloud">
            <Icon name="lucide:search" class="size-5" />
          </span>
        </div>

        <!-- Icons right -->
        <div class="ml-auto flex items-center gap-1 sm:gap-2 md:ml-0">
          <NuxtLink to="/shop/saved" aria-label="Sačuvano" class="relative flex h-11 w-11 items-center justify-center rounded-full text-white transition-colors hover:bg-white/10">
            <Icon name="lucide:heart" class="size-5" />
            <span v-if="savedCount > 0" class="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-coral px-1 text-[10px] font-bold text-white">{{ savedCount }}</span>
          </NuxtLink>
          <NuxtLink to="/auth/account" aria-label="Nalog" class="hidden h-11 w-11 items-center justify-center rounded-full text-white transition-colors hover:bg-white/10 sm:flex">
            <Icon name="lucide:user" class="size-5" />
          </NuxtLink>
          <NuxtLink to="/shop/cart" aria-label="Korpa" class="relative flex h-11 w-11 items-center justify-center rounded-full text-white transition-colors hover:bg-white/10">
            <Icon name="lucide:shopping-bag" class="size-5" />
            <span v-if="cartCount > 0" class="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-coral px-1 text-[10px] font-bold text-white">{{ cartCount }}</span>
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- Layer 3: category links -->
    <nav class="border-b border-cloud/30">
      <div class="mx-auto flex h-12 max-w-7xl items-center gap-1 overflow-x-auto px-4 sm:px-6 lg:px-8">
        <NuxtLink to="/" exact-active-class="bg-sky/40 text-navy" class="whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium text-navy-dark transition-colors hover:bg-sky/40  hover:text-navy">Početna</NuxtLink>
        <NuxtLink to="/legal/contact" active-class="bg-sky/40 text-navy" class="whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium text-navy-dark transition-colors hover:bg-sky/40 hover:text-navy">Kontakt</NuxtLink>
        <NuxtLink to="/#categories" class="ml-auto flex items-center gap-1 whitespace-nowrap rounded-lg bg-coral px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-coral/90">
          Interaktivne knjige
        </NuxtLink>
      </div>
    </nav>
  </header>
</template>
