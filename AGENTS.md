# AGENTS.md - next-farabak.net-app

## Commands

| Command                | Description                                              |
| ---------------------- | -------------------------------------------------------- |
| `pnpm dev`             | Start dev server: `prisma generate && next dev`          |
| `pnpm build`           | Build: `prisma generate && next build`                   |
| `pnpm start`           | Start production: `next start`                           |
| `pnpm lint`            | Run ESLint                                               |
| `pnpm lint:ci`         | CI lint: `eslint --max-warnings=0 .` (fails if warnings) |
| `pnpm lint:fix`        | Auto-fix ESLint issues                                   |
| `pnpm format`          | Format with Prettier                                     |
| `pnpm format:check`    | Check formatting (fails on diff)                         |
| `pnpm test`            | Run Vitest unit tests                                    |
| `pnpm test:watch`      | Vitest watch mode                                        |
| `pnpm test:coverage`   | Vitest with coverage report                              |
| `pnpm prisma:generate` | Generate Prisma client                                   |

## Project Structure

- **App router**: `src/app/` - Next.js 16 App Router pages and routes
- **Components**: `src/components/` - UI components (antd, radix-ui, tiptap)
- **Lib**: `src/lib/` - Utility functions, API helpers, validation
- **Context**: `src/context/` - React providers (UserContext, InvoiceContext)
- **Helpers**: `src/helpers/` - Business logic and helpers
- **Hooks**: `src/hooks/` - Custom React hooks
- **Prisma schemas**: `prisma/schema.prisma` - Multiple schemas: blog, info, member, project, support, company_activity, farabak_net_technomi, landing_page

## Key Conventions

- **TypeScript strict mode**: `tsconfig.json` - `strict: true`, `noEmit: true`
- **Path aliases**: `@/*` maps to `./src/*` (tsconfig & vitest config)
- **ESLint**: Import order groups: `[builtin, external, internal, [parent, sibling], index]` with alphabetical sorting
- **Tailwind CSS**: v4 - canonical classnames enforced, shorthand enforced, no contradictions
- **Prettier**: Runs on `*.{js,jsx,ts,tsx,json,css,scss,md}` via lint-staged and format scripts
- **Husky pre-commit**: Runs `npx lint-staged` - fixes ts/tsx with eslint --fix + prettier, formats json/css/scss/md with prettier only
- **Lint-staged**: `*.{ts,tsx}` → `eslint --fix, prettier --write`; `*.{json,css,scss,md}` → `prettier --write`
- **Prisma**: Must run `prisma generate` before `dev`, `build`, or `preview`. Multiple schemas in Prisma DB.
- **Environment vars**: `JWT_SECRET` and `REFRESH_TOKEN_SECRET` are required (proxy.ts will throw if missing). `DATABASE_URL` for Prisma connection.
- **Cypress**: e2e tests in `cypress/` - excluded from tsconfig and ESLint
- **Vitest**: Tests from `src/**/*.test.{ts,tsx}`. Setup in `src/test/setup.ts`. Uses jsdom env. API tests use `createApiTestContext` from `src/test/api-test-utils.ts`.

## Framework

- **Next.js 16** with App Router
- **React 19**
- **Tailwind CSS v4**
- **Prisma ORM** with PostgreSQL
- **Auth**: JWT-based with refresh token flow in `src/proxy.ts` (middleware)
- **AI content negotiation**: `src/proxy.ts` serves markdown for `acceptmarkdown.com` clients via `negotiate()` helper

## Public design and agent workflows

Repository skills live in `.agents/skills/<name>/SKILL.md`. Codex discovers these project skills; read the relevant skill and its linked references before applying it. Invoke a specific workflow explicitly with `$frontend-design`, `$nextjs-performance`, or another skill name. Keep this directory as the source of truth.

| Task                                      | Project skills to consult                                        |
| ----------------------------------------- | ---------------------------------------------------------------- |
| New UI, redesign or buyer journey         | `brainstorming`, `frontend-design`, `cro`                        |
| Multi-step implementation                 | `writing-plans`; make a plan for the current approved scope      |
| App Router, React or caching              | `next-best-practices`, `react-patterns`, `next-cache-components` |
| Loading speed or animation budgets        | `nextjs-performance`, `core-web-vitals`                          |
| Keyboard, responsive usability and motion | `accessibility`, `web-design-guidelines`                         |
| Agent instructions or skill edits         | `writing-for-agents`                                             |

For any public-page redesign, read `DESIGN.md` first, then inspect the route, its data sources, the shared header/footer, and the rendered page. The active homepage is `src/app/(main)/page.tsx` → `TrustLanding.tsx`; `src/content/landing-stories.ts` and `src/content/landing-assets.ts` carry its story and media facts. Use Tailwind CSS v4 utilities for new page styling and match the header's responsive gutters and inner width. Treat older landing components and `landing.module.css` as legacy code until a route actually imports them.

The `2026-10-19` and `2026-10-20` files under `docs/superpowers/specs/` and `docs/superpowers/plans/` are historical research and implementation plans. Do not replay their old checklists as the current task. `docs/superpowers/landing-product-image-prompts.md` records the current generated image references; the asset manifest records disclosure and product-link status. Check current product facts and media rights before carrying claims onto another page. Registration since Solar Hijri 1381 is confirmed; attributed testimonials require approval. Preserve unrelated working-tree edits.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
