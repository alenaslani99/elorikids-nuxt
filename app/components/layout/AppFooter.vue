<script setup lang="ts">
const year = new Date().getFullYear()

const columns = [
  {
    title: 'Kupovina',
    links: [
      { label: 'Prvi Koraci', to: '/books/prvi-koraci' },
      { label: 'Učimo kroz igru', to: '/books/ucimo-kroz-igru' },
      { label: 'Priprema za školu', to: '/books/priprema-za-skolu' },
    ],
  },
  {
    title: 'Kompanija',
    links: [
      { label: 'O nama', to: '/about-us' },
      { label: 'Kontakt', to: '/legal/contact' },
      { label: 'Blog', to: '/blog' },
    ],
  },
  {
    title: 'Podrška',
    links: [
      { label: 'Česta pitanja', to: '/faq' },
      { label: 'Pratite porudžbinu', to: '/track-order' },
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
            <a href="https://instagram.com/elorikids" target="_blank" rel="noopener" aria-label="Instagram" class="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-blue hover:text-white">
              <Icon name="lucide:instagram" class="size-4" />
            </a>
            <a href="https://www.facebook.com/people/Elori-Kids-aktivnosti-za-decu/61586359117432/" target="_blank" rel="noopener" aria-label="Facebook" class="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-blue hover:text-white">
              <Icon name="lucide:facebook" class="size-4" />
            </a>
            <a href="https://www.tiktok.com/@elorikids" target="_blank" rel="noopener" aria-label="TikTok" class="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-blue hover:text-white">
              <svg viewBox="0 0 24 24" fill="currentColor" class="size-4" aria-hidden="true">
                <path d="M19.589 6.825a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.167a2.865 2.865 0 0 1-5.314 1.445 2.864 2.864 0 0 1 2.441-4.373c.3 0 .594.046.873.135V9.02a6.146 6.146 0 0 0-.873-.063A6.31 6.31 0 0 0 3.78 17.29a6.31 6.31 0 0 0 5.721 3.71c3.41 0 6.166-2.764 6.166-6.166V8.726a8.18 8.18 0 0 0 4.782 1.526V6.825h-.86z"/>
              </svg>
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
          <NuxtLink to="/legal/privacy-policy" class="text-sm text-cloud/60 transition-colors hover:text-sky">Politika privatnosti</NuxtLink>
          <NuxtLink to="/legal/terms" class="text-sm text-cloud/60 transition-colors hover:text-sky">Uslovi korišćenja</NuxtLink>
        </div>
      </div>
    </div>
  </footer>
</template>
