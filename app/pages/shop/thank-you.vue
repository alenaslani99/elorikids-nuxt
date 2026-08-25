<script setup lang="ts">
useHead({
  title: 'Hvala na porudžbini - elorikids',
  meta: [
    { name: 'description', content: 'Vaša porudžbina je uspešno poslata. Kontaktiraćemo vas u skorijem vremenu radi potvrde.' },
    { name: 'robots', content: 'noindex, nofollow' },
  ],
})

const route = useRoute()
const orderId = computed(() => (route.query.id as string) || '')
</script>

<template>
  <div class="bg-cream">
    <section class="mx-auto max-w-xl px-4 py-20 text-center sm:px-6 lg:py-32 lg:px-8">
      <div class="mx-auto flex size-24 items-center justify-center rounded-full bg-mint/15">
        <Icon name="lucide:check-circle" class="size-14 text-mint" />
      </div>

      <h1 class="font-unbounded mt-8 text-4xl font-extrabold text-navy md:text-5xl">
        Hvala na porudžbini!
      </h1>

      <p class="mx-auto mt-4 max-w-md text-lg text-navy/70">
        Vaša porudžbina je uspešno poslata. Javićemo vam se na telefon ili email
        radi potvrde i dogovora o dostavi.
      </p>

      <p v-if="orderId" class="mt-4 text-sm text-navy/50">
        Broj porudžbine: <strong class="text-navy">{{ orderId }}</strong>
        <NuxtLink :to="`/track-order?id=${orderId}`" class="mt-1 block font-medium text-blue underline-offset-2 hover:underline sm:ml-2 sm:mt-0 sm:inline">
          Pratite porudžbinu →
        </NuxtLink>
      </p>

      <div class="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
        <NuxtLink
          to="/"
          class="inline-flex items-center justify-center gap-2 rounded-full bg-blue px-8 py-3.5 font-semibold text-white shadow-md transition-all hover:bg-navy hover:shadow-lg active:scale-[0.98]"
        >
          <Icon name="lucide:home" class="size-5" />
          Vrati se na početnu
        </NuxtLink>
        <NuxtLink
          to="/books"
          class="inline-flex items-center justify-center gap-2 rounded-full border-2 border-cloud bg-white px-8 py-3.5 font-semibold text-navy transition-colors hover:border-blue hover:text-blue"
        >
          Pogledaj ostale knjige
        </NuxtLink>
      </div>

      <!-- Reassurance -->
      <div class="mx-auto mt-12 max-w-md rounded-2xl bg-white p-6 text-left shadow-sm ring-1 ring-cloud/40">
        <div class="flex items-start gap-3">
          <Icon name="lucide:clock" class="size-6 shrink-0 text-blue" />
          <div>
            <p class="font-semibold text-navy">
              Šta dalje?
            </p>
            <p class="mt-1 text-sm text-navy/60">
              Kontaktiraćemo vas u roku od 24h radi potvrde porudžbine i dogovora
              o dostavi. Plaćanje se vrši pri preuzimanju (pouzeće).
            </p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
