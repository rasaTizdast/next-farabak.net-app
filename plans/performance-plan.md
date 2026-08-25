# Performance Plan

## Goal
Achieve faster load times, optimal Core Web Vitals (LCP, INP, CLS), and a smooth UX across desktop and mobile, with a focus on Persian‑language content and image‑heavy sections.

## Brainstorming (subagent scope)
- Profile current metrics with Lighthouse and Web Vitals API.
- Identify bottlenecks: heavy hero images, unoptimized fonts, third‑party scripts.
- Decide on PPR (Partial Prerendering) boundaries and dynamic imports.

## Plans (ordered by priority)

### 1. Image Optimization & Lazy Loading
- **Skill**: `core-web-vitals` / `next-best-practices` / `vercel-react-best-practices`
- **Action**: Migrate all `<img>` to `next/image` with `loading="lazy"`, `placeholder="blur"` and a generated blur data URL. Add `width`/`height` ratios to avoid CLS.
- **Implementation**: Run a codemod or manually replace images in `src/pages/` and `src/components/`. Use `next/font` for the IRANYekan font already in place.
- **Deliverable**: Reduced LCP, automatic format selection (WebP/AVIF), CLS prevention.

### 2. Font Optimization
- **Skill**: `next-best-practices` / `vercel-react-best-practices`
- **Action**: Ensure `IRANYekan` is loaded via `next/font/local` with `display="swap"` and `preload: true`. Remove any external font requests.
- **Implementation**: Verify `src/font.ts` or `next.config.js` contains:
  ```ts
  import iranYekan from "@/font/iranYekan";
  ```
- **Deliverable**: No FOIT/FOUT delay, instant text rendering.

### 3. Code Splitting & Dynamic Imports
- **Skill**: `next-best-practices` / `vercel-react-best-practices`
- **Action**: Use `next/dynamic` with `ssr: false` for below‑fold components (complex charts, heavy modals). Add skeleton loaders.
- **Implementation**: Wrap components in `<Suspense fallback={<Skeleton/>}>` and dynamic import.
- **Deliverable**: Smaller initial bundle, faster TTI.

### 4. Server Components & Streaming
- **Skill**: `next-cache-components` / `nextjs-data-fetching`
- **Action**: Convert data‑fetching pages to Server Components, leveraging Incremental Static Regeneration (ISR) with `revalidate: 60`. Add `loading.tsx` skeletons for each route segment.
- **Implementation**: Ensure every `page.tsx` either fetches data server‑side or uses `use cache` / `cacheLife` for static data.
- **Deliverable**: Faster first paint, reduced client JavaScript.

### 5. Critical CSS & Inline Styles
- **Skill**: `core-web-vitals` / `vercel-react-best-practices`
- **Action**: Extract above‑the‑fold CSS and inline it in `<style>` tag, or use Tailwind's `purge` to remove unused styles. Consider `critters` or `fillet` for critical CSS generation.
- **Implementation**: Add a build step `npm run extract:critical` that generates `critical.css` and injects it in `layout.tsx`.
- **Deliverable**: LCP improvement, lower RTT.

### 6. Third‑Party Script Audit
- **Skill**: `best-practices` / `nextjs-performance`
- **Action**: Review Google Analytics, Umami, and any chat widgets. Defer non‑essential scripts using `defer` or load them after First Contentful Paint.
- **Implementation**: Wrap analytics in `<Script afterFCP>` component or use `next/script` with `strategy="afterInteractive"`.
- **Deliverable**: Reduced blocking, improved INP.

### 7. PPR (Partial Prerendering) for Hybrid Pages
- **Skill**: `next-cache-components`
- **Action**: Identify pages that mix static and dynamic data (e.g., profile page with user‑specific data + static header). Apply `export const dynamic = "force-dynamic"` where needed, and use `searchParams` for ISR.
- **Implementation**: Refactor `src/app/(main)/profile/page.tsx` to use `generateStaticParams` + `revalidate`.
- **Deliverable**: Better SEO/isr blend, faster perceived load.

## Verification
- Run `npm run lint:perf` (custom) and `npx lighthouse https://your-domain.com --view`.
- Use `web-vitals` npm package to monitor real‑user LCP, FID, CLS.
- Compare metrics before/after each plan; target LCP < 2.5s, INP < 200ms, CLS < 0.1.

---
*Parallel subagents can tackle image/font optimization, code splitting, and PPR simultaneously.*