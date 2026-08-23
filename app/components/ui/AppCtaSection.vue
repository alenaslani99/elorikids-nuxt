<script setup lang="ts">
withDefaults(defineProps<{
  title: string
  subtitle?: string
  primaryLabel?: string
  primaryTo?: string
  secondaryLabel?: string
  secondaryTo?: string
  /** Section wrapper classes (background + spacing). */
  sectionClass?: string
}>(), {
  primaryLabel: 'Pogledaj knjige',
  primaryTo: '/books',
  secondaryLabel: 'Kontaktirajte nas',
  secondaryTo: '/legal/contact',
  sectionClass: 'bg-cream py-16 lg:py-24',
})
</script>

<template>
  <section :class="sectionClass">
    <div class="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
      <h2 class="font-unbounded text-3xl font-extrabold text-navy md:text-4xl">
        {{ title }}
      </h2>
      <p v-if="subtitle" class="mx-auto mt-4 max-w-xl text-lg text-navy/70">
        {{ subtitle }}
      </p>
      <div class="mt-8 flex flex-wrap justify-center gap-4">
        <NuxtLink
          v-if="primaryLabel"
          :to="primaryTo"
          class="inline-flex items-center gap-2 rounded-full bg-blue px-6 py-3 font-semibold text-white transition-colors hover:bg-navy"
        >
          {{ primaryLabel }}
          <Icon name="lucide:arrow-right" class="size-5" />
        </NuxtLink>
        <NuxtLink
          v-if="secondaryLabel"
          :to="secondaryTo"
          class="inline-flex items-center gap-2 rounded-full border-2 border-cloud bg-white px-6 py-3 font-semibold text-navy transition-colors hover:border-blue hover:text-blue"
        >
          {{ secondaryLabel }}
        </NuxtLink>
      </div>
    </div>
  </section>
</template>
