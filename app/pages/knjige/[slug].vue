<script setup lang="ts">
const route = useRoute()
const { getBook, getRelatedBooks } = useBooks()
const { addItem } = useCart()
const { isSaved, toggle } = useSaved()

const slug = computed(() => route.params.slug as string)
const book = computed(() => getBook(slug.value))

// 404 if book doesn't exist
if (!book.value) {
  throw createError({ statusCode: 404, statusMessage: 'Knjiga nije pronađena', fatal: true })
}

const relatedBooks = computed(() => getRelatedBooks(slug.value))

// --- Interactive state ---
const quantity = ref(1)
const activeTab = ref<'activities' | 'selling' | 'specs'>('activities')
const justAdded = ref(false)

const accentClasses: Record<string, { bg: string, text: string, soft: string, ring: string }> = {
  mint: { bg: 'bg-mint', text: 'text-mint', soft: 'bg-mint/15', ring: 'ring-mint' },
  purple: { bg: 'bg-purple', text: 'text-purple', soft: 'bg-purple/15', ring: 'ring-purple' },
  coral: { bg: 'bg-coral', text: 'text-coral', soft: 'bg-coral/15', ring: 'ring-coral' },
  sky: { bg: 'bg-sky', text: 'text-sky', soft: 'bg-sky/40', ring: 'ring-sky' },
  yellow: { bg: 'bg-yellow', text: 'text-yellow', soft: 'bg-yellow/15', ring: 'ring-yellow' },
}

const a = computed(() => accentClasses[book.value!.accent] ?? accentClasses.mint)

const saved = computed(() => isSaved(slug.value))

function toggleSave() {
  toggle({
    slug: book.value!.slug,
    title: book.value!.title,
    price: book.value!.price,
    img: book.value!.img,
    ageRange: book.value!.ageRange,
    accent: book.value!.accent,
  })
}

function addToCart() {
  addItem(book.value!.slug, book.value!.title, book.value!.price, quantity.value)
  justAdded.value = true
  setTimeout(() => (justAdded.value = false), 2000)
}

function incQty() {
  quantity.value++
}
function decQty() {
  if (quantity.value > 1) quantity.value--
}

// --- SEO + structured data ---
useHead({
  title: `${book.value!.title} - ${book.value!.ageRange} | elorikids`,
  meta: [
    { name: 'description', content: book.value!.description },
    { name: 'og:title', content: `${book.value!.title} | elorikids` },
    { name: 'og:description', content: book.value!.description },
    { name: 'og:type', content: 'product' },
  ],
  link: [
    { rel: 'canonical', href: `https://elorikids.rs/knjige/${book.value!.slug}` },
  ],
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: book.value!.title,
        description: book.value!.description,
        brand: { '@type': 'Brand', name: 'elorikids' },
        category: 'Children\'s activity book',
        offers: {
          '@type': 'Offer',
          price: book.value!.price,
          priceCurrency: 'RSD',
          availability: 'https://schema.org/InStock',
          url: `https://elorikids.rs/knjige/${book.value!.slug}`,
        },
      }),
    },
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Početna', item: 'https://elorikids.rs/' },
          { '@type': 'ListItem', position: 2, name: 'Knjige', item: 'https://elorikids.rs/knjige' },
          { '@type': 'ListItem', position: 3, name: book.value!.title, item: `https://elorikids.rs/knjige/${book.value!.slug}` },
        ],
      }),
    },
  ],
})
</script>

<template>
  <div v-if="book" class="bg-cream">
    <!-- Breadcrumbs -->
    <AppBreadcrumb
      :items="[{ label: 'Početna', to: '/' }, { label: 'Knjige', to: '/#categories' }, { label: book.title }]"
      nav-class="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8"
    />

    <!-- Product main -->
    <section class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div class="grid gap-10 lg:grid-cols-2 lg:gap-16">
        <!-- Gallery -->
        <div class="lg:sticky lg:top-32 lg:self-start">
          <!-- Product image -->
          <div class="relative overflow-hidden rounded-3xl shadow-lg">
            <NuxtImg
              :src="`/${book.img}`"
              :alt="`Naslovna strana - ${book.title}, interaktivna piši-briši knjiga za uzrast ${book.ageRange}`"
              class="aspect-[4/5] w-full object-cover"
              width="400"
              height="500"
              format="webp"
              loading="lazy"
            />
            <span
              class="absolute left-4 top-4 rounded-full bg-white/90 px-4 py-1.5 text-sm font-semibold text-navy shadow-sm"
            >
              {{ book.badge }}
            </span>
          </div>
        </div>

        <!-- Product info -->
        <div>
          <div class="flex items-center gap-3">
            <span class="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold" :class="[a.soft, a.text]">
              <Icon name="lucide:users" class="size-4" />
              {{ book.ageRange }}
            </span>
            <span class="inline-flex items-center gap-1.5 rounded-full bg-cream px-3 py-1 text-sm font-medium text-navy/60 ring-1 ring-cloud/50">
              <Icon name="lucide:book" class="size-4" />
              32 stranice
            </span>
          </div>

          <h1 class="font-unbounded mt-4 text-4xl font-extrabold text-navy md:text-5xl">
            {{ book.title }}
          </h1>
          <p class="mt-3 text-lg text-navy/70">
            {{ book.subtitle }}
          </p>

          <!-- Price -->
          <div class="mt-6 flex items-baseline gap-3">
            <span class="font-unbounded text-4xl font-extrabold text-navy">
              {{ book.price.toLocaleString('sr-RS') }}
              <span class="text-xl font-bold">RSD</span>
            </span>
            <span class="text-sm text-navy/50">uz besplatnu dostavu</span>
          </div>

          <!-- Short description -->
          <p class="mt-6 leading-relaxed text-navy/70">
            {{ book.description }}
          </p>

          <!-- Features chips -->
          <div class="mt-6 flex flex-wrap gap-2">
            <span
              v-for="feature in book.features"
              :key="feature"
              class="inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-sm font-medium text-navy shadow-sm ring-1 ring-cloud/40"
            >
              <Icon name="lucide:check" class="size-4 text-mint" />
              {{ feature }}
            </span>
          </div>

          <!-- Quantity + Add to cart -->
          <div class="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
            <!-- Quantity selector -->
            <div class="flex items-center justify-between gap-1 rounded-full border-2 border-cloud/50 bg-white p-1">
              <button
                type="button"
                class="flex size-10 items-center justify-center rounded-full text-navy transition-colors hover:bg-sky/40 disabled:opacity-40"
                :disabled="quantity <= 1"
                aria-label="Smanji količinu"
                @click="decQty"
              >
                <Icon name="lucide:minus" class="size-5" />
              </button>
              <span class="w-10 text-center font-bold text-navy">{{ quantity }}</span>
              <button
                type="button"
                class="flex size-10 items-center justify-center rounded-full text-navy transition-colors hover:bg-sky/40"
                aria-label="Povećaj količinu"
                @click="incQty"
              >
                <Icon name="lucide:plus" class="size-5" />
              </button>
            </div>

            <!-- Add to cart + Save (side by side on mobile, inline with qty on desktop) -->
            <div class="flex items-center gap-3 sm:contents">
              <!-- Add to cart button -->
              <button
                type="button"
                class="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-blue px-8 py-3.5 font-semibold text-white shadow-md transition-all hover:bg-blue/90 hover:shadow-lg active:scale-[0.98]"
                @click="addToCart"
              >
                <Icon v-if="justAdded" name="lucide:check" class="size-5" />
                <Icon v-else name="lucide:shopping-bag" class="size-5" />
                <span>{{ justAdded ? 'Dodato u korpu!' : 'Dodaj u korpu' }}</span>
              </button>

              <!-- Save / heart toggle -->
              <button
                type="button"
                class="flex size-[52px] shrink-0 items-center justify-center rounded-full border-2 transition-all active:scale-[0.98]"
                :class="saved ? 'border-coral bg-coral/10 text-coral' : 'border-cloud/50 bg-white text-navy hover:border-coral hover:text-coral'"
                :aria-pressed="saved"
                :aria-label="saved ? 'Ukloni iz sačuvanih' : 'Sačuvaj knjigu'"
                @click="toggleSave"
              >
                <Icon :name="saved ? 'lucide:heart' : 'lucide:heart'" class="size-5" :class="saved ? 'fill-coral' : ''" />
              </button>
            </div>
          </div>

          <!-- Subtotal line -->
          <div class="mt-4 flex items-center justify-between rounded-2xl bg-sky/20 px-6 py-3">
            <span class="text-sm font-medium text-navy/70">Ukupno za plaćanje:</span>
            <span class="font-unbounded text-xl font-bold text-navy">
              {{ (book.price * quantity).toLocaleString('sr-RS') }} RSD
            </span>
          </div>

          <!-- Trust badges -->
          <div class="mt-6 grid grid-cols-3 gap-3 text-center">
            <div class="rounded-xl bg-white p-3 shadow-sm ring-1 ring-cloud/40">
              <Icon name="lucide:truck" class="mx-auto size-6 text-blue" />
              <p class="mt-1.5 text-xs font-medium text-navy/70">
                Besplatna dostava
              </p>
            </div>
            <div class="rounded-xl bg-white p-3 shadow-sm ring-1 ring-cloud/40">
              <Icon name="lucide:rotate-ccw" class="mx-auto size-6 text-blue" />
              <p class="mt-1.5 text-xs font-medium text-navy/70">
                Povrat 14 dana
              </p>
            </div>
            <div class="rounded-xl bg-white p-3 shadow-sm ring-1 ring-cloud/40">
              <Icon name="lucide:shield-check" class="mx-auto size-6 text-blue" />
              <p class="mt-1.5 text-xs font-medium text-navy/70">
                Bezbedno plaćanje
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Tabs: Activities / Selling points / Specs -->
    <section class="bg-white py-16">
      <div class="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <!-- Tab buttons -->
        <div class="flex flex-wrap gap-2 border-b border-cloud/40">
          <button
            class="border-b-2 px-4 py-3 text-sm font-semibold transition-colors"
            :class="activeTab === 'activities' ? 'border-blue text-blue' : 'border-transparent text-navy/50 hover:text-navy'"
            @click="activeTab = 'activities'"
          >
            Aktivnosti
          </button>
          <button
            class="border-b-2 px-4 py-3 text-sm font-semibold transition-colors"
            :class="activeTab === 'selling' ? 'border-blue text-blue' : 'border-transparent text-navy/50 hover:text-navy'"
            @click="activeTab = 'selling'"
          >
            Zašto ovaj priručnik
          </button>
          <button
            class="border-b-2 px-4 py-3 text-sm font-semibold transition-colors"
            :class="activeTab === 'specs' ? 'border-blue text-blue' : 'border-transparent text-navy/50 hover:text-navy'"
            @click="activeTab = 'specs'"
          >
            Specifikacije
          </button>
        </div>

        <!-- Tab content -->
        <div class="mt-8">
          <!-- Activities tab -->
          <div v-if="activeTab === 'activities'" class="grid gap-4 sm:grid-cols-2">
            <div
              v-for="activity in book.activities"
              :key="activity.title"
              class="rounded-2xl border-2 border-cloud/30 p-5 transition-all hover:border-cloud hover:shadow-sm"
            >
              <div class="flex items-center gap-3">
                <div class="flex size-10 shrink-0 items-center justify-center rounded-xl" :class="a.soft">
                  <Icon name="lucide:sparkles" class="size-5" :class="a.text" />
                </div>
                <h3 class="font-semibold text-navy">
                  {{ activity.title }}
                </h3>
              </div>
              <p class="mt-3 text-sm leading-relaxed text-navy/60">
                {{ activity.description }}
              </p>
            </div>
          </div>

          <!-- Selling points tab -->
          <div v-else-if="activeTab === 'selling'" class="space-y-5">
            <div
              v-for="point in book.sellingPoints"
              :key="point.title"
              class="flex gap-4"
            >
              <div class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-mint/15">
                <Icon name="lucide:check-circle" class="size-5 text-mint" />
              </div>
              <div>
                <h3 class="font-semibold text-navy">
                  {{ point.title }}
                </h3>
                <p class="mt-1 text-sm leading-relaxed text-navy/60">
                  {{ point.text }}
                </p>
              </div>
            </div>
          </div>

          <!-- Specs tab -->
          <div v-else class="overflow-hidden rounded-2xl border-2 border-cloud/30">
            <dl class="divide-y divide-cloud/30">
              <div class="grid grid-cols-2 px-5 py-3.5">
                <dt class="text-sm font-medium text-navy/50">
                  Broj stranica
                </dt>
                <dd class="text-sm font-semibold text-navy">
                  32
                </dd>
              </div>
              <div class="grid grid-cols-2 px-5 py-3.5">
                <dt class="text-sm font-medium text-navy/50">
                  Materijal
                </dt>
                <dd class="text-sm font-semibold text-navy">
                  Laminirani, vodootporni papir
                </dd>
              </div>
              <div class="grid grid-cols-2 px-5 py-3.5">
                <dt class="text-sm font-medium text-navy/50">
                  Uzrast
                </dt>
                <dd class="text-sm font-semibold text-navy">
                  {{ book.ageRange }}
                </dd>
              </div>
              <div class="grid grid-cols-2 px-5 py-3.5">
                <dt class="text-sm font-medium text-navy/50">
                  Format
                </dt>
                <dd class="text-sm font-semibold text-navy">
                  A4 (210 × 297 mm)
                </dd>
              </div>
              <div class="grid grid-cols-2 px-5 py-3.5">
                <dt class="text-sm font-medium text-navy/50">
                  Sistem
                </dt>
                <dd class="text-sm font-semibold text-navy">
                  Piši-briši (višestruko korišćenje)
                </dd>
              </div>
              <div class="grid grid-cols-2 px-5 py-3.5">
                <dt class="text-sm font-medium text-navy/50">
                  Dostava
                </dt>
                <dd class="text-sm font-semibold text-navy">
                  Besplatna (1-3 radna dana)
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </section>

    <!-- Related books -->
    <section class="bg-cream py-16 lg:py-20">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 class="font-unbounded text-center text-3xl font-extrabold text-navy">
          Još interaktivnih knjiga
        </h2>
        <p class="mx-auto mt-3 max-w-xl text-center text-navy/60">
          Upotpunite kolekciju - sve knjige prate razvoj deteta korak po korak.
        </p>

        <div class="mt-10 grid gap-6 sm:grid-cols-2">
          <NuxtLink
            v-for="related in relatedBooks"
            :key="related.slug"
            :to="`/knjige/${related.slug}`"
            class="group flex gap-4 rounded-2xl border-2 border-cloud/40 bg-white p-5 transition-all hover:-translate-y-1 hover:shadow-lg"
          >
            <div class="flex aspect-[3/4] w-24 shrink-0 items-center justify-center rounded-xl" :class="{
              'bg-mint/20': related.accent === 'mint',
              'bg-purple/20': related.accent === 'purple',
              'bg-coral/20': related.accent === 'coral',
            }">
              <Icon name="lucide:book-open" class="size-10 opacity-40" :class="{
                'text-mint': related.accent === 'mint',
                'text-purple': related.accent === 'purple',
                'text-coral': related.accent === 'coral',
              }" />
            </div>
            <div class="flex flex-col">
              <span class="text-xs font-medium text-navy/50">{{ related.ageRange }}</span>
              <h3 class="font-unbounded text-lg font-bold text-navy group-hover:text-blue">
                {{ related.title }}
              </h3>
              <p class="mt-1 line-clamp-2 text-sm text-navy/60">
                {{ related.subtitle }}
              </p>
              <span class="mt-auto pt-2 font-bold text-navy">
                {{ related.price.toLocaleString('sr-RS') }} RSD
              </span>
            </div>
          </NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>
