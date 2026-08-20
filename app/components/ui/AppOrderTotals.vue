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
  props.shipping === 0 ? 'Besplatno' : `${props.shipping.toLocaleString('sr-RS')} RSD`,
)
</script>

<template>
  <div>
    <dl class="space-y-3 text-navy/70">
      <div class="flex justify-between">
        <dt>Knjige{{ showCount ? ` (${itemsCount})` : '' }}</dt>
        <dd class="font-medium text-navy">{{ total.toLocaleString('sr-RS') }} RSD</dd>
      </div>
      <div class="flex justify-between">
        <dt>Dostava</dt>
        <dd class="font-medium" :class="shipping === 0 ? 'text-mint' : 'text-navy'">
          {{ shippingLabel }}
        </dd>
      </div>
    </dl>

    <div class="my-5 border-t border-cloud/40" />

    <div class="flex items-baseline justify-between">
      <span class="font-semibold text-navy">Ukupno</span>
      <span class="font-unbounded text-2xl font-extrabold text-navy">
        {{ grandTotal.toLocaleString('sr-RS') }} RSD
      </span>
    </div>
  </div>
</template>
