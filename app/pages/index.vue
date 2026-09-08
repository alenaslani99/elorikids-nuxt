<script setup lang="ts">
useHead({
  title: 'elorikids - Interaktivne knjige za decu',
  meta: [
    { name: 'description', content: 'Interaktivne piši-briši knjige za decu uzrasta 2-6 godina. Laminirane, vodootporne stranice, originalni ručno ilustrovani sadržaj. Učenje kroz igru.' },
    { property: 'og:title', content: 'elorikids - Interaktivne knjige za decu' },
    { property: 'og:description', content: 'Interaktivne piši-briši knjige za decu uzrasta 2-6 godina. Laminirane, vodootporne stranice, originalni ručno ilustrovan sadržaj.' },
    { property: 'og:type', content: 'website' },
    { property: 'og:url', content: 'https://elorikids.rs/' },
    { property: 'og:image', content: 'https://elorikids.rs/elorikids-1.jpg' },
    { property: 'og:image:width', content: '1280' },
    { property: 'og:image:height', content: '1920' },
    { name: 'twitter:title', content: 'elorikids - Interaktivne knjige za decu' },
    { name: 'twitter:description', content: 'Interaktivne piši-briši knjige za decu uzrasta 2-6 godina. Učenje kroz igru.' },
  ],
  link: [
    { rel: 'canonical', href: 'https://elorikids.rs/' },
    // Preload LCP hero image: cuts resourceLoadDelay (~60ms in Lighthouse).
    // Matches AppHero srcset/sizes so mobile picks the 640w variant.
    {
      rel: 'preload',
      as: 'image',
      href: '/elorikids-1-640sq.webp',
      imagesrcset: '/elorikids-1-480sq.webp 480w, /elorikids-1-640sq.webp 640w, /elorikids-1-1024sq.webp 1024w',
      imagesizes: '(max-width: 1023px) 100vw, 600px',
      fetchpriority: 'high',
    },
  ],
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'elorikids',
        url: 'https://elorikids.rs',
        logo: 'https://elorikids.rs/favicon_io/apple-touch-icon.png',
        description: 'Interaktivne piši-briši knjige za decu uzrasta 2-6 godina. Laminirane, vodootporne stranice, originalni ručno ilustrovani sadržaj.',
      }),
    },
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'elorikids',
        url: 'https://elorikids.rs',
        inLanguage: 'sr-Latn',
      }),
    },
  ],
})
</script>

<template>
  <div>
    <AppHero />
    <!-- Below-fold sections hydrate on visibility: their JS is excluded
         from initial hydration, cutting mobile TBT (~1100ms). SSR HTML
         still renders for SEO; anchor links (#categories etc.) trigger
         hydration via scroll intersection. -->
    <LazyAppCategories hydrate-on-visible />
    <LazyAppActivities hydrate-on-visible />
    <LazyAppValueProps hydrate-on-visible />
    <LazyAppTestimonials hydrate-on-visible />
    <LazyAppFaq hydrate-on-visible />
  </div>
</template>
