/**
 * Re-exports shared validation patterns for client-side use.
 *
 * The actual definitions live in `shared/utils/validation.ts` so they
 * are shared with the server. This composable provides the auto-imported
 * `useValidation()` wrapper for backward compatibility.
 */
import {
  emailRegex,
  phoneRegex,
  serbianPhoneRegex,
  postalRegex,
  nameRegex,
  streetNumberRegex,
} from '~~/shared/utils/validation'

export { emailRegex, phoneRegex, serbianPhoneRegex, postalRegex, nameRegex, streetNumberRegex }

export function useValidation() {
  return { emailRegex, phoneRegex, serbianPhoneRegex, postalRegex, nameRegex, streetNumberRegex }
}
