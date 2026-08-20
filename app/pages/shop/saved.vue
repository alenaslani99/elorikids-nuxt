<script setup lang="ts">
useHead({
  title: 'Sačuvano - elorikids',
  meta: [
    { name: 'description', content: 'Vaše sačuvane knjige - interaktivne piši-briši knjige koje ste označili za kasnije.' },
  ],
})

const { items, remove, clear } = useSaved()
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
    <AppEmptyState
      v-if="items.length === 0"
      icon="lucide:heart"
      title="Nemate sačuvanih knjiga"
      description="Pritisnite srce na bilo kojoj knjizi da je sačuvate ovde za kasnije."
    />

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
              <NuxtLink :to="`/books/${item.slug}`">
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
            <NuxtLink :to="`/books/${item.slug}`" class="font-unbounded text-xl font-extrabold text-navy transition-colors hover:text-blue">
              {{ item.title }}
            </NuxtLink>
            <p class="mt-1 text-lg font-bold text-navy">
              {{ item.price.toLocaleString('sr-RS') }} RSD
            </p>

            <!-- Actions -->
            <div class="mt-auto flex flex-col gap-3 pt-6">
              <AddToCartButton
                :slug="item.slug"
                :title="item.title"
                :price="item.price"
                compact
              />
              <NuxtLink
                :to="`/books/${item.slug}`"
                class="inline-flex w-full items-center justify-center whitespace-nowrap rounded-full border-2 border-cloud px-5 py-3 text-sm font-semibold text-navy transition-colors hover:border-blue hover:text-blue"
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
