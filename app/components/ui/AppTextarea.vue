<script setup lang="ts">
withDefaults(defineProps<{
  id: string
  label: string
  rows?: number
  placeholder?: string
  required?: boolean
  disabled?: boolean
  /** Optional character limit. When set, shows "X / max" and turns coral when exceeded. */
  maxLength?: number
  /** Inline validation error shown below the textarea (reserved height avoids layout shift).
   *  Pass an empty string to reserve space without showing a message; omit entirely to render no slot. */
  error?: string
}>(), {
  rows: 3,
  required: false,
  disabled: false,
})

const model = defineModel<string>({ default: '' })

const charCount = computed(() => model.value.length)
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

    <!-- Bottom row: inline error (left) + optional character counter (right).
         In flow with a reserved one-line height so a 2-line error grows downward
         and pushes content below instead of overlapping it. -->
    <div
      v-if="error !== undefined || maxLength"
      class="flex items-start gap-2 pt-0.5"
    >
      <p
        v-if="error !== undefined"
        class="flex min-h-5 flex-1 items-start gap-1 text-xs text-coral transition-opacity duration-200"
        :class="error ? 'opacity-100' : 'opacity-0 pointer-events-none'"
      >
        <Icon name="lucide:alert-circle" class="size-3 shrink-0" />
        <span>{{ error || '\u00A0' }}</span>
      </p>
      <p
        v-if="maxLength"
        class="pointer-events-none shrink-0 text-xs transition-colors duration-200"
        :class="charCount > maxLength ? 'font-semibold text-coral' : 'text-navy/40'"
      >
        {{ charCount }} / {{ maxLength }}
      </p>
    </div>
  </div>
</template>
