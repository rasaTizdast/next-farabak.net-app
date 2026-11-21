# `(main)` Route Quality Implementation Plan

> **For agentic workers:** Use the executing-plans workflow task-by-task. Keep the existing route organization and preserve unrelated working-tree edits.

**Goal:** Correct confirmed shared and route-specific defects across all 37 `(main)` route templates, including rendered metadata, page landmarks, page-specific interactions, and loading states.

**Architecture:** Retain the `(main)` layout as the sole owner of the main landmark. Use a small metadata helper for consistent route-specific Open Graph/Twitter values while preserving route-specific metadata and structured data. Keep loading UI at route segments or focused Suspense boundaries that actually wait on uncached or client-only state.

**Tech Stack:** Next.js 16.4.5 App Router, React 19, TypeScript, Vitest, Tailwind CSS v4.

**Spec:** `docs/audits/2026-11-21-main-route-audit.md`

## Global Constraints

- Keep TypeScript strict mode and existing App Router async APIs.
- Preserve current private dashboard authentication and `noindex` behavior.
- Do not publish testimonials, stock, product authority, or customer data claims without confirmed source facts.
- Keep loading placeholders accessible, labeled, and decorative children hidden from assistive technology.
- Preserve user changes already present in `AGENTS.md`, the audit skill, and auditor configuration.
- Use route-specific canonical, social URL, title, and description values; do not inherit the homepage URL on non-home pages.

---

### Task 1: Add reusable route social metadata and cover homepage tags

**Files:**

- Create: `src/lib/seo/route-metadata.ts`
- Create: `src/lib/seo/route-metadata.test.ts`
- Modify: `src/app/(main)/page.tsx`
- Modify: route metadata exports in the audited `(main)` pages that currently inherit generic share fields.

- [ ] Write unit tests for a route metadata builder: title, description, canonical path, Open Graph URL, site name, and matching Twitter title/description/image.
- [ ] Run the unit test and confirm it fails because the helper is absent.
- [ ] Implement the minimal typed helper using the configured site URL and existing Open Graph image.
- [ ] Apply it to audited static and dynamic route metadata; preserve article/product-specific type and image where currently present.
- [ ] Add homepage Twitter title/description matching its existing homepage title and description.
- [ ] Run the helper tests and route metadata tests; inspect raw output for `/`, `/about-us`, `/support`, one category, and one product.

### Task 2: Restore one main landmark and the 404 landmark

**Files:**

- Modify: `src/app/(main)/layout.tsx` only if the existing main wrapper needs adjustment.
- Modify: audited About, Contact, Privacy, Products, Meeting Room, and loading components that create nested main elements.
- Modify: `(main)` not-found composition / `ErrorPage`.
- Add or update focused tests for rendered landmark counts.

- [ ] Add failing component/render assertions for a route with duplicate `<main>` and the catch-all 404 without `<main>`.
- [ ] Run those tests to confirm the defects reproduce.
- [ ] Change inner `PublicShell as="main"` wrappers and the products/planner wrappers to neutral `div`/`section` elements without changing their layout classes.
- [ ] Ensure each loading fallback uses the shared outer main rather than creating another landmark.
- [ ] Wrap not-found content in one main landmark and give it a not-found title while keeping `noindex`.
- [ ] Run the focused tests and inspect rendered main counts and skip-link target on representative routes.

### Task 3: Align crawl identity, sitemap, and structured data

**Files:**

- Modify: `src/lib/data/sitemap.ts`, `src/lib/data/sitemap.test.ts` (or current sitemap tests).
- Modify: member detail metadata and sitemap URL generation.
- Modify: product finder, board, report, search metadata.
- Modify: blog article route and JSON-LD helpers/tests.
- Modify: About and Activity JSON-LD generation/tests.

- [ ] Add failing cases for privacy and product finder sitemap membership and linked member profile URLs.
- [ ] Add failing cases for finder route canonical and noindex on board/report; keep product search `noindex` and remove the homepage canonical.
- [ ] Add failing route tests showing invalid blog category returns 404 or canonical redirect and valid metadata, breadcrumb, and JSON-LD URLs agree.
- [ ] Add a failing test confirming article `dateModified` is omitted when there is no real modified timestamp.
- [ ] Correct `/about-us` Organization `sameAs` and Activity list/department JSON-LD to match the visible page.
- [ ] Normalize blank product search input to a clear headed empty state or redirect; retain `noindex`.
- [ ] Run the targeted route, metadata, sitemap, and JSON-LD tests; inspect raw HTML and sitemap output.

### Task 4: Complete Contact Us inquiry flow

**Files:**

- Modify: `src/app/(main)/contact-us/page.tsx`
- Reuse: `src/app/(main)/contact-us/_components/ContactInquiryForm.tsx`
- Modify/add: `src/app/(main)/contact-us/page.test.tsx` and form tests.
- Remove or leave unused: `ContactUsLoading.tsx` only if tests show it has no remaining consumer.

- [ ] Add a failing route test that Contact Us renders a labeled inquiry form and advertises the same behavior.
- [ ] Confirm the test fails because the form is not mounted.
- [ ] Render the existing tested form with the configured contact recipient; keep phone/email alternatives available.
- [ ] Ensure the form shell is a non-main container and retains accessible labels/errors/status.
- [ ] Run contact route and form tests; inspect server HTML and keyboard labels without submitting an email.

### Task 5: Fix finder and dashboard client loading transitions

**Files:**

- Modify: `src/app/(main)/product-finder/board/BoardWorkspace.tsx` and tests.
- Modify: `src/app/(main)/product-finder/report/ReportWorkspace.tsx` and tests.
- Modify: `src/app/(main)/dashboard/DashboardLayoutContent.tsx`, dashboard loading UI, and tests.
- Modify: `src/app/(main)/dashboard/edit-user/page.tsx` and tests.
- Modify: `src/app/(main)/dashboard/all-invoices` skeleton components/tests.
- Modify: `src/app/(main)/dashboard/new-invoice/loading.tsx` and tests.

- [ ] Add failing tests for saved localStorage report/board data not flashing the empty state.
- [ ] Add a ready-after-storage-read state and use a neutral client-loading placeholder until it is set.
- [ ] Add failing tests showing dashboard profile loading preserves action-card space, edit-profile does not render blank fields, and titles identify the route.
- [ ] Reuse one dashboard profile-wait skeleton matching welcome, summary, and action cards; respect reduced motion in the spinner.
- [ ] Align invoice route and client skeleton row counts and add the new-invoice stepper/neutral rows placeholder.
- [ ] Run product finder and dashboard test files, including delayed-response cases.

### Task 6: Add catalog fetch fallbacks and refine existing loading shapes

**Files:**

- Add: `loading.tsx` files for product list, pagination, category, and subcategory listing routes that await primary uncached data.
- Reuse/modify: `src/app/(main)/products/_components/ProductListSkeletons.tsx`.
- Modify: FAQ, CCTV storage, X-ray Fit loading components and tests.
- Modify: product finder query fallback if needed after delayed-query test.

- [ ] Add failing render tests that the six primary product-list route segments have a fallback matching their eventual catalogue shape.
- [ ] Add a category/subcategory-aware skeleton variant rather than showing navigation unavailable on subcategory pages.
- [ ] Connect existing product skeletons to the relevant route loading files and keep product-detail’s existing local Suspense strategy.
- [ ] Align FAQ placeholder count with the live source behavior or use a neutral flexible count.
- [ ] Add the missing CCTV control placeholders and X-ray stepper/unit/field placeholders.
- [ ] Run product listing/skeleton tests and inspect skeleton markup for status labeling, hidden decorative shapes, and reduced motion.

### Task 7: Fix route interactions and state errors

**Files:**

- Modify: `src/app/(main)/about-us/projects/[project]/ProjectSlider.tsx` and tests.
- Modify: `src/components/FaqAccordion.tsx`, `src/components/ui/ItemsAccordion.tsx`, and tests.
- Modify: `src/app/(main)/support/warranty-tracking/ClientWarrantyTracking.tsx` and tests.
- Review/minimize: `src/app/api/public/warranty-check/route.ts` and its API tests.
- Modify: `src/lib/data/projects.ts` and relevant alt-text tests.

- [ ] Add failing tests that single-image galleries hide or disable arrows and multiple-image galleries still navigate.
- [ ] Add failing accessibility assertions that FAQ buttons are inside heading elements.
- [ ] Add failing warranty tests for visible/announced confirm progress, visible confirm errors, and retry behavior.
- [ ] Replace raw motion classes in warranty request states with reduced-motion-aware variants.
- [ ] Review the public warranty response fields and tests; return only fields required by the UI and mask customer phone if full phone is unnecessary.
- [ ] Replace generic English project image alt labels with contextual Persian text.
- [ ] Run project slider, accordion, warranty client, and warranty API tests.

### Task 8: Verify every route family after fixes

**Files:**

- Modify/add: focused route tests only where missing.
- No deployment or production mutation.

- [ ] Run the focused tests for every changed component and route metadata helper.
- [ ] Run `pnpm test` and `pnpm lint`.
- [ ] Start the local Next app with project environment and inspect rendered HTML for all 37 route templates (with representative data slugs), checking status, title, description, canonical, robots, Open Graph/Twitter URL, H1, main count, and visible loading boundaries.
- [ ] Inspect at least one desktop and one mobile viewport for the changed loading and interaction states if browser automation becomes available; otherwise record that screenshots/keyboard remain unavailable.
- [ ] Compare live-safe public GETs after local verification only if a deployment has independently occurred; do not infer deployment from local success.

## Execution record (2026-11-22)

Implemented route metadata, main landmark, sitemap, structured data, inquiry form, catalogue loading, dashboard/invoice loading, finder hydration, calculator fallback, FAQ/gallery, warranty error/privacy and Next Image host changes. The audit report records route-level scope and verification details.

- TypeScript passed with `pnpm exec tsc --noEmit`.
- Changed-file ESLint and Prettier passed after the final interaction edits.
- Final focused route/component/API suites passed: 57 tests across 21 files.
- Full `pnpm test` ran: 1,570 passed and 9 multipart upload API tests failed because Undici rejected their `File` objects. These failures are outside the main-route change set.
- Repository-wide `pnpm lint:ci` reports one existing error in untouched `src/app/(main)/layout.tsx`: use Next `Link` for `/contact-us/` instead of a raw anchor. Changed-file lint passes.
- Local HTML requests checked route status, titles, H1s and main landmarks, including the image host regression before and after the fix. Protected dashboard requests redirected without a session.
- Mobile screenshots, browser keyboard walkthrough, Lighthouse/PageSpeed, CrUX, and a full local run of all 37 route templates remain unavailable/unverified.
