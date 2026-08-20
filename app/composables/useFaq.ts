export interface FaqItem {
  question: string
  answer: string
}

export const faqs: FaqItem[] = [
  {
    question: 'Da li su stranice zaista za višekratnu upotrebu?',
    answer: 'Da. Sve naše knjige imaju laminirane, vodootporne stranice koje se brišu suvom krpom ili mokrom maramicom. Jednu stranicu možete pisati i brisati stotine puta bez oštećenja.',
  },
  {
    question: 'Koja je razlika između knjiga po uzrastu?',
    answer: 'Svaka knjiga je prilagođena razvojnom stadijumu deteta. "Prvi koraci" (2-3 god.) fokusira se na boje, veličine i prepoznavanje. "Učimo kroz igru" (3-4 god.) uvodi sortiranje i logiku. "Priprema za školu" (4-6 god.) razvija koncentraciju, lavirinte i školske veštine.',
  },
  {
    question: 'Kojim flomastere koristiti i kako se brišu?',
    answer: 'Za najbolje iskustvo koristite flomastere na bazi vode (whiteboard markers) ili vodene bojice. Pisanje se jednostavno briše suvom krpom, mokrom maramicom ili mokrom spužvicom. Izbegavajte trajne markere jer se ne mogu obrisati.',
  },
  {
    question: 'Da li su knjige bezbedne za decu?',
    answer: 'Apsolutno. Materijali su netoksični i bezbedni za decu. Knjige su izrađene od izdržljivih materijala koji ne kidaju i ne seckaju, sa zaobljenim ivicama. Sadržaj je pažljivo kreiran da bude edukativan i uzrastu primeren.',
  },
  {
    question: 'Koliko traje isporuka i da li dostavljate van Srbije?',
    answer: 'Za porudžbine u Srbiji isporuka traje 1-3 radna dana. Dostava je besplatna za porudžbine iznad 3.000 RSD. Trenutno dostavljamo isključivo na teritoriji Srbije.',
  },
  {
    question: 'Da li mogu vratiti proizvod ako mi ne odgovara?',
    answer: 'Da. Imate pravo na povrat robe u roku od 14 dana od prijema, pod uslovom da knjiga nije oštećena. Novac vam vraćamo na račun u roku od 7 radnih dana od prijma povraćene robe.',
  },
]

export function useFaq() {
  return { faqs }
}
