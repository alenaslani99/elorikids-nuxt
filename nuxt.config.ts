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
        // Preload the Unbounded latin woff2 used by the hero H1: it chained
        // ~940ms behind the CSS in the critical path. NOTE: the filename hash
        // is content-based — if @nuxt/fonts output changes, update this URL
        // (find the ~45KB file in .output/public/_fonts/ after build).
        { rel: 'preload', as: 'font', type: 'font/woff2', crossorigin: 'anonymous', href: '/_fonts/kszk12Vcoz7vUH9r_CDxDeuw-zVu9AAWJDILFh6BHz0-l1qIasRKkG0aY8Frl8gdWxoe7LM3laaQ4OM17i2YYi8.woff2' },
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
      },
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
