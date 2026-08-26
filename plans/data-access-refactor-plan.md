# Data Access Refactor Plan (Root Cause of `force-dynamic` Sprawl)

> Created 2026-08-26 from grilling session on `performance-plan.md`.
> **Problem**: Server Components fetch their own Next.js API routes via
> `${process.env.BASE_URL}/api/...` (e.g., `src/app/(main)/page.tsx:61`).
> During `next build`, these self-fetches need a reachable backend, which is why
> 26+ files carry `export const dynamic = "force-dynamic"` — killing ISR and
> TTFB gains on every public page.
>
> **Fix**: bypass HTTP entirely. Route Handlers stay for external clients;
> server-side pages query data helpers that hit Prisma directly.

## Skills

- `next-best-practices` · `vercel-react-best-practices` · `improve-codebase-architecture`

## Goal

Public `(main)` pages render via ISR with zero HTTP self-fetches; `force-dynamic`
remains only where genuinely per-user (dashboard, admin).

## Plans

### 1. Inventory & classify fetch sites

- Grep all `fetch(\`${...BASE_URL}/api/...`in`src/app/(main)` server components.
- For each: note route handler, DB model(s) touched, revalidate value, error handling.

### 2. Build a server-side data layer

- Create `src/lib/data/` with one module per domain (`sliders.ts`, `products.ts`,
  `blog.ts`, `projects.ts`, ...). Each exports typed async functions using Prisma
  directly, wrapped in `unstable_cache` (or `use cache` when on cacheComponents)
  with tags matching the old `revalidate` TTLs.
- Keep response shapes identical to the API JSON so call-site changes are minimal.

### 3. Migrate public pages one route at a time

- Replace each self-fetch with the data-layer call; delete `force-dynamic`.
- Order by traffic: homepage → products list/detail → blog → about-us → support.
- Each migration is an atomic commit with a green local prod build.

### 4. Revalidate on mutation

- Admin mutations already go through API routes — add `revalidateTag(...)` calls
  in those handlers so ISR content refreshes on write (replaces time-only ISR
  where freshness matters, e.g., products).

### 5. Cleanup

- Remove now-unused `BASE_URL` self-fetch helpers; keep API routes intact for
  client-side consumers.
- Grep gate: no `BASE_URL}/api` fetches remain inside any server component.

## Verification

- `npm run build` with backend unreachable → must still succeed (the original
  failure mode is gone).
- Route table: all migrated `(main)` routes show as ISR/static.
- Spot-check rendered HTML matches pre-refactor output per page.
- Targets unlocked: homepage + public routes drop `ƒ` (dynamic) status.
