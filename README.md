# elorikids

Marketing-first online shop for interactive laminated write-wipe activity books for children aged 2–6. Built with Nuxt 4, Tailwind CSS v4, and Nuxt UI components.

## Stack

- **Nuxt 4** - SSR framework
- **Tailwind CSS v4** - styling (via `@tailwindcss/vite`)
- **@nuxt/icon** + `@iconify-json/lucide` - icons
- **@nuxt/image** - optimized responsive images (IPX)
- **@nuxt/fonts** - self-hosted fonts (Google: Unbounded)

## Getting started

```bash
npm install
npm run dev
```

Dev server runs on `http://localhost:3000`.

## Scripts

| Command             | Description                |
| ------------------- | -------------------------- |
| `npm run dev`       | Start dev server           |
| `npm run build`     | Build for production       |
| `npm run generate`  | Static site generation     |
| `npm run preview`   | Preview production build   |

## Project structure

```
app/
├── assets/css/         # Tailwind entry + custom styles
├── components/
│   ├── layout/         # AppHeader, AppFooter
│   └── sections/       # Landing page sections
├── composables/        # useAuth, useBooks, useCart, ...
├── layouts/            # default layout
└── pages/              # file-based routes
```

## Pages

- `/` - landing
- `/books/[slug]` - book details
- `/korpa` - cart
- `/poruci` - checkout
- `/prijava` · `/registracija` - auth
- `/sacuvano` - saved items
- `/kontakt` - contact
- `/politika-privatnosti` · `/uslovi-koriscenja` - legal
- `/hvala` - order confirmation

## Language

All UI copy is in Serbian (Latin script, `sr-Latn`).
