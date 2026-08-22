import tailwindcss from "@tailwindcss/vite";

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxt/icon', '@nuxt/fonts', '@nuxt/image'],
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
      ],
      link: [
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
  icon: {
    clientBundle: {
      scan: true
    }
  }
});
