# Core Web Vitals Plan

## Status (audited 2026-09-02)

**OVERALL: DONE** — all six items implemented and verified (lint + Vitest green on changed files).

| #   | Item                                   | Status                                                                                                                                                                                                                                                                                                                                                                     |
| --- | -------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | LCP Optimization – Hero                | ✅ DONE — `ImageSlider.tsx` `next/image` 1920×900, `priority` + `fetchPriority="high"` on slide 0, preconnect to S3                                                                                                                                                                                                                                                        |
| 2   | INP / FID Reduction                    | ✅ DONE — product grids in `<Suspense>`, `next/script afterInteractive`; `useTransition` added to warranty-tracking wizard (`ClientWarrantyTracking.tsx`) and invoice submit (`dashboard/new-invoice/page.tsx`) so big step/panel commits are interruptible; behavior-identical tests added                                                                                |
| 3   | CLS Prevention                         | ✅ DONE — font swap (`display:"swap"`), sized images, aspect-ratio skeletons                                                                                                                                                                                                                                                                                               |
| 4   | Metric Monitoring & Alerting           | ✅ DONE — `web-vitals` dep added; `src/lib/web-vitals.ts` (`initWebVitals`/`reportWebVitals`) reports LCP/INP/CLS only when over good thresholds to GA4 (`gtag`) + optional Umami; mounted via `WebVitalsProvider` in root layout; CI check `npm run vitals:check` via `scripts/check-web-vitals.mjs` (fails on LCP ≥ 2500 / INP ≥ 200 / CLS ≥ 0.1 from a Lighthouse JSON) |
| 5   | Responsive Image & Breakpoint Strategy | ✅ DONE — `sizes` added to product cards (`GridContentServer.tsx`, dropped `quality={100}`), blog hero/list/detail images, header logo; `deviceSizes` aligned to Tailwind breakpoints in `next.config.mjs`                                                                                                                                                                 |
| 6   | Server-Component Fetching & Streaming  | ✅ DONE — public pages are async RSC; Suspense + 30+ `loading.tsx`/`error.tsx`                                                                                                                                                                                                                                                                                             |

### Remaining

None.

## Goal

Reach and maintain excellent Core Web Vitals scores: Largest Contentful Paint (LCP) < 2.5s, First Input Delay (FID) / Interaction to Next Paint (INP) < 200ms, Cumulative Layout Shift (CLS) < 0.1, across all pages and devices.

## Brainstorming (subagent scope)

- Measure current vitals with `npm run metrics` (if exists) or Web Vitals API.
- Identify biggest contributors: hero image, font load, inline script blocking.

## Plans (ordered by priority)

### 1. LCP Optimization – Hero & Above‑the‑Fold Content

- **Skill**: `core-web-vitals` / `next-best-practices`
- **Action**:
  - Ensure hero image is served via `next/image` with actual width/height, prioritized (no `loading="lazy"`).
  - Add `preload` link for hero image: `<link rel="preload" as="image" href="/hero.png">` in `layout.tsx`.
  - Compress hero image to WebP/AVIF using Next's automatic format.
- **Implementation**: Edit `src/app/(main)/page.tsx` hero section.
- **Target**: LCP element becomes the hero image, loaded early.

### 2. INP / FID Reduction – Script & Event Handling

- **Skill**: `core-web-vitals` / `vercel-react-best-practices` / `nextjs-performance`
- **Action**:
  - Break up long tasks: avoid heavy computations on main thread during initial render.
  - Use `useTransition` / `useOptimistic` for form interactions.
  - Defer non‑critical event listeners to after first paint.
- **Implementation**: Wrap interactive components (e.g., project filters) in `<Suspense>` with fallback; use `next/script` with `strategy="afterInteractive"`.
- **Target**: INP < 200ms on all interactions.

### 3. CLS Prevention – Image & Font Dimensions

- **Skill**: `core-web-vitals` / `next-best-practices`
- **Action**:
  - Enforce `width` and `height` (or `style` aspect‑ratio) on every `<img>` and `<image>`.
  - Use `next/font` with `display="swap"` so font does not cause layout shift.
  - Avoid inserting content above existing content; use placeholders.
- **Implementation**: Run a codemod to add dimensions; verify `src/font.ts` uses `iranYekan` with swap.
- **Target**: CLS < 0.01.

### 4. Metric Monitoring & Alerting

- **Skill**: `nextjs-performance` / `best-practices`
- **Action**:
  - Add `web-vitals` analytics snippet that sends LCP, INP, CLS to a custom endpoint or Umami event.
  - Create a CI check: `npx web-vitals@3.0.0 --ci` failing build if thresholds violated.
- **Implementation**: `src/lib/web-vitals.ts` exporting `sendVitals`; configure in `layout.tsx`.
- **Target**: Continuous visibility, automatic regression detection.

### 5. Responsive Image & Breakpoint Strategy

- **Skill**: `next-best-practices` / `core-web-vitals`
- **Action**:
  - Use `next/image` `sizes` attribute to let the browser choose the appropriate srcset based on viewport.
  - Define breakpoints matching Tailwind’s responsive utilities (sm, md, lg, xl).
- **Implementation**: `<Image src="/photo.jpg" alt="..." widths={[375, 768, 1440]} heights={[200, 400, 600]} />`.
- **Target**: Faster image decode on mobile, reduced data usage.

### 6. Server‑Component Data Fetching & Streaming

- **Skill**: `next-cache-components` / `nextjs-data-fetching`
- **Action**:
  - Keep data fetching on the server; avoid `useEffect` + `fetch` patterns that block paint.
  - Use `streaming` with `<Suspense>` to render parts of the page as soon as they’re ready.
- **Implementation**: Refactor any client‑side `getUser` or `fetchProjects` to server components.
- **Target**: Reduced JavaScript bundle, earlier meaningful paint.

## Verification

- Run `npx lighthouse --output=json --output-path=lighthouse.json http://localhost:3000` and check scores.
- Use `web-vitals` dashboard in development (`localhost:3000/_vitals` if custom).
- Assert thresholds in CI: `largest-contentful-paint < 2500`, `interaction-to-next-paint < 200`, `cumulative-layout-shift < 0.1`.

---

_Subagents can run parallel: one optimizes images/LCP, another scripts/INP, another dimensions/CLS._
