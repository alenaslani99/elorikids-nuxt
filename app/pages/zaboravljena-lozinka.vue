<script setup lang="ts">
useHead({
  title: 'Zaboravljena lozinka - elorikids',
  meta: [
    { name: 'description', content: 'Resetujte vašu elorikids lozinku - unesite adresu e-pošte i poslaćemo vam link za reset.' },
    { name: 'robots', content: 'noindex, nofollow' },
  ],
})

const form = reactive({
  email: '',
})

const status = ref<'idle' | 'loading' | 'success' | 'error'>('idle')
const errorMessage = ref('')

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

async function handleSubmit() {
  errorMessage.value = ''

  if (!form.email.trim()) {
    status.value = 'error'
    errorMessage.value = 'Unesite adresu e-pošte.'
    return
  }

  if (!emailRegex.test(form.email.trim())) {
    status.value = 'error'
    errorMessage.value = 'Unesite ispravnu adresu e-pošte.'
    return
  }

  status.value = 'loading'

  try {
    await $fetch('/api/contact', {
      method: 'POST',
      body: {
        name: form.email,
        email: form.email,
        message: 'Zahtev za reset lozinke',
      },
    })
    status.value = 'success'
  }
  catch {
    status.value = 'error'
    errorMessage.value = 'Došlo je do greške. Pokušajte ponovo.'
  }
}

// Clear stale status as soon as the user edits the email
watch(form, () => {
  if (status.value === 'error' || status.value === 'success') {
    status.value = 'idle'
    errorMessage.value = ''
  }
})
</script>

<template>
  <div class="bg-cream">
    <!-- Page header -->
    <section class="bg-gradient-to-b from-sky/30 to-cream py-12 lg:py-16">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <AppBreadcrumb :items="[{ label: 'Početna', to: '/' }, { label: 'Zaboravljena lozinka' }]" nav-class="mb-4" />
        <h1 class="font-unbounded text-4xl font-extrabold text-navy md:text-5xl">
          Zaboravljena lozinka
        </h1>
      </div>
    </section>

    <section class="py-12 lg:py-16">
      <div class="mx-auto max-w-md px-4 sm:px-6 lg:px-8">
        <div class="rounded-3xl border-2 border-cloud/40 bg-white p-8 shadow-sm">
          <div class="mb-6 text-center">
            <div class="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-yellow/15">
              <Icon name="lucide:key-round" class="size-8 text-yellow" />
            </div>
            <h2 class="font-unbounded text-2xl font-bold text-navy">
              Resetujte lozinku
            </h2>
            <p class="mt-2 text-navy/60">
              Unesite vašu adresu e-pošte i poslaćemo vam link za resetovanje lozinke.
            </p>
          </div>

          <form class="space-y-5" @submit.prevent="handleSubmit">
            <!-- Email -->
            <div>
              <label for="email" class="mb-1.5 block text-sm font-semibold text-navy">
                Adresa e-pošte
              </label>
              <input
                id="email"
                v-model="form.email"
                type="email"
                inputmode="email"
                autocomplete="email"
                required
                placeholder="marko@primer.rs"
                class="w-full rounded-xl border-2 border-cloud/50 bg-cream px-4 py-3 text-navy placeholder:text-navy/40 focus:border-blue focus:outline-none focus:ring-2 focus:ring-blue/20"
                :disabled="status === 'loading'"
              >
            </div>

            <!-- Status message (reserved height prevents layout shift) -->
            <div class="min-h-8">
              <p v-if="status === 'error'" class="py-1 text-sm font-medium text-coral" role="alert">
                {{ errorMessage }}
              </p>
              <p v-else-if="status === 'success'" class="py-1 text-sm font-medium text-mint" role="status">
                Link za reset je poslat! Proverite vašu e-poštu.
              </p>
            </div>

            <!-- Submit -->
            <button
              type="submit"
              class="inline-flex w-full items-center justify-center gap-2 rounded-full bg-blue px-8 py-3.5 font-semibold text-white shadow-md transition-all hover:bg-navy hover:shadow-lg active:scale-[0.98] disabled:opacity-60"
              :disabled="status === 'loading'"
            >
              <Icon v-if="status === 'loading'" name="lucide:loader-2" class="size-5 animate-spin" />
              <span>{{ status === 'loading' ? 'Slanje...' : 'Pošalji link' }}</span>
            </button>
          </form>

          <!-- Back to login -->
          <p class="mt-6 text-center text-sm text-navy/60">
            Setili ste se lozinke?
            <NuxtLink to="/prijava" class="font-semibold text-blue transition-colors hover:text-navy">
              Nazad na prijavu
            </NuxtLink>
          </p>
        </div>
      </div>
    </section>
  </div>
</template>
