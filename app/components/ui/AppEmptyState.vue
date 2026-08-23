<script setup lang="ts">
withDefaults(defineProps<{
  icon: string
  title: string
  description: string
  ctaLabel?: string
  ctaTo?: string
}>(), {
  ctaLabel: 'Pogledaj knjige',
  ctaTo: '/books',
})
</script>

<template>
  <section class="py-16 lg:py-24">
    <div class="mx-auto max-w-xl px-4 text-center sm:px-6 lg:px-8">
      <div class="mx-auto flex size-24 items-center justify-center rounded-full bg-sky/30">
        <Icon :name="icon" class="size-12 text-navy/40" />
      </div>
      <h2 class="font-unbounded mt-6 text-2xl font-bold text-navy">
        {{ title }}
      </h2>
      <p class="mt-3 text-navy/60">
        {{ description }}
      </p>
      <NuxtLink
        :to="ctaTo"
        class="mt-8 inline-flex items-center gap-2 rounded-full bg-blue px-8 py-3.5 font-semibold text-white shadow-md transition-all hover:bg-navy hover:shadow-lg active:scale-[0.98]"
      >
        {{ ctaLabel }}
        <Icon name="lucide:arrow-right" class="size-5" />
      </NuxtLink>
    </div>
  </section>
</template>
