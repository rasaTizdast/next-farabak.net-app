# PPR Plan (`cacheComponents`) — DORMANT

> Created 2026-08-26 from grilling session on `performance-plan.md`.
> **Gate**: do NOT run this until items 0–3 of `performance-plan.md` are done
> and measured — only proceed if LCP/TTFB still miss targets (LCP ≥ 2.5s or
> homepage still dynamic-per-request after the data-access refactor).

## Skills

- `next-cache-components` (primary) · `nextjs-performance` · `webapp-testing`

## Context

Next.js 16.2 supports Partial Prerendering via `experimental.cacheComponents`.
Static shells prerender at build time; dynamic holes stream at request time.
This suits hybrid public pages (static marketing chrome + live inventory/blog
teasers).

## Plans

### 1. Enable flag behind a branch

- Branch off `Development`; set `experimental: { cacheComponents: true }` in
  `next.config.mjs`. Expect build errors listing non-compliant pages.

### 2. Fix violations iteratively

- Add `use cache` + `cacheTag` to data functions from `src/lib/data/` (see
  `data-access-refactor-plan.md` — this plan depends on it being done).
- Wrap genuinely dynamic segments in `<Suspense>` so the static shell streams.
- Remove legacy `export const revalidate` / `dynamic` exports where superseded.

### 3. Set cache lifetimes

- `cacheLife` profiles per domain: sliders/projects (hours), products (minutes),
  blog teasers (minutes), static copy (`max`).

### 4. Validate

- Full `npm run build`, `npm test`, Cypress smoke of homepage/products/blog.
- Compare Lighthouse PPR vs pre-PPR builds; keep only if measurable win.

## Rollback

Single revert of the config flag restores prior behavior; keep the branch
squash-merged only with green metrics.
