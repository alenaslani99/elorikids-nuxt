<script setup lang="ts">
useHead({
  title: 'Uslovi korišćenja - elorikids',
  meta: [
    { name: 'description', content: 'Uslovi korišćenja elorikids sajta i usluga — pravila kupovine, poručivanja, dostave i povraćaja.' },
  ],
})

const lastUpdated = '20. avgust 2026.'

const sections = [
  { id: 'uvod', title: '1. Uvod' },
  { id: 'koriscenje', title: '2. Korišćenje sajta' },
  { id: 'nalog', title: '3. Korisnički nalog' },
  { id: 'porucivanje', title: '4. Poručivanje i cene' },
  { id: 'placanje', title: '5. Način plaćanja' },
  { id: 'dostava', title: '6. Dostava' },
  { id: 'povracaj', title: '7. Pravo na povraćaj robe' },
  { id: 'garancija', title: '8. Garancija i kvalitet' },
  { id: 'intelektualna', title: '9. Intelektualna svojina' },
  { id: 'odgovornost', title: '10. Ograničenje odgovornosti' },
  { id: 'izmjene', title: '11. Izmene uslova' },
  { id: 'kontakt', title: '12. Kontakt' },
]

const activeSection = ref(sections[0].id)

onMounted(() => {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          activeSection.value = entry.target.id
        }
      })
    },
    { rootMargin: '-100px 0px -60% 0px' },
  )

  sections.forEach((s) => {
    const el = document.getElementById(s.id)
    if (el) observer.observe(el)
  })

  onBeforeUnmount(() => observer.disconnect())
})
</script>

<template>
  <div class="bg-cream">
    <!-- Page header -->
    <section class="bg-gradient-to-b from-sky/30 to-cream py-12 lg:py-16">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <nav class="mb-4 flex items-center gap-2 text-sm text-navy/50" aria-label="Breadcrumb">
          <NuxtLink to="/" class="transition-colors hover:text-blue">Početna</NuxtLink>
          <span aria-hidden="true">›</span>
          <span class="font-medium text-navy">Uslovi korišćenja</span>
        </nav>
        <div class="flex items-center gap-3">
          <div class="flex size-12 items-center justify-center rounded-2xl bg-coral/10">
            <Icon name="lucide:file-text" class="size-6 text-coral" />
          </div>
          <h1 class="font-unbounded text-4xl font-extrabold text-navy md:text-5xl">
            Uslovi korišćenja
          </h1>
        </div>
        <p class="mt-3 text-sm text-navy/50">
          Poslednja izmena: {{ lastUpdated }}
        </p>
      </div>
    </section>

    <!-- Content -->
    <section class="py-12 lg:py-16">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="grid gap-10 lg:grid-cols-4 lg:gap-12">
          <!-- Table of contents -->
          <aside class="hidden lg:col-span-1 lg:block">
            <div class="sticky top-32">
              <p class="mb-4 text-sm font-semibold text-navy/50">
                Sadržaj
              </p>
              <nav class="space-y-1">
                <a
                  v-for="s in sections"
                  :key="s.id"
                  :href="`#${s.id}`"
                  class="block rounded-lg px-3 py-2 text-sm transition-colors"
                  :class="activeSection === s.id ? 'bg-blue/10 font-semibold text-blue' : 'text-navy/60 hover:bg-sky/30 hover:text-navy'"
                >
                  {{ s.title }}
                </a>
              </nav>
            </div>
          </aside>

          <!-- Article body -->
          <div class="lg:col-span-3">
            <div class="rounded-3xl border-2 border-cloud/40 bg-white p-8 shadow-sm lg:p-12">
              <!-- 1. Uvod -->
              <div id="uvod" class="scroll-mt-32">
                <h2 class="font-unbounded text-2xl font-bold text-navy">
                  1. Uvod
                </h2>
                <p class="mt-3 leading-relaxed text-navy/70">
                  Ovi Uslovi korišćenja regulišu odnos između elorikids (u daljem tekstu „mi") i korisnika
                  (u daljem tekstu „vi") sajta <NuxtLink to="/" class="font-semibold text-blue hover:text-navy">elorikids.rs</NuxtLink>.
                  Korišćenjem našeg sajta prihvatate ove Uslove u celosti. Ukoliko se ne slažete sa nekom od
                  odredbi, molimo vas da ne koristite naše usluge.
                </p>
                <p class="mt-3 leading-relaxed text-navy/70">
                  Prodaja robe putem interneta vrši se u skladu sa Zakonom o zaštiti potrošača (RS) i Zakonom
                  o elektronskoj trgovini (RS).
                </p>
              </div>

              <!-- 2. Korišćenje sajta -->
              <div id="koriscenje" class="mt-10 scroll-mt-32">
                <h2 class="font-unbounded text-2xl font-bold text-navy">
                  2. Korišćenje sajta
                </h2>
                <p class="mt-3 leading-relaxed text-navy/70">
                  Pristupom i korišćenjem sajta obavezujete se da:
                </p>
                <ul class="mt-4 space-y-2.5">
                  <li class="flex items-start gap-2 text-navy/70">
                    <Icon name="lucide:check" class="mt-0.5 size-5 shrink-0 text-mint" />
                    <span>Koristite sajt u skladu sa važećim propisima i ovim Uslovima.</span>
                  </li>
                  <li class="flex items-start gap-2 text-navy/70">
                    <Icon name="lucide:check" class="mt-0.5 size-5 shrink-0 text-mint" />
                    <span>Nećete ometati rad sajta, niti pokušavati neovlašćen pristup.</span>
                  </li>
                  <li class="flex items-start gap-2 text-navy/70">
                    <Icon name="lucide:check" class="mt-0.5 size-5 shrink-0 text-mint" />
                    <span>Nećete koristiti sadržaj sajta u komercijalne svrhe bez našeg pisanog pristanka.</span>
                  </li>
                  <li class="flex items-start gap-2 text-navy/70">
                    <Icon name="lucide:check" class="mt-0.5 size-5 shrink-0 text-mint" />
                    <span>Pružaće tačne podatke prilikom registracije i poručivanja.</span>
                  </li>
                </ul>
                <p class="mt-4 leading-relaxed text-navy/70">
                  Zadržavamo pravo da ograničimo ili onemogućimo pristup sajtu korisnicima koji krše ove Uslove.
                </p>
              </div>

              <!-- 3. Korisnički nalog -->
              <div id="nalog" class="mt-10 scroll-mt-32">
                <h2 class="font-unbounded text-2xl font-bold text-navy">
                  3. Korisnički nalog
                </h2>
                <p class="mt-3 leading-relaxed text-navy/70">
                  Registracijom na sajtu dobijate pristup svom korisničkom nalogu, koji vam omogućava brže
                  poručivanje i pregled istorije porudžbina.
                </p>
                <ul class="mt-4 space-y-2.5">
                  <li class="flex items-start gap-2 text-navy/70">
                    <Icon name="lucide:dot" class="mt-0.5 size-5 shrink-0 text-blue" />
                    <span><strong class="text-navy">Odgovornost</strong> — vi ste odgovorni za čuvanje svojih pristupnih podataka i za sve aktivnosti pod vašim nalogom.</span>
                  </li>
                  <li class="flex items-start gap-2 text-navy/70">
                    <Icon name="lucide:dot" class="mt-0.5 size-5 shrink-0 text-blue" />
                    <span><strong class="text-navy">Tačnost podataka</strong> — obavezni ste da ažurirate svoje podatke u slučaju promene.</span>
                  </li>
                  <li class="flex items-start gap-2 text-navy/70">
                    <Icon name="lucide:dot" class="mt-0.5 size-5 shrink-0 text-blue" />
                    <span><strong class="text-navy">Brisanje naloga</strong> — možete zatražiti brisanje naloga u svakom trenutku.</span>
                  </li>
                </ul>
                <p class="mt-4 leading-relaxed text-navy/70">
                  Više o obradi podataka pročitajte u našoj
                  <NuxtLink to="/politika-privatnosti" class="font-semibold text-blue hover:text-navy">Politici privatnosti</NuxtLink>.
                </p>
              </div>

              <!-- 4. Poručivanje i cene -->
              <div id="porucivanje" class="mt-10 scroll-mt-32">
                <h2 class="font-unbounded text-2xl font-bold text-navy">
                  4. Poručivanje i cene
                </h2>
                <p class="mt-3 leading-relaxed text-navy/70">
                  Sve cene na sajtu su izražene u dinarima (RSD) i uključuju PDV. Prikazane cene važe u
                  trenutku poručivanja i obavezuju nas do potvrde porudžbine.
                </p>
                <ul class="mt-4 space-y-2.5">
                  <li class="flex items-start gap-2 text-navy/70">
                    <Icon name="lucide:check" class="mt-0.5 size-5 shrink-0 text-mint" />
                    <span>Porudžbina se smatra primljenom kada dobijete potvrdu e-poštom ili telefonom.</span>
                  </li>
                  <li class="flex items-start gap-2 text-navy/70">
                    <Icon name="lucide:check" class="mt-0.5 size-5 shrink-0 text-mint" />
                    <span>Zadržavamo pravo da odbijemo porudžbinu iz opravdanih razloga (npr. greška u cenama, nedostatak na lageru).</span>
                  </li>
                  <li class="flex items-start gap-2 text-navy/70">
                    <Icon name="lucide:check" class="mt-0.5 size-5 shrink-0 text-mint" />
                    <span>U slučaju očigledne greške u ceni, kontaktiraćemo vas pre isporuke.</span>
                  </li>
                </ul>
                <div class="mt-4 flex items-start gap-3 rounded-2xl bg-yellow/10 p-4 text-sm text-navy/70">
                  <Icon name="lucide:info" class="mt-0.5 size-5 shrink-0 text-yellow" />
                  <span>Knjige su namenjene deci uzrasta 2–6 godina i koriste se uz nadzor odraslih.</span>
                </div>
              </div>

              <!-- 5. Način plaćanja -->
              <div id="placanje" class="mt-10 scroll-mt-32">
                <h2 class="font-unbounded text-2xl font-bold text-navy">
                  5. Način plaćanja
                </h2>
                <p class="mt-3 leading-relaxed text-navy/70">
                  Trenutno omogućavamo sledeći način plaćanja:
                </p>
                <div class="mt-4 rounded-2xl bg-sky/20 p-5">
                  <div class="flex items-start gap-3">
                    <div class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue/10">
                      <Icon name="lucide:wallet" class="size-5 text-blue" />
                    </div>
                    <div>
                      <p class="font-semibold text-navy">
                        Pouzeće (prijem robe)
                      </p>
                      <p class="mt-1 text-sm text-navy/60">
                        Plaćanje se vrši u gotovini kuriru prilikom preuzimanja porudžbine.
                        Iznos koji plaćate je tačno onoliko koliko je prikazano u rezimeu porudžbine —
                        bez skrivenih troškova.
                      </p>
                    </div>
                  </div>
                </div>
                <p class="mt-4 leading-relaxed text-navy/70">
                  U planu je i online plaćanje karticama, o čemu ćemo vas blagovremeno obavestiti.
                </p>
              </div>

              <!-- 6. Dostava -->
              <div id="dostava" class="mt-10 scroll-mt-32">
                <h2 class="font-unbounded text-2xl font-bold text-navy">
                  6. Dostava
                </h2>
                <p class="mt-3 leading-relaxed text-navy/70">
                  Isporuku vršimo na teritoriji Republike Srbije preko kurirskih službi.
                </p>
                <div class="mt-4 grid gap-3 sm:grid-cols-3">
                  <div class="rounded-2xl bg-white p-4 ring-1 ring-cloud/40">
                    <Icon name="lucide:truck" class="size-6 text-blue" />
                    <p class="mt-2 font-semibold text-navy">
                      Vreme isporuke
                    </p>
                    <p class="mt-1 text-sm text-navy/60">
                      1–3 radna dana od potvrde porudžbine.
                    </p>
                  </div>
                  <div class="rounded-2xl bg-white p-4 ring-1 ring-cloud/40">
                    <Icon name="lucide:gift" class="size-6 text-mint" />
                    <p class="mt-2 font-semibold text-navy">
                      Besplatna dostava
                    </p>
                    <p class="mt-1 text-sm text-navy/60">
                      Za porudžbine preko 5.000 RSD.
                    </p>
                  </div>
                  <div class="rounded-2xl bg-white p-4 ring-1 ring-cloud/40">
                    <Icon name="lucide:banknote" class="size-6 text-coral" />
                    <p class="mt-2 font-semibold text-navy">
                      Trošak dostave
                    </p>
                    <p class="mt-1 text-sm text-navy/60">
                      350 RSD za porudžbine ispod 5.000 RSD.
                    </p>
                  </div>
                  </div>
                <p class="mt-4 leading-relaxed text-navy/70">
                  Rizik slučajnog gubitka ili oštećenja robe prelazi na vas u trenutku preuzimanja porudžbine
                  od kurira.
                </p>
              </div>

              <!-- 7. Povraćaj robe -->
              <div id="povracaj" class="mt-10 scroll-mt-32">
                <h2 class="font-unbounded text-2xl font-bold text-navy">
                  7. Pravo na povraćaj robe
                </h2>
                <p class="mt-3 leading-relaxed text-navy/70">
                  U skladu sa Zakonom o zaštiti potrošača, imate pravo da odustanete od ugovora u roku od
                  14 dana od dana prijema robe, bez obrazloženja.
                </p>
                <ul class="mt-4 space-y-2.5">
                  <li class="flex items-start gap-2 text-navy/70">
                    <Icon name="lucide:check" class="mt-0.5 size-5 shrink-0 text-mint" />
                    <span>Roba mora biti neupotrebljavana, u originalnom pakovanju i bez oštećenja.</span>
                  </li>
                  <li class="flex items-start gap-2 text-navy/70">
                    <Icon name="lucide:check" class="mt-0.5 size-5 shrink-0 text-mint" />
                    <span>Troškove povraćaja snosi kupac, osim ako je roba neispravna.</span>
                  </li>
                  <li class="flex items-start gap-2 text-navy/70">
                    <Icon name="lucide:check" class="mt-0.5 size-5 shrink-0 text-mint" />
                    <span>Sredstva vraćamo u roku od 14 dana od prijema robe, na isti način na koji je plaćena.</span>
                  </li>
                </ul>
                <p class="mt-4 leading-relaxed text-navy/70">
                  Za pokretanje postupka povraćaja, kontaktirajte nas na
                  <a href="mailto:pozdrav@elorikids.rs" class="font-semibold text-blue hover:text-navy">pozdrav@elorikids.rs</a>.
                </p>
              </div>

              <!-- 8. Garancija i kvalitet -->
              <div id="garancija" class="mt-10 scroll-mt-32">
                <h2 class="font-unbounded text-2xl font-bold text-navy">
                  8. Garancija i kvalitet
                </h2>
                <p class="mt-3 leading-relaxed text-navy/70">
                  Naše knjige su izrađene od visokokvalitetnih, laminiranih i vodootpornih materijala,
                  osmišljenih za višestruko korišćenje (piši-briši sistem).
                </p>
                <ul class="mt-4 space-y-2.5">
                  <li class="flex items-start gap-2 text-navy/70">
                    <Icon name="lucide:shield-check" class="mt-0.5 size-5 shrink-0 text-blue" />
                    <span>Sve knjige prolaze kontrolu kvaliteta pre isporuke.</span>
                  </li>
                  <li class="flex items-start gap-2 text-navy/70">
                    <Icon name="lucide:alert-triangle" class="mt-0.5 size-5 shrink-0 text-blue" />
                    <span>Ukoliko primite oštećenu ili neispravnu knjigu, javite nam se u roku od 3 dana od prijema — besplatno ćemo je zameniti.</span>
                  </li>
                  <li class="flex items-start gap-2 text-navy/70">
                    <Icon name="lucide:eraser" class="mt-0.5 size-5 shrink-0 text-blue" />
                    <span>Piši-briši sistem omogućava neograničeno korišćenje flomastera za brisanje.</span>
                  </li>
                </ul>
              </div>

              <!-- 9. Intelektualna svojina -->
              <div id="intelektualna" class="mt-10 scroll-mt-32">
                <h2 class="font-unbounded text-2xl font-bold text-navy">
                  9. Intelektualna svojina
                </h2>
                <p class="mt-3 leading-relaxed text-navy/70">
                  Sav sadržaj na sajtu — uključujući tekstove, ilustracije, dizajn, logo i brend elorikids —
                  zaštićen je zakonom o autorskom i srodnim pravima.
                </p>
                <ul class="mt-4 space-y-2.5">
                  <li class="flex items-start gap-2 text-navy/70">
                    <Icon name="lucide:dot" class="mt-0.5 size-5 shrink-0 text-blue" />
                    <span><strong class="text-navy">Zabranjeno</strong> — kopiranje, distribucija i korišćenje sadržaja bez pisanog odobrenja.</span>
                  </li>
                  <li class="flex items-start gap-2 text-navy/70">
                    <Icon name="lucide:dot" class="mt-0.5 size-5 shrink-0 text-blue" />
                    <span><strong class="text-navy">Dozvoljeno</strong> — korišćenje u lične svrhe (pregled, poručivanje).</span>
                  </li>
                  <li class="flex items-start gap-2 text-navy/70">
                    <Icon name="lucide:dot" class="mt-0.5 size-5 shrink-0 text-blue" />
                    <span><strong class="text-navy">Originalni sadržaj</strong> — svi zadaci i ilustracije su ručno kreirani, bez kopiranih materijala.</span>
                  </li>
                </ul>
              </div>

              <!-- 10. Ograničenje odgovornosti -->
              <div id="odgovornost" class="mt-10 scroll-mt-32">
                <h2 class="font-unbounded text-2xl font-bold text-navy">
                  10. Ograničenje odgovornosti
                </h2>
                <p class="mt-3 leading-relaxed text-navy/70">
                  Trudimo se da sve informacije na sajtu budu tačne i ažurne, ali ne garantujemo potpunu
                  tačnost u svakom trenutku. Ne odgovaramo za:
                </p>
                <ul class="mt-4 space-y-2.5">
                  <li class="flex items-start gap-2 text-navy/70">
                    <Icon name="lucide:dot" class="mt-0.5 size-5 shrink-0 text-blue" />
                    <span>Indirektne štete nastale korišćenjem ili nemogućnošću korišćenja sajta.</span>
                  </li>
                  <li class="flex items-start gap-2 text-navy/70">
                    <Icon name="lucide:dot" class="mt-0.5 size-5 shrink-0 text-blue" />
                    <span>Sadržaj i usluge trećih lica koji su eventualno povezani sa našim sajtom.</span>
                  </li>
                  <li class="flex items-start gap-2 text-navy/70">
                    <Icon name="lucide:dot" class="mt-0.5 size-5 shrink-0 text-blue" />
                    <span>Tehničke prekide u radu sajta van naše kontrole.</span>
                  </li>
                </ul>
              </div>

              <!-- 11. Izmene -->
              <div id="izmjene" class="mt-10 scroll-mt-32">
                <h2 class="font-unbounded text-2xl font-bold text-navy">
                  11. Izmene uslova
                </h2>
                <p class="mt-3 leading-relaxed text-navy/70">
                  Zadržavamo pravo da izmenimo ove Uslove korišćenja u bilo kom trenutku. Izmene stupaju na
                  snagu objavljivanjem na sajtu. Nastavak korišćenja sajta nakon izmena smatra se prihvatanjem
                  novih uslova. Datum poslednje izmene naveden je na vrhu stranice.
                </p>
              </div>

              <!-- 12. Kontakt -->
              <div id="kontakt" class="mt-10 scroll-mt-32">
                <h2 class="font-unbounded text-2xl font-bold text-navy">
                  12. Kontakt
                </h2>
                <p class="mt-3 leading-relaxed text-navy/70">
                  Za sva pitanja u vezi sa ovim Uslovima, molimo vas da nas kontaktirate:
                </p>
                <div class="mt-4 space-y-3">
                  <a
                    href="mailto:pozdrav@elorikids.rs"
                    class="flex items-center gap-3 rounded-2xl border-2 border-cloud/40 bg-cream p-4 transition-colors hover:border-blue"
                  >
                    <div class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue/10">
                      <Icon name="lucide:mail" class="size-5 text-blue" />
                    </div>
                    <div>
                      <p class="text-sm text-navy/50">
                        E-pošta
                      </p>
                      <p class="font-semibold text-navy">pozdrav@elorikids.rs</p>
                    </div>
                  </a>
                  <NuxtLink
                    to="/kontakt"
                    class="flex items-center gap-3 rounded-2xl border-2 border-cloud/40 bg-cream p-4 transition-colors hover:border-blue"
                  >
                    <div class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-coral/10">
                      <Icon name="lucide:message-circle" class="size-5 text-coral" />
                    </div>
                    <div>
                      <p class="text-sm text-navy/50">
                        Kontakt forma
                      </p>
                      <p class="font-semibold text-navy">Pošaljite poruku</p>
                    </div>
                  </NuxtLink>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
