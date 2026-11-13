<script setup lang="ts">
/**
 * Security gate for the admin panel.
 *
 * The panel is open for 1 hour after a Google sign-in. Once that
 * window has passed (or the panel was locked), the owner confirms
 * their identity by going through Google again - the callback opens a
 * fresh window and returns to /admin.
 */
const confirmUrl = googleSignInUrl('/admin')
</script>

<template>
  <div class="bg-cream">
    <section class="flex min-h-[60vh] items-center justify-center py-12 lg:py-16">
      <div class="w-full max-w-md px-4 sm:px-6 lg:px-8">
        <div class="rounded-3xl border-2 border-cloud/40 bg-white p-8 text-center shadow-sm">
          <div class="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-navy/5">
            <Icon name="lucide:shield-check" class="size-8 text-navy" />
          </div>
          <h2 class="font-unbounded text-2xl font-bold text-navy">
            Potvrda identiteta
          </h2>
          <p class="mt-2 text-navy/60">
            Admin panel je zaključan. Potvrdite identitet putem Google naloga da biste nastavili.
          </p>

          <!-- Full-page navigation to the API route (not a client route) -->
          <a
            :href="confirmUrl"
            class="mt-6 flex w-full items-center justify-center gap-2 rounded-full bg-navy px-6 py-3 font-semibold text-white transition-colors hover:bg-navy-dark"
          >
            <Icon name="lucide:log-in" class="size-5" />
            Potvrdi preko Google-a
          </a>
        </div>
      </div>
    </section>
  </div>
</template>
