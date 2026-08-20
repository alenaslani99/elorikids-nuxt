<script setup lang="ts">
const email = ref('')
const status = ref<'idle' | 'loading' | 'success' | 'error'>('idle')
const errorMessage = ref('')

async function handleSubmit() {
  if (!email.value) {
    status.value = 'error'
    errorMessage.value = 'Unesite adresu e-pošte.'
    return
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email.value)) {
    status.value = 'error'
    errorMessage.value = 'Unesite ispravnu adresu e-pošte.'
    return
  }

  status.value = 'loading'
  errorMessage.value = ''

  try {
    await $fetch('/api/newsletter', {
      method: 'POST',
      body: { email: email.value },
    })
    status.value = 'success'
  }
  catch {
    status.value = 'error'
    errorMessage.value = 'Došlo je do greške. Pokušajte ponovo.'
  }
}

// Clear stale status as soon as the user edits the email
watch(email, () => {
  if (status.value === 'error' || status.value === 'success') {
    status.value = 'idle'
    errorMessage.value = ''
  }
})
</script>

<template>
  <section class="relative overflow-hidden bg-gradient-to-br from-navy to-navy-dark py-16 lg:py-20">
    <!-- Decorative accents -->
    <div class="pointer-events-none absolute -left-20 -top-20 size-64 rounded-full bg-blue/10 blur-3xl" />
    <div class="pointer-events-none absolute -bottom-20 -right-20 size-64 rounded-full bg-yellow/10 blur-3xl" />

    <div class="relative mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
      <div class="mx-auto mb-6 flex size-14 items-center justify-center rounded-2xl bg-yellow/20">
        <Icon name="lucide:mail" class="size-7 text-yellow" />
      </div>

      <h2 class="font-unbounded text-3xl font-extrabold text-white md:text-4xl">
        Budite u toku
      </h2>
      <p class="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-cloud/80">
        Prijavite se na našu newsletter listu i budite prvi koji saznaje za
        nove knjige, popuste i besplatne aktivnosti za decu.
      </p>

      <!-- Form -->
      <form
        class="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row"
        @submit.prevent="handleSubmit"
      >
        <input
          v-model="email"
          type="email"
          inputmode="email"
          autocomplete="email"
          required
          placeholder="Vaša adresa e-pošte"
          aria-label="Adresa e-pošte"
          class="w-full rounded-full border border-cloud/30 bg-white/10 px-6 py-3 text-white placeholder:text-cloud/50 focus:border-yellow focus:outline-none focus:ring-2 focus:ring-yellow/40"
          :disabled="status === 'loading'"
        >
        <button
          type="submit"
          class="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-yellow px-6 py-3 font-semibold text-navy transition-colors hover:bg-yellow/90 disabled:opacity-60"
          :disabled="status === 'loading'"
        >
          <Icon v-if="status === 'loading'" name="lucide:loader-2" class="size-5 animate-spin" />
          <span>{{ status === 'loading' ? 'Slanje...' : 'Prijavi se' }}</span>
        </button>
      </form>

      <!-- Status message (reserved height prevents layout shift) -->
      <div class="min-h-8">
        <p v-if="status === 'error'" class="mt-3 text-sm text-coral" role="alert">
          {{ errorMessage }}
        </p>
        <p v-else-if="status === 'success'" class="mt-3 text-sm font-medium text-mint" role="status">
          Hvala! Proverite vašu e-poštu da potvrdite prijavu.
        </p>
      </div>

      <!-- Privacy note -->
      <p class="mt-4 text-xs text-cloud/50">
        Bez spama. Odjava u svakom trenutku. Poštujemo vašu privatnost.
      </p>
    </div>
  </section>
</template>
