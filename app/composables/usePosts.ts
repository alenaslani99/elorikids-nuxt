export interface BlogSection {
  heading: string
  body: string[]
}

export interface BlogPost {
  slug: string
  title: string
  excerpt: string
  img: string
  author: string
  authorRole: string
  date: string
  category: string
  readingTime: string
  intro: string
  sections: BlogSection[]
  accent: string
  featured?: boolean
}

const months = [
  'januar', 'februar', 'mart', 'april', 'maj', 'jun',
  'jul', 'avgust', 'septembar', 'oktobar', 'novembar', 'decembar',
]

/** Format an ISO date as "15. avgust 2025." (Serbian Latin, no Intl dependency). */
export function formatDate(iso: string): string {
  const d = new Date(iso)
  return `${d.getDate()}. ${months[d.getMonth()]} ${d.getFullYear()}.`
}

export const posts: BlogPost[] = [
  {
    slug: 'ucenje-kroz-igru-kljuc-za-razvoj',
    title: 'Zašto je učenje kroz igru ključno za razvoj deteta',
    excerpt: 'Igra nije samo zabava — to je način na koji deca istražuju svet, rešavaju probleme i grade samopouzdanje. Evo zašto je toliko važno u prvim godinama.',
    img: 'first-book.jpg',
    author: 'Marija Petrović',
    authorRole: 'Pedagog',
    date: '2025-08-12',
    category: 'Razvoj',
    readingTime: '5 min čitanja',
    intro: 'Kada dete od dve godine sla��e kocke ili uparuje boje, ono ne samo da se zabavlja — ono uči. Igra je najprirodniji način učenja, a prve godine života su upravo vreme kada se mozak razvija brže nego ikada.',
    sections: [
      {
        heading: 'Mozak uči dok se igra',
        body: [
          'Istraživanja pokazuju da deca učestvovanjem u slobodnoj i vođenoj igri grade neuronske veze koje su temen za kasnije akademsko i emocionalno učenje. Svaki zadatak koji podstiče radoznalost — od pronalaženja parova do rešavanja jednostavnih lavirinta — jača sposobnost zaključivanja.',
          'Za razliku od pasivnog gledanja ekrana, aktivna igra zahteva od deteta da donosi odluke, proba, greši i pokušava ponovo. Taj proces je suština učenja.',
        ],
      },
      {
        heading: 'Tri ključne veštine koje se razvijaju igrom',
        body: [
          '1. Logičko mišljenje — sortiranje, grupisanje i uparivanje uče dete da prepoznaje šeme i odnose između predmeta.',
          '2. Koncentracija — zadaci koji zahtevaju pažnju, poput pronalaženja razlika, postepeno produžavaju vreme fokusiranosti.',
          '3. Samopouzdanje — kada dete samo reši zadatak, oseća ponos i motivaciju da pokuša sledeći, teži.',
        ],
      },
      {
        heading: 'Kako roditelj može da pomogne',
        body: [
          'Najvažnije je da učenje ostane zabavno. Nema pritiska, nema ocena — samo radoznalost i otkrića. Birajte aktivnosti prilagođene uzrastu i pratite interesovanja deteta.',
          'Piši-briši knjige su odličan primer: dete može da greši bez posledica, jer se stranice brišu i koriste iznova. To uklanja strah od greške i podstiče pokušavanje.',
        ],
      },
    ],
    accent: 'mint',
    featured: true,
  },
  {
    slug: 'kako-odabrati-prvu-knjigu',
    title: 'Kako odabrati prvu knjigu za vaše dete',
    excerpt: 'Prva knjiga je važna. Evo šta tražiti u knjizi za najmlađe — od veličine stranica i ilustracija do vrste zadataka i materijala.',
    img: 'second-book.jpg',
    author: 'Jelena Marković',
    authorRole: 'Izdavač',
    date: '2025-07-28',
    category: 'Saveti',
    readingTime: '4 min čitanja',
    intro: 'Izbor prve knjige često zbunjuje roditelje — polica je puna, a dete još uvek ne zna šta voli. Ključ je u nekoliko jednostavnih pravila koja vam pomažu da odaberete knjigu koja će zaista zadržati pažnju mališana.',
    sections: [
      {
        heading: 'Prilagodite uzrastu',
        body: [
          'Knjiga za dete od 2 godine nije ista kao knjiga za predškolca. Najmlađima trebaju velike, jasne ilustracije i jednostavni zadaci — prepoznavanje boja, uparivanje oblika i životinja.',
          'Deca od 3 do 4 godine već mogu da sortiraju i grupišu, dok predškolci uživaju u lavirintima i zadacima koncentracije. Pratite razvojni stadijum, ne samo broj godina.',
        ],
      },
      {
        heading: 'Tražite izdržljive materijale',
        body: [
          'Mališani nisu nežni sa knjigama — i to je sasvim u redu. Laminirane, vodootporne stranice koje se mogu brisati znače da knjiga traje, da se koristi iznova i da zamenjuje stotine papirnih radnih listova.',
          'Zaobljene ivice i netoksični materijali su detalj koji roditelji cene tek kad ga iskuse.',
        ],
      },
      {
        heading: 'Neka bude interaktivna',
        body: [
          'Pasivno gledanje slika brzo dosadi. Knjiga koja poziva dete da nešto uradi — oboji, spoji, pronađe — drži pažnju mnogo duže i ostavlja dublji trag u učenju.',
        ],
      },
    ],
    accent: 'purple',
  },
  {
    slug: 'pisi-brisi-sistem-prednosti',
    title: 'Piši-briši sistem: zašto je bolji od običnih radnih listova',
    excerpt: 'Jedna piši-briši knjiga zamenjuje stotine radnih listova. Manje papira, manje otpada i veća sloboda za dete da greši i pokušava ponovo.',
    img: 'third-book.jpg',
    author: 'Ana Nikolić',
    authorRole: 'Suosnivač elorikids',
    date: '2025-07-10',
    category: 'Proizvod',
    readingTime: '3 min čitanja',
    intro: 'Piši-briši sistem je srž elorikids knjiga. Zvuči jednostavno, ali menja način na koji dete uči — i način na koji porodica troši papir.',
    sections: [
      {
        heading: 'Sloboda grešenja',
        body: [
          'Kada dete zna da se stranica može obrisati, prestaje da se plaši greške. Ono pokušava, briše i pokušava ponovo — upravo onako kako učenje i treba da izgleda.',
          'Ovaj osećaj „bezbednog pokušaja” je ono što razlikuje zadržavanje znanja od memorisanja pod pritiskom.',
        ],
      },
      {
        heading: 'Manje otpada, više upotrebe',
        body: [
          'Jedna laminirana knjiga zamenjuje stotine jednokratnih radnih listova. To znači manje papira, manje štamparija i manje nereda po kući.',
          'Za porodice koje žele održiviji pristup roditeljstvu, to je mali korak sa velikim učinkom.',
        ],
      },
      {
        heading: 'Iznova i iznova',
        body: [
          'Knjiga se ne troši posle jednog prolaska. Mlađi brat ili sestra mogu da je koriste posle starijeg, a dete može da se vraća omiljenim zadacima koliko god želi.',
        ],
      },
    ],
    accent: 'coral',
  },
]

export function usePosts() {
  const getPost = (slug: string) => posts.find(p => p.slug === slug)
  const getRelatedPosts = (slug: string) => posts.filter(p => p.slug !== slug)

  return { posts, getPost, getRelatedPosts }
}
