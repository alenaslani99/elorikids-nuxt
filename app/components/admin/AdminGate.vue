<script setup lang="ts">
/**
 * Security gate for the admin panel.
 * Two modes:
 *   - 'setup':  first-time configuration of the security question + answer
 *   - 'verify':  answer the security question to elevate the session
 *
 * Emits 'done' when setup or verification succeeds — the parent
 * page then re-checks the admin status.
 */
const props = defineProps<{
  mode: 'setup' | 'verify'
  question?: string
}>()

const emit = defineEmits<{
  done: []
}>()

const { status, errorMessage, setError, reset, clearStale } = useFormStatus()

// ── Setup form ──────────────────────────────────────────────────
const setupForm = reactive({
  question: '',
  answer: '',
  confirmAnswer: '',
})
const setupSubmitted = ref(false)

const questionError = computed(() => {
  if (!setupSubmitted.value) return ''
  if (!setupForm.question.trim() || setupForm.question.trim().length < 5)
    return 'Pitanje mora imati najmanje 5 karaktera.'
  return ''
})
const answerError = computed(() => {
  if (!setupSubmitted.value) return ''
  if (!setupForm.answer.trim() || setupForm.answer.trim().length < 3)
    return 'Odgovor mora imati najmanje 3 karaktera.'
  if (setupForm.answer !== setupForm.confirmAnswer)
    return 'Odgovori se ne poklapaju.'
  return ''
})

// ── Verify form ─────────────────────────────────────────────────
const verifyAnswer = ref('')

// Clear stale error/success on any edit
watch(
  [() => setupForm.question, () => setupForm.answer, () => setupForm.confirmAnswer, verifyAnswer],
  () => clearStale(),
)

async function handleSetup() {
  reset()
  setupSubmitted.value = true
  if (questionError.value || answerError.value) return

  status.value = 'loading'
  try {
    await $fetch('/api/admin/setup', {
      method: 'POST',
      body: {
        question: setupForm.question.trim(),
        answer: setupForm.answer.trim(),
      },
    })
    emit('done')
  }
  catch (e: any) {
    setError(e?.data?.statusMessage || 'Došlo je do greške. Pokušajte ponovo.')
  }
}

async function handleVerify() {
  reset()
  if (!verifyAnswer.value.trim()) {
    setError('Odgovor je obavezan.')
    return
  }

  status.value = 'loading'
  try {
    await $fetch('/api/admin/elevate', {
      method: 'POST',
      body: { answer: verifyAnswer.value.trim() },
    })
    emit('done')
  }
  catch (e: any) {
    setError(e?.data?.statusMessage || 'Došlo je do greške. Pokušajte ponovo.')
  }
}
</script>

<template>
  <div class="bg-cream">
    <section class="flex min-h-[60vh] items-center justify-center py-12 lg:py-16">
      <div class="w-full max-w-md px-4 sm:px-6 lg:px-8">
        <div class="rounded-3xl border-2 border-cloud/40 bg-white p-8 shadow-sm">
          <div class="mb-6 text-center">
            <div class="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-navy/5">
              <Icon name="lucide:shield-check" class="size-8 text-navy" />
            </div>
            <h2 class="font-unbounded text-2xl font-bold text-navy">
              {{ mode === 'setup' ? 'Postavite sigurnosno pitanje' : 'Potvrda identiteta' }}
            </h2>
            <p class="mt-2 text-navy/60">
              {{ mode === 'setup'
                ? 'Dodatni sloj sigurnosti za pristup admin panelu.'
                : 'Unesite odgovor na sigurnosno pitanje da biste pristupili panelu.'
              }}
            </p>
          </div>

          <!-- Setup mode -->
          <form v-if="mode === 'setup'" class="space-y-5" @submit.prevent="handleSetup">
            <AppInput
              id="question"
              v-model="setupForm.question"
              label="Sigurnosno pitanje"
              type="text"
              placeholder="npr. Koji je naziv vašeg prvog ljubimca?"
              required
              :disabled="status === 'loading'"
              :error="questionError"
            />
            <AppInput
              id="answer"
              v-model="setupForm.answer"
              label="Odgovor"
              type="password"
              show-password-toggle
              placeholder="••••••••"
              required
              :disabled="status === 'loading'"
              :error="answerError"
            />
            <AppInput
              id="confirmAnswer"
              v-model="setupForm.confirmAnswer"
              label="Potvrdite odgovor"
              type="password"
              show-password-toggle
              placeholder="••••••••"
              required
              :disabled="status === 'loading'"
            />

            <p
              class="min-h-5 text-sm text-coral transition-opacity duration-200"
              :class="status === 'error' ? 'opacity-100' : 'opacity-0'"
              role="alert"
            >
              {{ errorMessage }}
            </p>

            <AppSubmitButton
              :loading="status === 'loading'"
              label="Postavi pitanje"
              loading-label="Čuvanje..."
            />
          </form>

          <!-- Verify mode -->
          <form v-else class="space-y-5" @submit.prevent="handleVerify">
            <div class="rounded-2xl bg-sky/20 p-4">
              <p class="text-sm font-semibold text-navy">
                Sigurnosno pitanje:
              </p>
              <p class="mt-1 text-navy/70">
                {{ question }}
              </p>
            </div>

            <AppInput
              id="securityAnswer"
              v-model="verifyAnswer"
              label="Vaš odgovor"
              type="password"
              show-password-toggle
              autocomplete="off"
              required
              placeholder="••••••••"
              :disabled="status === 'loading'"
            />

            <p
              class="min-h-5 text-sm text-coral transition-opacity duration-200"
              :class="status === 'error' ? 'opacity-100' : 'opacity-0'"
              role="alert"
            >
              {{ errorMessage }}
            </p>

            <AppSubmitButton
              :loading="status === 'loading'"
              label="Potvrdi"
              loading-label="Provera..."
            />
          </form>
        </div>
      </div>
    </section>
  </div>
</template>
