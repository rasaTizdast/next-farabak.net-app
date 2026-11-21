# Unlighthouse Report: Public Routes

**Date:** 2026-11-22
**Target:** local production build at `http://localhost:3010`
**Tool:** `unlighthouse@beta` (`1.0.0-beta.1`)
**Scope:** 18 representative main routes, mobile and desktop (36 route/device checks)

## Routes checked

`/`, `/about-us`, `/about-us/activity`, `/contact-us`, `/privacy`, `/product-finder`, `/product-finder/board`, `/product-finder/report`, `/products`, `/products/reolink-cctv-camera`, `/products/reolink-cctv-camera/bullet`, `/products/search`, `/support`, `/support/blog`, `/support/faq`, `/support/download-center`, `/support/tools`, and `/support/tools/meeting-room`.

## Full baseline and fixes

The initial scan completed all 36 checks without route failures. Its average score was **97.99%**: performance 97.97%, accessibility 98.33%, SEO 95.67%, best practices 100%, and agentic browsing 98.89%. Average LCP was 680ms; the maximum CLS was 0.857.

The largest issues were the contact page's short Suspense fallback shifting the full form and map into view, and the product listing's first image being lazy-loaded. The contact page now reserves its final layout with a matching skeleton, and the first product image is prioritized. The contact page's desktop CLS fell from 0.857 to 0.0021 in the focused rerun; mobile CLS fell from 0.102 to 0.

Accessibility issues on the home and tools routes were corrected by increasing text contrast. Footer heading levels were adjusted to keep navigation group titles at h2 and the address heading at h3. A raw contact link in the shared layout now uses the shared Next.js `Link` component.

The initial homepage and tools accessibility scores were 95%. Search and finder workflow pages retain their deliberate `noindex` metadata. Lighthouse's initial `/products` browser scan reported the description outside the parsed head because metadata was streamed; a Googlebot user-agent request confirmed the generated description is inside `<head>` for crawlers.

## Focused post-fix rerun

The final production build rerun covered `/`, `/products`, `/products/reolink-cctv-camera`, `/products/reolink-cctv-camera/bullet`, `/contact-us`, and `/support/tools` on both devices (12 checks, no failures).

| Metric                | Result |
| --------------------- | -----: |
| Average overall score | 99.33% |
| Performance           | 98.67% |
| Accessibility         |   100% |
| SEO                   | 98.67% |
| Best practices        |   100% |
| Agentic browsing      |   100% |
| Average LCP           | 1.035s |
| Maximum CLS           | 0.0032 |

Product root LCP improved from 3.42s desktop / 4.65s mobile to 1.33s / 2.67s. Scores for external product imagery can vary between scans; the category route's mobile LCP was 2.445s in the focused rerun.

## Commands and artifacts

The scans ran against the local `next start` production server with explicit route and device lists using `pnpm dlx --package=unlighthouse@beta unlighthouse-ci`. Generated SQLite databases and `ci-result.json` exports are in the machine's `%TEMP%` directory and were not added to the repository.

## Other verification

- `pnpm build`: passed, including Prisma generation, Next production build, type check, and static route generation.
- `pnpm lint:ci`: passed.
- `pnpm exec tsc --noEmit`: passed.
- Focused menu, catalogue, loading, contact, footer, and product image tests passed.
- Full `pnpm test`: 1,578 passed and 9 failed in existing multipart-upload API tests. The failing handlers return 500 when their tests pass a mocked `File` that Undici's `FormData` rejects. Affected suites: projects; showcase products; landing sliders; member create/update; product blog upload. These failures are unrelated to the audited page changes.
