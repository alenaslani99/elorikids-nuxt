/**
 * Google Tag Manager, gated by the cookie banner.
 *
 * - Nothing loads until the visitor grants analytics or marketing consent.
 * - Google Consent Mode v2 signals are set from the visitor's choice, so tags
 *   inside GTM can require `analytics_storage` / `ad_storage` before firing.
 * - Nuxt is an SPA after the first load, so a `page_view` dataLayer event is
 *   pushed on every route change (use a Custom Event trigger in GTM, not
 *   "All Pages").
 */
import type { ConsentChoice } from '~/composables/useConsent'

declare global {
  interface Window {
    dataLayer: unknown[]
  }
}

function gtag(..._args: unknown[]) {
  // Consent Mode reads the `arguments` object, not a plain array.
  window.dataLayer.push(arguments)
}

function consentState(c: ConsentChoice) {
  const ads = c.marketing ? 'granted' : 'denied'
  return {
    analytics_storage: c.analytics ? 'granted' : 'denied',
    ad_storage: ads,
    ad_user_data: ads,
    ad_personalization: ads,
  }
}

// Admin pages are internal - keep them out of analytics and ad audiences.
const isTrackedPath = (path: string) => !path.startsWith('/admin')

export default defineNuxtPlugin(() => {
  const gtmId = useRuntimeConfig().public.gtmId as string
  if (!gtmId) return

  const { choice } = useConsent()
  const router = useRouter()

  window.dataLayer = window.dataLayer || []
  gtag('consent', 'default', {
    analytics_storage: 'denied',
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
  })

  let loaded = false

  function pageView(path: string) {
    if (!loaded || !isTrackedPath(path)) return
    window.dataLayer.push({
      event: 'page_view',
      page_path: path,
      page_location: window.location.href,
      page_title: document.title,
    })
  }

  function load() {
    if (loaded) return
    loaded = true
    window.dataLayer.push({ 'gtm.start': Date.now(), 'event': 'gtm.js' })
    const s = document.createElement('script')
    s.async = true
    s.src = `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(gtmId)}`
    document.head.appendChild(s)
    pageView(router.currentRoute.value.fullPath)
  }

  watch(choice, (next, prev) => {
    if (!next) return
    gtag('consent', 'update', consentState(next))
    window.dataLayer.push({ event: 'consent_update', ...consentState(next) })

    // Revoking a category after tags already ran: reload so Meta/Google
    // scripts are gone from memory, not just told to stop.
    const revoked = prev && ((prev.analytics && !next.analytics) || (prev.marketing && !next.marketing))
    if (loaded && revoked) {
      window.location.reload()
      return
    }

    if (next.analytics || next.marketing) load()
  }, { immediate: true })

  // Title is set by useHead after navigation; wait a tick so page_title is right.
  router.afterEach((to, from) => {
    if (to.fullPath === from.fullPath) return
    nextTick(() => pageView(to.fullPath))
  })
})
