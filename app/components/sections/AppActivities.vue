<script setup lang="ts">
interface Activity {
  icon: string
  title: string
  description: string
  bg: string
  text: string
}

const activities: Activity[] = [
  {
    icon: 'lucide:route',
    title: 'Lavirinti',
    description: 'Pronađi pravi put kroz zavrzlame i razvij strpljenje i logičko mišljenje uz svaki zadatak.',
    bg: 'bg-coral',
    text: 'text-white',
  },
  {
    icon: 'lucide:palette',
    title: 'Boje',
    description: 'Upoznaj boje sveta oko sebe i sparuju ih sa predmetima - sunce je žuto, list je zelen.',
    bg: 'bg-yellow',
    text: 'text-navy',
  },
  {
    icon: 'lucide:paw-print',
    title: 'Životinje',
    description: 'Domaće i divlje životinje, roditelji i mladunci - sve na jednom mestu za upoznavanje.',
    bg: 'bg-mint',
    text: 'text-navy',
  },
  {
    icon: 'lucide:layout-grid',
    title: 'Sortiranje',
    description: 'Grupiši i razvrstaj voće, povrće i igračke po pravilima - uči razmišljanju korak po korak.',
    bg: 'bg-purple',
    text: 'text-white',
  },
  {
    icon: 'lucide:eye',
    title: 'Pronađi razlike',
    description: 'Uporedi slike i otkrij šta se razlikuje - pažnja i vizuelna percepcija na maksimumu.',
    bg: 'bg-blue',
    text: 'text-white',
  },
  {
    icon: 'lucide:link',
    title: 'Uparivanje',
    description: 'Spari parove i poveži koncepte koji idu zajedno - ključ i vrata, četkica i pasta za zube.',
    bg: 'bg-sky',
    text: 'text-navy',
  },
]

const flipped = ref<boolean[]>(activities.map(() => false))

function flip(index: number) {
  flipped.value[index] = !flipped.value[index]
}
</script>

<template>
  <section class="relative overflow-hidden bg-gradient-to-b from-sky/30 to-cream py-16 lg:py-24">
    <!-- Floating decorative blobs -->
    <div class="pointer-events-none absolute -left-16 top-10 size-48 animate-[float_6s_ease-in-out_infinite] rounded-full bg-coral/20 blur-2xl" />
    <div class="pointer-events-none absolute right-10 top-32 size-56 animate-[float_8s_ease-in-out_infinite] rounded-full bg-purple/20 blur-2xl" />
    <div class="pointer-events-none absolute bottom-10 left-1/3 size-52 animate-[float_7s_ease-in-out_infinite] rounded-full bg-yellow/20 blur-2xl" />

    <div class="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <!-- Section header -->
      <div class="mx-auto mb-12 max-w-2xl text-center">
        <span class="inline-block rounded-full bg-coral/20 px-4 py-1.5 text-sm font-semibold text-coral-dark">
          Igramo se!
        </span>
        <h2 class="font-unbounded mt-4 text-3xl font-extrabold text-navy md:text-4xl lg:text-5xl">
          Šta sve možeš raditi?
        </h2>
        <p class="mt-4 text-lg text-navy/70">
          Klikni na svaku pločicu i otkrij zabavne aktivnosti koje te čekaju u našim knjigama!
        </p>
      </div>

      <!-- Flip cards grid -->
      <div class="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-3">
        <button
          v-for="(activity, index) in activities"
          :key="activity.title"
          type="button"
          class="group [perspective:1200px]"
          :aria-expanded="flipped[index] ? 'true' : 'false'"
          @click="flip(index)"
        >
          <div
            class="relative h-52 transition-transform duration-500 [transform-style:preserve-3d] sm:h-56"
            :class="flipped[index] ? '[transform:rotateY(180deg)]' : ''"
          >
            <!-- Front -->
            <div
              class="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-3xl p-4 shadow-md transition-shadow duration-300 [backface-visibility:hidden] group-hover:shadow-xl group-hover:-translate-y-1 sm:gap-4 sm:p-6"
              :class="[activity.bg, activity.text]"
            >
              <div class="flex size-14 items-center justify-center rounded-2xl bg-white/25 sm:size-16">
                <Icon :name="activity.icon" class="size-7 sm:size-9" />
              </div>
              <span class="font-unbounded text-base font-extrabold sm:text-xl">{{ activity.title }}</span>
              <span class="flex items-center gap-1 text-xs font-medium opacity-80">
                <Icon name="lucide:rotate-cw" class="size-3" />
                Klikni za više
              </span>
            </div>

            <!-- Back -->
            <div
              class="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-3xl border-2 bg-white p-4 text-center shadow-md [backface-visibility:hidden] [transform:rotateY(180deg)] sm:gap-3 sm:p-6"
              :class="flipped[index] ? 'border-blue/40' : 'border-cloud/40'"
            >
              <div
                class="flex size-10 shrink-0 items-center justify-center rounded-2xl sm:size-14"
                :class="[activity.bg, activity.text]"
              >
                <Icon :name="activity.icon" class="size-5 sm:size-7" />
              </div>
              <h3 class="font-unbounded text-sm font-bold text-navy sm:text-lg">
                {{ activity.title }}
              </h3>
              <p class="text-xs leading-relaxed text-navy/70 sm:text-sm">
                {{ activity.description }}
              </p>
            </div>
          </div>
        </button>
      </div>

      <!-- Hint -->
      <p class="mt-8 text-center text-sm text-navy/75">
        <Icon name="lucide:hand" class="mr-1 inline size-4" />
        Dodirni bilo koju pločicu da je okreneš
      </p>
    </div>
  </section>
</template>

<style scoped>
@keyframes float {
  0%, 100% {
    transform: translateY(0) translateX(0);
  }
  50% {
    transform: translateY(-20px) translateX(10px);
  }
}
</style>
