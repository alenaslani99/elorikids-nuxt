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
- `/auth/login` - sign-in (Google only; accounts are created on first sign-in)
- `/sacuvano` - saved items
- `/kontakt` - contact
- `/politika-privatnosti` · `/uslovi-koriscenja` - legal
- `/hvala` - order confirmation

## Auth

Sign-in is Google-only (`server/utils/google.ts`, `server/api/auth/google*`).
Secrets: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` (see `.env.example`).

Two roles in `users.role`: `customer` (default) and `owner`. The owner is
promoted by hand in D1 (command in `.env.example`). `/admin` needs the owner
role plus a Google sign-in within the last hour.

## Language

All UI copy is in Serbian (Latin script, `sr-Latn`).
