<script setup lang="ts">
</script>

<template>
  <section class="bg-cream py-16 lg:py-24" id="faq">
    <div class="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
      <!-- Section header -->
      <div class="mx-auto mb-12 max-w-2xl text-center">
        <span class="inline-block rounded-full bg-sky/40 px-4 py-1.5 text-sm font-semibold text-navy">
          Česta pitanja
        </span>
        <h2 class="font-unbounded mt-4 text-3xl font-extrabold text-navy md:text-4xl">
          Odgovori na vaša pitanja
        </h2>
        <p class="mt-4 text-lg text-navy/70">
          Sve što treba da znate o našim knjigama, načinu upotrebe i dostavi.
        </p>
      </div>

      <!-- Accordion -->
      <AppFaqAccordion :items="faqs" />

      <!-- Contact CTA -->
      <div class="mt-10 text-center">
        <p class="text-navy/70">
          Niste našli odgovor na svoje pitanje?
        </p>
        <NuxtLink
          to="/legal/contact"
          class="mt-3 inline-flex items-center gap-2 font-semibold text-navy transition-colors hover:text-blue"
        >
          Kontaktirajte nas
          <Icon name="lucide:arrow-right" class="size-4" />
        </NuxtLink>
      </div>
    </div>
  </section>
</template>
