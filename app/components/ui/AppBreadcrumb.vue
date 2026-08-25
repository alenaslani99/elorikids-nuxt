<script setup lang="ts">
interface BreadcrumbItem {
  label: string
  to?: string
}

defineProps<{
  items: BreadcrumbItem[]
  /**
   * Classes applied to the wrapping <nav> element.
   * The inner <ol> always carries the shared list styling
   * (flex items-center gap-2 text-sm text-navy/50), so pass only
   * the page-specific wrapper classes here.
   */
  navClass?: string
}>()
</script>

<template>
  <nav :class="navClass" aria-label="Breadcrumb">
    <ol class="flex flex-wrap items-center gap-2 text-sm text-navy/50">
      <template v-for="(item, index) in items" :key="index">
        <li class="min-w-0">
          <NuxtLink
            v-if="item.to"
            :to="item.to"
            class="block max-w-[40ch] truncate transition-colors hover:text-blue sm:max-w-none"
          >
            {{ item.label }}
          </NuxtLink>
          <span v-else class="block max-w-[40ch] truncate font-medium text-navy sm:max-w-none">{{ item.label }}</span>
        </li>
        <li v-if="index < items.length - 1" aria-hidden="true">›</li>
      </template>
    </ol>
  </nav>
</template>
