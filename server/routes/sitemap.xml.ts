import { books } from '~/composables/useBooks'
import { posts } from '~/composables/usePosts'

const SITE = 'https://elorikids.rs'

// Static SEO-critical pages (SSR-rendered).
// SPA-only routes (/admin, /shop, /auth/account, /track-order) are excluded —
// they have no SEO value and return empty client-rendered shells.
const staticUrls: { loc: string; priority: string; lastmod?: string }[] = [
  { loc: '/', priority: '1.0', lastmod: '2026-08-23' },
  { loc: '/books', priority: '0.9', lastmod: '2026-08-23' },
  { loc: '/about-us', priority: '0.8', lastmod: '2026-08-23' },
  { loc: '/faq', priority: '0.7', lastmod: '2026-08-23' },
  { loc: '/blog', priority: '0.8', lastmod: '2026-08-23' },
  { loc: '/legal/contact', priority: '0.5', lastmod: '2026-08-23' },
  { loc: '/legal/privacy-policy', priority: '0.3', lastmod: '2026-08-23' },
  { loc: '/legal/terms', priority: '0.3', lastmod: '2026-08-23' },
]

function urlEntry(loc: string, priority: string, lastmod?: string) {
  let xml = `  <url>\n    <loc>${SITE}${loc}</loc>\n    <priority>${priority}</priority>\n`
  if (lastmod) xml += `    <lastmod>${lastmod}</lastmod>\n`
  xml += `  </url>`
  return xml
}

export default defineEventHandler((event) => {
  const urls: string[] = []

  // Static pages
  for (const u of staticUrls) {
    urls.push(urlEntry(u.loc, u.priority, u.lastmod))
  }

  // Book product pages (SSR)
  for (const book of books) {
    urls.push(urlEntry(`/books/${book.slug}`, '0.9', '2026-08-23'))
  }

  // Blog posts (SSR)
  for (const post of posts) {
    urls.push(urlEntry(`/blog/${post.slug}`, '0.7', post.date))
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join('\n')}
</urlset>`

  setHeader(event, 'Content-Type', 'application/xml; charset=utf-8')
  return xml
})
