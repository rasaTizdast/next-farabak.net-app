# `(main)` route quality audit — 2026-11-21

## Scope and method

Audited all 37 `page.tsx` route templates under `src/app/(main)`, assigning one `technical_quality_auditor` agent per route. Dynamic routes were checked against representative live slugs where data was available. Audits included page source, related layouts/components/data, server-rendered live HTML, metadata, route and nested loading fallbacks, and responsive/loading states from source. Installed Next.js 16.4.5 page, metadata, and loading guides were reviewed.

Live GETs were available for public routes and unauthenticated dashboard routes. Protected dashboard pages redirected to `/auth/login`; no credentials were entered. The desktop browser automation surface timed out, PageSpeed Insights returned 403, and Lighthouse/CrUX measurements were unavailable. Therefore viewport visuals, mobile/keyboard behavior, and field performance remain unverified; findings below use raw server HTML and source evidence. Audit date: 2026-11-21.

## Confirmed findings

### Shared route structure and metadata

- The `(main)` layout already provides `<main id="main-content">`. Nested `<main>` elements appear in About pages (`about-us`, `activity`, `members`, `projects`, member detail, project detail), Contact Us, Privacy, all `/products` routes through `products/layout.tsx`, and the meeting-room planner. Several matching loading fallbacks repeat the landmark. The catch-all 404 has no main landmark. Keep the shared main, make inner shells neutral containers, and add one main around 404 content.
- Homepage Twitter tags inherit the generic storefront defaults. Many routes with correct route-specific title, description, and canonical still inherit generic Open Graph/Twitter fields and homepage `og:url`: About, Activity, members, projects, contact, support hub, blog list/category/article, download center, FAQ, tools hub and tool pages, warranty tracking, product finder/board/report, and parts of the catalog. Product listing/category/subcategory routes generally have correct Open Graph data but stale Twitter metadata. Product detail metadata is correct.
- `/about-us` uses internal archive URLs as Organization `sameAs`; Activity JSON-LD has an empty `ItemList` and puts `OrganizationRole` values in `Organization.department`.
- `/about-us/members/[member]` inherits the homepage canonical and the live member detail URLs are missing from the sitemap. `/privacy` is indexable but missing from the live sitemap. `/product-finder` is indexable but absent from the sitemap and public entry links. User-state `/product-finder/board` and `/product-finder/report` inherit homepage metadata and are indexable; they need explicit route identity and a `noindex` policy. `/products/search` is already `noindex` but incorrectly canonicalizes to `/`.
- A live blog article URL with the wrong category slug returns 200, declares the invalid URL canonical, while its `BlogPosting` URL uses the valid category. The route must validate the category or redirect to a canonical category. Blog `dateModified` duplicates `created_at` despite no separate modification timestamp.
- An unknown catch-all route returns 404 and `noindex` but inherits the storefront browser/social title and has no main landmark.

### Page purpose and interactions

- Contact Us promises a project inquiry flow, but its rendered page has no form. `ContactInquiryForm` exists but is not mounted. An unused `ContactUsLoading.tsx` is not a recognized route loading file; the page’s data-only Suspense boundary is otherwise appropriately focused.
- A one-image project gallery still renders previous/next arrows that cannot change the image. Project images use generic English alt labels.
- The FAQ accordion places an `<h2>` inside the accordion button rather than placing the button inside the heading.
- Product search without `q` renders an empty title and no H1. Missing/blank input needs an intentional state or redirect.
- Warranty confirmation failures set an error that is not rendered on the confirmation step. The pending state replaces the button text with an unlabeled spinner; request animations do not honor reduced motion. The related public API returns customer name and phone after a supplied warranty code; this was not probed with customer data and is a privacy risk to review.

### Loading behavior

- The homepage, About Us, support hub, tools hub, and product detail routes have focused Suspense or cached/static behavior; no extra full-page loading route is needed for those paths.
- The Privacy, Activity, member/project archive and member/project detail fallbacks match their page structures, but the fallbacks for Privacy, Activity, members and project detail also duplicate the main landmark.
- Dashboard’s route fallback omits action cards while its profile-fetch state uses a generic spinner; the spinner ignores reduced-motion settings. Edit User can show blank fields before profile data arrives. Its route skeleton omits the intro sentence. New Invoice’s skeleton omits the three-step indicator and assumes rows exist. All Invoices has a five-row route skeleton versus a four-row client skeleton.
- Product Finder’s base fallback fits the no-query state, but a category query can briefly show the unselected-intent fallback. Its questionnaire-level fallback is suitable.
- Board and Report read localStorage in `useEffect` with `report = null`; saved content therefore flashes an empty state. Their route loading fallbacks show populated tables/reports even though the settled client state may be empty.
- Primary data fetches on `/products`, root pagination, category, category pagination, subcategory, and subcategory pagination have no route fallback. Existing catalogue skeletons are unused or do not fit every subcategory shape. Product search already has a suitable broad loading skeleton.
- FAQ’s fallback has five rows while the live sample has two. CCTV storage’s fallback omits several calculator controls. X-ray Fit’s fallback omits the stepper/unit switch/active field group. Meeting Room, Download Center, Warranty Tracking, Blog listing/category/article, and Change Password loading shapes were otherwise judged appropriate from source.

## Prioritized implementation

1. Remove duplicate main landmarks across shared and route-specific shells; add a single main landmark to the 404. Verify loaded and loading output.
2. Make Open Graph/Twitter metadata route-specific, repair canonical/robots identity for finder, board, report, search, member detail, and 404, and update sitemap entries for intended indexable pages.
3. Add tests and fixes for invalid blog categories, search without a query, localStorage hydration flashes, contact inquiry flow, dashboard profile loading, warranty confirmation errors, and gallery arrows.
4. Add catalogue loading fallbacks for each awaited product-list route and align existing account/tool fallbacks with their settled layouts; respect reduced-motion settings.
5. Correct inaccurate JSON-LD and generic alt text, fix FAQ heading semantics, add dashboard page titles, and review/minimize warranty customer data returned by the public API.

## Readiness

Initial readiness at audit time: needs work. The implementation and verification record below captures the changes since this finding.

## Implementation and verification (2026-11-22)

Implemented the main findings across the audited route families:

- Replaced nested page/loading `<main>` elements with neutral containers, kept the shared main landmark, and gave the 404 component an explicit main option.
- Added route metadata for social previews and canonical identity; corrected finder/search/dashboard behavior, blog category validation, sitemap coverage, Activity structured data, and not-found title.
- Mounted the existing inquiry form on Contact Us; fixed single-image project navigation and FAQ heading semantics.
- Added catalogue loading fallbacks, corrected dashboard/invoice skeleton differences, added headings to board/report hydration placeholders, and expanded the CCTV/X-ray calculator fallbacks to represent their visible controls.
- Derived allowed Next Image hostnames from the configured bucket URL. Local data uses a bucket hostname that was absent from `next.config.mjs`, which previously forced entire image-bearing routes into client rendering.
- Removed customer name and phone from the public warranty response and displayed a generic callback message. Confirmation errors and progress now remain visible and motion-aware.

Verification:

- Final focused route/component/API suites passed: 57 tests across 21 files.
- `pnpm exec tsc --noEmit` passed.
- ESLint and Prettier passed for the changed source files and audit/plan documents. Repository-wide `pnpm lint:ci` reports one existing error in the untouched `(main)/layout.tsx`: a raw anchor navigates to `/contact-us/` instead of using Next `Link`.
- Full `pnpm test`: 1,570 passed; 9 upload API tests failed because Node/Undici rejected the tests' multipart `File` values. The failing tests are in project/member/showcase/slider/product-blog upload APIs, outside the audited route changes.
- Local Next HTML requests returned HTTP 200 and one shared main landmark for sampled public routes. Before fixing the image hostname, member/project/catalog pages showed no initial HTML H1 because Next abandoned server rendering; after the fix they rendered their H1s. Board/report loading output now also contains its route heading. Protected dashboard requests redirect to the homepage without a session.
- Mobile screenshots, full keyboard walkthroughs, Lighthouse/PageSpeed and CrUX remain unavailable in this environment.
