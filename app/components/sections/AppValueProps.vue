<script setup lang="ts">
interface ValueProp {
  icon: string
  title: string
  description: string
  accent: 'blue' | 'purple' | 'coral' | 'mint'
}

const props: ValueProp[] = [
  {
    icon: 'lucide:eraser',
    title: 'Piši-briši sistem',
    description: 'Laminirane, vodootporne stranice omogućavaju višestruko korišćenje. Dete može da vežba isti zadatak bezbroj puta, bez straha od greške. Jednostavno obrišite i počnite ispočetka!',
    accent: 'blue',
  },
  {
    icon: 'lucide:palette',
    title: 'Originalni sadržaj',
    description: 'Svaki zadatak je pažljivo osmišljen i ručno ilustrovan. Nema kopiranih materijala - sve je kreirano sa ljubavlju, prilagođeno našoj deci i njihovim potrebama.',
    accent: 'purple',
  },
  {
    icon: 'lucide:puzzle',
    title: 'Učenje kroz igru',
    description: 'Zabava je na prvom mestu - učenje dolazi prirodno. Šareni zadaci, simpatične ilustracije i raznovrsne aktivnosti drže pažnju mališana dok nesvesno usvajaju nova znanja.',
    accent: 'coral',
  },
  {
    icon: 'lucide:book-open',
    title: '24 stranice',
    description: 'Raznovrsni zadaci koji podstiču kreativnost i radoznalost. Svaka stranica donosi novu aktivnost koja razvija motoriku, logiku i maštu vašeg deteta.',
    accent: 'mint',
  },
]

const accentClasses: Record<ValueProp['accent'], { bg: string, text: string }> = {
  blue: { bg: 'bg-blue/10', text: 'text-blue' },
  purple: { bg: 'bg-purple/10', text: 'text-purple' },
  coral: { bg: 'bg-coral/10', text: 'text-coral' },
  mint: { bg: 'bg-mint/15', text: 'text-mint' },
}
</script>

<template>
  <section id="value-props" class="scroll-mt-20 bg-cream py-16 lg:py-24">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <!-- Section header -->
      <div class="mx-auto mb-12 max-w-2xl text-center">
        <span class="inline-block rounded-full bg-sky/40 px-4 py-1.5 text-sm font-semibold text-navy">
          Zašto elorikids
        </span>
        <h2 class="font-unbounded mt-4 text-3xl font-extrabold text-navy md:text-4xl">
          Knjige koje rastu sa detetom
        </h2>
        <p class="mt-4 text-lg text-navy/70">
          Četiri razloga zašto roditelji širom Srbije biraju naše interaktivne knjige.
        </p>
      </div>

      <!-- Value props grid -->
      <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div
          v-for="prop in props"
          :key="prop.title"
          class="flex flex-col items-start rounded-3xl border-2 border-cloud/40 bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
        >
          <!-- Icon badge -->
          <div
            class="mb-6 flex size-14 items-center justify-center rounded-2xl"
            :class="accentClasses[prop.accent].bg"
          >
            <Icon
              :name="prop.icon"
              class="size-7"
              :class="accentClasses[prop.accent].text"
            />
          </div>

          <h3 class="mb-3 text-xl font-bold text-navy">
            {{ prop.title }}
          </h3>
          <p class="text-sm leading-relaxed text-navy/70">
            {{ prop.description }}
          </p>
        </div>
      </div>
    </div>
  </section>
</template>
