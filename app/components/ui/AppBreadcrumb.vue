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
    <ol class="flex items-center gap-2 text-sm text-navy/50">
      <template v-for="(item, index) in items" :key="index">
        <li>
          <NuxtLink
            v-if="item.to"
            :to="item.to"
            class="transition-colors hover:text-blue"
          >
            {{ item.label }}
          </NuxtLink>
          <span v-else class="font-medium text-navy">{{ item.label }}</span>
        </li>
        <li v-if="index < items.length - 1" aria-hidden="true">›</li>
      </template>
    </ol>
  </nav>
</template>
