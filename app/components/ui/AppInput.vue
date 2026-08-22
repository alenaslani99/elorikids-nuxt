<script setup lang="ts">
const props = withDefaults(defineProps<{
  id: string
  label: string
  type?: string
  placeholder?: string
  autocomplete?: string
  inputmode?: 'none' | 'text' | 'tel' | 'url' | 'email' | 'numeric' | 'decimal' | 'search'
  required?: boolean
  disabled?: boolean
  /** Show a password visibility toggle (only relevant when type="password"). */
  showPasswordToggle?: boolean
  /** Inline validation error shown below the input (reserved height avoids layout shift).
   *  Pass an empty string to reserve space without showing a message; omit entirely to render no slot. */
  error?: string
}>(), {
  type: 'text',
  required: false,
  disabled: false,
  showPasswordToggle: false,
})

const model = defineModel<string>({ default: '' })
const showPassword = ref(false)

const actualType = computed(() => {
  if (props.type === 'password' && props.showPasswordToggle) {
    return showPassword.value ? 'text' : 'password'
  }
  return props.type
})
</script>

<template>
  <div class="relative">
    <label :for="id" class="mb-1.5 block text-sm font-semibold text-navy">
      {{ label }}
    </label>
    <div :class="showPasswordToggle ? 'relative' : ''">
      <input
        :id="id"
        v-model="model"
        :type="actualType"
        :placeholder="placeholder"
        :autocomplete="autocomplete"
        :inputmode="inputmode"
        :required="required"
        :disabled="disabled"
        :class="[
          'w-full rounded-xl border-2 bg-cream px-4 py-3 text-navy placeholder:text-navy/40 focus:outline-none focus:ring-2',
          error
            ? 'border-coral focus:border-coral focus:ring-coral/20'
            : 'border-cloud/50 focus:border-blue focus:ring-blue/20',
          showPasswordToggle ? 'pr-12' : '',
        ]"
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
