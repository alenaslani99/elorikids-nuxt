<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{
  error: NuxtError
}>()

const is404 = computed(() => props.error?.statusCode === 404)

useHead({
  title: is404.value ? 'Stranica nije pronađena - elorikids' : 'Greška - elorikids',
  meta: [
    { name: 'robots', content: 'noindex, nofollow' },
  ],
})

function goHome() {
  clearError({ redirect: '/' })
}
</script>

<template>
  <div class="flex min-h-screen flex-col bg-cream">
    <!-- Minimal header -->
    <header class="border-b-2 border-cloud/40 bg-white">
      <div class="mx-auto flex max-w-7xl items-center px-4 py-4 sm:px-6 lg:px-8">
        <NuxtLink to="/" class="flex items-center gap-2">
          <span class="font-unbounded text-xl font-extrabold text-navy">elorikids</span>
        </NuxtLink>
      </div>
    </header>

    <main class="flex flex-1 items-center justify-center px-4 py-16">
      <div class="max-w-md text-center">
        <!-- Big status code -->
        <p class="font-unbounded text-7xl font-extrabold text-navy/20 sm:text-8xl">
          {{ error?.statusCode || 500 }}
        </p>

        <div class="mx-auto mt-4 flex size-20 items-center justify-center rounded-full bg-sky/30">
          <Icon
            :name="is404 ? 'lucide:compass' : 'lucide:triangle-alert'"
            class="size-10 text-navy/40"
          />
        </div>

        <h1 class="font-unbounded mt-6 text-2xl font-bold text-navy">
          {{ is404 ? 'Stranica nije pronađena' : 'Nešto je pošlo po zlu' }}
        </h1>

        <p class="mt-3 text-navy/60">
          {{ is404
            ? 'Stranica koju tražite ne postoji ili je premeštena.'
            : 'Došlo je do greške. Pokušajte ponovo kasnije.'
          }}
        </p>

        <button
          type="button"
          class="mt-8 inline-flex items-center gap-2 rounded-full bg-blue px-8 py-3.5 font-semibold text-white shadow-md transition-all hover:bg-navy hover:shadow-lg active:scale-[0.98]"
          @click="goHome"
        >
          <Icon name="lucide:home" class="size-5" />
          Nazad na početnu
        </button>
      </div>
    </main>
  </div>
</template>
