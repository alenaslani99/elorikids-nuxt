<script setup lang="ts">
import { FREE_SHIPPING_THRESHOLD } from '~~/shared/utils/orders'

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

// No flat shipping fee: the courier charges by destination below the
// free-shipping threshold, so the row never shows an amount.
const isFreeShipping = computed(() => props.total >= FREE_SHIPPING_THRESHOLD)
const shippingLabel = computed(() =>
  isFreeShipping.value ? 'Besplatno' : '+ dostava',
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
        <dd class="whitespace-nowrap font-medium" :class="isFreeShipping ? 'text-mint' : 'text-navy'">
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
