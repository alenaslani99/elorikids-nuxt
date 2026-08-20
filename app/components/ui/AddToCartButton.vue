<script setup lang="ts">
const props = withDefaults(defineProps<{
  slug: string
  title: string
  price: number
  quantity?: number
  compact?: boolean
}>(), {
  quantity: 1,
  compact: false,
})

const { addItem } = useCart()

const justAdded = ref(false)
let timeout: ReturnType<typeof setTimeout> | null = null

function handleAddToCart() {
  addItem(props.slug, props.title, props.price, props.quantity)
  justAdded.value = true
  if (timeout) clearTimeout(timeout)
  timeout = setTimeout(() => (justAdded.value = false), 2000)
}

onBeforeUnmount(() => {
  if (timeout) clearTimeout(timeout)
})
</script>

<template>
  <button
    type="button"
    class="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-blue font-semibold text-white shadow-md transition-all hover:bg-navy hover:shadow-lg active:scale-[0.98]"
    :class="compact ? 'px-5 py-3 text-sm' : 'px-8 py-3.5'"
    @click="handleAddToCart"
  >
    <Icon
      v-if="justAdded"
      name="lucide:check"
      :class="compact ? 'size-4' : 'size-5'"
    />
    <Icon
      v-else
      name="lucide:shopping-bag"
      :class="compact ? 'size-4' : 'size-5'"
    />
    <span class="relative whitespace-nowrap">
      <!-- Ghost text reserves width for the longer label -->
      <span class="invisible" aria-hidden="true">Dodato u korpu!</span>
      <!-- Actual label overlaid and centered -->
      <span class="absolute inset-0 flex items-center justify-center">{{ justAdded ? 'Dodato u korpu!' : 'Dodaj u korpu' }}</span>
    </span>
  </button>
</template>
