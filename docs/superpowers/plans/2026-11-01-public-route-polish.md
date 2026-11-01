# Public Route Polish Implementation Plan

> **For agentic workers:** Implement this scoped plan in the current checkout. Preserve the existing untracked redesign plan and spec.

**Goal:** Finish the requested public-site visual, navigation, breadcrumb, and heading refinements across shared chrome and support/company routes.

**Architecture:** Reuse the current public shell, PageIntro, PublicBreadcrumbs, and menu data. Keep route pages server rendered and make spacing, semantic hierarchy, and links explicit in the existing components.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS v4, Vitest, local browser review.

**Scope:** Header/footer and mobile navigation; products mega menu; support and about-us pages and descendants; projects and warranty routes; blog index, category, and article.

## Global constraints

- Preserve the existing Farabak public shell, responsive gutters, RTL behavior, and content facts.
- The product-finder is work in progress; remove public entry points to it without deleting its routes.
- User-owned untracked redesign plan/spec files must remain untouched.
- Verify local rendering and source-level heading structure; do not claim production changes.

---

### Task 1: Align shared chrome and navigation

**Files:** `src/app/globals.css`, `src/app/(main)/_components/ui/footer/Footer.tsx`, `src/app/(main)/_components/ui/productsMegaMenu/ProductsMegaMenuContent.tsx`, `src/app/(main)/_components/ui/hambugerMenu/HamburgerMenu.tsx`, `src/app/(main)/products/_components/ProductResultsBar.tsx`.

- [x] Set the shared header color token to the actual products flyout navy; retain the existing footer endpoint and gradient.
- [x] Replace the inaccurate footer map artwork with a location card that routes the stored office address to Google Maps.
- [x] Make each category name in the desktop flyout navigate to its category; keep the adjacent disclosure/selection interaction usable.
- [x] Add linked support and company route groups in the mobile sidebar.
- [x] Remove public product-finder links from the product result UI.
- [x] Run focused component tests and inspect the support/footer rendering locally; mobile route links are covered by the sidebar component changes.

### Task 2: Refine support and company page hierarchy

**Files:** support index, FAQ, download center, warranty tracking; about-us index, activity, projects list/detail, members list/detail; contact page as required for H1 correction.

- [x] Restore correctly labeled breadcrumbs on each support/about-us route and descendant.
- [x] Set a shared, moderate top-to-bottom section rhythm; add top spacing to warranty.
- [x] Remove activity and support-card numbers; darken activity descriptions; give “خدمات اصلی” space after the hero.
- [x] Remove the specified project intro sentence.
- [x] Verify one visible H1 on `/about-us`, `/support`, `/support/warranty-tracking`, `/about-us/projects`, and `/about-us/members`; reduce `/about-us/activity` and `/contact-us` to one H1.
- [x] Run focused route checks and inspect the requested desktop routes locally.

### Task 3: Improve blog card and article presentation

**Files:** support blog index, category, and article route pages plus existing blog card/image helpers as needed.

- [x] Align image and content inset spacing in article cards.
- [x] Show author, publication date, and calculated reading time on cards when source data exists.
- [x] Present article metadata on a subtly darker surface with a light shadow.
- [x] Verify metadata and layout in rendered blog routes.

### Task 4: Verify, commit atomically, and push

- [x] Run focused tests, lint/format checks, `git diff --check`, and rendered route/heading audits. (TypeScript check retains the existing `landing-stories.test.ts` union error.)
- [x] Review `git status` and diff to ensure unrelated files remain untouched.
- [x] Create atomic commits grouped by shared chrome/navigation, support/company pages, and blog presentation.
- [x] Push the commits to the current branch and confirm the remote head.
