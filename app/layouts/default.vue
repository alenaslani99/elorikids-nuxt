<template>
  <div class="min-h-screen flex flex-col">
    <AppHeader />
    <main class="flex-1">
      <slot />
    </main>
    <!-- Below fold on every page: defer hydration to cut initial JS/TBT.
         SSR HTML still renders for SEO. -->
    <LazyAppNewsletter hydrate-on-visible />
    <LazyAppFooter hydrate-on-visible />
    <CookieConsent />
  </div>
</template>
