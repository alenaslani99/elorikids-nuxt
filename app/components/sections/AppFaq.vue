<script setup lang="ts">
interface FaqItem {
  question: string
  answer: string
}

const faqs: FaqItem[] = [
  {
    question: 'Da li su stranice zaista za višekratnu upotrebu?',
    answer: 'Da. Sve naše knjige imaju laminirane, vodootporne stranice koje se brišu suvom krpom ili mokrom maramicom. Jednu stranicu možete pisati i brisati stotine puta bez oštećenja.',
  },
  {
    question: 'Koja je razlika između knjiga po uzrastu?',
    answer: 'Svaka knjiga je prilagođena razvojnom stadijumu deteta. "Prvi koraci" (2-3 god.) fokusira se na boje, veličine i prepoznavanje. "Učimo kroz igru" (3-4 god.) uvodi sortiranje i logiku. "Priprema za školu" (4-6 god.) razvija koncentraciju, lavirinte i školske veštine.',
  },
  {
    question: 'Kojim flomastere koristiti i kako se brišu?',
    answer: 'Za najbolje iskustvo koristite flomastere na bazi vode (whiteboard markers) ili vodene bojice. Pisanje se jednostavno briše suvom krpom, mokrom maramicom ili mokrom spužvicom. Izbegavajte trajne markere jer se ne mogu obrisati.',
  },
  {
    question: 'Da li su knjige bezbedne za decu?',
    answer: 'Apsolutno. Materijali su netoksični i bezbedni za decu. Knjige su izrađene od izdržljivih materijala koji ne kidaju i ne seckaju, sa zaobljenim ivicama. Sadržaj je pažljivo kreiran da bude edukativan i uzrastu primeren.',
  },
  {
    question: 'Koliko traje isporuka i da li dostavljate van Srbije?',
    answer: 'Za porudžbine u Srbiji isporuka traje 1-3 radna dana. Dostava je besplatna za porudžbine iznad 3.000 RSD. Trenutno dostavljamo isključivo na teritoriji Srbije.',
  },
  {
    question: 'Da li mogu vratiti proizvod ako mi ne odgovara?',
    answer: 'Da. Imate pravo na povrat robe u roku od 14 dana od prijema, pod uslovom da knjiga nije oštećena. Novac vam vraćamo na račun u roku od 7 radnih dana od prijama povraćene robe.',
  },
]

const openIndex = ref<number | null>(0)

function toggle(index: number) {
  openIndex.value = openIndex.value === index ? null : index
}
</script>

<template>
  <section class="bg-cream py-16 lg:py-24">
    <div class="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
      <!-- Section header -->
      <div class="mx-auto mb-12 max-w-2xl text-center">
        <span class="inline-block rounded-full bg-sky/40 px-4 py-1.5 text-sm font-semibold text-navy">
          Česta pitanja
        </span>
        <h2 class="font-unbounded mt-4 text-3xl font-extrabold text-navy md:text-4xl">
          Odgovori na vaša pitanja
        </h2>
        <p class="mt-4 text-lg text-navy/70">
          Sve što treba da znate o našim knjigama, načinu upotrebe i dostavi.
        </p>
      </div>

      <!-- Accordion -->
      <div class="space-y-4">
        <div
          v-for="(faq, index) in faqs"
          :key="index"
          class="overflow-hidden rounded-2xl border-2 border-cloud/40 bg-white shadow-sm transition-colors"
          :class="openIndex === index ? 'border-blue/40' : ''"
        >
          <button
            type="button"
            class="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
            :aria-expanded="openIndex === index"
            @click="toggle(index)"
          >
            <span class="text-lg font-semibold text-navy">{{ faq.question }}</span>
            <span
              class="flex size-8 shrink-0 items-center justify-center rounded-full transition-colors"
              :class="openIndex === index ? 'bg-blue text-white' : 'bg-cloud/40 text-navy'"
            >
              <Icon
                name="lucide:chevron-down"
                class="size-5 transition-transform duration-300"
                :class="openIndex === index ? 'rotate-180' : ''"
              />
            </span>
          </button>

          <div
            class="grid transition-all duration-300 ease-in-out"
            :class="openIndex === index ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'"
          >
            <div class="overflow-hidden">
              <p class="px-6 pb-5 leading-relaxed text-navy/70">
                {{ faq.answer }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Contact CTA -->
      <div class="mt-10 text-center">
        <p class="text-navy/70">
          Niste našli odgovor na svoje pitanje?
        </p>
        <NuxtLink
          to="/kontakt"
          class="mt-3 inline-flex items-center gap-2 font-semibold text-navy transition-colors hover:text-blue"
        >
          Kontaktirajte nas
          <Icon name="lucide:arrow-right" class="size-4" />
        </NuxtLink>
      </div>
    </div>
  </section>
</template>
