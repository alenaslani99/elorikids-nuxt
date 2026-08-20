/** Shared validation regexes used across all form pages. */
export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
export const phoneRegex = /^\+?\d[\d\s/-]{6,}$/

export function useValidation() {
  return { emailRegex, phoneRegex }
}
