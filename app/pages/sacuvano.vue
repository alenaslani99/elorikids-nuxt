<script setup lang="ts">
useHead({
  title: 'Sačuvano - elorikids',
  meta: [
    { name: 'description', content: 'Vaše sačuvane knjige - interaktivne piši-briši knjige koje ste označili za kasnije.' },
  ],
})

const { items, remove, clear } = useSaved()
const { addItem } = useCart()

const accentClasses: Record<string, { soft: string, text: string }> = {
  mint: { soft: 'bg-mint/15', text: 'text-mint' },
  purple: { soft: 'bg-purple/15', text: 'text-purple' },
  coral: { soft: 'bg-coral/15', text: 'text-coral' },
  sky: { soft: 'bg-sky/40', text: 'text-sky' },
  yellow: { soft: 'bg-yellow/15', text: 'text-yellow' },
}

// Per-card "added" feedback state (mirrors the effect on the product page)
const justAddedSlug = ref<string | null>(null)

function addToCart(item: { slug: string, title: string, price: number }) {
  addItem(item.slug, item.title, item.price, 1)
  justAddedSlug.value = item.slug
  setTimeout(() => {
    if (justAddedSlug.value === item.slug) justAddedSlug.value = null
  }, 2000)
}
</script>

<template>
  <div class="bg-cream">
    <!-- Page header -->
    <section class="bg-gradient-to-b from-sky/30 to-cream py-12 lg:py-16">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <AppBreadcrumb :items="[{ label: 'Početna', to: '/' }, { label: 'Sačuvano' }]" nav-class="mb-4" />
        <div class="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 class="font-unbounded text-4xl font-extrabold text-navy md:text-5xl">
              Sačuvane knjige
            </h1>
            <p class="mt-3 text-lg text-navy/70">
              Knjige koje ste označili srcem za kasnije.
            </p>
          </div>
          <button
            v-if="items.length > 0"
            type="button"
            class="inline-flex w-fit items-center gap-2 rounded-full border-2 border-cloud bg-white px-5 py-2.5 text-sm font-semibold text-navy/70 transition-colors hover:border-coral hover:text-coral"
            @click="clear"
          >
            <Icon name="lucide:trash-2" class="size-4" />
            Očisti sve
          </button>
        </div>
      </div>
    </section>

    <!-- Empty state -->
    <section v-if="items.length === 0" class="py-16 lg:py-24">
      <div class="mx-auto max-w-xl px-4 text-center sm:px-6 lg:px-8">
        <div class="mx-auto flex size-24 items-center justify-center rounded-full bg-sky/30">
          <Icon name="lucide:heart" class="size-12 text-navy/40" />
        </div>
        <h2 class="font-unbounded mt-6 text-2xl font-bold text-navy">
          Nemate sačuvanih knjiga
        </h2>
        <p class="mt-3 text-navy/60">
          Pritisnite srce na bilo kojoj knjizi da je sačuvate ovde za kasnije.
        </p>
        <NuxtLink
          to="/#categories"
          class="mt-8 inline-flex items-center gap-2 rounded-full bg-blue px-8 py-3.5 font-semibold text-white shadow-md transition-all hover:bg-navy hover:shadow-lg active:scale-[0.98]"
        >
          Pogledaj knjige
          <Icon name="lucide:arrow-right" class="size-5" />
        </NuxtLink>
      </div>
    </section>

    <!-- Saved grid -->
    <section v-else class="py-12 lg:py-16">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <article
            v-for="item in items"
            :key="item.slug"
            class="group flex flex-col rounded-3xl border-2 border-cloud/40 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
          >
            <!-- Image + remove -->
            <div class="relative mb-5 overflow-hidden rounded-2xl">
              <NuxtLink :to="`/knjige/${item.slug}`">
                <NuxtImg
                  :src="`/${item.img}`"
                  :alt="item.title"
                  class="aspect-[4/3] w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  width="400"
                  height="300"
                  format="webp"
                  loading="lazy"
                />
              </NuxtLink>
              <button
                type="button"
                aria-label="Ukloni iz sačuvanih"
                class="absolute right-3 top-3 flex size-9 items-center justify-center rounded-full bg-white/90 text-coral shadow-sm backdrop-blur transition-colors hover:bg-coral hover:text-white"
                @click="remove(item.slug)"
              >
                <Icon name="lucide:heart" class="size-5 fill-coral" />
              </button>
            </div>

            <!-- Age badge -->
            <span
              class="mb-3 w-fit rounded-full px-3 py-1 text-sm font-semibold"
              :class="accentClasses[item.accent]?.soft ?? accentClasses.mint.soft"
            >
              <span :class="accentClasses[item.accent]?.text ?? accentClasses.mint.text">{{ item.ageRange }}</span>
            </span>

            <!-- Title + price -->
            <NuxtLink :to="`/knjige/${item.slug}`" class="font-unbounded text-xl font-extrabold text-navy transition-colors hover:text-blue">
              {{ item.title }}
            </NuxtLink>
            <p class="mt-1 text-lg font-bold text-navy">
              {{ item.price.toLocaleString('sr-RS') }} RSD
            </p>

            <!-- Actions -->
            <div class="mt-auto flex gap-3 pt-6">
              <button
                type="button"
                class="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-blue px-5 py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-navy active:scale-[0.98]"
                @click="addToCart(item)"
              >
                <Icon v-if="justAddedSlug === item.slug" name="lucide:check" class="size-4" />
                <Icon v-else name="lucide:shopping-bag" class="size-4" />
                {{ justAddedSlug === item.slug ? 'Dodato u korpu!' : 'Dodaj u korpu' }}
              </button>
              <NuxtLink
                :to="`/knjige/${item.slug}`"
                class="inline-flex items-center justify-center rounded-full border-2 border-cloud px-5 py-3 text-sm font-semibold text-navy transition-colors hover:border-blue hover:text-blue"
              >
                Pogledaj
              </NuxtLink>
            </div>
          </article>
        </div>
      </div>
    </section>
  </div>
</template>
