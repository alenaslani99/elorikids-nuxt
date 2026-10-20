<script setup lang="ts">
const { choice, decided, settingsOpen, save, acceptAll, rejectAll, openSettings } = useConsent()

// Small mount delay so the bar slides in after first paint rather than
// appearing as part of the initial SSR payload.
const mounted = ref(false)
onMounted(() => {
  mounted.value = true
})

const bannerVisible = computed(() => mounted.value && !decided.value && !settingsOpen.value)

// Draft toggles for the settings panel - only applied on save.
const draft = reactive({ analytics: false, marketing: false })
watch(settingsOpen, (open) => {
  if (!open) return
  draft.analytics = choice.value?.analytics ?? false
  draft.marketing = choice.value?.marketing ?? false
})

const categories = [
  {
    key: 'analytics' as const,
    icon: 'lucide:bar-chart-3',
    title: 'Analitički kolačići',
    text: 'Pomažu nam da razumemo kako posetioci koriste sajt (posećene stranice, izvor posete), kako bismo ga poboljšali. Google Analytics.',
  },
  {
    key: 'marketing' as const,
    icon: 'lucide:megaphone',
    title: 'Marketinški kolačići',
    text: 'Omogućuju merenje uspešnosti oglasa i prikazivanje relevantnih oglasa na Facebook-u i Instagram-u. Meta Pixel.',
  },
]

function closeSettings() {
  settingsOpen.value = false
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && settingsOpen.value) closeSettings()
}
onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))
</script>

<template>
  <ClientOnly>
    <!-- Bottom banner (first visit) -->
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="translate-y-full opacity-0"
      enter-to-class="translate-y-0 opacity-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="translate-y-0 opacity-100"
      leave-to-class="translate-y-full opacity-0"
    >
      <div
        v-if="bannerVisible"
        class="fixed inset-x-0 bottom-0 z-50 px-4 pb-4 sm:px-6 sm:pb-6"
        role="dialog"
        aria-live="polite"
        aria-label="Obaveštenje o kolačićima"
      >
        <div class="mx-auto max-w-5xl rounded-2xl border-2 border-cloud/40 bg-white p-4 shadow-lg sm:p-5">
          <div class="flex flex-col items-start gap-4 lg:flex-row lg:items-center">
            <div class="flex flex-1 items-start gap-4">
              <div class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-yellow/20">
                <Icon name="lucide:cookie" class="size-5 text-yellow" />
              </div>

              <p class="flex-1 text-sm leading-relaxed text-navy/70">
                Koristimo neophodne kolačiće za rad sajta, a uz vašu saglasnost i analitičke i marketinške
                kolačiće. Izbor možete promeniti u bilo kom trenutku. Saznajte više u
                <NuxtLink to="/legal/privacy-policy#kolacici" class="font-semibold text-blue hover:text-navy">
                  Politici privatnosti
                </NuxtLink>.
              </p>
            </div>

            <div class="flex w-full shrink-0 flex-wrap items-center gap-2 sm:flex-nowrap lg:w-auto">
              <button
                type="button"
                class="flex-1 rounded-full px-4 py-2.5 text-sm font-semibold text-navy/60 transition-colors hover:text-navy sm:flex-none"
                @click="openSettings"
              >
                Podešavanja
              </button>
              <button
                type="button"
                class="flex-1 rounded-full border-2 border-cloud px-5 py-2 text-sm font-semibold text-navy transition-colors hover:border-blue hover:text-blue sm:flex-none"
                @click="rejectAll"
              >
                Odbij sve
              </button>
              <button
                type="button"
                class="w-full rounded-full bg-blue px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-navy active:scale-[0.98] sm:w-auto"
                @click="acceptAll"
              >
                Prihvati sve
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Settings panel (from banner or footer link) -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="settingsOpen"
        class="fixed inset-0 z-[60] flex items-end justify-center bg-navy/40 p-4 sm:items-center"
        @click.self="closeSettings"
      >
        <div
          class="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-5 shadow-xl sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="cookie-settings-title"
        >
          <div class="flex items-start justify-between gap-4">
            <h2 id="cookie-settings-title" class="font-unbounded text-xl font-bold text-navy">
              Podešavanja kolačića
            </h2>
            <button
              type="button"
              class="-m-1 rounded-full p-1 text-navy/50 transition-colors hover:text-navy"
              aria-label="Zatvori"
              @click="closeSettings"
            >
              <Icon name="lucide:x" class="size-5" />
            </button>
          </div>
          <p class="mt-2 text-sm leading-relaxed text-navy/60">
            Izaberite koje kolačiće dozvoljavate. Neophodni kolačići su uvek uključeni jer bez njih korpa
            i prijava ne rade.
          </p>

          <ul class="mt-5 space-y-3">
            <li class="flex items-start gap-3 rounded-xl border-2 border-cloud/40 p-4">
              <Icon name="lucide:settings" class="mt-0.5 size-5 shrink-0 text-blue" />
              <div class="flex-1">
                <p class="font-semibold text-navy">Neophodni kolačići</p>
                <p class="mt-1 text-sm text-navy/60">
                  Korpa, sačuvane knjige, prijava i pamćenje ovog izbora.
                </p>
              </div>
              <span class="shrink-0 text-xs font-semibold text-mint">Uvek aktivni</span>
            </li>

            <li
              v-for="c in categories"
              :key="c.key"
              class="rounded-xl border-2 border-cloud/40 p-4"
            >
              <label class="flex cursor-pointer items-start gap-3">
                <Icon :name="c.icon" class="mt-0.5 size-5 shrink-0 text-blue" />
                <div class="flex-1">
                  <p class="font-semibold text-navy">{{ c.title }}</p>
                  <p class="mt-1 text-sm text-navy/60">{{ c.text }}</p>
                </div>
                <input
                  v-model="draft[c.key]"
                  type="checkbox"
                  role="switch"
                  class="peer sr-only"
                >
                <span
                  class="relative mt-0.5 h-6 w-11 shrink-0 rounded-full bg-cloud transition-colors peer-checked:bg-blue peer-focus-visible:ring-2 peer-focus-visible:ring-blue peer-focus-visible:ring-offset-2 after:absolute after:left-0.5 after:top-0.5 after:size-5 after:rounded-full after:bg-white after:shadow after:transition-transform peer-checked:after:translate-x-5"
                  aria-hidden="true"
                />
              </label>
            </li>
          </ul>

          <div class="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              class="rounded-full border-2 border-cloud px-5 py-2 text-sm font-semibold text-navy transition-colors hover:border-blue hover:text-blue"
              @click="save(draft)"
            >
              Sačuvaj izbor
            </button>
            <button
              type="button"
              class="rounded-full bg-blue px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-navy active:scale-[0.98]"
              @click="acceptAll"
            >
              Prihvati sve
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </ClientOnly>
</template>
