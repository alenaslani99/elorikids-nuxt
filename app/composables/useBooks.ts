export interface BookActivity {
  title: string;
  description: string;
}

export interface MediaItem {
  type: "video" | "image";
  src: string;
  alt?: string;
}

export interface Book {
  slug: string;
  img: string;
  media: MediaItem[];
  title: string;
  subtitle: string;
  ageRange: string;
  ageSlug: string;
  category: string;
  price: number;
  description: string;
  features: string[];
  activities: BookActivity[];
  sellingPoints: { title: string; text: string }[];
  accent: string;
  badge: string;
}

export const books: Book[] = [
  {
    slug: "prvi-koraci",
    title: "Prvi koraci",
    img: "prvi-koraci.jpeg",
    // Video first, then the cover image. Drop the .mp4 in /public to activate.
    media: [
      // {
      //   type: "video",
      //   src: "/prvi-koraci.mp4",
      //   alt: "Pregled knjige Prvi koraci",
      // },
      {
        type: "image",
        src: "/prvi-koraci.jpeg",
        alt: "Naslovna strana - Prvi koraci",
      },
    ],
    subtitle: "Boje, veličine i životinje za najmlađe istraživače",
    ageRange: "2–3 godine",
    ageSlug: "2-3-godine",
    category: "2–3 godine",
    price: 2000,
    description:
      "Idealna prva radna sveska za najmlađe. Kroz šarene ilustracije i jednostavne zadatke, dete upoznaje boje, veličine i životinje. Svaka stranica je prilagođena malim rukama i razvija osnove logičkog razmišljanja kroz igru.",
    features: ["32 stranice", "Laminirano", "Vodootporno", "Piši-briši"],
    activities: [
      {
        title: "Svet boja",
        description:
          "Uparivanje predmeta sa bojama (sunce je žuto, list je zelen).",
      },
      {
        title: "Veliko i malo",
        description:
          "Poređenje veličina kroz svakodnevne i životinjske primere.",
      },
      {
        title: "Životinje",
        description:
          "Domaće i divlje životinje, uparivanje roditelja i mladunaca.",
      },
      {
        title: "Uparivanje",
        description:
          "Pronalaženje parova i uparivanje sličnih predmeta za logiku.",
      },
    ],
    sellingPoints: [
      {
        title: "Piši-briši sistem",
        text: "Laminirane, vodootporne stranice omogućavaju višestruko korišćenje. Dete može da vežba isti zadatak bezbroj puta, bez straha od greške. Jednostavno obrišite i počnite ispočetka!",
      },
      {
        title: "Originalni sadržaj",
        text: "Svaki zadatak je pažljivo osmišljen i ručno ilustrovan. Nema kopiranih materijala - sve je kreirano sa ljubavlju, prilagođeno našoj deci i njihovim potrebama.",
      },
      {
        title: "Učenje kroz igru",
        text: "Zabava je na prvom mestu - učenje dolazi prirodno. Šareni zadaci, simpatične ilustracije i raznovrsne aktivnosti drže pažnju mališana dok nesvesno usvajaju nova znanja.",
      },
      {
        title: "32 stranice",
        text: "Raznovrsni zadaci koji podstiču kreativnost i radoznalost.",
      },
    ],
    accent: "mint",
    badge: "Najmlađima",
  },
  {
    slug: "ucimo-kroz-igru",
    img: "ucimo-kroz-igru.jpeg",
    media: [
      // {
      //   type: "video",
      //   src: "/ucimo-kroz-igru.mp4",
      //   alt: "Pregled knjige Učimo kroz igru",
      // },
      {
        type: "image",
        src: "/ucimo-kroz-igru.jpeg",
        alt: "Naslovna strana - Učimo kroz igru",
      },
    ],
    title: "Učimo kroz igru",
    subtitle: "Sortiranje, grupisanje i logičke veze",
    ageRange: "3–4 godine",
    ageSlug: "3-4-godine",
    category: "3–4 godine",
    price: 2000,
    description:
      "Knjiga koja razvija sposobnost sortiranja, grupisanja i povezivanja. Kroz zanimljive zadatke sa voćem, povrćem, igračkama i životinjama, dete uči da prepoznaje šta pripada gde i kako stvari idu zajedno.",
    features: ["32 stranice", "Laminirano", "Vodootporno", "Piši-briši"],
    activities: [
      {
        title: "Sortiranje",
        description: "Sortiranje voća i povrća, prepoznavanje šta pripada gde.",
      },
      {
        title: "Kategorije",
        description:
          "Grupisanje predmeta po tipu (igračke, odeća, hrana, ...).",
      },
      {
        title: "Povezivanje",
        description: "Uparivanje parova životinja, predmeta i pojmova.",
      },
      {
        title: "Logika",
        description:
          "Zadaci zaključivanja, pronalaženje šema za razvoj mišljenja.",
      },
    ],
    sellingPoints: [
      {
        title: "Piši-briši sistem",
        text: "Laminirane, vodootporne stranice omogućavaju višestruko korišćenje. Dete može da vežba isti zadatak bezbroj puta, bez straha od greške. Jednostavno obrišite i počnite ispočetka!",
      },
      {
        title: "Originalni sadržaj",
        text: "Svaki zadatak je pažljivo osmišljen i ručno ilustrovan. Nema kopiranih materijala - sve je kreirano sa ljubavlju, prilagođeno našoj deci i njihovim potrebama.",
      },
      {
        title: "Učenje kroz igru",
        text: "Zabava je na prvom mestu - učenje dolazi prirodno. Šareni zadaci, simpatične ilustracije i raznovrsne aktivnosti drže pažnju mališana dok nesvesno usvajaju nova znanja.",
      },
      {
        title: "32 stranice",
        text: "Raznovrsni zadaci koji podstiču kreativnost i radoznalost.",
      },
    ],
    accent: "purple",
    badge: "Razvoj logike",
  },
  {
    slug: "priprema-za-skolu",
    img: "priprema-za-skolu.jpeg",
    media: [
      // {
      //   type: "video",
      //   src: "/priprema-za-skolu.mp4",
      //   alt: "Pregled knjige Priprema za školu",
      // },
      {
        type: "image",
        src: "/priprema-za-skolu.jpeg",
        alt: "Naslovna strana - Priprema za školu",
      },
    ],
    title: "Priprema za školu",
    subtitle: "Lavirinti, logika i koncentracija za buduće đake",
    ageRange: "4–6 godine",
    ageSlug: "4-6-godine",
    category: "4–6 godine",
    price: 2000,
    description:
      "Poslednja knjiga u seriji - priprema za polazak u školu. Lavirinti, pronalaženje razlika i asocijacije razvijaju strpljenje, pažnju i logičko razmišljanje. Sve što dete treba da savlada pre prvog školskog zvona.",
    features: ["32 stranice", "Laminirano", "Vodootporno", "Piši-briši"],
    activities: [
      {
        title: "Lavirinti",
        description:
          "Pronalaženje pravog puta razvija strpljenje i logičko razmišljanje.",
      },
      {
        title: "Pronađi razlike",
        description: "Upoređivanje slika jača pažnju i vizuelnu percepciju.",
      },
      {
        title: "Asocijacije",
        description:
          "Povezivanje predmeta koji idu zajedno (četkica+pasta, ključ+vrata).",
      },
      {
        title: "Koncentracija",
        description: "Zadaci fokusa koji pripremaju za školske obaveze.",
      },
    ],
    sellingPoints: [
      {
        title: "Piši-briši sistem",
        text: "Laminirane, vodootporne stranice omogućavaju višestruko korišćenje. Dete može da vežba isti zadatak bezbroj puta, bez straha od greške. Jednostavno obrišite i počnite ispočetka!",
      },
      {
        title: "Originalni sadržaj",
        text: "Svaki zadatak je pažljivo osmišljen i ručno ilustrovan. Nema kopiranih materijala - sve je kreirano sa ljubavlju, prilagođeno našoj deci i njihovim potrebama.",
      },
      {
        title: "Učenje kroz igru",
        text: "Zabava je na prvom mestu - učenje dolazi prirodno. Šareni zadaci, simpatične ilustracije i raznovrsne aktivnosti drže pažnju mališana dok nesvesno usvajaju nova znanja.",
      },
      {
        title: "32 stranice",
        text: "Raznovrsni zadaci koji podstiču kreativnost i radoznalost.",
      },
    ],
    accent: "coral",
    badge: "Školski start",
  },
];

export function useBooks() {
  const getBook = (slug: string) => books.find((b) => b.slug === slug);
  const getRelatedBooks = (slug: string) =>
    books.filter((b) => b.slug !== slug);

  return { books, getBook, getRelatedBooks };
}
