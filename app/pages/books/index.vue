<script setup lang="ts">
import { books } from '~/composables/useBooks'
import { getAccent } from '~/composables/useAccent'

function goToBook(slug: string) {
  navigateTo(`/books/${slug}`)
}

useHead({
  title: 'Knjige za decu 2-6 god - interaktivne piši-briši | elorikids',
  meta: [
    { name: 'description', content: 'Knjige za decu uzrasta 2-6 godina na jednom mestu: Prvi koraci (2-3 god), Učimo kroz igru (3-4 god), Priprema za školu (4-6 god). Laminirane vodootporne stranice, cene i poručivanje.' },
    { property: 'og:title', content: 'Knjige za decu 2-6 god - interaktivne piši-briši | elorikids' },
    { property: 'og:description', content: 'Knjige za decu 2-6 godina: Prvi koraci, Učimo kroz igru, Priprema za školu. Cene, uzrasti i poručivanje na jednom mestu.' },
    { property: 'og:type', content: 'website' },
    { property: 'og:url', content: 'https://elorikids.rs/books' },
    { property: 'og:image', content: 'https://elorikids.rs/elorikids-1.jpg' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: 'Knjige za decu 2-6 god - interaktivne piši-briši | elorikids' },
    { name: 'twitter:description', content: 'Knjige za decu po uzrastu: 2-3, 3-4 i 4-6 godina. Cene i poručivanje.' },
  ],
  link: [
    { rel: 'canonical', href: 'https://elorikids.rs/books' },
  ],
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Početna', item: 'https://elorikids.rs/' },
          { '@type': 'ListItem', position: 2, name: 'Knjige', item: 'https://elorikids.rs/books' },
        ],
      }),
    },
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'ItemList',
        itemListElement: books.map((book, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: book.title,
          url: `https://elorikids.rs/books/${book.slug}`,
        })),
      }),
    },
  ],
})
</script>

<template>
  <div class="bg-cream">
    <!-- Page header -->
    <AppPageHeader
      title="Naše knjige"
      badge="Knjige"
      badge-class="bg-sky/40 text-navy"
      subtitle="Tri interaktivne piši-briši knjige za decu od 2 do 6 godina. Svaka je prilagođena razvojnom uzrastu deteta - od prvih boja do lavirinta za predškolce."
      :breadcrumb-items="[{ label: 'Početna', to: '/' }, { label: 'Knjige' }]"
    />

    <!-- Book listing -->
    <section class="py-12 lg:py-16">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="grid gap-8 md:grid-cols-3">
          <article
            v-for="book in books"
            :key="book.slug"
            class="group flex cursor-pointer flex-col overflow-hidden rounded-3xl border-2 border-cloud/40 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            @click="goToBook(book.slug)"
          >
            <!-- Book image -->
            <div class="overflow-hidden">
              <NuxtImg
                :src="`/${book.img}`"
                :alt="`${book.title} - interaktivna piši-briši knjiga za decu (${book.ageRange})`"
                class="aspect-[4/3] w-full object-cover transition-transform duration-300 group-hover:scale-105"
                width="400"
                height="300"
                format="webp"
                loading="lazy"
              />
            </div>

            <div class="flex flex-1 flex-col p-6">
              <!-- Age badge -->
              <span
                class="mb-3 w-fit rounded-full px-3 py-1 text-sm font-semibold"
                :class="getAccent(book.accent).badge"
              >
                {{ book.ageRange }}
              </span>

              <!-- Title -->
              <NuxtLink :to="`/books/${book.slug}`" @click.stop>
                <h2 class="font-unbounded text-2xl font-extrabold text-navy">
                  {{ book.title }}
                </h2>
              </NuxtLink>
              <p class="mt-1 text-sm font-medium text-navy/50">{{ book.subtitle }}</p>

              <!-- Description -->
              <p class="mt-4 flex-1 leading-relaxed text-navy/70">
                {{ book.description }}
              </p>

              <!-- Price + Add to cart -->
              <div class="mt-6 space-y-3">
                <div class="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span class="text-lg font-bold text-navy">
                    {{ book.price.toLocaleString('sr-RS') }} RSD
                  </span>
                  <span
                    v-if="book.oldPrice && book.oldPrice > book.price"
                    class="text-sm font-medium text-navy/40 line-through"
                  >
                    {{ book.oldPrice.toLocaleString('sr-RS') }} RSD
                  </span>
                  <span
                    v-if="book.oldPrice && book.oldPrice > book.price"
                    class="rounded-full bg-coral px-3 py-1 text-sm font-bold text-white"
                  >
                    -{{ Math.round((1 - book.price / book.oldPrice) * 100) }}%
                  </span>
                </div>
                <div @click.stop>
                  <AddToCartButton
                    :slug="book.slug"
                    :title="book.title"
                    :price="book.price"
                    compact
                    class="w-full"
                  />
                </div>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>

    <!-- Buying guide (unique copy so Google snippets don't fall back to header/footer boilerplate) -->
    <section class="pb-12 lg:pb-16">
      <div class="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div class="rounded-3xl border-2 border-cloud/40 bg-white p-8 shadow-sm lg:p-10">
          <h2 class="font-unbounded text-2xl font-extrabold text-navy">
            Kako da izaberete prave knjige za decu?
          </h2>
          <div class="mt-4 space-y-4 leading-relaxed text-navy/70">
            <p>
              Knjige za decu najlakše birate prema uzrastu: za najmlađe (2-3 godine) počnite sa
              <NuxtLink to="/books/prvi-koraci" class="font-semibold text-blue hover:text-navy">Prvim koracima</NuxtLink>
              - boje, veličine i životinje kroz jednostavne zadatke. Za uzrast 3-4 godine
              <NuxtLink to="/books/ucimo-kroz-igru" class="font-semibold text-blue hover:text-navy">Učimo kroz igru</NuxtLink>
              uvodi sortiranje, grupisanje i logičke veze, dok je
              <NuxtLink to="/books/priprema-za-skolu" class="font-semibold text-blue hover:text-navy">Priprema za školu</NuxtLink>
              (4-6 godina) puna lavirinta i zadataka koncentracije pred polazak u školu.
            </p>
            <p>
              Sve tri knjige dele isti piši-briši sistem: laminirane, vodootporne stranice
              koje se brišu i koriste iznova, pa dete vežba bez straha od greške. Poručivanje
              je preko korpe, plaćanje pouzećem, a dostava stiže za 1-3 radna dana širom Srbije.
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <AppCtaSection
      title="Imate pitanja?"
      subtitle="Kontaktirajte nas - rado ćemo vam pomoći da izaberete pravu knjigu za vaše dete."
      primary-label=" Kontakt"
      primary-to="/legal/contact"
      secondary-label="Česta pitanja"
      secondary-to="/faq"
    />
  </div>
</template>
