import type { InjectionKey } from 'vue'

/** Provided by pages/admin.vue - re-checks admin status (shows the gate again). */
export const ADMIN_REFRESH_STATUS: InjectionKey<() => Promise<void>> = Symbol('admin-refresh-status')

/**
 * Helpers for admin child pages. A 403 from an admin API means the
 * elevation expired (1h window) or was locked elsewhere, so the parent
 * re-checks status and the security gate takes over.
 */
export function useAdmin() {
  const refreshStatus = inject(ADMIN_REFRESH_STATUS, async () => {})

  function errorMessage(e: any, fallback: string): string {
    if (e?.statusCode === 403 || e?.response?.status === 403) {
      refreshStatus()
    }
    return e?.data?.statusMessage || fallback
  }

  return { errorMessage }
}
