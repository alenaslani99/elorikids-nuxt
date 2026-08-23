<script setup lang="ts">
useHead({
  title: 'Česta pitanja - elorikids',
  meta: [
    { name: 'description', content: 'Odgovori na najčešća pitanja o elorikids knjigama — piši-briši sistem, uzrasti, bezbednost, dostava i povrat robe.' },
    { property: 'og:title', content: 'Česta pitanja | elorikids' },
    { property: 'og:description', content: 'Odgovori na najčešća pitanja o elorikids knjigama.' },
    { property: 'og:type', content: 'website' },
    { property: 'og:url', content: 'https://elorikids.rs/faq' },
    { property: 'og:image', content: 'https://elorikids.rs/elorikids-1.jpg' },
    { name: 'twitter:title', content: 'Česta pitanja | elorikids' },
    { name: 'twitter:description', content: 'Odgovori na najčešća pitanja o elorikids knjigama.' },
  ],
  link: [
    { rel: 'canonical', href: 'https://elorikids.rs/faq' },
  ],
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqs.map(f => ({
          '@type': 'Question',
          name: f.question,
          acceptedAnswer: { '@type': 'Answer', text: f.answer },
        })),
      }),
    },
  ],
})
</script>

<template>
  <div>
    <!-- Page header -->
    <AppPageHeader
      title="Odgovori na vaša pitanja"
      badge="Česta pitanja"
      subtitle="Sve što treba da znate o našim knjigama, načinu upotrebe i dostavi. Ako ne pronađete odgovor, tu smo da pomognemo."
      :breadcrumb-items="[{ label: 'Početna', to: '/' }, { label: 'Česta pitanja' }]"
    />

    <!-- Accordion -->
    <section class="bg-cream py-12 lg:py-16">
      <div class="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <AppFaqAccordion :items="faqs" />

        <!-- Contact CTA -->
        <div class="mt-10 rounded-3xl border-2 border-cloud/40 bg-white p-8 text-center shadow-sm">
          <h2 class="font-unbounded text-2xl font-extrabold text-navy">
            Niste našli odgovor?
          </h2>
          <p class="mt-3 text-navy/70">
            Rado ćemo odgovoriti na sva vaša pitanja.
          </p>
          <div class="mt-6 flex flex-wrap justify-center gap-4">
            <NuxtLink
              to="/legal/contact"
              class="inline-flex items-center gap-2 rounded-full bg-blue px-6 py-3 font-semibold text-white transition-colors hover:bg-navy"
            >
              Kontaktirajte nas
              <Icon name="lucide:arrow-right" class="size-5" />
            </NuxtLink>
            <NuxtLink
              to="/track-order"
              class="inline-flex items-center gap-2 rounded-full border-2 border-cloud bg-white px-6 py-3 font-semibold text-navy transition-colors hover:border-blue hover:text-blue"
            >
              Pratite porudžbinu
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
