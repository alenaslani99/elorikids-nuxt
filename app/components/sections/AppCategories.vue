<script setup lang="ts">
interface BookCard {
    slug: string;
    title: string;
    subtitle: string;
    age: string;
    description: string;
    activities: string[];
    accent: "mint" | "purple" | "coral";
    icon: string;
    image: string;
    alt: string;
}

const books: BookCard[] = [
    {
        slug: "prvi-koraci",
        title: "Prvi koraci",
        subtitle: "First Steps",
        age: "2-3 godine",
        description:
            "Boje, veličine i životinje za najmlađe istraživače. Idealna prva radna sveska.",
        activities: ["Svet boja", "Veliko i malo", "Životinje", "Uparivanje"],
        accent: "mint",
        icon: "lucide:palette",
        image: "prvi-koraci-640x480.webp",
        alt: "Prvi koraci - interaktivna piši-briši knjiga za decu od 2 do 3 godine",
    },
    {
        slug: "ucimo-kroz-igru",
        title: "Učimo kroz igru",
        subtitle: "Learning Through Play",
        age: "3-4 godine",
        description:
            "Sortiranje, grupisanje i logičke veze koje razvijaju razmišljanje.",
        activities: ["Sortiranje", "Kategorije", "Povezivanje", "Logika"],
        accent: "purple",
        icon: "lucide:shapes",
        image: "ucimo-kroz-igru-640x480.webp",
        alt: "Učimo kroz igru - interaktivna piši-briši knjiga za decu od 3 do 4 godine",
    },
    {
        slug: "priprema-za-skolu",
        title: "Priprema za školu",
        subtitle: "School Prep",
        age: "4-6 godine",
        description:
            "Lavirinti, logika i koncentracija za buduće školarki i školarce.",
        activities: [
            "Lavirinti",
            "Pronađi razlike",
            "Asocijacije",
            "Koncentracija",
        ],
        accent: "coral",
        icon: "lucide:graduation-cap",
        image: "priprema-za-skolu-640x480.webp",
        alt: "Priprema za školu - interaktivna piši-briši knjiga za decu od 4 do 6 godine",
    },
];

const accentClasses: Record<
    BookCard["accent"],
    {
        badge: string;
        iconWrap: string;
        icon: string;
        ring: string;
        hover: string;
        imageRing: string;
    }
> = {
    mint: {
        badge: "bg-mint/20 text-navy",
        iconWrap: "bg-mint/20",
        icon: "text-mint",
        ring: "group-hover:ring-mint/40",
        hover: "hover:border-mint/50",
        imageRing: "ring-mint/30",
    },
    purple: {
        badge: "bg-purple/20 text-navy",
        iconWrap: "bg-purple/20",
        icon: "text-purple",
        ring: "group-hover:ring-purple/40",
        hover: "hover:border-purple/50",
        imageRing: "ring-purple/30",
    },
    coral: {
        badge: "bg-coral/20 text-navy",
        iconWrap: "bg-coral/20",
        icon: "text-coral",
        ring: "group-hover:ring-coral/40",
        hover: "hover:border-coral/50",
        imageRing: "ring-coral/30",
    },
};
</script>

<template>
    <section id="categories" class="scroll-mt-20 bg-cream py-16 lg:py-24">
        <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <!-- Section header -->
            <div class="mx-auto mb-12 max-w-2xl text-center">
                <span
                    class="inline-block rounded-full bg-sky/40 px-4 py-1.5 text-sm font-semibold text-navy"
                >
                    Naše knjige
                </span>
                <h2
                    class="font-unbounded mt-4 text-3xl font-extrabold text-navy md:text-4xl"
                >
                    Pronađite pravu knjigu po uzrastu
                </h2>
                <p class="mt-4 text-lg text-navy/70">
                    Tri interaktivne piši-briši knjige, dizajnirane za decu od 2
                    do 6 godina. Svaka je prilagođena razvojnom uzrastu deteta.
                </p>
            </div>

            <!-- Cards -->
            <div class="grid gap-8 md:grid-cols-3">
                <NuxtLink
                    v-for="book in books"
                    :key="book.slug"
                    :to="`/books/${book.slug}`"
                    class="group flex flex-col rounded-3xl border-2 border-cloud/40 bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                    :class="accentClasses[book.accent].hover"
                >
                    <!-- Book image: plain <img> with pre-generated .webp.
                         NuxtImg's _ipx optimizer doesn't run on Cloudflare
                         Workers and would silently serve the ~300KB original. -->
                    <div class="mb-6 overflow-hidden rounded-2xl">
                        <img
                            :src="`/${book.image}`"
                            :alt="book.alt"
                            :class="[
                                'aspect-[4/3] w-full object-cover ring-2 transition-transform duration-300 group-hover:scale-105',
                                accentClasses[book.accent].imageRing,
                            ]"
                            width="640"
                            height="480"
                            loading="lazy"
                            decoding="async"
                            sizes="(max-width: 768px) 100vw, 400px"
                        />
                    </div>

                    <!-- Icon badge -->
                    <div
                        class="mb-4 flex size-12 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110"
                        :class="accentClasses[book.accent].iconWrap"
                    >
                        <Icon
                            :name="book.icon"
                            class="size-6"
                            :class="accentClasses[book.accent].icon"
                        />
                    </div>

                    <!-- Age badge -->
                    <span
                        class="mb-3 w-fit rounded-full px-3 py-1 text-sm font-semibold"
                        :class="accentClasses[book.accent].badge"
                    >
                        {{ book.age }}
                    </span>

                    <!-- Title -->
                    <h3
                        class="font-unbounded text-2xl font-extrabold text-navy"
                    >
                        {{ book.title }}
                    </h3>
                    <p class="text-sm font-medium text-navy/75">
                        {{ book.subtitle }}
                    </p>

                    <!-- Description -->
                    <p class="mt-4 text-base leading-relaxed text-navy/70">
                        {{ book.description }}
                    </p>

                    <!-- Activities -->
                    <ul class="mt-6 space-y-2">
                        <li
                            v-for="activity in book.activities"
                            :key="activity"
                            class="flex items-center gap-2 text-sm text-navy/75"
                        >
                            <Icon
                                name="lucide:check"
                                class="size-4 shrink-0"
                                :class="accentClasses[book.accent].icon"
                            />
                            {{ activity }}
                        </li>
                    </ul>

                    <!-- CTA -->
                    <div class="mt-auto pt-8">
                        <span
                            class="inline-flex items-center gap-2 font-semibold text-navy transition-colors"
                            :class="accentClasses[book.accent].ring"
                        >
                            Saznaj više
                            <Icon
                                name="lucide:arrow-right"
                                class="size-4 transition-transform group-hover:translate-x-1"
                            />
                        </span>
                    </div>
                </NuxtLink>
            </div>

            <!-- Shared selling points -->
            <div class="mx-auto mt-16 max-w-4xl">
                <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    <div class="flex items-start gap-3">
                        <Icon
                            name="lucide:eraser"
                            class="mt-0.5 size-6 shrink-0 text-blue"
                        />
                        <div>
                            <h4 class="text-sm font-semibold text-navy">
                                Piši-briši sistem
                            </h4>
                            <p
                                class="mt-1 text-xs leading-relaxed text-navy/75"
                            >
                                Laminirane, vodootporne stranice za višestruko
                                korišćenje.
                            </p>
                        </div>
                    </div>
                    <div class="flex items-start gap-3">
                        <Icon
                            name="lucide:sparkles"
                            class="mt-0.5 size-6 shrink-0 text-yellow"
                        />
                        <div>
                            <h4 class="text-sm font-semibold text-navy">
                                Originalni sadržaj
                            </h4>
                            <p
                                class="mt-1 text-xs leading-relaxed text-navy/75"
                            >
                                Ručno ilustrovani zadaci, kreirani sa ljubavlju.
                            </p>
                        </div>
                    </div>
                    <div class="flex items-start gap-3">
                        <Icon
                            name="lucide:gamepad-2"
                            class="mt-0.5 size-6 shrink-0 text-mint"
                        />
                        <div>
                            <h4 class="text-sm font-semibold text-navy">
                                Učenje kroz igru
                            </h4>
                            <p
                                class="mt-1 text-xs leading-relaxed text-navy/75"
                            >
                                Zabava na prvom mestu - učenje dolazi prirodno.
                            </p>
                        </div>
                    </div>
                    <div class="flex items-start gap-3">
                        <Icon
                            name="lucide:book-open"
                            class="mt-0.5 size-6 shrink-0 text-coral"
                        />
                        <div>
                            <h4 class="text-sm font-semibold text-navy">
                                32 stranice
                            </h4>
                            <p
                                class="mt-1 text-xs leading-relaxed text-navy/75"
                            >
                                Raznovrsni zadaci koji podstiču radoznalost.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>
