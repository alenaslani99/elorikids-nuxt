<script setup lang="ts">
/**
 * Change-password card for the account page. The server re-checks
 * everything (current password, policy, rate limit) - validation here is
 * only for fast feedback.
 */
const { passwordRegex } = useValidation()
const { status, errorMessage, setError, reset, clearStale } = useFormStatus()

const form = reactive({ current: '', next: '', confirm: '' })
const submitted = ref(false)

const currentError = computed(() =>
  submitted.value && !form.current ? 'Unesite trenutnu lozinku.' : '',
)
const nextError = computed(() => {
  if (!submitted.value) return ''
  if (!passwordRegex.test(form.next)) return 'Najmanje 8 karaktera i bar jedna cifra.'
  if (form.next === form.current) return 'Mora biti različita od trenutne.'
  return ''
})
const confirmError = computed(() => {
  if (form.next === form.confirm) return ''
  return submitted.value || form.confirm ? 'Lozinke se ne poklapaju.' : ''
})

// Clear stale error/success as soon as the user edits a field
watch(form, () => {
  if (status.value !== 'loading') clearStale()
})

async function handleSubmit() {
  reset()
  submitted.value = true
  if (currentError.value || nextError.value || confirmError.value) return

  status.value = 'loading'
  try {
    await $fetch('/api/account/password', {
      method: 'POST',
      body: { currentPassword: form.current, newPassword: form.next },
    })
    submitted.value = false
    Object.assign(form, { current: '', next: '', confirm: '' })
    // After the form watcher has run, so the message isn't cleared by it
    await nextTick()
    status.value = 'success'
  }
  catch (e: any) {
    setError(e?.data?.statusMessage || 'Promena lozinke nije uspela. Pokušajte ponovo.')
  }
}
</script>

<template>
  <div class="rounded-3xl border-2 border-cloud/40 bg-white p-6 shadow-sm sm:p-8">
    <div class="mb-6 flex items-center gap-3">
      <div class="flex size-10 items-center justify-center rounded-xl bg-purple/15">
        <Icon name="lucide:key-round" class="size-5 text-purple-dark" />
      </div>
      <h2 class="font-unbounded text-xl font-bold text-navy">
        Promena lozinke
      </h2>
    </div>

    <form class="space-y-4" novalidate @submit.prevent="handleSubmit">
      <AppInput
        id="current-password"
        v-model="form.current"
        label="Trenutna lozinka"
        type="password"
        show-password-toggle
        autocomplete="current-password"
        required
        :disabled="status === 'loading'"
        :error="currentError"
      />
      <AppInput
        id="new-password"
        v-model="form.next"
        label="Nova lozinka"
        type="password"
        show-password-toggle
        autocomplete="new-password"
        required
        :disabled="status === 'loading'"
        :error="nextError"
      />
      <AppInput
        id="new-password-confirm"
        v-model="form.confirm"
        label="Potvrdite novu lozinku"
        type="password"
        autocomplete="new-password"
        required
        :disabled="status === 'loading'"
        :error="confirmError"
      />

      <p class="text-xs text-navy/50">
        Najmanje 8 karaktera, bar jedna cifra. Posle promene bićete odjavljeni sa svih ostalih uređaja.
      </p>

      <!-- Status (always reserved to avoid layout shift) -->
      <p
        class="min-h-5 text-sm transition-opacity duration-200"
        :class="[
          status === 'error' || status === 'success' ? 'opacity-100' : 'opacity-0',
          status === 'success' ? 'text-mint-dark' : 'text-coral',
        ]"
        role="status"
      >
        {{ status === 'success' ? 'Lozinka je promenjena.' : errorMessage }}
      </p>

      <AppSubmitButton
        :loading="status === 'loading'"
        label="Promeni lozinku"
        loading-label="Čuvanje..."
      />
    </form>
  </div>
</template>
