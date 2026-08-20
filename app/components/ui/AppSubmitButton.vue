<script setup lang="ts">
withDefaults(defineProps<{
  loading?: boolean
  disabled?: boolean
  label: string
  loadingLabel?: string
  /** Full width (default) or auto width. */
  full?: boolean
  /** Button color. */
  color?: 'blue' | 'navy'
  /** Optional trailing icon name (shown when not loading). */
  icon?: string
}>(), {
  loading: false,
  disabled: false,
  full: true,
  color: 'blue',
})
</script>

<template>
  <button
    type="submit"
    :class="[
      'inline-flex items-center justify-center gap-2 rounded-full py-3.5 font-semibold text-white shadow-md transition-all active:scale-[0.98] disabled:opacity-60',
      full ? 'w-full px-8' : 'px-6 sm:w-auto',
      color === 'blue' ? 'bg-blue hover:bg-navy hover:shadow-lg' : 'bg-navy hover:bg-navy-dark transition-colors',
    ]"
    :disabled="loading || disabled"
  >
    <Icon v-if="loading" name="lucide:loader-2" class="size-5 animate-spin" />
    <span>{{ loading ? (loadingLabel || label) : label }}</span>
    <Icon v-if="icon && !loading" :name="icon" class="size-5" />
  </button>
</template>
