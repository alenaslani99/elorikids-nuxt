<script setup lang="ts">
import { books } from '~/composables/useBooks'
import { getAccent } from '~/composables/useAccent'

function goToBook(slug: string) {
  navigateTo(`/books/${slug}`)
}

useHead({
  title: 'Knjige - elorikids',
  meta: [
    { name: 'description', content: 'Interaktivne piši-briši knjige za decu uzrasta 2 do 6 godina. Laminirane, vodootporne stranice sa originalnim ručno ilustrovanim sadržajem. Prilagođeno uzrastu deteta.' },
    { property: 'og:title', content: 'Knjige | elorikids' },
    { property: 'og:description', content: 'Interaktivne piši-briši knjige za decu uzrasta 2 do 6 godina. Prilagođeno uzrastu deteta.' },
    { property: 'og:type', content: 'website' },
    { property: 'og:url', content: 'https://elorikids.rs/books' },
    { property: 'og:image', content: 'https://elorikids.rs/elorikids-1.jpg' },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: 'Knjige | elorikids' },
    { name: 'twitter:description', content: 'Interaktivne piši-briši knjige za decu uzrasta 2 do 6 godina.' },
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
      subtitle="Tri interaktivne piši-briši knjige, dizajnirane za decu od 2 do 6 godina. Svaka je prilagođena razvojnom uzrastu deteta - od prvih boja do lavirinta za predškolce."
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
