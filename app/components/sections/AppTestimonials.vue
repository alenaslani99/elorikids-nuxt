<script setup lang="ts">
interface Testimonial {
  quote: string
  name: string
  city: string
  book: string
  rating: number
  accent: 'blue' | 'coral' | 'mint'
}

const testimonials: Testimonial[] = [
  {
    quote: 'Kćerka od tri godine ne odvaja se od knjige "Prvi koraci". Sve je sama obriše i krene iznova! Najlepše je gledati je kako sa ponosom imenuje boje i životinje.',
    name: 'Marija P.',
    city: 'Novi Sad',
    book: 'Prvi koraci',
    rating: 5,
    accent: 'coral',
  },
  {
    quote: 'Konačno nešto što nije ekran! Sin od četiri godine obožava sortiranje i uparivanje. Knjiga je izdržljiva, briše se lako, a zadaci su zaista osmišljeni.',
    name: 'Stefan J.',
    city: 'Beograd',
    book: 'Učimo kroz igru',
    rating: 5,
    accent: 'blue',
  },
  {
    quote: 'Lavirinti i zadaci za koncentraciju su nas osvojili. Petogodišnji sin je počeo da crta sigurnije rukom, a najviše mu se sviđa što može sve da obriše i proba ponovo.',
    name: 'Ana K.',
    city: 'Niš',
    book: 'Priprema za školu',
    rating: 5,
    accent: 'mint',
  },
]

const accentClasses: Record<Testimonial['accent'], { bg: string, text: string, ring: string }> = {
  blue: { bg: 'bg-blue/10', text: 'text-blue-dark', ring: 'ring-blue/20' },
  coral: { bg: 'bg-coral/10', text: 'text-coral-dark', ring: 'ring-coral/20' },
  mint: { bg: 'bg-mint/15', text: 'text-mint-dark', ring: 'ring-mint/20' },
}

const initials = (name: string) =>
  name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
</script>

<template>
  <section class="relative overflow-hidden bg-gradient-to-b from-purple/10 via-sky/20 to-cream py-16 lg:py-24">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <!-- Section header -->
      <div class="mx-auto mb-12 max-w-2xl text-center">
        <span class="inline-block rounded-full bg-purple/20 px-4 py-1.5 text-sm font-semibold text-purple-dark">
          Iskustva roditelja
        </span>
        <h2 class="font-unbounded mt-4 text-3xl font-extrabold text-navy md:text-4xl">
          Šta kažu roditelji
        </h2>
        <p class="mt-4 text-lg text-navy/70">
          Više od 500 porodica širom Srbije već uči i igra se sa elorikids knjigama.
        </p>
      </div>

      <!-- Testimonials grid -->
      <div class="grid gap-6 md:grid-cols-3">
        <article
          v-for="t in testimonials"
          :key="t.name"
          class="relative flex flex-col rounded-3xl border-2 border-cloud/40 bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
        >
          <!-- Quote mark -->
          <Icon
            name="lucide:quote"
            class="absolute -top-3 right-6 size-10 opacity-10"
            :class="accentClasses[t.accent].text"
          />

          <!-- Stars -->
          <div class="mb-4 flex gap-0.5">
            <Icon
              v-for="star in t.rating"
              :key="star"
              name="lucide:star"
              class="size-5 fill-yellow text-yellow"
            />
          </div>

          <!-- Quote -->
          <p class="mb-6 flex-1 text-base leading-relaxed text-navy/80">
            „{{ t.quote }}"
          </p>

          <!-- Author -->
          <div class="flex items-center gap-4 border-t border-cloud/40 pt-5">
            <div
              class="flex size-12 shrink-0 items-center justify-center rounded-full font-bold ring-4"
              :class="[accentClasses[t.accent].bg, accentClasses[t.accent].text, accentClasses[t.accent].ring]"
            >
              {{ initials(t.name) }}
            </div>
            <div>
              <p class="font-semibold text-navy">{{ t.name }}</p>
              <p class="text-sm text-navy/75">
                {{ t.city }} · kupac knjige „{{ t.book }}"
              </p>
            </div>
          </div>
        </article>
      </div>

      <!-- Trust stats -->
      <div class="mx-auto mt-12 flex max-w-2xl flex-wrap items-center justify-center gap-x-10 gap-y-4 text-center">
        <div class="flex items-center gap-2 text-navy/70">
          <Icon name="lucide:star" class="size-5 fill-yellow text-yellow" />
          <span class="text-sm font-medium">4,9/5 prosečna ocena</span>
        </div>
        <div class="flex items-center gap-2 text-navy/70">
          <Icon name="lucide:users" class="size-5 text-blue" />
          <span class="text-sm font-medium">500+ zadovoljnih porodica</span>
        </div>
        <div class="flex items-center gap-2 text-navy/70">
          <Icon name="lucide:truck" class="size-5 text-mint" />
          <span class="text-sm font-medium">Dostava u celoj Srbiji</span>
        </div>
      </div>
    </div>
  </section>
</template>
