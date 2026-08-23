<script setup lang="ts">
withDefaults(defineProps<{
  id: string
  label: string
  rows?: number
  placeholder?: string
  required?: boolean
  disabled?: boolean
  /** Optional word limit. When set, shows "X / max" and turns coral when exceeded. */
  maxWords?: number
  /** Inline validation error shown below the textarea (reserved height avoids layout shift).
   *  Pass an empty string to reserve space without showing a message; omit entirely to render no slot. */
  error?: string
}>(), {
  rows: 3,
  required: false,
  disabled: false,
})

const model = defineModel<string>({ default: '' })

const wordCount = computed(() => {
  const text = model.value.trim()
  if (!text) return 0
  return text.split(/\s+/).filter(Boolean).length
})
</script>

<template>
  <div class="relative">
    <label :for="id" class="mb-1.5 block text-sm font-semibold text-navy">
      {{ label }}
    </label>
    <textarea
      :id="id"
      :name="id"
      v-model="model"
      :rows="rows"
      :placeholder="placeholder"
      :required="required"
      :disabled="disabled"
      :class="[
        'w-full resize-y rounded-xl border-2 bg-cream px-4 py-3 text-navy placeholder:text-navy/40 focus:outline-none focus:ring-2',
        error
          ? 'border-coral focus:border-coral focus:ring-coral/20'
          : 'border-cloud/50 focus:border-blue focus:ring-blue/20',
      ]"
    />

    <!-- Word counter -->
    <p
      v-if="maxWords"
      class="pointer-events-none absolute right-0 top-full pt-0.5 text-xs transition-colors duration-200"
      :class="wordCount > maxWords ? 'font-semibold text-coral' : 'text-navy/40'"
    >
      {{ wordCount }} / {{ maxWords }}
    </p>

    <!-- Inline error (absolute so it overlays without taking flow space → no layout shift, no extra padding) -->
    <p
      v-if="error !== undefined"
      class="absolute left-0 top-full flex items-center gap-1 pt-0.5 text-xs text-coral transition-opacity duration-200"
      :class="error ? 'opacity-100' : 'opacity-0 pointer-events-none'"
    >
      <Icon name="lucide:alert-circle" class="size-3 shrink-0" />
      <span>{{ error || '\u00A0' }}</span>
    </p>
  </div>
</template>
