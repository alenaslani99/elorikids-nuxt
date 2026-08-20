<script setup lang="ts">
interface FaqItem {
  question: string
  answer: string
}

withDefaults(defineProps<{
  items: FaqItem[]
  /** Index opened by default (null = all collapsed). */
  defaultOpen?: number | null
}>(), {
  defaultOpen: 0,
})

const openIndex = ref<number | null>(0)

function toggle(index: number) {
  openIndex.value = openIndex.value === index ? null : index
}
</script>

<template>
  <div class="space-y-4">
    <div
      v-for="(faq, index) in items"
      :key="index"
      class="overflow-hidden rounded-2xl border-2 border-cloud/40 bg-white shadow-sm transition-colors"
      :class="openIndex === index ? 'border-blue/40' : ''"
    >
      <button
        type="button"
        class="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
        :aria-expanded="openIndex === index"
        @click="toggle(index)"
      >
        <span class="text-lg font-semibold text-navy">{{ faq.question }}</span>
        <span
          class="flex size-8 shrink-0 items-center justify-center rounded-full transition-colors"
          :class="openIndex === index ? 'bg-blue text-white' : 'bg-cloud/40 text-navy'"
        >
          <Icon
            name="lucide:chevron-down"
            class="size-5 transition-transform duration-300"
            :class="openIndex === index ? 'rotate-180' : ''"
          />
        </span>
      </button>

      <div
        class="grid overflow-hidden transition-[grid-template-rows] duration-300 ease-out"
        :class="openIndex === index ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'"
      >
        <div class="overflow-hidden">
          <p class="px-6 pb-5 leading-relaxed text-navy/70">
            {{ faq.answer }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
