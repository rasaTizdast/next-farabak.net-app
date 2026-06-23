# Agent Guide for next-farabak-app-v15

## Installed Skills (skills.sh)

All skills are in `.agents/skills/` and should be loaded with the `skill` tool when needed:

| Skill                           | File                                                    | When to Use                                                |
| ------------------------------- | ------------------------------------------------------- | ---------------------------------------------------------- |
| `next-best-practices`           | `.agents/skills/next-best-practices/SKILL.md`           | Writing routes, layouts, metadata, error handling          |
| `vercel-react-best-practices`   | `.agents/skills/vercel-react-best-practices/SKILL.md`   | Performance review, bundle optimizations, re-renders       |
| `web-design-guidelines`         | `.agents/skills/web-design-guidelines/SKILL.md`         | UI correctness, accessibility, spacing, typography         |
| `frontend-design`               | `.agents/skills/frontend-design/SKILL.md`               | Visual polish, aesthetic direction                         |
| `next-cache-components`         | `.agents/skills/next-cache-components/SKILL.md`         | PPR, `use cache`, `cacheLife`, `cacheTag`, `revalidateTag` |
| `vercel-composition-patterns`   | `.agents/skills/vercel-composition-patterns/SKILL.md`   | Component architecture, compound components, render props  |
| `systematic-debugging`          | `.agents/skills/systematic-debugging/SKILL.md`          | Bug fixing, unexpected behavior                            |
| `improve-codebase-architecture` | `.agents/skills/improve-codebase-architecture/SKILL.md` | Refactoring, consolidation, testability                    |
| `tdd`                           | `.agents/skills/tdd/SKILL.md`                           | Writing tests, red-green-refactor                          |
| `extract-design-system`         | `.agents/skills/extract-design-system/SKILL.md`         | Reverse-engineering design tokens                          |

## Project Overview

**Stack:** Next.js 16 (App Router) · React 19 · TypeScript 5.6 · Tailwind CSS 3.4  
**Database:** PostgreSQL via Prisma 6 (multi-schema)  
**State:** React Context (UserContext, InvoiceContext)  
**Auth:** JWT via `jose` + HTTP-only cookies  
**UI Lib:** Ant Design 5 + Tailwind utility classes  
**Forms:** React Hook Form + Yup  
**HTTP:** Axios  
**Font:** IRANYekan variable font (local via `next/font`)  
**Images:** `next/image` with S3 (Liara)  
**Analytics:** Google Analytics (lazyOnload) + Umami (lazyOnload)

## Key Conventions

### Language & Direction

- All user-facing UI text must be in **Persian** (Farsi)
- RTL layout — use `right`/`left` appropriately, never hard-code
- Numbers: use Persian numerals where culturally appropriate, English numerals for technical data
- Currency: IRR (Iranian Rial)

### Code Architecture

- **Server Components by default** — only add `"use client"` when hooks, event handlers, or browser APIs are needed
- **Route groups:** `(main)` for public, `auth` for auth pages, `admin` for admin panel
- **API routes** under `src/app/api/` — 29 endpoint groups
- **Public pages** use ISR with `fetch(..., { next: { revalidate } })`
- **Admin pages** are client-side with inline `useState`/`useEffect` fetching

### Performance Rules (Critical)

1. Use `next/dynamic` for below-fold components with skeleton loading
2. Add `loading.tsx` for every route segment that fetches data
3. Add `error.tsx` for every route segment with Persian error messages
4. Wrap all `"use client"` data-fetching sections in `<Suspense>` boundaries
5. Every data-dependent component must handle 4 states: loading → empty → error → success
6. Images: `next/image` with explicit `width`/`height`, `placeholder="blur"` + `blurDataURL`
7. Fonts: `next/font/local` with `display="swap"`, `preload: true`
8. Avoid `await` inside loops — use `Promise.all()`
9. Avoid `array.includes()` inside loops — use `Set`
10. Avoid `dangerouslySetInnerHTML` without `DOMPurify`
11. Avoid `useEffect` + `fetch` on pages — prefer Server Components

### Testing Strategy

- **Unit tests:** Vitest (in `src/`) for hooks, context, helpers, utils
- **E2E tests:** Cypress (in `cypress/`) for full user flows
- **Data cleanup:** All DB-writing tests must use a UUID marker and clean up in `after()`/`afterAll()`
- Run: `npm test` (Vitest) or `npx cypress run` (E2E)

### Key Commands

```bash
npm run dev             # prisma generate + next dev
npm run build           # prisma generate + next build
npm run lint            # ESLint check
npm run lint:fix        # ESLint auto-fix
npm run format          # Prettier format
npm test                # Vitest unit tests (CI mode)
npm run test:watch      # Vitest unit tests (watch mode)
npx cypress open        # E2E tests (interactive)
npx cypress run         # E2E tests (headless)
npx vitest              # Unit tests (watch mode, same as test:watch)
npx vitest run          # Unit tests (CI mode, same as npm test)
npx react-doctor .      # React Doctor scan
```

### File Organization

```
src/app/                # App Router routes + API
src/components/         # Shared components
src/context/            # React Context (UserContext, InvoiceContext)
src/hooks/              # Custom hooks (useInvoiceCookie, etc.)
src/lib/                # Prisma client init
src/utils/              # Utility functions
src/helpers/            # Business logic (pricingHelper, invoiceHandlers, etc.)
src/constants/          # Static JSON data
```

### Design Tokens

See `DESIGN.md` for full reference. Quick summary:

- Primary: `#00bfff`, Secondary: `#318ce7`, Dark: `#003262`
- Font: IRANYekan variable (CSS var `--font-iran-yekan`)
- Breakpoints: mobile (577px), sm, md, lg, xl, 2xl (1400px)
