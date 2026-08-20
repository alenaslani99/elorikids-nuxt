<script setup lang="ts">
useHead({
  title: 'elorikids - Interaktivne knjige za decu',
  meta: [
    { name: 'description', content: 'Interaktivne piši-briši knjige za decu uzrasta 2-6 godina. Laminirane, vodootporne stranice, originalni ručno ilustrovani sadržaj. Učenje kroz igru.' },
  ],
})
</script>

<template>
  <div>
    <AppHero />
    <AppCategories />
    <AppActivities />
    <AppValueProps />
    <AppTestimonials />
    <AppFaq />
  </div>
</template>
