<script setup lang="ts">
useHead({
  title: 'O nama - elorikids',
  meta: [
    { name: 'description', content: 'elorikids je brend interaktivnih piši-briši knjiga za decu uzrasta 2 do 6 godina. Laminirane, vodootporne stranice sa originalnim ručno ilustrovanim sadržajem. Učenje kroz igru, iznova i iznova.' },
  ],
})

const values = [
  {
    icon: 'lucide:heart',
    title: 'Ljubav u svakom detalju',
    description: 'Svaku knjigu kreiramo od nule — od prve skice do poslednje ilustracije. Nema kopiranih materijala, samo originalni sadržaj napravljen sa ljubavlju prema deci.',
    accent: 'coral',
  },
  {
    icon: 'lucide:leaf',
    title: 'Održivost',
    description: 'Piši-briši sistem znači da jedna knjiga zamenjuje stotine radnih listova. Manje papira, manje otpada, više učenja — iznova i iznova.',
    accent: 'mint',
  },
  {
    icon: 'lucide:baby',
    title: 'Prilagođeno uzrastu',
    description: 'Svaka knjiga prati razvojni stadijum deteta — od prepoznavanja boja sa 2 godine do lavirinta i koncentracije pred školu.',
    accent: 'blue',
  },
  {
    icon: 'lucide:hand-heart',
    title: 'Bezbednost na prvom mestu',
    description: 'Netoksični materijali, zaobljene ivice i izdržljive stranice koje ne kidaju. Knjige su bezbedne za najmlađe mališane.',
    accent: 'purple',
  },
]

const stats = [
  { value: '500+', label: 'Zadovoljnih porodica' },
  { value: '3', label: 'Knjige po uzrastu' },
  { value: '32', label: 'Stranice po knjizi' },
  { value: '4,9/5', label: 'Prosečna ocena' },
]

const milestones = [
  {
    icon: 'lucide:lightbulb',
    title: 'Ideja',
    text: 'Kao roditelji, tražili smo nešto što nije ekran — nešto što decu drži pažnjom, uči kroz igru i traje.',
    accent: 'yellow',
  },
  {
    icon: 'lucide:pen-tool',
    title: 'Kreacija',
    text: 'Počeli smo da crtamo i osmišljavamo zadate — svaki ručno ilustrovan, prilagođen uzrastu i pun boja.',
    accent: 'coral',
  },
  {
    icon: 'lucide:book-open-check',
    title: 'Danas',
    text: 'Tri knjige, stotine zadatka i preko 500 porodica širom Srbije koje uče i igraju se sa nama.',
    accent: 'mint',
  },
]

const milestoneAccent: Record<string, string> = {
  yellow: 'bg-yellow/20 text-yellow',
  coral: 'bg-coral/10 text-coral',
  mint: 'bg-mint/15 text-mint',
}
</script>

<template>
  <div>
    <!-- Page header -->
    <AppPageHeader
      title="Priča koja počinje decom"
      badge="O nama"
      badge-class="bg-coral/20 text-coral"
      subtitle="elorikids je rođen iz jednostavne želje — da deci ponudimo nešto lepše od ekrana. Interaktivne piši-briši knjige koje budu radoznalost, razvijaju veštine i čine učenje zabavnim."
      :breadcrumb-items="[{ label: 'Početna', to: '/' }, { label: 'O nama' }]"
    />

    <!-- Brand story -->
    <section class="bg-cream py-16 lg:py-24">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="grid items-center gap-12 lg:grid-cols-2">
          <!-- Text -->
          <div>
            <span class="inline-block rounded-full bg-sky/40 px-4 py-1.5 text-sm font-semibold text-navy">
              Naša priča
            </span>
            <h2 class="font-unbounded mt-4 text-3xl font-extrabold text-navy md:text-4xl">
              Od ideje do knjiga u rukama dece
            </h2>
            <div class="mt-6 space-y-4 text-lg leading-relaxed text-navy/70">
              <p>
                Sve je počelo kao roditeljska dilema — kako decu uzrasta 2 do 6 godina zaokupiti
                nečim što je zabavno, edukativno i nije još jedan ekran? Odgovor smo pronašli u
                piši-briši sistemu: laminiranim, vodootpornim stranicama koje se mogu brisati
                i koristiti iznova.
              </p>
              <p>
                Svaku knjigu kreiramo od nule. Zadaci su ručno ilustrovani, pažljivo prilagođeni
                uzrastu i puni boja. Nema kopiranih materijala — sve nastaje sa ljubavlju, za našu
                decu i njihove potrebe.
              </p>
              <p>
                Danas, preko 500 porodica širom Srbije uči i igra se sa elorikids knjigama.
                I tek smo počeli.
              </p>
            </div>
          </div>

          <!-- Image -->
          <div class="relative">
            <NuxtImg
              src="/elorikids-1.jpg"
              alt="elorikids interaktivne piši-briši knjige za decu od 2 do 6 godina"
              class="aspect-square w-full rounded-3xl object-cover shadow-xl"
              width="400"
              height="400"
              format="webp"
              loading="lazy"
            />
            <!-- Floating badge -->
            <div class="absolute -bottom-6 -left-6 hidden rounded-2xl border-2 border-cloud/40 bg-white p-5 shadow-lg sm:block">
              <p class="font-unbounded text-3xl font-extrabold text-blue">100%</p>
              <p class="text-sm text-navy/60">originalni sadržaj</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Values -->
    <section class="bg-gradient-to-b from-cream to-sky/20 py-16 lg:py-24">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="mx-auto mb-12 max-w-2xl text-center">
          <span class="inline-block rounded-full bg-purple/20 px-4 py-1.5 text-sm font-semibold text-purple">
            Naše vrednosti
          </span>
          <h2 class="font-unbounded mt-4 text-3xl font-extrabold text-navy md:text-4xl">
            U šta verujemo
          </h2>
          <p class="mt-4 text-lg text-navy/70">
            Četiri načela koja vode svaku knjigu koju napravimo.
          </p>
        </div>

        <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div
            v-for="value in values"
            :key="value.title"
            class="flex flex-col items-start rounded-3xl border-2 border-cloud/40 bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
          >
            <div
              class="mb-6 flex size-14 items-center justify-center rounded-2xl"
              :class="accentClasses[value.accent].soft"
            >
              <Icon
                :name="value.icon"
                class="size-7"
                :class="accentClasses[value.accent].text"
              />
            </div>
            <h3 class="mb-3 text-xl font-bold text-navy">
              {{ value.title }}
            </h3>
            <p class="text-sm leading-relaxed text-navy/70">
              {{ value.description }}
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Stats -->
    <section class="bg-navy py-16 lg:py-20">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-2 gap-8 text-center lg:grid-cols-4">
          <div v-for="stat in stats" :key="stat.label">
            <p class="font-unbounded text-4xl font-extrabold text-yellow md:text-5xl">
              {{ stat.value }}
            </p>
            <p class="mt-2 text-sm text-cloud/70">
              {{ stat.label }}
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Milestones -->
    <section class="bg-cream py-16 lg:py-24">
      <div class="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div class="mx-auto mb-12 max-w-2xl text-center">
          <span class="inline-block rounded-full bg-sky/40 px-4 py-1.5 text-sm font-semibold text-navy">
            Naš put
          </span>
          <h2 class="font-unbounded mt-4 text-3xl font-extrabold text-navy md:text-4xl">
            Kako smo došli dovde
          </h2>
        </div>

        <div class="grid gap-6 md:grid-cols-3">
          <div
            v-for="(milestone, index) in milestones"
            :key="milestone.title"
            class="relative rounded-3xl border-2 border-cloud/40 bg-white p-8 shadow-sm"
          >
            <span class="font-unbounded absolute -top-4 left-8 flex size-9 items-center justify-center rounded-full bg-navy text-sm font-bold text-white">
              {{ index + 1 }}
            </span>
            <div
              class="mb-5 flex size-14 items-center justify-center rounded-2xl"
              :class="milestoneAccent[milestone.accent]"
            >
              <Icon :name="milestone.icon" class="size-7" />
            </div>
            <h3 class="mb-3 text-xl font-bold text-navy">
              {{ milestone.title }}
            </h3>
            <p class="text-sm leading-relaxed text-navy/70">
              {{ milestone.text }}
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <AppCtaSection
      title="Spremni za učenje kroz igru?"
      subtitle="Pogledajte naše knjige i pronađite onu koja je prava za vaše dete."
      section-class="bg-gradient-to-b from-sky/20 to-cream py-16 lg:py-24"
    />
  </div>
</template>
