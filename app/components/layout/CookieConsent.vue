<script setup lang="ts">
// Persists the visitor's choice for 1 year. `useCookie` is SSR-safe,
// so there is no hydration mismatch and the bar stays hidden on return visits.
const consent = useCookie<'accepted' | 'declined' | null>('cookie-consent', {
  maxAge: 60 * 60 * 24 * 365,
  sameSite: 'lax',
})

// Small mount delay so the bar slides in after first paint rather than
// appearing as part of the initial SSR payload.
const mounted = ref(false)
onMounted(() => {
  mounted.value = true
})

const visible = computed(() =>
  mounted.value && consent.value !== 'accepted' && consent.value !== 'declined',
)

function accept() {
  consent.value = 'accepted'
}

function decline() {
  consent.value = 'declined'
}
</script>

<template>
  <ClientOnly>
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="translate-y-full opacity-0"
      enter-to-class="translate-y-0 opacity-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="translate-y-0 opacity-100"
      leave-to-class="translate-y-full opacity-0"
    >
      <div
        v-if="visible"
        class="fixed inset-x-0 bottom-0 z-50 px-4 pb-4 sm:px-6 sm:pb-6"
        role="dialog"
        aria-live="polite"
        aria-label="Obaveštenje o kolačićima"
      >
        <div class="mx-auto max-w-5xl rounded-2xl border-2 border-cloud/40 bg-white p-4 shadow-lg sm:p-5">
          <div class="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <div class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-yellow/20">
              <Icon name="lucide:cookie" class="size-5 text-yellow" />
            </div>

            <p class="flex-1 text-sm leading-relaxed text-navy/70">
              Koristimo kolačiće radi pravilnog funkcionisanja sajta i poboljšanja korisničkog iskustva.
              Saznajte više u
              <NuxtLink to="/legal/privacy-policy#kolacici" class="font-semibold text-blue hover:text-navy">
                Politici privatnosti
              </NuxtLink>.
            </p>

            <div class="flex w-full shrink-0 items-center gap-3 sm:w-auto">
              <button
                type="button"
                class="flex-1 rounded-full px-5 py-2.5 text-sm font-semibold text-navy/60 transition-colors hover:text-navy sm:flex-none"
                @click="decline"
              >
                Odbij
              </button>
              <button
                type="button"
                class="flex-1 rounded-full bg-blue px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-navy active:scale-[0.98] sm:flex-none"
                @click="accept"
              >
                Prihvatam
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </ClientOnly>
</template>
