<script setup lang="ts">
interface FaqItem {
  question: string
  answer: string
}

const props = withDefaults(defineProps<{
  items: FaqItem[]
  /** Index opened by default (null = all collapsed). */
  defaultOpen?: number | null
}>(), {
  defaultOpen: 0,
})

const openIndex = ref<number | null>(props.defaultOpen)

// DOM refs for measuring actual content height per panel
const answerEls = ref<(HTMLElement | null)[]>([])

function setAnswerRef(el: any, index: number) {
  answerEls.value[index] = el ? el as HTMLElement : null
}

function toggle(index: number) {
  openIndex.value = openIndex.value === index ? null : index
}

// Re-measure on viewport resize so open panels stay accurate
const resizeTick = ref(0)

function panelStyle(index: number): Record<string, string> {
  void resizeTick.value // reactive dependency on resize

  const el = answerEls.value[index]
  if (openIndex.value === index) {
    return el ? { height: `${el.scrollHeight}px` } : { height: 'auto' }
  }
  return { height: '0px' }
}

function handleResize() {
  resizeTick.value++
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<template>
  <div class="space-y-4">
    <div
      v-for="(faq, index) in items"
      :key="index"
      class="overflow-hidden rounded-2xl border-2 border-cloud/40 bg-white shadow-sm transition-colors duration-200"
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
          class="flex size-8 shrink-0 items-center justify-center rounded-full transition-colors duration-200"
          :class="openIndex === index ? 'bg-blue text-white' : 'bg-cloud/40 text-navy'"
        >
          <Icon
            name="lucide:chevron-down"
            class="size-5 transition-transform duration-300"
            :class="openIndex === index ? 'rotate-180' : ''"
          />
        </span>
      </button>

      <!-- Smooth height-animated panel -->
      <div
        class="overflow-hidden transition-[height] duration-300 ease-out"
        :style="panelStyle(index)"
      >
        <div :ref="(el) => setAnswerRef(el, index)">
          <p class="px-6 pb-5 leading-relaxed text-navy/70">
            {{ faq.answer }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
