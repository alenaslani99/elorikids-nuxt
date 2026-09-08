import tailwindcss from "@tailwindcss/vite";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxt/icon', '@nuxt/fonts', '@nuxt/image'],
  features: {
    // Inline page-critical CSS into SSR HTML: removes the render-blocking
    // /_nuxt/entry.*.css request from the critical path (Lighthouse: ~340ms).
    inlineStyles: true,
  },
  components: [
    { path: '~/components', pathPrefix: false },
  ],
  css: ['~/assets/css/main.css'],
  fonts: {
    families: [
      { name: 'Unbounded', provider: 'google' },
    ],
  },
  app: {
    head: {
      htmlAttrs: { lang: 'sr-Latn' },
      title: 'elorikids - Interaktivne knjige za decu',
      meta: [
        { name: 'description', content: 'Interaktivne piši-briši knjige za decu uzrasta 2-6 godina. Laminirane, vodootporne stranice, originalni ručno ilustrovani sadržaj. Učenje kroz igru.' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'theme-color', content: '#123F73' },
        // ── Global Open Graph / Twitter defaults ──
        // Per-page OG tags override these. og:image uses an absolute URL
        // because social crawlers don't resolve relative paths.
        { property: 'og:site_name', content: 'elorikids' },
        { property: 'og:locale', content: 'sr_RS' },
        { property: 'og:image', content: 'https://elorikids.rs/elorikids-1.jpg' },
        { property: 'og:image:width', content: '1280' },
        { property: 'og:image:height', content: '1920' },
        { name: 'twitter:card', content: 'summary_large_image' },
      ],
      link: [
        // Preload the Unbounded latin + latin-ext woff2 used by the hero H1:
        // they chained ~940ms behind the CSS in the critical path. Latin-ext
        // carries Serbian diacritics (čćžšđ, e.g. "učenje") - without it those
        // glyphs swap in late and shift the headline (CLS). NOTE: the filename
        // hashes are content-based — if @nuxt/fonts output changes, update
        // these URLs (find the files in .output/public/_fonts/ after build).
        { rel: 'preload', as: 'font', type: 'font/woff2', crossorigin: 'anonymous', href: '/_fonts/kszk12Vcoz7vUH9r_CDxDeuw-zVu9AAWJDILFh6BHz0-l1qIasRKkG0aY8Frl8gdWxoe7LM3laaQ4OM17i2YYi8.woff2' },
        { rel: 'preload', as: 'font', type: 'font/woff2', crossorigin: 'anonymous', href: '/_fonts/xJ3E-P_YyxQozBk-LSKho30vBh8p2BM9_Nyr9bLfcfg-gsUhBK1eL7K2W7ELQG0Yo1Igd_qHYCrfipiZ91c6NLE.woff2' },
        { rel: 'icon', type: 'image/x-icon', href: '/favicon_io/favicon.ico' },
        { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon_io/favicon-32x32.png' },
        { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon_io/favicon-16x16.png' },
        { rel: 'apple-touch-icon', href: '/favicon_io/apple-touch-icon.png' },
        { rel: 'manifest', href: '/favicon_io/site.webmanifest' },
      ],
    },
  },
  vite: {
    plugins: [
      tailwindcss(),
    ],
  },
  nitro: {
    preset: 'cloudflare-module',
  },
  routeRules: {
    // ── SSR pages (left on by default - SEO-critical, public content) ──
    //   /, /about-us, /faq, /legal/**, /books/**
    //   /blog/** (SEO-critical - blog index and posts must render server-side)
    //   /auth/login, /auth/register (form renders immediately, no flash)
    //
    // ── Homepage Link headers (RFC 8288 / RFC 9727 §3) ──────────────────
    //   Points agents to machine-readable resources for discovery.
    '/': {
      headers: {
        Link: '</llms.txt>; rel="describedby", </products.md>; rel="describedby", </sitemap.xml>; rel="describedby"',
        // HTML must revalidate: prevents stale SSR referencing old hashed
        // /_nuxt/* chunks after a new deploy (Lighthouse 404 BVVkIIX0.js).
        'Cache-Control': 'public, max-age=0, must-revalidate',
        // Security hardening (Lighthouse best-practices informative).
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
        'X-Frame-Options': 'SAMEORIGIN',
        'Content-Security-Policy': "frame-ancestors 'self'",
        'Cross-Origin-Opener-Policy': 'same-origin',
        'X-Content-Type-Options': 'nosniff',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
      },
    },
    // ── Immutable hashed/static assets (1y) ─────────────────────────────
    //   Explicit (Nitro/Cloudflare already defaults _nuxt to immutable,
    //   but explicit guards against regressions and stale-HTML skew).
    '/_nuxt/**': {
      headers: { 'Cache-Control': 'public, max-age=31536000, immutable' },
    },
    '/_fonts/**': {
      headers: { 'Cache-Control': 'public, max-age=31536000, immutable' },
    },
    //
    // ── SPA-only pages (ssr: false) ────────────────────────────────────
    //   No SEO value / requires client session / post-action flows.
    //   The client auth plugin resolves the session before render, so
    //   gating on isReady gives a clean state with no hydration mismatch.
    '/admin/**': { ssr: false },
    '/shop/**': { ssr: false },
    '/auth/account': { ssr: false },
    '/auth/forgot-password': { ssr: false },
    '/track-order': { ssr: false },
  },
  icon: {
    clientBundle: {
      scan: true
    }
  }
});
