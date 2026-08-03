# Project Knowledge Base: next-farabak-app-v15

> **Last Updated:** 2026-07-26
> **Maintainer:** Rasa Tizdast
> **Purpose:** Comprehensive context for AI agents working on this codebase

---

## Project Overview

**next-farabak-app-v15** is a Next.js application for a B2B invoicing platform (فراپک / Farabak) serving Iranian businesses. It features a public product catalog, invoice management system, warranty tracking, and an admin panel for managing branches, products, warehouses, and invoices.

---

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js (App Router) | 16.x |
| UI | React | 19.x |
| Language | TypeScript | 5.6 |
| Styling | Tailwind CSS | 3.4 |
| Database | PostgreSQL via Prisma | 6.x (multi-schema) |
| Auth | JWT (jose) + HTTP-only cookies | - |
| UI Library | Ant Design 5 + Tailwind | - |
| Forms | React Hook Form + Yup | - |
| HTTP Client | Axios | - |
| Font | IRANYekan variable font (local) | - |
| Images | next/image with S3 (Liara) | - |
| Analytics | Google Analytics + Umami (lazyOnload) | - |
| State | React Context (UserContext, InvoiceContext) | - |
| Unit Testing | Vitest | - |
| E2E Testing | Cypress | - |
| Code Quality | React Doctor, ESLint, Prettier | - |

---

## Project Structure

```
next-farabak-app/
├── .agents/skills/          # AI agent skills (10 skills)
├── .claude/                 # Claude Code settings (project-level)
├── cypress/                 # E2E tests
├── prisma/                  # Database schemas & migrations
├── public/                  # Static assets
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── (main)/          # Public pages (routes group)
│   │   ├── admin/           # Admin panel
│   │   ├── auth/            # Authentication pages
│   │   ├── api/             # API routes (29 endpoint groups)
│   │   ├── globals.css      # Global styles & design tokens
│   │   ├── layout.tsx       # Root layout (RTL, font, analytics)
│   │   └── page.tsx         # Homepage
│   ├── components/          # Shared React components
│   ├── context/             # React Context (UserContext, InvoiceContext)
│   ├── hooks/               # Custom hooks (useInvoiceCookie, etc.)
│   ├── lib/                 # Prisma client initialization
│   ├── utils/               # Utility functions
│   ├── helpers/             # Business logic (pricing, invoice handlers)
│   ├── constants/           # Static JSON data
│   └── types/               # TypeScript type definitions
├── doctor.config.mjs        # React Doctor configuration
├── tailwind.config.ts       # Tailwind configuration
├── vitest.config.ts         # Vitest configuration
├── AGENTS.md                # Agent guide (existing)
├── DESIGN.md                # Design system documentation
├── OPTIMIZATION_MISSION.md  # Optimization tracking
└── CLAUDE.md                # This file - project knowledge base
```

---

## Routing Architecture

### Route Groups

| Group | Path | Description |
|-------|------|-------------|
| `(main)` | `/*` | Public pages - product catalog, blog, about |
| `auth` | `/auth/*` | Authentication - login, register, forgot password |
| `admin` | `/admin/*` | Admin panel - branches, products, invoices, warehouses |

### API Endpoints

- **Location:** `src/app/api/`
- **Count:** 29 endpoint groups
- **Patterns:** RESTful, with JWT authentication middleware

---

## Key Conventions

### Language & Localization

- **Primary Language:** Persian (Farsi) - all user-facing text
- **Layout:** RTL (right-to-left)
- **Numerals:** Persian numerals for UI, English numerals for technical data
- **Currency:** IRR (Iranian Rial)

### Code Architecture

1. **Server Components by default** - only add `"use client"` when hooks/event handlers/browser APIs are needed
2. **Route groups** organize pages: `(main)` for public, `auth` for auth, `admin` for admin
3. **API routes** under `src/app/api/` - 29 endpoint groups
4. **ISR** for public pages: `fetch(..., { next: { revalidate } })`
5. **Client-side** for admin pages: `useState`/`useEffect` fetching

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

### Component States

All data-driven components must implement these visual states (in Persian):

| State | Persian Text | Implementation |
|-------|-------------|----------------|
| Loading | - | `animate-pulse` skeleton placeholders |
| Empty | `"محصولی یافت نشد"` / `"آیتمی یافت نشد"` | Conditional rendering |
| Error | `"خطا در دریافت اطلاعات"` | Error boundary + retry |
| Success | - | Render data |

---

## Design System

### Brand Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `--primary-color` | `#00bfff` | Primary buttons, links, active states |
| `--secondary-color` | `#318ce7` | Secondary elements, hover states |
| `--third-color` | `#1e90ff` | Tertiary accents |
| `--fourth-color` | `#0e6aff` | Darker accents, active borders |
| `--dark-blue-color` | `#003262` | Header, footer, dark sections |

### Typography

- **Primary Font:** IRANYekanXVF.woff (variable font)
- **CSS Variable:** `--font-iran-yekan`
- **Weight Range:** 100-1000 (variable)
- **Font Display:** `swap`
- **Preloaded:** Yes
- **Fallback:** `system-ui, arial`

### Breakpoints

| Name | Width | Notes |
|------|-------|-------|
| `mobile` | 577px | Custom mobile-first |
| `sm` | 640px | |
| `md` | 768px | |
| `lg` | 1024px | |
| `xl` | 1280px | |
| `2xl` | 1400px | Custom max container width |

### Custom CSS Classes

- `.glass-card` - Glassmorphism card (blur + transparency)
- `.input-field` - Standard form input
- `.textarea-field` - Textarea with min-height
- `.responsive-table-wrapper` - Mobile-friendly table scroll
- `.scrollbar-hide` - Hide scrollbar while keeping scroll
- `.prose-view` - TipTap editor output styling

---

## Testing Strategy

### Unit Tests (Vitest)

- **Location:** `src/` directory
- **Focus:** Hooks, context, helpers, utils
- **Commands:**
  ```bash
  npm test              # CI mode
  npm run test:watch    # Watch mode
  npx vitest            # Same as test:watch
  npx vitest run        # Same as npm test
  ```

### E2E Tests (Cypress)

- **Location:** `cypress/` directory
- **Focus:** Full user flows
- **Commands:**
  ```bash
  npx cypress open      # Interactive mode
  npx cypress run       # Headless mode
  ```

### Code Quality

- **React Doctor:** `npx react-doctor .` - React-specific linting
- **ESLint:** `npm run lint` / `npm run lint:fix`
- **Prettier:** `npm run format`

---

## Development Commands

```bash
# Development
npm run dev             # prisma generate + next dev
npm run build           # prisma generate + next build

# Code Quality
npm run lint            # ESLint check
npm run lint:fix        # ESLint auto-fix
npm run format          # Prettier format
npx react-doctor .      # React Doctor scan

# Testing
npm test                # Vitest unit tests (CI mode)
npm run test:watch      # Vitest unit tests (watch mode)
npx cypress open        # E2E tests (interactive)
npx cypress run         # E2E tests (headless)
```

---

## AI Agent Skills

All skills are in `.agents/skills/` and should be loaded with the `skill` tool:

| Skill | When to Use |
|-------|-------------|
| `next-best-practices` | Routes, layouts, metadata, error handling |
| `vercel-react-best-practices` | Performance review, bundle optimizations |
| `web-design-guidelines` | UI correctness, accessibility, spacing |
| `frontend-design` | Visual polish, aesthetic direction |
| `next-cache-components` | PPR, `use cache`, `cacheLife`, `cacheTag` |
| `vercel-composition-patterns` | Component architecture, compound components |
| `systematic-debugging` | Bug fixing, unexpected behavior |
| `improve-codebase-architecture` | Refactoring, consolidation, testability |
| `tdd` | Writing tests, red-green-refactor |
| `extract-design-system` | Reverse-engineering design tokens |

---

## Architecture Patterns

### Data Fetching

- **Public Pages:** Server Components with ISR (`fetch(..., { next: { revalidate } })`)
- **Admin Pages:** Client-side with `useState`/`useEffect` (interactive filters/pagination)
- **API Routes:** RESTful endpoints with JWT middleware

### State Management

- **Global State:** React Context (`UserContext`, `InvoiceContext`)
- **Local State:** `useState`/`useReducer` in components
- **Form State:** React Hook Form + Yup validation

### Authentication

- **Method:** JWT via `jose` library
- **Storage:** HTTP-only cookies
- **Middleware:** Route protection for admin/auth routes

### Database

- **ORM:** Prisma 6
- **Database:** PostgreSQL (multi-schema)
- **Location:** `prisma/` directory

---

## Common Component Patterns

### Image Slider (Homepage Hero)

- Component: `src/app/_components/imageSlider/ImageSlider.tsx`
- Dimensions: 1920x900, Quality: 90
- First slide: `priority` + `fetchPriority="high"` for LCP
- Remaining slides: `loading="lazy"`
- `placeholder="blur"` with `blurDataURL`

### Product Cards

- Used in: `CategoryGrid.tsx`, `ProductGrid.tsx`, `ProductsShowCase.tsx`
- Structure: Image → Title → Price → Add-to-invoice button
- Image: `width={1340}`, `height={780}`, `quality={75}`

### Forms (Auth, Contact, Admin)

- React Hook Form + Yup validation
- Custom `TextInput` component: `src/app/auth/_components/TextInput.tsx`
- Error messages shown inline below inputs
- Persian labels and placeholder text

### Tables (Admin)

- Ant Design `Table` component
- Used in branches, products, invoices, warehouses
- Skeleton loading via `ProductTableSkeleton`
- Empty state: Persian message

### Skeleton Loaders

- `src/app/_components/ui/SkeletonLoader.tsx` — generic, accepts `amount` prop
- `ProductTableSkeleton.tsx` — admin table rows
- `SkeletonFeatures` — product detail page features

---

## Important Files Reference

| File | Purpose |
|------|---------|
| `src/app/layout.tsx` | Root layout (RTL, font, analytics) |
| `src/app/globals.css` | Global styles, design tokens, custom classes |
| `src/lib/prisma.ts` | Prisma client initialization |
| `src/context/UserContext.tsx` | Global user state |
| `src/context/InvoiceContext.tsx` | Invoice management state |
| `tailwind.config.ts` | Tailwind configuration + breakpoints |
| `doctor.config.mjs` | React Doctor rule suppressions |
| `vitest.config.ts` | Test configuration |
| `AGENTS.md` | Existing agent documentation |
| `DESIGN.md` | Design system documentation |
| `OPTIMIZATION_MISSION.md` | Optimization tracking |

---

## Known Issues & Technical Debt

### React Doctor Score
- **Reported:** 100/100 (with suppressions)
- **Honest Score:** 90/100 (1 false positive warning after justified suppressions)
- **Goal:** Maintain 90+ honest score

### ESLint Configuration
- `react-hooks/rules-of-hooks` and `react-hooks/exhaustive-deps` are disabled in ESLint config
- `@typescript-eslint/no-explicit-any` is disabled
- Import ordering is enforced (builtin, external, internal, parent/sibling, index with alphabetical within groups)

### Vitest Coverage Thresholds
- Statements: 20%, Branches: 15%, Functions: 20%, Lines: 20%
- Coverage provider: v8
- Environment: jsdom

### Component Size
- 48 components exceed 300 lines (largest: 2052 lines)
- All are admin panel components with complex state management
- Breaking them down requires architectural redesign

### React Doctor Suppressions
- 18 rules suppressed in `doctor.config.mjs` with detailed justifications
- Most are justified false positives or architectural decisions
- See `OPTIMIZATION_MISSION.md` for detailed justification

### Performance Considerations
- Admin pages use client-side fetching (needed for interactivity)
- Some components have deeply coupled parent-child state management
- React Compiler is enabled and handles memoization automatically

### Missing Documentation
- No `.env.example` file — environment variables are undocumented
- README.md is still the default `create-next-app` template
- No CHANGELOG.md or release notes

---

## Git Workflow

- **Main Branch:** `main`
- **Development Branch:** `Development` (active work)
- **Git User:** Rasa Tizdast (`rasaknifehand@gmail.com`)
- **Commit Convention:** Conventional commits (`fix:`, `test:`, `chore:`, `docs:`, `refactor:`, `perf:`, `feat:`, `style:`)
- **Branching:** Linear history, no merge commits, no feature branches
- **No git hooks** — no husky, no lint-staged

### Commit Prefix Breakdown (Recent)
| Prefix | Usage |
|--------|-------|
| `fix` | Bug fixes |
| `refactor` | Code restructuring |
| `docs` | Documentation updates |
| `perf` | Performance improvements |
| `test` | Test additions/changes |
| `style` | Formatting/whitespace |
| `feat` | New features |
| `chore` | Build/tooling changes |

## Deployment

- **Hosting:** Hostinger (Linux hosting with Node.js support)
- **Domain:** farabak.net (configurable via env)
- **Deploy Method:** `npm run preview` (prisma generate → build → start)
- **S3 Storage:** Liara object storage for images
- **No CI/CD pipeline** — no GitHub Actions, no Vercel, no Docker
- **No `.vercel` config** (was likely used previously)

---

## Environment Variables

**No `.env.example` exists.** Key categories from `.env`, `.env.development`, `.env.production`:

### `.env` (shared)
- `LIARA_*` — S3-compatible storage (bucket, URL, endpoint, access/secret keys)
- `DATABASE_URL` — PostgreSQL on Liara cloud (`nextDev` database)
- `UMAMI_*` — Umami analytics
- `GOOGLE_SITE_VERIFICATION`, `GOOGLE_ANALYTICS_ID`
- `CURRENCY_API_KEY`
- `MAIL_HOST/PORT/USER/PASS` — SMTP via Liara email
- `NEXT_PUBLIC_SUPPORT_NUMBER`

### `.env.development`
- `JWT_SECRET`, `REFRESH_TOKEN_SECRET` (base64-encoded)
- `NODE_ENV=development`
- `BASE_URL=http://127.0.0.1:3000`

### `.env.production`
- Same JWT secrets
- `NODE_ENV=production`
- `BASE_URL` (commented-out `https://farabak.net`)

All `.env*` files are gitignored. `cypress.env.json` is also gitignored.

---

## Quick Reference for AI Agents

### When Working on Public Pages

1. Use Server Components by default
2. Implement ISR with `fetch(..., { next: { revalidate } })`
3. Add `loading.tsx` and `error.tsx` for route segments
4. Handle all 4 states: loading, empty, error, success
5. Use Persian text for all user-facing content
6. Follow RTL layout conventions

### When Working on Admin Pages

1. Client-side fetching is acceptable (interactive features)
2. Use Ant Design components for tables, modals, forms
3. Implement skeleton loading states
4. Use React Hook Form + Yup for validation
5. Handle Persian error messages

### When Working on API Routes

1. Use JWT middleware for authentication
2. Follow RESTful patterns
3. Validate inputs with Yup
4. Return appropriate HTTP status codes
5. Use Prisma for database operations

### When Working on Components

1. Check if Server Component is possible (no hooks/events)
2. Implement all 4 data states
3. Use Tailwind for styling
4. Follow design system colors and typography
5. Add proper accessibility labels

---

## Additional Resources

- **AGENTS.md** - Existing agent documentation
- **DESIGN.md** - Complete design system
- **OPTIMIZATION_MISSION.md** - Optimization tracking and decisions
- **`.agents/skills/`** - AI agent skills for various tasks
