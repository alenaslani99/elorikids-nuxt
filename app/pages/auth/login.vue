<script setup lang="ts">
useHead({
  title: 'Prijava - elorikids',
  meta: [
    { name: 'description', content: 'Prijavite se na svoj elorikids nalog putem Google naloga da biste brže naručivali i pratili porudžbine.' },
    { name: 'robots', content: 'noindex, nofollow' },
  ],
})

const route = useRoute()

// Where to land after sign-in (the server only accepts same-site paths)
const signInUrl = computed(() => {
  const redirect = route.query.redirect
  return googleSignInUrl(typeof redirect === 'string' ? redirect : undefined)
})

const ERROR_MESSAGES: Record<string, string> = {
  cancelled: 'Prijava je otkazana. Pokušajte ponovo.',
  state: 'Prijava je istekla. Pokušajte ponovo.',
  rate: 'Preveliki broj pokušaja. Pokušajte ponovo za nekoliko minuta.',
  config: 'Prijava trenutno nije dostupna. Pokušajte kasnije.',
  google: 'Prijava putem Google naloga nije uspela. Pokušajte ponovo.',
}

const errorMessage = computed(() => {
  const code = route.query.error
  if (typeof code !== 'string') return ''
  return ERROR_MESSAGES[code] ?? ERROR_MESSAGES.google!
})
</script>

<template>
  <div class="bg-cream">
    <AppPageHeader title="Prijava" :breadcrumb-items="[{ label: 'Početna', to: '/' }, { label: 'Prijava' }]" />

    <section class="py-12 lg:py-16">
      <div class="mx-auto max-w-md px-4 sm:px-6 lg:px-8">
        <div class="rounded-3xl border-2 border-cloud/40 bg-white p-8 shadow-sm">
          <div class="mb-6 text-center">
            <div class="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-blue/10">
              <Icon name="lucide:user" class="size-8 text-blue" />
            </div>
            <h2 class="font-unbounded text-2xl font-bold text-navy">
              Dobrodošli!
            </h2>
            <p class="mt-2 text-navy/60">
              Prijavite se da biste brže naručivali i pratili porudžbine.
            </p>
          </div>

          <!-- Full-page navigation to the API route (not a client route) -->
          <a
            :href="signInUrl"
            class="flex w-full items-center justify-center gap-3 rounded-full border-2 border-cloud bg-white px-6 py-3 font-semibold text-navy transition-colors hover:border-blue hover:bg-sky/10"
          >
            <svg class="size-5 shrink-0" viewBox="0 0 48 48" aria-hidden="true">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
            </svg>
            Nastavi sa Google nalogom
          </a>

          <!-- Error (always reserved to avoid CLS) -->
          <p
            class="mt-4 min-h-5 text-center text-sm text-coral"
            role="alert"
          >
            {{ errorMessage }}
          </p>

          <p class="mt-4 text-center text-sm text-navy/60">
            Nemate nalog? Kreira se automatski pri prvoj prijavi. Lozinka vam nije potrebna.
          </p>
        </div>
      </div>
    </section>
  </div>
</template>
