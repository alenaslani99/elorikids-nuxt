/**
 * Shared form status state used across all form pages
 * (login, register, forgot-password, contact, checkout, track-order).
 */
export function useFormStatus() {
  const status = ref<'idle' | 'loading' | 'success' | 'error'>('idle')
  const errorMessage = ref('')

  function setError(msg: string) {
    status.value = 'error'
    errorMessage.value = msg
  }

  function reset() {
    status.value = 'idle'
    errorMessage.value = ''
  }

  /** Call from a `watch(form, …)` to clear stale error/success on edit. */
  function clearStale() {
    if (status.value === 'error' || status.value === 'success') {
      reset()
    }
  }

  return { status, errorMessage, setError, reset, clearStale }
}
