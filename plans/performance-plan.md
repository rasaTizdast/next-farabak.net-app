# Performance Plan (Revised after Codebase Audit)

> Rewritten on 2026-08-26 against the actual Next.js 16.2 App Router codebase.
> Original plan referenced stale paths (`src/pages/`, `src/font.ts`) and work
> already completed (font loading, analytics deferral).

## Audit Findings (current state)

| Area                    | Status                                                                                                                                                                            |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Fonts                   | ✅ Done — `next/font/local` with swap/preload/fallbacks (`src/app/layout.tsx:16`). ⚠️ Duplicate manual `<link rel="preload">` at line 47 causes a double-preload console warning. |
| Analytics scripts       | ✅ Done — GA + Umami use `lazyOnload` / deferred `<Script>`.                                                                                                                      |
| Images                  | ✅ Mostly done — public pages use `next/image`; slider LCP image already has `priority={index === 0}`. Remaining raw `<img>` tags are admin-only (not CWV-critical).              |
| ISR                     | ✅ Widely used (`revalidate: 60–3600`) across products/blog/about-us. ⚠️ Homepage overrides everything with `force-dynamic`.                                                      |
| Dynamic imports         | ✅ Homepage sections use `next/dynamic`. ⚠️ Fallbacks are fixed `h-48` gray boxes → CLS risk when real heights differ.                                                            |
| loading.tsx / error.tsx | ✅ 20 loading.tsx present.                                                                                                                                                        |
| Ant Design              | ⚠️ `ConfigProvider` wraps the **entire app at root layout** → antd runtime CSS-in-JS ships to public pages that never render an antd component.                                   |
| PPR / `cacheComponents` | ❌ Not enabled (Next 16.2 supports it).                                                                                                                                           |

## Goal

Faster TTFB/LCP on public pages, reduced client JS shipped to visitors,
CLS-free section loading. Targets: LCP < 2.5s, INP < 200ms, CLS < 0.1.

## Plans (ordered by expected impact)

### 0. Baseline Measurement

- **Skill**: `core-web-vitals`
- **Action**: Run Lighthouse (mobile) on `/`, `/products`, one product detail page, one blog post. Record LCP/TBT/CLS/transfer sizes as the baseline in this file.
- **Deliverable**: Numbers to compare each change against.

### 1. Remove `force-dynamic` from the homepage

- **Skill**: `nextjs-performance` / `next-cache-components`
- **Action**: `src/app/(main)/page.tsx:1` sets `export const dynamic = "force-dynamic"` while all its fetches already carry `next: { revalidate: 300 }`. Delete the export so the page can be statically prerendered + revalidated (ISR).
- **Context (grilled)**: every `force-dynamic` in this project was added because
  builds failed when server-component self-fetches (`${BASE_URL}/api/...`)
  couldn't reach the running backend. If the build fails again after removal,
  **revert** — the root cause is owned by `plans/data-access-refactor-plan.md`.
- **Verify**: `npm run build` passes and route output shows `/` as ISR, not per-request dynamic.
- **Deliverable**: Major TTFB/LCP win on the highest-traffic page.

### 2. Fix duplicate font preload

- **Skill**: `nextjs-performance` (font reference)
- **Action**: Delete the manual `<link rel="preload" href="/fonts/IRANYekanXVF.woff">` block from `src/app/layout.tsx` — `localFont({ preload: true })` already emits it with the correct hashed URL.
- **Deliverable**: No double-download warning; correct preloaded URL.

### 3. Scope Ant Design out of public pages

- **Skill**: `vercel-react-best-practices`
- **Action**: Audit which public `(main)`/`auth` routes render antd components. If none, move `ConfigProvider` (and its theme tokens) into the `admin` and `dashboard` layouts so public pages stop downloading antd runtime. Public styling stays Tailwind-only.
- **Careful**: Verify modals/messages/toasts used via context (e.g., antd `App` hooks) aren't relied upon on public pages before moving.
- **Deliverable**: Smaller client bundle on 100% of public traffic.

### 4. CLS-safe dynamic-import fallbacks

- **Skill**: `core-web-vitals`
- **Action**: Replace the generic `h-48 bg-gray-100` fallbacks in `src/app/(main)/page.tsx` (and any other `dynamic()` call sites) with skeleton placeholders matching each section's real rendered height at mobile/desktop breakpoints.
- **Deliverable**: CLS < 0.1 on landing page.

### 5. Image attribute pass on public templates

- **Skill**: `nextjs-performance` (image reference)
- **Action**: Sweep `src/app/_components/**` and `(main)` templates for missing `sizes` props (slider/banner/grid images), wrong `quality` values, or missing `alt`. Confirm no public component uses raw `<img>`.
- **Deliverable**: Correct responsive srcsets; no oversized downloads.

### 6. ~~(Optional, gated) Enable PPR via `cacheComponents`~~

- **Struck from this plan** (grilled decision): too invasive for this pass.
- Moved to `plans/ppr-plan.md` — dormant; run only if post-item-3 metrics
  still miss targets.

## Decisions Log (grilling, 2026-08-26)

| Q                  | Decision                                                                      |
| ------------------ | ----------------------------------------------------------------------------- |
| Homepage freshness | ISR staleness up to 300s acceptable                                           |
| Ant Design         | Move ConfigProvider to admin only; rewrite public antd components in Tailwind |
| Measurement        | Local production build (`next build && next start`)                           |
| Branch             | Work directly on `Development`, atomic commits                                |
| PPR                | Struck; separate dormant plan written                                         |

## Verification

- Re-run Lighthouse after each item; compare to baseline (#0).
- `npm run build` must succeed and route table must show expected static/dynamic split.
- `npm test` green; targeted Cypress flows for homepage + product page.
- Final targets: LCP < 2.5s · INP < 200ms · CLS < 0.1.
