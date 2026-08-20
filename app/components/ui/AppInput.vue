<script setup lang="ts">
const props = withDefaults(defineProps<{
  id: string
  label: string
  modelValue: string
  type?: string
  placeholder?: string
  autocomplete?: string
  inputmode?: string
  required?: boolean
  disabled?: boolean
  /** Show a password visibility toggle (only relevant when type="password"). */
  showPasswordToggle?: boolean
}>(), {
  type: 'text',
  required: false,
  disabled: false,
  showPasswordToggle: false,
})

const emit = defineEmits<{ 'update:modelValue': [string] }>()
const showPassword = ref(false)

const actualType = computed(() => {
  if (props.type === 'password' && props.showPasswordToggle) {
    return showPassword.value ? 'text' : 'password'
  }
  return props.type
})

function onInput(e: Event) {
  emit('update:modelValue', (e.target as HTMLInputElement).value)
}
</script>

<template>
  <div>
    <label :for="id" class="mb-1.5 block text-sm font-semibold text-navy">
      {{ label }}
    </label>
    <div :class="showPasswordToggle ? 'relative' : ''">
      <input
        :id="id"
        :value="modelValue"
        :type="actualType"
        :placeholder="placeholder"
        :autocomplete="autocomplete"
        :inputmode="inputmode"
        :required="required"
        :disabled="disabled"
        :class="[
          'w-full rounded-xl border-2 border-cloud/50 bg-cream px-4 py-3 text-navy placeholder:text-navy/40 focus:border-blue focus:outline-none focus:ring-2 focus:ring-blue/20',
          showPasswordToggle ? 'pr-12' : '',
        ]"
        @input="onInput"
      >
      <button
        v-if="showPasswordToggle"
        type="button"
        :aria-label="showPassword ? 'Sakrij lozinku' : 'Prikaži lozinku'"
        class="absolute right-3 top-1/2 -translate-y-1/2 text-navy/40 transition-colors hover:text-navy"
        @click="showPassword = !showPassword"
      >
        <Icon :name="showPassword ? 'lucide:eye-off' : 'lucide:eye'" class="size-5" />
      </button>
    </div>
  </div>
</template>
