<script setup lang="ts">
//
</script>

<template>
  <section class="relative overflow-hidden bg-gradient-to-b from-sky/40 to-cream">
    <div class="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
      <div class="grid items-center gap-12 lg:grid-cols-2">
        <!-- Text -->
        <div>
          <h1 class="font-unbounded mb-6 text-4xl font-extrabold leading-tight text-navy md:text-5xl lg:text-6xl">
            Knjige koje deci čine učenje zabavnim
          </h1>

          <p class="mb-8 max-w-lg text-lg leading-relaxed text-navy/70">
            Laminirane, vodootporne stranice koje se mogu brisati i ponovo koristiti. Originalni, ručno ilustrovani sadržaj za decu uzrasta 2 do 6 godina - učenje kroz igru, iznova i iznova.
          </p>

          <div class="flex flex-wrap gap-4">
            <NuxtLink
              to="/#categories"
              class="inline-flex items-center gap-2 rounded-full bg-blue px-6 py-3 font-semibold text-white transition-colors hover:bg-navy"
            >
              Pogledaj knjige
              <Icon name="lucide:arrow-right" class="size-5" />
            </NuxtLink>
            <NuxtLink
              to="/#value-props"
              class="inline-flex items-center gap-2 rounded-full border-2 border-cloud bg-white px-6 py-3 font-semibold text-navy transition-colors hover:border-blue hover:text-blue"
            >
              Kako radi?
            </NuxtLink>
          </div>
        </div>

        <!-- Visual -->
        <div class="relative">
          <NuxtImg
            src="/elorikids-1.jpg"
            alt="Elorikids interaktivne piši-briši knjige za decu od 2 do 6 godina"
            class="aspect-square w-full rounded-3xl object-cover shadow-xl"
            width="400"
            height="400"
            format="webp"
            loading="lazy"
          />
        </div>
      </div>
    </div>
  </section>
</template>
