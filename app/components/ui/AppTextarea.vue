<script setup lang="ts">
withDefaults(defineProps<{
  id: string
  label: string
  modelValue: string
  rows?: number
  placeholder?: string
  required?: boolean
  disabled?: boolean
}>(), {
  rows: 3,
  required: false,
  disabled: false,
})

const emit = defineEmits<{ 'update:modelValue': [string] }>()

function onInput(e: Event) {
  emit('update:modelValue', (e.target as HTMLTextAreaElement).value)
}
</script>

<template>
  <div>
    <label :for="id" class="mb-1.5 block text-sm font-semibold text-navy">
      {{ label }}
    </label>
    <textarea
      :id="id"
      :value="modelValue"
      :rows="rows"
      :placeholder="placeholder"
      :required="required"
      :disabled="disabled"
      class="w-full resize-y rounded-xl border-2 border-cloud/50 bg-cream px-4 py-3 text-navy placeholder:text-navy/40 focus:border-blue focus:outline-none focus:ring-2 focus:ring-blue/20"
      @input="onInput"
    />
  </div>
</template>
