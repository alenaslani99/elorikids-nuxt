<script setup lang="ts">
useHead({
  title: 'Politika privatnosti - elorikids',
  meta: [
    { name: 'description', content: 'Politika privatnosti elorikids - kako prikupljamo, koristimo i štitimo vaše lične podatke.' },
  ],
})

const lastUpdated = '20. avgust 2026.'

const sections = [
  { id: 'uvod', title: '1. Uvod' },
  { id: 'podaci', title: '2. Podaci koje prikupljamo' },
  { id: 'svrha', title: '3. Svrha obrade podataka' },
  { id: 'pravni-osnov', title: '4. Pravni osnov obrade' },
  { id: 'deljenje', title: '5. Deljenje podataka sa trećim licima' },
  { id: 'cuvali', title: '6. Koliko dugo čuvamo podatke' },
  { id: 'bezbednost', title: '7. Bezbednost podataka' },
  { id: 'prava', title: '8. Vaša prava' },
  { id: 'kolacici', title: '9. Kolačići (cookies)' },
  { id: 'izmjene', title: '10. Izmene politike' },
  { id: 'kontakt', title: '11. Kontakt' },
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
        <AppBreadcrumb :items="[{ label: 'Početna', to: '/' }, { label: 'Politika privatnosti' }]" nav-class="mb-4" />
        <div class="flex items-center gap-3">
          <div class="flex size-12 items-center justify-center rounded-2xl bg-blue/10">
            <Icon name="lucide:shield-check" class="size-6 text-blue" />
          </div>
          <h1 class="font-unbounded text-4xl font-extrabold text-navy md:text-5xl">
            Politika privatnosti
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
          <div class="prose-elori lg:col-span-3">
            <div class="rounded-3xl border-2 border-cloud/40 bg-white p-8 shadow-sm lg:p-12">
              <!-- 1. Uvod -->
              <div id="uvod" class="scroll-mt-32">
                <h2 class="font-unbounded text-2xl font-bold text-navy">
                  1. Uvod
                </h2>
                <p class="mt-3 leading-relaxed text-navy/70">
                  elorikids (u daljem tekstu „mi") ceni vašu privatnost i posvećena je zaštiti vaših ličnih podataka.
                  Ova Politika privatnosti objašnjava kako prikupljamo, koristimo, čuvamo i štitimo podatke
                  koje nam dostavite prilikom korišćenja našeg sajta <NuxtLink to="/" class="font-semibold text-blue hover:text-navy">elorikids.rs</NuxtLink> i usluga koje pružamo.
                </p>
                <p class="mt-3 leading-relaxed text-navy/70">
                  Korišćenjem našeg sajta smatra se da ste saglasni sa praksama opisanim u ovoj Politici.
                  Ukoliko se ne slažete sa nekom od odredbi, molimo vas da ne koristite naše usluge.
                </p>
              </div>

              <!-- 2. Podaci koje prikupljamo -->
              <div id="podaci" class="mt-10 scroll-mt-32">
                <h2 class="font-unbounded text-2xl font-bold text-navy">
                  2. Podaci koje prikupljamo
                </h2>
                <p class="mt-3 leading-relaxed text-navy/70">
                  Prikupljamo samo podatke koji su neophodni za obradu porudžbina i pružanje usluga:
                </p>
                <ul class="mt-4 space-y-2.5">
                  <li class="flex items-start gap-2 text-navy/70">
                    <Icon name="lucide:dot" class="mt-0.5 size-5 shrink-0 text-blue" />
                    <span><strong class="text-navy">Podaci o kupcu</strong> - ime i prezime, adresa e-pošte i broj telefona, prilikom registracije i poručivanja.</span>
                  </li>
                  <li class="flex items-start gap-2 text-navy/70">
                    <Icon name="lucide:dot" class="mt-0.5 size-5 shrink-0 text-blue" />
                    <span><strong class="text-navy">Podaci o dostavi</strong> - adresa, grad i poštanski broj za isporuku porudžbine.</span>
                  </li>
                  <li class="flex items-start gap-2 text-navy/70">
                    <Icon name="lucide:dot" class="mt-0.5 size-5 shrink-0 text-blue" />
                    <span><strong class="text-navy">Podaci o porudžbini</strong> - koje knjige ste naručili, količina, iznos i način plaćanja.</span>
                  </li>
                  <li class="flex items-start gap-2 text-navy/70">
                    <Icon name="lucide:dot" class="mt-0.5 size-5 shrink-0 text-blue" />
                    <span><strong class="text-navy">Tehnički podaci</strong> - IP adresa, vrsta pregledača i jezik, prilikom posete sajtu.</span>
                  </li>
                </ul>
                <p class="mt-4 leading-relaxed text-navy/70">
                  Ne prikupljamo posebne kategorije ličnih podataka (npr. o zdravlju, verskom ili političkom opredeljenju)
                  niti podatke o deci mlađoj od 15 godina bez pristanka roditelja.
                </p>
              </div>

              <!-- 3. Svrha obrade -->
              <div id="svrha" class="mt-10 scroll-mt-32">
                <h2 class="font-unbounded text-2xl font-bold text-navy">
                  3. Svrha obrade podataka
                </h2>
                <p class="mt-3 leading-relaxed text-navy/70">
                  Vaše podatke koristimo isključivo u sledeće svrhe:
                </p>
                <ul class="mt-4 space-y-2.5">
                  <li class="flex items-start gap-2 text-navy/70">
                    <Icon name="lucide:check" class="mt-0.5 size-5 shrink-0 text-mint" />
                    <span>Obrada i ispunjavanje vaših porudžbina, uključujući dostavu i korisničku podršku.</span>
                  </li>
                  <li class="flex items-start gap-2 text-navy/70">
                    <Icon name="lucide:check" class="mt-0.5 size-5 shrink-0 text-mint" />
                    <span>Komunikacija sa vama u vezi sa porudžbinama, dostavom i eventualnim problemima.</span>
                  </li>
                  <li class="flex items-start gap-2 text-navy/70">
                    <Icon name="lucide:check" class="mt-0.5 size-5 shrink-0 text-mint" />
                    <span>Omogućavanje registracije i pristupa vašem nalogu i istoriji porudžbina.</span>
                  </li>
                  <li class="flex items-start gap-2 text-navy/70">
                    <Icon name="lucide:check" class="mt-0.5 size-5 shrink-0 text-mint" />
                    <span>Slanje newslettera i marketinških obaveštenja, isključivo uz vaš pristanak.</span>
                  </li>
                  <li class="flex items-start gap-2 text-navy/70">
                    <Icon name="lucide:check" class="mt-0.5 size-5 shrink-0 text-mint" />
                    <span>Poboljšanje našeg sajta, usluga i korisničkog iskustva.</span>
                  </li>
                  <li class="flex items-start gap-2 text-navy/70">
                    <Icon name="lucide:check" class="mt-0.5 size-5 shrink-0 text-mint" />
                    <span>Ispunjavanje zakonskih obaveza (npr. čuvanje računa i poreskih evidencija).</span>
                  </li>
                </ul>
              </div>

              <!-- 4. Pravni osnov -->
              <div id="pravni-osnov" class="mt-10 scroll-mt-32">
                <h2 class="font-unbounded text-2xl font-bold text-navy">
                  4. Pravni osnov obrade
                </h2>
                <p class="mt-3 leading-relaxed text-navy/70">
                  Obrada vaših podataka zasniva se na sledećim pravnim osnovima:
                </p>
                <ul class="mt-4 space-y-2.5">
                  <li class="flex items-start gap-2 text-navy/70">
                    <Icon name="lucide:dot" class="mt-0.5 size-5 shrink-0 text-blue" />
                    <span><strong class="text-navy">Saglasnost</strong> - za slanje newslettera i marketinških poruka.</span>
                  </li>
                  <li class="flex items-start gap-2 text-navy/70">
                    <Icon name="lucide:dot" class="mt-0.5 size-5 shrink-0 text-blue" />
                    <span><strong class="text-navy">Izvršenje ugovora</strong> - za obradu porudžbina i isporuku robe.</span>
                  </li>
                  <li class="flex items-start gap-2 text-navy/70">
                    <Icon name="lucide:dot" class="mt-0.5 size-5 shrink-0 text-blue" />
                    <span><strong class="text-navy">Zakonska obaveza</strong> - za čuvanje računa i poreskih evidencija.</span>
                  </li>
                  <li class="flex items-start gap-2 text-navy/70">
                    <Icon name="lucide:dot" class="mt-0.5 size-5 shrink-0 text-blue" />
                    <span><strong class="text-navy">Legitimni interes</strong> - za poboljšanje usluga i sprečavanje prevare.</span>
                  </li>
                </ul>
              </div>

              <!-- 5. Deljenje podataka -->
              <div id="deljenje" class="mt-10 scroll-mt-32">
                <h2 class="font-unbounded text-2xl font-bold text-navy">
                  5. Deljenje podataka sa trećim licima
                </h2>
                <p class="mt-3 leading-relaxed text-navy/70">
                  Vaše lične podatke ne prodajemo niti ih ustupamo trećim licima u marketinške svrhe.
                  Podatke delimo isključivo sa partnerima koji su neophodni za ispunjavanje vaše porudžbine:
                </p>
                <ul class="mt-4 space-y-2.5">
                  <li class="flex items-start gap-2 text-navy/70">
                    <Icon name="lucide:truck" class="mt-0.5 size-5 shrink-0 text-blue" />
                    <span><strong class="text-navy">Kurirske službe</strong> - za isporuku porudžbina (ime, adresa, telefon).</span>
                  </li>
                  <li class="flex items-start gap-2 text-navy/70">
                    <Icon name="lucide:mail" class="mt-0.5 size-5 shrink-0 text-blue" />
                    <span><strong class="text-navy">Provajderi e-pošte</strong> - za slanje newslettera i potvrda porudžbina.</span>
                  </li>
                  <li class="flex items-start gap-2 text-navy/70">
                    <Icon name="lucide:landmark" class="mt-0.5 size-5 shrink-0 text-blue" />
                    <span><strong class="text-navy">Državni organi</strong> - isključivo na zakonski zahtev (poreske evidencije).</span>
                  </li>
                </ul>
                <p class="mt-4 leading-relaxed text-navy/70">
                  Svi naši partneri su ugovorno obavezni da čuvaju poverljivost vaših podataka i da ih koriste
                  samo u svrhu za koju su im dostavljeni.
                </p>
              </div>

              <!-- 6. Čuvanje -->
              <div id="cuvali" class="mt-10 scroll-mt-32">
                <h2 class="font-unbounded text-2xl font-bold text-navy">
                  6. Koliko dugo čuvamo podatke
                </h2>
                <p class="mt-3 leading-relaxed text-navy/70">
                  Podatke čuvamo onoliko dugo koliko je potrebno za ispunjavanje svrhe za koju su prikupljeni:
                </p>
                <ul class="mt-4 space-y-2.5">
                  <li class="flex items-start gap-2 text-navy/70">
                    <Icon name="lucide:check" class="mt-0.5 size-5 shrink-0 text-mint" />
                    <span><strong class="text-navy">Podaci o porudžbini</strong> - 5 godina radi poreskih obaveza.</span>
                  </li>
                  <li class="flex items-start gap-2 text-navy/70">
                    <Icon name="lucide:check" class="mt-0.5 size-5 shrink-0 text-mint" />
                    <span><strong class="text-navy">Podaci o nalogu</strong> - dok je nalog aktivan, ili do zahteva za brisanjem.</span>
                  </li>
                  <li class="flex items-start gap-2 text-navy/70">
                    <Icon name="lucide:check" class="mt-0.5 size-5 shrink-0 text-mint" />
                    <span><strong class="text-navy">Newsletter</strong> - do odjave, koju možete izvršiti u svakom trenutku.</span>
                  </li>
                </ul>
                <p class="mt-4 leading-relaxed text-navy/70">
                  Po isteku ovog roka, podaci se trajno brišu ili anonimizuju.
                </p>
              </div>

              <!-- 7. Bezbednost -->
              <div id="bezbednost" class="mt-10 scroll-mt-32">
                <h2 class="font-unbounded text-2xl font-bold text-navy">
                  7. Bezbednost podataka
                </h2>
                <p class="mt-3 leading-relaxed text-navy/70">
                  Primenjujemo odgovarajuće tehničke i organizacione mere za zaštitu vaših podataka od
                  neovlašćenog pristupa, gubitka ili zloupotrebe. To uključuje:
                </p>
                <ul class="mt-4 space-y-2.5">
                  <li class="flex items-start gap-2 text-navy/70">
                    <Icon name="lucide:lock" class="mt-0.5 size-5 shrink-0 text-blue" />
                    <span>Šifrovanu komunikaciju (HTTPS) između vašeg pregledača i našeg servera.</span>
                  </li>
                  <li class="flex items-start gap-2 text-navy/70">
                    <Icon name="lucide:database" class="mt-0.5 size-5 shrink-0 text-blue" />
                    <span>Bezbedno čuvanje baze podataka sa kontrolisanim pristupom.</span>
                  </li>
                  <li class="flex items-start gap-2 text-navy/70">
                    <Icon name="lucide:user-check" class="mt-0.5 size-5 shrink-0 text-blue" />
                    <span>Ograničen pristup podacima samo ovlašćenom osoblju.</span>
                  </li>
                </ul>
                <p class="mt-4 leading-relaxed text-navy/70">
                  Uprkos svim merama predostrožnosti, nijedan sistem nije potpuno bezbedan. Ukoliko dođe do
                  kompromitacije podataka, obavestićemo vas u najkraćem mogućem roku.
                </p>
                <div class="mt-4 flex items-start gap-3 rounded-2xl bg-coral/10 p-4 text-sm text-navy/70">
                  <Icon name="lucide:info" class="mt-0.5 size-5 shrink-0 text-coral" />
                  <span>Plaćanje se vrši pouzećem (prijem robe), stoga ne skladištimo podatke o platnim karticama.</span>
                </div>
              </div>

              <!-- 8. Prava -->
              <div id="prava" class="mt-10 scroll-mt-32">
                <h2 class="font-unbounded text-2xl font-bold text-navy">
                  8. Vaša prava
                </h2>
                <p class="mt-3 leading-relaxed text-navy/70">
                  U skladu sa Zakonom o zaštiti podataka o ličnosti (RS) i Opštom uredbom o zaštiti
                  podataka (GDPR), imate sledeća prava:
                </p>
                <div class="mt-4 grid gap-3 sm:grid-cols-2">
                  <div class="rounded-2xl bg-sky/20 p-4">
                    <p class="font-semibold text-navy">
                      <Icon name="lucide:eye" class="mb-0.5 mr-1 inline size-5 text-blue" />
                      Pravo na pristup
                    </p>
                    <p class="mt-1 text-sm text-navy/60">
                      Možete zatražiti uvid u podatke koje o vama čuvamo.
                    </p>
                  </div>
                  <div class="rounded-2xl bg-sky/20 p-4">
                    <p class="font-semibold text-navy">
                      <Icon name="lucide:pencil" class="mb-0.5 mr-1 inline size-5 text-blue" />
                      Pravo na ispravku
                    </p>
                    <p class="mt-1 text-sm text-navy/60">
                      Možete ispraviti netačne ili dopuniti nepotpune podatke.
                    </p>
                  </div>
                  <div class="rounded-2xl bg-sky/20 p-4">
                    <p class="font-semibold text-navy">
                      <Icon name="lucide:trash-2" class="mb-0.5 mr-1 inline size-5 text-blue" />
                      Pravo na brisanje
                    </p>
                    <p class="mt-1 text-sm text-navy/60">
                      Možete zatražiti brisanje svojih podataka (pravo na zaborav).
                    </p>
                  </div>
                  <div class="rounded-2xl bg-sky/20 p-4">
                    <p class="font-semibold text-navy">
                      <Icon name="lucide:pause" class="mb-0.5 mr-1 inline size-5 text-blue" />
                      Pravo na prigovor
                    </p>
                    <p class="mt-1 text-sm text-navy/60">
                      Možete prigovoriti obradi u određenim situacijama.
                    </p>
                  </div>
                </div>
                <p class="mt-4 leading-relaxed text-navy/70">
                  Za ostvarivanje ovih prava kontaktirajte nas na
                  <a href="mailto:pozdrav@elorikids.rs" class="font-semibold text-blue hover:text-navy">pozdrav@elorikids.rs</a>.
                  Odgovorićemo u roku od 30 dana.
                </p>
              </div>

              <!-- 9. Kolačići -->
              <div id="kolacici" class="mt-10 scroll-mt-32">
                <h2 class="font-unbounded text-2xl font-bold text-navy">
                  9. Kolačići (cookies)
                </h2>
                <p class="mt-3 leading-relaxed text-navy/70">
                  Naš sajt koristi kolačiće radi pravilnog funkcionisanja i poboljšanja korisničkog iskustva.
                  Kolačići su male tekstualne datoteke koje se čuvaju u vašem pregledaču.
                </p>
                <ul class="mt-4 space-y-2.5">
                  <li class="flex items-start gap-2 text-navy/70">
                    <Icon name="lucide:settings" class="mt-0.5 size-5 shrink-0 text-blue" />
                    <span><strong class="text-navy">Neophodni kolačići</strong> - omogućuju osnovne funkcije (korpa, prijava).</span>
                  </li>
                  <li class="flex items-start gap-2 text-navy/70">
                    <Icon name="lucide:bar-chart-3" class="mt-0.5 size-5 shrink-0 text-blue" />
                    <span><strong class="text-navy">Analitički kolačići</strong> - anonimno prikupljaju podatke o korišćenju sajta.</span>
                  </li>
                  <li class="flex items-start gap-2 text-navy/70">
                    <Icon name="lucide:megaphone" class="mt-0.5 size-5 shrink-0 text-blue" />
                    <span><strong class="text-navy">Marketinški kolačići</strong> - omogućuju prikazivanje relevantnih oglasa.</span>
                  </li>
                </ul>
                <p class="mt-4 leading-relaxed text-navy/70">
                  Možete kontrolisati i onemogućiti kolačiće u podešavanjima vašeg pregledača. Imajte na umu da
                  onemogućavanje neophodnih kolačića može uticati na funkcionalnost sajta.
                </p>
              </div>

              <!-- 10. Izmene -->
              <div id="izmjene" class="mt-10 scroll-mt-32">
                <h2 class="font-unbounded text-2xl font-bold text-navy">
                  10. Izmene politike
                </h2>
                <p class="mt-3 leading-relaxed text-navy/70">
                  Zadržavamo pravo da izmenimo ovu Politiku privatnosti u bilo kom trenutku. Izmene stupaju
                  na snagu objavljivanjem na ovom sajtu. Preporučujemo da povremeno proveravate ovu stranicu
                  radi eventualnih izmena. Datum poslednje izmene naveden je na vrhu stranice.
                </p>
              </div>

              <!-- 11. Kontakt -->
              <div id="kontakt" class="mt-10 scroll-mt-32">
                <h2 class="font-unbounded text-2xl font-bold text-navy">
                  11. Kontakt
                </h2>
                <p class="mt-3 leading-relaxed text-navy/70">
                  Za sva pitanja u vezi sa zaštitom privatnosti i vaših podataka, molimo vas da nas kontaktirate:
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
                    to="/legal/contact"
                    class="flex items-center gap-3 rounded-2xl border-2 border-cloud/40 bg-cream p-4 transition-colors hover:border-blue"
                  >
                    <div class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-mint/15">
                      <Icon name="lucide:message-circle" class="size-5 text-mint" />
                    </div>
                    <div>
                      <p class="text-navy/50 text-sm">
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
