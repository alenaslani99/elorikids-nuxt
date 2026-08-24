<template>
  <div class="min-h-screen flex flex-col">
    <AppHeader />
    <main class="flex-1">
      <slot />
    </main>
    <AppNewsletter />
    <AppFooter />
    <CookieConsent />
  </div>
</template>
