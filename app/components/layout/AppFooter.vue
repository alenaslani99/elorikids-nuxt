<script setup lang="ts">
const year = new Date().getFullYear()

const columns = [
  {
    title: 'Kupovina',
    links: [
      { label: 'Slikovnice', to: '/#categories' },
      { label: 'Aktivne knjige', to: '/#categories' },
      { label: 'Školski pribor', to: '/#categories' },
      { label: 'Likovna oprema', to: '/#categories' },
    ],
  },
  {
    title: 'Kompanija',
    links: [
      { label: 'O nama', to: '/kontakt' },
      { label: 'Kontakt', to: '/kontakt' },
      { label: 'Poslovi', to: '/kontakt' },
      { label: 'Blog', to: '/kontakt' },
    ],
  },
  {
    title: 'Podrška',
    links: [
      { label: 'Dostava', to: '/prijava' },
      { label: 'Povrat robe', to: '/registracija' },
      { label: 'Česta pitanja', to: '/#categories' },
      { label: 'Pratite porudžbinu', to: '/#categories' },
    ],
  },
]
</script>

<template>
  <footer class="bg-navy-dark text-cloud">
    <div class="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
      <div class="grid grid-cols-2 gap-8 md:grid-cols-5">
        <div class="col-span-2">
          <NuxtLink to="/" class="font-unbounded text-2xl font-extrabold tracking-tight text-white">
            elori<span class="text-yellow">kids</span>
          </NuxtLink>
          <p class="mt-4 max-w-xs text-sm leading-relaxed text-cloud/70">
            Dečije knjige i školski pribor koji bude radoznalost i
            čine učenje zabavnim.
          </p>
          <div class="mt-6 flex gap-3">
            <a href="#" aria-label="Facebook" class="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-blue hover:text-white">
              <Icon name="lucide:facebook" class="size-4" />
            </a>
            <a href="#" aria-label="Instagram" class="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-blue hover:text-white">
              <Icon name="lucide:instagram" class="size-4" />
            </a>
            <a href="#" aria-label="Twitter" class="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-blue hover:text-white">
              <Icon name="lucide:twitter" class="size-4" />
            </a>
          </div>
        </div>

        <div v-for="col in columns" :key="col.title">
          <h3 class="text-sm font-semibold text-white">{{ col.title }}</h3>
          <ul class="mt-4 space-y-3">
            <li v-for="link in col.links" :key="link.label">
              <NuxtLink :to="link.to" active-class="text-sky" class="text-sm text-cloud/70 transition-colors hover:text-sky">{{ link.label }}</NuxtLink>
            </li>
          </ul>
        </div>
      </div>

      <div class="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-8 sm:flex-row">
        <p class="text-sm text-cloud/60">
          © {{ year }} elorikids. Sva prava zadržana.
        </p>
        <div class="flex gap-6">
          <NuxtLink to="/politika-privatnosti" class="text-sm text-cloud/60 transition-colors hover:text-sky">Politika privatnosti</NuxtLink>
          <NuxtLink to="/uslovi-koriscenja" class="text-sm text-cloud/60 transition-colors hover:text-sky">Uslovi korišćenja</NuxtLink>
        </div>
      </div>
    </div>
  </footer>
</template>
