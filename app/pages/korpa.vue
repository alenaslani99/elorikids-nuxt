<script setup lang="ts">
useHead({
  title: 'Korpa - elorikids',
  meta: [
    { name: 'description', content: 'Pregled vaše korpe — interaktivne piši-briši knjige za decu. Besplatna dostava za porudžbine preko 5.000 RSD.' },
  ],
})

const { items, total, shipping, grandTotal, increment, decrement, removeItem } = useCart()
const { getBook } = useBooks()

const FREE_SHIPPING_THRESHOLD = 5000
const remainingForFreeShipping = computed(() => Math.max(0, FREE_SHIPPING_THRESHOLD - total.value))
const hasFreeShipping = computed(() => total.value >= FREE_SHIPPING_THRESHOLD)
const shippingProgress = computed(() => Math.min(100, (total.value / FREE_SHIPPING_THRESHOLD) * 100))

const shippingCost = computed(() => (shipping.value === 0 ? 'Besplatno' : `${shipping.value.toLocaleString('sr-RS')} RSD`))
</script>

<template>
  <div class="bg-cream">
    <!-- Page header -->
    <section class="bg-gradient-to-b from-sky/30 to-cream py-12 lg:py-16">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <AppBreadcrumb :items="[{ label: 'Početna', to: '/' }, { label: 'Korpa' }]" nav-class="mb-4" />
        <h1 class="font-unbounded text-4xl font-extrabold text-navy md:text-5xl">
          Vaša korpa
        </h1>
        <p class="mt-3 text-lg text-navy/70">
          Pregledajte knjige koje ste izabrali i nastavite ka porudžbini.
        </p>
      </div>
    </section>

    <!-- Empty state -->
    <section v-if="items.length === 0" class="py-16 lg:py-24">
      <div class="mx-auto max-w-xl px-4 text-center sm:px-6 lg:px-8">
        <div class="mx-auto flex size-24 items-center justify-center rounded-full bg-sky/30">
          <Icon name="lucide:shopping-bag" class="size-12 text-navy/40" />
        </div>
        <h2 class="font-unbounded mt-6 text-2xl font-bold text-navy">
          Vaša korpa je prazna
        </h2>
        <p class="mt-3 text-navy/60">
          Još uvek niste dodali nijednu knjigu. Pogledajte našu ponudu interaktivnih
          piši-briši knjiga za decu uzrasta 2-6 godina.
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

    <!-- Cart with items -->
    <section v-else class="py-12 lg:py-16">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="grid gap-10 lg:grid-cols-3 lg:gap-12">
          <!-- Cart items -->
          <div class="lg:col-span-2">
            <!-- Free shipping progress -->
            <div class="mb-8 rounded-2xl border-2 border-cloud/40 bg-white p-5 shadow-sm">
              <div v-if="!hasFreeShipping" class="flex items-center gap-3 text-sm text-navy/70">
                <Icon name="lucide:truck" class="size-5 shrink-0 text-blue" />
                <span>
                  Dodajte još <strong class="text-navy">{{ remainingForFreeShipping.toLocaleString('sr-RS') }} RSD</strong> za besplatnu dostavu.
                </span>
              </div>
              <div v-else class="flex items-center gap-3 text-sm font-medium text-mint">
                <Icon name="lucide:check-circle" class="size-5 shrink-0" />
                <span>Ostvarili ste besplatnu dostavu!</span>
              </div>
              <div class="mt-3 h-2 overflow-hidden rounded-full bg-cloud/40">
                <div
                  class="h-full rounded-full bg-mint transition-all duration-500"
                  :style="{ width: `${shippingProgress}%` }"
                />
              </div>
            </div>

            <!-- Item rows -->
            <ul class="space-y-4">
              <li
                v-for="item in items"
                :key="item.slug"
                class="flex flex-col gap-4 rounded-2xl border-2 border-cloud/40 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:gap-6"
              >
                <!-- Image -->
                <NuxtLink :to="`/knjige/${item.slug}`" class="shrink-0">
                  <div class="overflow-hidden rounded-xl">
                    <NuxtImg
                      :src="`/${getBook(item.slug)?.img ?? ''}`"
                      :alt="item.title"
                      class="h-24 w-20 object-cover sm:h-28 sm:w-24"
                      width="96"
                      height="112"
                      format="webp"
                      loading="lazy"
                    />
                  </div>
                </NuxtLink>

                <!-- Details -->
                <div class="flex flex-1 flex-col gap-2">
                  <div class="flex items-start justify-between gap-3">
                    <div>
                      <NuxtLink :to="`/knjige/${item.slug}`" class="font-bold text-navy transition-colors hover:text-blue">
                        {{ item.title }}
                      </NuxtLink>
                      <p v-if="getBook(item.slug)" class="mt-0.5 text-sm text-navy/50">
                        {{ getBook(item.slug)?.ageRange }}
                      </p>
                    </div>
                    <button
                      type="button"
                      aria-label="Ukloni iz korpe"
                      class="flex size-9 shrink-0 items-center justify-center rounded-full text-navy/40 transition-colors hover:bg-coral/10 hover:text-coral"
                      @click="removeItem(item.slug)"
                    >
                      <Icon name="lucide:trash-2" class="size-5" />
                    </button>
                  </div>

                  <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                    <!-- Quantity -->
                    <div class="flex w-full items-center justify-between rounded-full border-2 border-cloud/50 p-1 sm:w-auto">
                      <button
                        type="button"
                        class="flex size-8 shrink-0 items-center justify-center rounded-full text-navy transition-colors hover:bg-sky/40"
                        aria-label="Smanji količinu"
                        @click="decrement(item.slug)"
                      >
                        <Icon name="lucide:minus" class="size-4" />
                      </button>
                      <span class="flex-1 text-center font-bold text-navy sm:flex-none sm:px-2">{{ item.quantity }}</span>
                      <button
                        type="button"
                        class="flex size-8 shrink-0 items-center justify-center rounded-full text-navy transition-colors hover:bg-sky/40"
                        aria-label="Povećaj količinu"
                        @click="increment(item.slug)"
                      >
                        <Icon name="lucide:plus" class="size-4" />
                      </button>
                    </div>

                    <!-- Price -->
                    <div class="text-right">
                      <p class="text-sm text-navy/50">
                        {{ item.price.toLocaleString('sr-RS') }} RSD / kom
                      </p>
                      <p class="font-unbounded text-lg font-bold text-navy">
                        {{ (item.price * item.quantity).toLocaleString('sr-RS') }} RSD
                      </p>
                    </div>
                  </div>
                </div>
              </li>
            </ul>

            <!-- Continue shopping -->
            <NuxtLink
              to="/#categories"
              class="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-blue transition-colors hover:text-navy"
            >
              <Icon name="lucide:arrow-left" class="size-4" />
              Nastavi kupovinu
            </NuxtLink>
          </div>

          <!-- Order summary -->
          <div class="lg:col-span-1">
            <div class="lg:sticky lg:top-32">
              <div class="rounded-3xl border-2 border-cloud/40 bg-white p-6 shadow-sm">
                <h2 class="font-unbounded mb-6 text-xl font-bold text-navy">
                  Rezime porudžbine
                </h2>

                <dl class="space-y-3 text-navy/70">
                  <div class="flex justify-between">
                    <dt>Knjige ({{ items.length }})</dt>
                    <dd class="font-medium text-navy">{{ total.toLocaleString('sr-RS') }} RSD</dd>
                  </div>
                  <div class="flex justify-between">
                    <dt>Dostava</dt>
                    <dd class="font-medium" :class="shipping === 0 ? 'text-mint' : 'text-navy'">
                      {{ shippingCost }}
                    </dd>
                  </div>
                </dl>

                <div class="my-5 border-t border-cloud/40" />

                <div class="flex items-baseline justify-between">
                  <span class="font-semibold text-navy">Ukupno</span>
                  <span class="font-unbounded text-2xl font-extrabold text-navy">
                    {{ grandTotal.toLocaleString('sr-RS') }} RSD
                  </span>
                </div>

                <NuxtLink
                  to="/poruci"
                  class="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-blue px-8 py-3.5 font-semibold text-white shadow-md transition-all hover:bg-navy hover:shadow-lg active:scale-[0.98]"
                >
                  Naruči
                  <Icon name="lucide:arrow-right" class="size-5" />
                </NuxtLink>

                <!-- Trust badges -->
                <div class="mt-6 space-y-3">
                  <div class="flex items-center gap-3 text-sm text-navy/60">
                    <Icon name="lucide:truck" class="size-5 shrink-0 text-blue" />
                    Besplatna dostava za porudžbine preko 5.000 RSD
                  </div>
                  <div class="flex items-center gap-3 text-sm text-navy/60">
                    <Icon name="lucide:eraser" class="size-5 shrink-0 text-blue" />
                    Piši-briši sistem, višestruko korišćenje
                  </div>
                  <div class="flex items-center gap-3 text-sm text-navy/60">
                    <Icon name="lucide:shield-check" class="size-5 shrink-0 text-blue" />
                    Porudžbina se šalje na email — bez plaćanja unapred
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
