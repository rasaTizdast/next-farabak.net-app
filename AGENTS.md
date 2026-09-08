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
