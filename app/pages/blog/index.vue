<script setup lang="ts">
useHead({
  title: 'Blog - elorikids',
  meta: [
    { name: 'description', content: 'Saveti, priče i uvidi o učenju kroz igru, razvoju deteta i piši-briši knjigama elorikids.' },
    { name: 'og:title', content: 'Blog | elorikids' },
    { name: 'og:description', content: 'Saveti i priče o učenju kroz igru i razvoju deteta.' },
    { name: 'og:type', content: 'website' },
  ],
  link: [
    { rel: 'canonical', href: 'https://elorikids.rs/blog' },
  ],
})

const featured = computed(() => posts.find(p => p.featured) ?? posts[0])
const rest = computed(() => posts.filter(p => p.slug !== featured.value.slug))

const accentClasses: Record<string, { badge: string, text: string, ring: string }> = {
  mint: { badge: 'bg-mint/20 text-navy', text: 'text-mint', ring: 'ring-mint/30' },
  purple: { badge: 'bg-purple/20 text-navy', text: 'text-purple', ring: 'ring-purple/30' },
  coral: { badge: 'bg-coral/20 text-navy', text: 'text-coral', ring: 'ring-coral/30' },
}

function classesFor(post: BlogPost) {
  return accentClasses[post.accent] ?? accentClasses.mint
}
</script>

<template>
  <div>
    <!-- Page header -->
    <section class="bg-gradient-to-b from-sky/30 to-cream py-12 lg:py-16">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <AppBreadcrumb :items="[{ label: 'Početna', to: '/' }, { label: 'Blog' }]" nav-class="mb-4" />
        <div class="max-w-3xl">
          <span class="inline-block rounded-full bg-coral/20 px-4 py-1.5 text-sm font-semibold text-coral">
            Blog
          </span>
          <h1 class="font-unbounded mt-4 text-4xl font-extrabold text-navy md:text-5xl">
            Učenje, igra i odrastanje
          </h1>
          <p class="mt-4 max-w-2xl text-lg leading-relaxed text-navy/70">
            Saveti, priče i uvidi o razvoju deteta, piši-briši knjigama i učenju
            kroz igru — od onih koji to svakodnevno rade.
          </p>
        </div>
      </div>
    </section>

    <!-- Featured post -->
    <section class="bg-cream py-12 lg:py-16">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <NuxtLink
          :to="`/blog/${featured.slug}`"
          class="group grid items-center gap-8 rounded-3xl border-2 border-cloud/40 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl lg:grid-cols-2 lg:p-8"
        >
          <div class="overflow-hidden rounded-2xl">
            <NuxtImg
              :src="`/${featured.img}`"
              :alt="featured.title"
              class="aspect-[16/10] w-full object-cover transition-transform duration-300 group-hover:scale-105"
              width="640"
              height="400"
              format="webp"
              loading="lazy"
            />
          </div>
          <div>
            <div class="flex flex-wrap items-center gap-3 text-sm text-navy/50">
              <span
                class="rounded-full px-3 py-1 text-xs font-semibold"
                :class="classesFor(featured).badge"
              >
                {{ featured.category }}
              </span>
              <span class="inline-flex items-center gap-1">
                <Icon name="lucide:star" class="size-4 text-yellow" />
                Istaknuto
              </span>
            </div>
            <h2 class="font-unbounded mt-4 text-2xl font-extrabold text-navy md:text-3xl">
              {{ featured.title }}
            </h2>
            <p class="mt-3 leading-relaxed text-navy/70">
              {{ featured.excerpt }}
            </p>
            <div class="mt-5 flex items-center gap-4 text-sm text-navy/50">
              <span class="font-medium text-navy">{{ featured.author }}</span>
              <span>·</span>
              <span>{{ formatDate(featured.date) }}</span>
              <span>·</span>
              <span>{{ featured.readingTime }}</span>
            </div>
            <span class="mt-6 inline-flex items-center gap-2 font-semibold text-navy transition-colors group-hover:text-blue">
              Pročitaj članak
              <Icon name="lucide:arrow-right" class="size-4 transition-transform group-hover:translate-x-1" />
            </span>
          </div>
        </NuxtLink>
      </div>
    </section>

    <!-- Rest of the posts -->
    <section class="bg-gradient-to-b from-cream to-sky/20 py-12 lg:py-16">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div class="mb-10">
          <h2 class="font-unbounded text-2xl font-extrabold text-navy md:text-3xl">
            Najnovije
          </h2>
          <p class="mt-2 text-navy/60">
            Još članaka koje smo pripremili za vas.
          </p>
        </div>

        <div class="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          <NuxtLink
            v-for="post in rest"
            :key="post.slug"
            :to="`/blog/${post.slug}`"
            class="group flex flex-col overflow-hidden rounded-3xl border-2 border-cloud/40 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
          >
            <div class="overflow-hidden">
              <NuxtImg
                :src="`/${post.img}`"
                :alt="post.title"
                class="aspect-[16/10] w-full object-cover transition-transform duration-300 group-hover:scale-105"
                width="480"
                height="300"
                format="webp"
                loading="lazy"
              />
            </div>
            <div class="flex flex-1 flex-col p-6">
              <div class="flex flex-wrap items-center gap-3 text-sm text-navy/50">
                <span
                  class="rounded-full px-3 py-1 text-xs font-semibold"
                  :class="classesFor(post).badge"
                >
                  {{ post.category }}
                </span>
                <span>{{ formatDate(post.date) }}</span>
              </div>
              <h3 class="font-unbounded mt-4 text-xl font-extrabold text-navy">
                {{ post.title }}
              </h3>
              <p class="mt-3 flex-1 text-sm leading-relaxed text-navy/70">
                {{ post.excerpt }}
              </p>
              <div class="mt-5 flex items-center gap-2 text-sm text-navy/50">
                <Icon name="lucide:clock" class="size-4" />
                <span>{{ post.readingTime }}</span>
              </div>
            </div>
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- Newsletter / CTA -->
    <section class="bg-cream py-16 lg:py-24">
      <div class="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
        <h2 class="font-unbounded text-3xl font-extrabold text-navy md:text-4xl">
          Pratite nove članke
        </h2>
        <p class="mx-auto mt-4 max-w-xl text-lg text-navy/70">
          Pogledajte naše knjige i pronađite onu koja je prava za vaše dete.
        </p>
        <div class="mt-8 flex flex-wrap justify-center gap-4">
          <NuxtLink
            to="/#categories"
            class="inline-flex items-center gap-2 rounded-full bg-blue px-6 py-3 font-semibold text-white transition-colors hover:bg-navy"
          >
            Pogledaj knjige
            <Icon name="lucide:arrow-right" class="size-5" />
          </NuxtLink>
          <NuxtLink
            to="/legal/contact"
            class="inline-flex items-center gap-2 rounded-full border-2 border-cloud bg-white px-6 py-3 font-semibold text-navy transition-colors hover:border-blue hover:text-blue"
          >
            Kontaktirajte nas
          </NuxtLink>
        </div>
      </div>
    </section>
  </div>
</template>
