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
  /** Capitalize the first letter of each word as the user types (names, addresses, cities). */
  capitalize?: boolean
}>(), {
  type: 'text',
  required: false,
  disabled: false,
  showPasswordToggle: false,
  capitalize: false,
})

const model = defineModel<string>({ default: '' })
const showPassword = ref(false)

const actualType = computed(() => {
  if (props.type === 'password' && props.showPasswordToggle) {
    return showPassword.value ? 'text' : 'password'
  }
  return props.type
})

// Capitalize the first letter of every word. Preserves cursor position so
// typing in the middle of a word doesn't jump the caret to the end.
function onInput(e: Event) {
  const el = e.target as HTMLInputElement
  const { selectionStart, selectionEnd } = el
  model.value = el.value
    .toLowerCase()
    .replace(/(^|\s)([a-zšđčćž])/g, (_, space, ch) => space + ch.toUpperCase())
  // Restore selection on the next tick (after v-model writes the value)
  nextTick(() => {
    if (selectionStart !== null && selectionEnd !== null) {
      el.setSelectionRange(selectionStart, selectionEnd)
    }
  })
}
</script>

<template>
  <div class="relative">
    <label :for="id" class="mb-1.5 block text-sm font-semibold text-navy">
      {{ label }}
    </label>
    <div :class="showPasswordToggle ? 'relative' : ''">
      <input
        :id="id"
        :name="id"
        v-model="model"
        :type="actualType"
        :placeholder="placeholder"
        :autocomplete="autocomplete"
        :inputmode="inputmode"
        :required="required"
        :disabled="disabled"
        :autocapitalize="capitalize ? 'words' : undefined"
        @input="capitalize ? onInput($event) : undefined"
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

    <!-- Inline error: reserved height keeps it in flow so it never overlaps content below,
         while avoiding layout shift for the common single-line case. -->
    <p
      v-if="error !== undefined"
      class="flex min-h-5 items-start gap-1 pt-0.5 text-xs text-coral transition-opacity duration-200"
      :class="error ? 'opacity-100' : 'opacity-0 pointer-events-none'"
    >
      <Icon name="lucide:alert-circle" class="size-3 shrink-0" />
      <span>{{ error || '\u00A0' }}</span>
    </p>
  </div>
</template>
