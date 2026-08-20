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

const { status, errorMessage, setError, clearStale } = useFormStatus()

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

async function handleSubmit() {
  errorMessage.value = ''

  if (!form.email.trim()) {
    setError('Unesite adresu e-pošte.')
    return
  }

  if (!emailRegex.test(form.email.trim())) {
    setError('Unesite ispravnu adresu e-pošte.')
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
    setError('Došlo je do greške. Pokušajte ponovo.')
  }
}

// Clear stale status as soon as the user edits the email
watch(form, () => clearStale())
</script>

<template>
  <div class="bg-cream">
    <AppPageHeader title="Zaboravljena lozinka" :breadcrumb-items="[{ label: 'Početna', to: '/' }, { label: 'Zaboravljena lozinka' }]" />

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
            <AppInput
              id="email"
              v-model="form.email"
              label="Adresa e-pošte"
              type="email"
              inputmode="email"
              autocomplete="email"
              required
              placeholder="marko@primer.rs"
              :disabled="status === 'loading'"
            />

            <!-- Status message (reserved height prevents layout shift) -->
            <div class="min-h-8">
              <p v-if="status === 'error'" class="py-1 text-sm font-medium text-coral" role="alert">
                {{ errorMessage }}
              </p>
              <p v-else-if="status === 'success'" class="py-1 text-sm font-medium text-mint" role="status">
                Link za reset je poslat! Proverite vašu e-poštu.
              </p>
            </div>

            <AppSubmitButton
              :loading="status === 'loading'"
              label="Pošalji link"
              loading-label="Slanje..."
            />
          </form>

          <!-- Back to login -->
          <p class="mt-6 text-center text-sm text-navy/60">
            Setili ste se lozinke?
            <NuxtLink to="/auth/login" class="font-semibold text-blue transition-colors hover:text-navy">
              Nazad na prijavu
            </NuxtLink>
          </p>
        </div>
      </div>
    </section>
  </div>
</template>
