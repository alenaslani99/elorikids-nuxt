<script setup lang="ts">
const route = useRoute()
const { getPost, getRelatedPosts } = usePosts()

const slug = computed(() => route.params.slug as string)
const post = computed(() => getPost(slug.value))

// 404 if post doesn't exist
if (!post.value) {
  throw createError({ statusCode: 404, statusMessage: 'Članak nije pronađen', fatal: true })
}

const relatedPosts = computed(() => getRelatedPosts(slug.value))

const a = computed(() => accentClasses[post.value!.accent] ?? accentClasses.mint)

// --- SEO + structured data ---
useHead({
  title: `${post.value!.title} | elorikids blog`,
  meta: [
    { name: 'description', content: post.value!.excerpt },
    { name: 'og:title', content: `${post.value!.title} | elorikids blog` },
    { name: 'og:description', content: post.value!.excerpt },
    { name: 'og:type', content: 'article' },
  ],
  link: [
    { rel: 'canonical', href: `https://elorikids.rs/blog/${post.value!.slug}` },
  ],
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: post.value!.title,
        description: post.value!.excerpt,
        datePublished: post.value!.date,
        author: { '@type': 'Person', name: post.value!.author, jobTitle: post.value!.authorRole },
        publisher: { '@type': 'Organization', name: 'elorikids' },
        mainEntityOfPage: `https://elorikids.rs/blog/${post.value!.slug}`,
      }),
    },
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Početna', item: 'https://elorikids.rs/' },
          { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://elorikids.rs/blog' },
          { '@type': 'ListItem', position: 3, name: post.value!.title, item: `https://elorikids.rs/blog/${post.value!.slug}` },
        ],
      }),
    },
  ],
})
</script>

<template>
  <div v-if="post" class="bg-cream">
    <!-- Breadcrumbs -->
    <AppBreadcrumb
      :items="[{ label: 'Početna', to: '/' }, { label: 'Blog', to: '/blog' }, { label: post.title }]"
      nav-class="mx-auto max-w-3xl px-4 pt-6 sm:px-6 lg:px-8"
    />

    <!-- Article header -->
    <article class="mx-auto max-w-3xl px-4 pb-12 pt-6 sm:px-6 lg:px-8">
      <!-- Category + date + reading time -->
      <div class="flex flex-wrap items-center gap-3 text-sm text-navy/50">
        <span
          class="rounded-full px-3 py-1 text-xs font-semibold"
          :class="a.badge"
        >
          {{ post.category }}
        </span>
        <span>{{ formatDate(post.date) }}</span>
        <span>·</span>
        <span class="inline-flex items-center gap-1">
          <Icon name="lucide:clock" class="size-4" />
          {{ post.readingTime }}
        </span>
      </div>

      <h1 class="font-unbounded mt-5 text-3xl font-extrabold text-navy md:text-4xl">
        {{ post.title }}
      </h1>

      <!-- Author -->
      <div class="mt-6 flex items-center gap-4">
        <div
          class="flex size-12 items-center justify-center rounded-full"
          :class="a.soft"
        >
          <Icon name="lucide:user" class="size-6" :class="a.text" />
        </div>
        <div>
          <p class="font-semibold text-navy">{{ post.author }}</p>
          <p class="text-sm text-navy/50">{{ post.authorRole }}</p>
        </div>
      </div>
    </article>

    <!-- Hero image -->
    <div class="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
      <NuxtImg
        :src="`/${post.img}`"
        :alt="post.title"
        class="aspect-[16/9] w-full rounded-3xl object-cover shadow-xl"
        width="960"
        height="540"
        format="webp"
        loading="eager"
      />
    </div>

    <!-- Intro + body -->
    <div class="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <!-- Intro paragraph -->
      <p class="text-lg font-medium leading-relaxed text-navy">
        {{ post.intro }}
      </p>

      <!-- Sections -->
      <div class="mt-10 space-y-10">
        <section v-for="section in post.sections" :key="section.heading">
          <h2 class="font-unbounded text-2xl font-extrabold text-navy">
            {{ section.heading }}
          </h2>
          <div class="mt-4 space-y-4 text-lg leading-relaxed text-navy/80">
            <p v-for="(para, i) in section.body" :key="i">
              {{ para }}
            </p>
          </div>
        </section>
      </div>

      <!-- Share / back -->
      <div class="mt-12 flex flex-col items-start justify-between gap-4 border-t border-cloud/40 pt-8 sm:flex-row sm:items-center">
        <NuxtLink
          to="/blog"
          class="inline-flex items-center gap-2 font-semibold text-navy transition-colors hover:text-blue"
        >
          <Icon name="lucide:arrow-left" class="size-5" />
          Svi članci
        </NuxtLink>
        <div class="flex items-center gap-2 text-sm text-navy/50">
          <span>Podijelite:</span>
          <a
            :href="`https://www.facebook.com/sharer/sharer.php?u=https://elorikids.rs/blog/${post.slug}`"
            target="_blank"
            rel="noopener"
            aria-label="Podijeli na Facebooku"
            class="flex size-9 items-center justify-center rounded-full bg-cloud/40 text-navy transition-colors hover:bg-blue hover:text-white"
          >
            <Icon name="lucide:facebook" class="size-4" />
          </a>
          <a
            :href="`https://twitter.com/intent/tweet?url=https://elorikids.rs/blog/${post.slug}&text=${encodeURIComponent(post.title)}`"
            target="_blank"
            rel="noopener"
            aria-label="Podijeli na Twitteru"
            class="flex size-9 items-center justify-center rounded-full bg-cloud/40 text-navy transition-colors hover:bg-blue hover:text-white"
          >
            <Icon name="lucide:twitter" class="size-4" />
          </a>
        </div>
      </div>
    </div>

    <!-- Related posts -->
    <section class="bg-gradient-to-b from-cream to-sky/20 py-16 lg:py-20">
      <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 class="font-unbounded text-center text-3xl font-extrabold text-navy">
          Pročitajte i
        </h2>

        <div class="mt-10 grid gap-8 md:grid-cols-2">
          <NuxtLink
            v-for="related in relatedPosts"
            :key="related.slug"
            :to="`/blog/${related.slug}`"
            class="group flex flex-col overflow-hidden rounded-3xl border-2 border-cloud/40 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
          >
            <div class="overflow-hidden">
              <NuxtImg
                :src="`/${related.img}`"
                :alt="related.title"
                class="aspect-[16/10] w-full object-cover transition-transform duration-300 group-hover:scale-105"
                width="480"
                height="300"
                format="webp"
                loading="lazy"
              />
            </div>
            <div class="flex flex-1 flex-col p-6">
              <div class="flex items-center gap-3 text-sm text-navy/50">
                <span
                  class="rounded-full px-3 py-1 text-xs font-semibold"
                  :class="accentClasses[related.accent]?.badge ?? accentClasses.mint.badge"
                >
                  {{ related.category }}
                </span>
                <span>{{ formatDate(related.date) }}</span>
              </div>
              <h3 class="font-unbounded mt-4 text-xl font-extrabold text-navy">
                {{ related.title }}
              </h3>
              <p class="mt-3 flex-1 text-sm leading-relaxed text-navy/70">
                {{ related.excerpt }}
              </p>
              <span class="mt-5 inline-flex items-center gap-2 font-semibold text-navy transition-colors group-hover:text-blue">
                Pročitaj
                <Icon name="lucide:arrow-right" class="size-4 transition-transform group-hover:translate-x-1" />
              </span>
            </div>
          </NuxtLink>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <AppCtaSection
      title="Spremni za učenje kroz igru?"
      subtitle="Pogledajte naše knjige i pronađite onu koja je prava za vaše dete."
    />
  </div>
</template>
