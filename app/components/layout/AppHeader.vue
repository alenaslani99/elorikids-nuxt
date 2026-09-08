<script setup lang="ts">
import { books } from "~/composables/useBooks";

const search = ref("");
const isSearchOpen = ref(false);
const { count: cartCount } = useCart();
const { count: savedCount } = useSaved();
const { isLoggedIn, isReady, user, logout } = useAuth();
const router = useRouter();

// Only render the logged-in UI after the component has mounted on the
// client. The server always renders the logged-out branch, so this keeps
// the first client render identical to SSR and avoids a hydration mismatch
// (server=logged-out, client=logged-in). It then upgrades in onMounted.
const mounted = ref(false);
onMounted(() => {
    mounted.value = true;
});

async function handleLogout() {
    await logout();
    router.push("/");
}

const searchResults = computed(() => {
    const q = search.value.trim().toLowerCase();
    if (!q) return [];
    return books
        .filter(
            (b) =>
                b.title.toLowerCase().includes(q) ||
                b.subtitle.toLowerCase().includes(q) ||
                b.category.toLowerCase().includes(q),
        )
        .slice(0, 5);
});

function goToBook(slug: string) {
    search.value = "";
    isSearchOpen.value = false;
    router.push(`/books/${slug}`);
}

function onSearchSubmit() {
    const first = searchResults.value[0];
    if (first) {
        goToBook(first.slug);
    }
}

// Close dropdown when clicking outside
const searchContainer = ref<HTMLElement | null>(null);
function onClickOutside(e: MouseEvent) {
    if (
        searchContainer.value &&
        !searchContainer.value.contains(e.target as Node)
    ) {
        isSearchOpen.value = false;
    }
}
onMounted(() => document.addEventListener("click", onClickOutside));
onBeforeUnmount(() => document.removeEventListener("click", onClickOutside));
</script>

<template>
    <header class="sticky top-0 z-50 bg-white shadow-sm">
        <!-- Layer 1: announcement + login/register -->
        <div class="bg-navy-dark text-white">
            <div
                class="mx-auto flex min-h-9 max-w-7xl items-center justify-between px-4 py-1.5 text-xs sm:h-9 sm:px-6 sm:py-0 lg:px-8"
            >
                <p class="flex items-center gap-1.5 font-medium">
                    <span>🚚</span>
                    <span class="hidden sm:inline"
                        >Besplatna dostava za porudžbine preko 4.500 RSD</span
                    >
                    <span class="sm:hidden"
                        >Besplatna dostava preko<br />4.500 RSD</span
                    >
                </p>
                <nav class="flex items-center gap-4">
                    <!-- Auth-aware UI: render a stable logged-out state during SSR and
               until the client has mounted. The auth client plugin resolves
               the session before mount, but we still gate the logged-in branch
               behind `mounted` so the first client render matches the server
               (logged-out), then upgrades after hydration. -->
                    <template v-if="mounted && isLoggedIn && isReady">
                        <NuxtLink
                            to="/auth/account"
                            class="font-medium transition-colors hover:text-sky"
                        >
                            <span class="hidden sm:inline">Zdravo, </span
                            >{{ user?.name?.split(" ")[0] }}
                        </NuxtLink>
                        <span class="text-cloud/50">|</span>
                        <button
                            type="button"
                            class="font-medium text-coral transition-colors hover:text-coral/80"
                            @click="handleLogout"
                        >
                            Odjava
                        </button>
                    </template>
                    <template v-else>
                        <NuxtLink
                            to="/auth/login"
                            class="font-medium transition-colors hover:text-sky"
                            >Prijava</NuxtLink
                        >
                        <span class="text-cloud/50">|</span>
                        <NuxtLink
                            to="/auth/register"
                            class="font-medium transition-colors hover:text-sky"
                            >Registracija</NuxtLink
                        >
                    </template>
                </nav>
            </div>
        </div>

        <!-- Layer 2: site name + search + icons -->
        <div class="bg-navy">
            <div
                class="mx-auto flex h-20 max-w-7xl items-center gap-6 px-4 sm:px-6 lg:px-8"
            >
                <!-- Site name -->
                <NuxtLink
                    to="/"
                    class="shrink-0 font-unbounded text-2xl font-extrabold tracking-tight text-white"
                >
                    elori<span class="text-yellow">kids</span>
                </NuxtLink>

                <!-- Search -->
                <div
                    ref="searchContainer"
                    class="relative hidden flex-1 md:block"
                >
                    <input
                        id="header-search"
                        name="header-search"
                        v-model="search"
                        type="search"
                        placeholder="Pretražite knjige i školski pribor..."
                        autocomplete="off"
                        class="w-full rounded-full border border-white/10 bg-white/10 py-2.5 pl-12 pr-4 text-sm text-white placeholder:text-cloud/70 transition-colors focus:border-sky focus:bg-white/15 focus:outline-none focus:ring-2 focus:ring-sky/30"
                        @focus="isSearchOpen = true"
                        @keydown.enter.prevent="onSearchSubmit"
                    />
                    <span
                        class="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-cloud"
                    >
                        <Icon name="lucide:search" class="size-5" />
                    </span>

                    <!-- Dropdown results -->
                    <div
                        v-if="isSearchOpen && search.trim()"
                        class="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-cloud/30 bg-white shadow-xl"
                    >
                        <div
                            v-if="searchResults.length === 0"
                            class="px-4 py-6 text-center text-sm text-navy/50"
                        >
                            Nema rezultata za „{{ search }}“
                        </div>
                        <ul v-else class="divide-y divide-cloud/20">
                            <li v-for="book in searchResults" :key="book.slug">
                                <button
                                    type="button"
                                    class="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-cream"
                                    @click="goToBook(book.slug)"
                                >
                                    <NuxtImg
                                        :src="`/${book.img}`"
                                        :alt="book.title"
                                        width="40"
                                        height="56"
                                        class="size-10 shrink-0 rounded-lg object-cover"
                                    />
                                    <div class="min-w-0">
                                        <p
                                            class="truncate text-sm font-semibold text-navy"
                                        >
                                            {{ book.title }}
                                        </p>
                                        <p
                                            class="truncate text-xs text-navy/50"
                                        >
                                            {{ book.category }} ·
                                            {{
                                                book.price.toLocaleString(
                                                    "sr-RS",
                                                )
                                            }}
                                            RSD
                                            <span class="line-through">{{
                                                book.oldPrice.toLocaleString(
                                                    "sr-RS",
                                                )
                                            }}</span>
                                        </p>
                                    </div>
                                </button>
                            </li>
                        </ul>
                    </div>
                </div>

                <!-- Icons right -->
                <div class="ml-auto flex items-center gap-1 sm:gap-2 md:ml-0">
                    <NuxtLink
                        to="/shop/saved"
                        aria-label="Sačuvano"
                        class="relative flex h-11 w-11 items-center justify-center rounded-full text-white transition-colors hover:bg-white/10"
                    >
                        <Icon name="lucide:heart" class="size-5" />
                        <span
                            v-if="savedCount > 0"
                            class="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-coral-dark px-1 text-[10px] font-bold text-white"
                            >{{ savedCount }}</span
                        >
                    </NuxtLink>
                    <NuxtLink
                        to="/auth/account"
                        aria-label="Nalog"
                        class="hidden h-11 w-11 items-center justify-center rounded-full text-white transition-colors hover:bg-white/10 sm:flex"
                    >
                        <Icon name="lucide:user" class="size-5" />
                    </NuxtLink>
                    <NuxtLink
                        to="/shop/cart"
                        aria-label="Korpa"
                        class="relative flex h-11 w-11 items-center justify-center rounded-full text-white transition-colors hover:bg-white/10"
                    >
                        <Icon name="lucide:shopping-bag" class="size-5" />
                        <span
                            v-if="cartCount > 0"
                            class="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-coral-dark px-1 text-[10px] font-bold text-white"
                            >{{ cartCount }}</span
                        >
                    </NuxtLink>
                </div>
            </div>
        </div>

        <!-- Layer 3: category links -->
        <nav class="border-b border-cloud/30">
            <div
                class="mx-auto flex h-12 max-w-7xl items-center gap-1 overflow-x-auto px-4 sm:px-6 lg:px-8"
            >
                <NuxtLink
                    to="/"
                    exact-active-class="bg-sky/40 text-navy"
                    class="whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium text-navy-dark transition-colors hover:bg-sky/40 hover:text-navy"
                    >Početna</NuxtLink
                >
                <NuxtLink
                    to="/legal/contact"
                    active-class="bg-sky/40 text-navy"
                    class="whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium text-navy-dark transition-colors hover:bg-sky/40 hover:text-navy"
                    >Kontakt</NuxtLink
                >
                <NuxtLink
                    to="/books"
                    class="ml-auto flex items-center gap-1 whitespace-nowrap rounded-lg bg-coral-dark px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-coral-dark/90"
                >
                    Interaktivne knjige
                </NuxtLink>
            </div>
        </nav>
    </header>
</template>
