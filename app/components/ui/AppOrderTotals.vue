<script setup lang="ts">
const props = withDefaults(defineProps<{
  total: number
  shipping: number
  grandTotal: number
  itemsCount?: number
  showCount?: boolean
}>(), {
  itemsCount: 0,
  showCount: false,
})

const shippingLabel = computed(() =>
  props.shipping === 0 ? 'Besplatno' : '+ dostava',
)
</script>

<template>
  <div>
    <dl class="space-y-3 text-navy/70">
      <div class="flex justify-between">
        <dt>Knjige{{ showCount ? ` (${itemsCount})` : '' }}</dt>
        <dd class="whitespace-nowrap font-medium text-navy">{{ total.toLocaleString('sr-RS') }} RSD</dd>
      </div>
      <div class="flex justify-between">
        <dt>Dostava</dt>
        <dd class="whitespace-nowrap font-medium" :class="shipping === 0 ? 'text-mint' : 'text-navy'">
          {{ shippingLabel }}
        </dd>
      </div>
    </dl>

    <div class="my-5 border-t border-cloud/40" />

    <div class="flex items-baseline justify-between">
      <span class="font-semibold text-navy">Ukupno</span>
      <span class="whitespace-nowrap font-unbounded text-2xl font-extrabold tabular-nums text-navy">
        {{ grandTotal.toLocaleString('sr-RS') }} RSD
      </span>
    </div>
  </div>
</template>
