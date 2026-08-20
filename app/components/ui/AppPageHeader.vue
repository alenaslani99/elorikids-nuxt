<script setup lang="ts">
interface BreadcrumbItem {
  label: string
  to?: string
}

withDefaults(defineProps<{
  title: string
  subtitle?: string
  badge?: string
  badgeClass?: string
  breadcrumbItems?: BreadcrumbItem[]
}>(), {
  badgeClass: 'bg-sky/40 text-navy',
})
</script>

<template>
  <section class="bg-gradient-to-b from-sky/30 to-cream py-12 lg:py-16">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <AppBreadcrumb v-if="breadcrumbItems" :items="breadcrumbItems" nav-class="mb-4" />
      <div class="max-w-3xl">
        <span v-if="badge" class="inline-block rounded-full px-4 py-1.5 text-sm font-semibold" :class="badgeClass">
          {{ badge }}
        </span>
        <h1 class="font-unbounded mt-4 text-4xl font-extrabold text-navy md:text-5xl">
          {{ title }}
        </h1>
        <p v-if="subtitle" class="mt-4 max-w-2xl text-lg leading-relaxed text-navy/70">
          {{ subtitle }}
        </p>
        <slot />
      </div>
    </div>
  </section>
</template>
