<script setup lang="ts">
useHead({
  title: 'Porudžbina - elorikids',
  meta: [
    { name: 'description', content: 'Završite porudžbinu — unesite podatke za dostavu i pošaljite porudžbinu. Plaćanje se vrši pri preuzimanju.' },
    { name: 'robots', content: 'noindex, nofollow' },
  ],
})

const { items, total, shipping, grandTotal, clear } = useCart()
const { getBook } = useBooks()

const router = useRouter()

// Redirect to cart if empty
onMounted(() => {
  if (items.value.length === 0) {
    router.replace('/korpa')
  }
})

const form = reactive({
  name: '',
  phone: '',
  email: '',
  address: '',
  city: '',
  postal: '',
  note: '',
})

const status = ref<'idle' | 'loading' | 'success' | 'error'>('idle')
const errorMessage = ref('')

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const phoneRegex = /^\+?\d[\d\s/-]{6,}$/

async function handleSubmit() {
  errorMessage.value = ''

  if (!form.name.trim()) {
    status.value = 'error'
    errorMessage.value = 'Unesite ime i prezime.'
    return
  }
  if (!form.phone.trim() || !phoneRegex.test(form.phone.trim())) {
    status.value = 'error'
    errorMessage.value = 'Unesite ispravan broj telefona.'
    return
  }
  if (!form.email.trim() || !emailRegex.test(form.email.trim())) {
    status.value = 'error'
    errorMessage.value = 'Unesite ispravnu adresu e-pošte.'
    return
  }
  if (!form.address.trim()) {
    status.value = 'error'
    errorMessage.value = 'Unesite adresu dostave.'
    return
  }
  if (!form.city.trim()) {
    status.value = 'error'
    errorMessage.value = 'Unesite grad.'
    return
  }
  if (!form.postal.trim()) {
    status.value = 'error'
    errorMessage.value = 'Unesite poštanski broj.'
    return
  }

  status.value = 'loading'

  try {
    const res = await $fetch<{ ok: boolean, orderId?: string }>('/api/order', {
      method: 'POST',
      body: {
        customer: {
          name: form.name,
          phone: form.phone,
          email: form.email,
          address: form.address,
          city: form.city,
          postal: form.postal,
          note: form.note,
        },
        items: items.value.map(i => ({ slug: i.slug, title: i.title, price: i.price, quantity: i.quantity })),
        totals: {
          subtotal: total.value,
          shipping: shipping.value,
          grandTotal: grandTotal.value,
        },
      },
    })

    if (res.ok) {
      clear()
      status.value = 'success'
      router.push(`/hvala?id=${res.orderId ?? ''}`)
    }
    else {
      throw new Error('Nepoznata greška')
    }
  }
  catch (e: any) {
    status.value = 'error'
    errorMessage.value = e?.data?.statusMessage || e?.message || 'Došlo je do greške. Pokušajte ponovo.'
  }
}
</script>

<template>
  <div class="bg-cream">
    <!-- Page header -->
    <section class="bg-gradient-to-b from-sky/30 to-cream py-12 lg:py-16">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <nav class="mb-4 flex items-center gap-2 text-sm text-navy/50" aria-label="Breadcrumb">
          <NuxtLink to="/" class="transition-colors hover:text-blue">Početna</NuxtLink>
          <span aria-hidden="true">›</span>
          <NuxtLink to="/korpa" class="transition-colors hover:text-blue">Korpa</NuxtLink>
          <span aria-hidden="true">›</span>
          <span class="font-medium text-navy">Porudžbina</span>
        </nav>
        <h1 class="font-unbounded text-4xl font-extrabold text-navy md:text-5xl">
          Podaci za dostavu
        </h1>
        <p class="mt-3 text-lg text-navy/70">
          Popunite podatke ispod i mi ćemo vas kontaktirati radi potvrde porudžbine.
          Plaćanje se vrši pri preuzimanju.
        </p>
      </div>
    </section>

    <section class="py-12 lg:py-16">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="grid gap-10 lg:grid-cols-5 lg:gap-12">
          <!-- Form -->
          <div class="lg:col-span-3">
            <div class="rounded-3xl border-2 border-cloud/40 bg-white p-8 shadow-sm">
              <h2 class="font-unbounded mb-2 text-2xl font-bold text-navy">
                Vaši podaci
              </h2>
              <p class="mb-6 text-navy/60">
                Sva polja sa * su obavezna.
              </p>

              <form class="space-y-5" @submit.prevent="handleSubmit">
                <!-- Name -->
                <div>
                  <label for="name" class="mb-1.5 block text-sm font-semibold text-navy">
                    Ime i prezime *
                  </label>
                  <input
                    id="name"
                    v-model="form.name"
                    type="text"
                    autocomplete="name"
                    placeholder="Marko Marković"
                    class="w-full rounded-xl border-2 border-cloud/50 bg-cream px-4 py-3 text-navy placeholder:text-navy/40 focus:border-blue focus:outline-none focus:ring-2 focus:ring-blue/20"
                    :disabled="status === 'loading'"
                  >
                </div>

                <!-- Phone + Email -->
                <div class="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label for="phone" class="mb-1.5 block text-sm font-semibold text-navy">
                      Telefon *
                    </label>
                    <input
                      id="phone"
                      v-model="form.phone"
                      type="tel"
                      inputmode="tel"
                      autocomplete="tel"
                      placeholder="+381 60 123 4567"
                      class="w-full rounded-xl border-2 border-cloud/50 bg-cream px-4 py-3 text-navy placeholder:text-navy/40 focus:border-blue focus:outline-none focus:ring-2 focus:ring-blue/20"
                      :disabled="status === 'loading'"
                    >
                  </div>
                  <div>
                    <label for="email" class="mb-1.5 block text-sm font-semibold text-navy">
                      E-pošta *
                    </label>
                    <input
                      id="email"
                      v-model="form.email"
                      type="email"
                      inputmode="email"
                      autocomplete="email"
                      placeholder="marko@primer.rs"
                      class="w-full rounded-xl border-2 border-cloud/50 bg-cream px-4 py-3 text-navy placeholder:text-navy/40 focus:border-blue focus:outline-none focus:ring-2 focus:ring-blue/20"
                      :disabled="status === 'loading'"
                    >
                  </div>
                </div>

                <!-- Address -->
                <div>
                  <label for="address" class="mb-1.5 block text-sm font-semibold text-navy">
                    Adresa *
                  </label>
                  <input
                    id="address"
                    v-model="form.address"
                    type="text"
                    autocomplete="street-address"
                    placeholder="Bulevar oslobođenja 12"
                    class="w-full rounded-xl border-2 border-cloud/50 bg-cream px-4 py-3 text-navy placeholder:text-navy/40 focus:border-blue focus:outline-none focus:ring-2 focus:ring-blue/20"
                    :disabled="status === 'loading'"
                  >
                </div>

                <!-- City + Postal -->
                <div class="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label for="city" class="mb-1.5 block text-sm font-semibold text-navy">
                      Grad *
                    </label>
                    <input
                      id="city"
                      v-model="form.city"
                      type="text"
                      autocomplete="address-level2"
                      placeholder="Novi Sad"
                      class="w-full rounded-xl border-2 border-cloud/50 bg-cream px-4 py-3 text-navy placeholder:text-navy/40 focus:border-blue focus:outline-none focus:ring-2 focus:ring-blue/20"
                      :disabled="status === 'loading'"
                    >
                  </div>
                  <div>
                    <label for="postal" class="mb-1.5 block text-sm font-semibold text-navy">
                      Poštanski broj *
                    </label>
                    <input
                      id="postal"
                      v-model="form.postal"
                      type="text"
                      inputmode="numeric"
                      autocomplete="address-level3"
                      placeholder="21000"
                      class="w-full rounded-xl border-2 border-cloud/50 bg-cream px-4 py-3 text-navy placeholder:text-navy/40 focus:border-blue focus:outline-none focus:ring-2 focus:ring-blue/20"
                    >
                  </div>
                </div>

                <!-- Note -->
                <div>
                  <label for="note" class="mb-1.5 block text-sm font-semibold text-navy">
                    Napomena (opciono)
                  </label>
                  <textarea
                    id="note"
                    v-model="form.note"
                    rows="3"
                    placeholder="Npr. pozvoni pre dostave, podatci o detetu..."
                    class="w-full resize-y rounded-xl border-2 border-cloud/50 bg-cream px-4 py-3 text-navy placeholder:text-navy/40 focus:border-blue focus:outline-none focus:ring-2 focus:ring-blue/20"
                    :disabled="status === 'loading'"
                  />
                </div>

                <!-- Error -->
                <p v-if="status === 'error'" class="text-sm text-coral" role="alert">
                  {{ errorMessage }}
                </p>

                <!-- Submit -->
                <button
                  type="submit"
                  class="inline-flex w-full items-center justify-center gap-2 rounded-full bg-blue px-8 py-3.5 font-semibold text-white shadow-md transition-all hover:bg-navy hover:shadow-lg active:scale-[0.98] disabled:opacity-60"
                  :disabled="status === 'loading'"
                >
                  <Icon v-if="status === 'loading'" name="lucide:loader-2" class="size-5 animate-spin" />
                  <span>{{ status === 'loading' ? 'Slanje porudžbine...' : 'Naruči' }}</span>
                </button>

                <p class="text-center text-sm text-navy/50">
                  Plaćanje se vrši pouzećem (pouzeće) pri preuzimanju.
                </p>
              </form>
            </div>
          </div>

          <!-- Order summary -->
          <div class="lg:col-span-2">
            <div class="lg:sticky lg:top-32">
              <div class="rounded-3xl border-2 border-cloud/40 bg-white p-6 shadow-sm">
                <h2 class="font-unbounded mb-6 text-xl font-bold text-navy">
                  Vaša porudžbina
                </h2>

                <!-- Items -->
                <ul class="space-y-4">
                  <li
                    v-for="item in items"
                    :key="item.slug"
                    class="flex items-center gap-4"
                  >
                    <NuxtLink :to="`/knjige/${item.slug}`" class="shrink-0">
                      <div class="overflow-hidden rounded-lg">
                        <NuxtImg
                          :src="`/${getBook(item.slug)?.img ?? ''}`"
                          :alt="item.title"
                          class="h-16 w-14 object-cover"
                          width="56"
                          height="64"
                          format="webp"
                          loading="lazy"
                        />
                      </div>
                    </NuxtLink>
                    <div class="min-w-0 flex-1">
                      <p class="truncate font-semibold text-navy">
                        {{ item.title }}
                      </p>
                      <p class="text-sm text-navy/50">
                        {{ item.quantity }} × {{ item.price.toLocaleString('sr-RS') }} RSD
                      </p>
                    </div>
                    <span class="font-semibold text-navy">
                      {{ (item.price * item.quantity).toLocaleString('sr-RS') }}
                    </span>
                  </li>
                </ul>

                <div class="my-5 border-t border-cloud/40" />

                <!-- Totals -->
                <dl class="space-y-3 text-navy/70">
                  <div class="flex justify-between">
                    <dt>Knjige</dt>
                    <dd class="font-medium text-navy">{{ total.toLocaleString('sr-RS') }} RSD</dd>
                  </div>
                  <div class="flex justify-between">
                    <dt>Dostava</dt>
                    <dd class="font-medium" :class="shipping === 0 ? 'text-mint' : 'text-navy'">
                      {{ shipping === 0 ? 'Besplatno' : `${shipping.toLocaleString('sr-RS')} RSD` }}
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

                <div class="mt-6 flex items-start gap-3 rounded-2xl bg-sky/20 p-4 text-sm text-navy/70">
                  <Icon name="lucide:info" class="size-5 shrink-0 text-blue" />
                  <span>Nakon slanja porudžbine javićemo vam se telefonom ili emailom radi potvrde. Plaćanje pri preuzimanju.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
