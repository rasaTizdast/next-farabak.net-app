# Farabak Page Indexing Remediation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Remove confirmed broken internal links, preserve correct dispositions for retired and canonical URLs, and return a URL-by-URL indexing audit workbook with production evidence.

**Architecture:** Filter inactive blog and product categories at the server-side data sources used by public navigation. Add a permanent redirect for the retired industrial subcategory that the catalog owner confirmed moved to `black-wonder`. Preserve the retired SKU as a 404. Update the supplied audit workbook with evidence and one disposition per reported URL, then verify production and Google Search Console where access allows.

**Tech Stack:** Next.js 16 App Router, TypeScript, Prisma, Vitest, Excel workbook.

**Spec:** `C:\Users\Rasa\.codex\attachments\c185d6f9-1f3b-491e-a675-75d19a08b817\goal-objective.md`

## Global Constraints

- Preserve the two unrelated staged changes in the original `next-farabak-app` checkout.
- Keep retired URLs at 404 and do not redirect unrelated pages to the homepage.
- Redirect the retired industrial subcategory only to the catalog-confirmed replacement, `/products/industrial-cctv-camera/black-wonder`.
- Keep `EXB-2323-S436` retired with no replacement.
- Preserve valid pagination, its self-canonical behavior, and intentional noindex pages.
- Treat Search Console indexing as pending until Google reports the result.

## Current status (2026-11-14)

- Tasks 1 and 2 are implemented in commits `8b85f7ae` and `a1f941dd`; focused tests, changed-file lint, and the production build passed. The full test suite stalled without producing results, so it remains unverified.
- Task 3's 326 URL rows have explicit dispositions in the output workbook. Production checks and local smoke checks are recorded there; Search Console stored/live evidence is still pending authentication.
- Task 4 is not complete: production deployment and post-release checks are blocked because the configured `farabak.web` Liara account is unauthenticated. Do not report the fixes as released until deployment succeeds.
- The original checkout's unrelated staged edits were preserved by working in this isolated worktree.

## Production evidence recheck (2026-11-15)

- `/support/blog` still links to `/support/blog/installing`; that target is 404 with `noindex` and a homepage canonical. The fix is local only.
- The retired industrial category still returns 404 rather than the planned 308; `/black-wonder` is 200 and self-canonical. The listed article has no rendered anchor to the retired URL, though its Next payload still contains the unavailable category's old `Link` value.
- The retired SKU remains 404 and is absent from the 480-URL sitemap. The sitemap also excludes `installing` and the retired category URL; it includes `black-wonder` product URLs.
- All five priority templates and all ten historical noindex URLs were rechecked: 200, self-canonical, `index, follow`, and no `X-Robots-Tag`. A Googlebot user-agent probe returned the same responses, and `robots.txt` permits public crawling; this does not verify real Googlebot traffic.
- Argus 2E and its Solar Panel Package return distinct product headings, are both self-canonical and appear in the sitemap. Google's selected canonical remains unknown.
- Valid `/page/2` returns 200 with its own canonical and ten product anchors; `/page/1` is 308 to the base; out-of-range `/page/999` and the listed `/page/0` both return 404.
- The user selected production evidence instead of Search Console checks. At the time of this recheck, no deployment had occurred and Liara authentication was unavailable.
- On 2026-11-15, the reviewed commits were pushed to `origin/main` at `a1f941dde7e83620f6bf8fc3b266f9323d515bf8`. GitHub reports no deployment record, workflow run, or commit status for that SHA; production still shows the pre-release behavior.
- Liara's official GitHub deployment guide requires linking the repository and branch in the Liara console and completing an initial manual deployment before pushes can deploy automatically. The connection state cannot be inspected without Liara account access; the CLI remains unauthenticated.

---

### Task 1: Remove empty blog categories from public navigation

**Files:**

- Modify: `src/lib/data/blogCategories.ts`
- Create: `src/lib/data/blogCategories.test.ts`

- [ ] Add a test that supplies the database query result and verifies `getBlogCategories()` requests only categories with a published, public blog. The expected Prisma filter is:
  ```ts
  {
    where: {
      BlogCategories: {
        some: {
          Blogs: { status: "Published", QrCode_key: null },
        },
      },
    },
  }
  ```
  Assert the returned categories are passed through unchanged.
- [ ] Run `pnpm exec vitest run src/lib/data/blogCategories.test.ts` and confirm the test fails because the current query has no publication filter.
- [ ] Add that relation filter to `prisma.categories.findMany` in `getBlogCategories()`.
- [ ] Re-run the focused test and confirm it passes. The live `installing` category has no published posts, so it must disappear from `/support/blog`; its route remains a 404.

### Task 2: Remove the unavailable product link and redirect the moved category

**Files:**

- Modify: `src/helpers/menuHelpers.ts`
- Create: `src/helpers/menuHelpers.test.ts`
- Modify: `src/proxy.ts`
- Modify: `src/proxy.test.ts`

- [ ] Add a menu-data test with one available subcategory (`black-wonder`) and one unavailable subcategory (`explosion-proof-cctv-camera`). Assert the returned menu contains only the available subcategory.
- [ ] Run `pnpm exec vitest run src/helpers/menuHelpers.test.ts` and confirm the unavailable subcategory is currently returned.
- [ ] Filter `CategoryContent` to `Available: true` in the public menu data query. Do not change the admin category API.
- [ ] Add a proxy test for `GET https://farabak.net/products/industrial-cctv-camera/explosion-proof-cctv-camera`. Assert it returns 308 with `Location: https://farabak.net/products/industrial-cctv-camera/black-wonder`.
- [ ] Run `pnpm exec vitest run src/proxy.test.ts` and confirm the new test fails before implementation.
- [ ] Add the specific permanent redirect before product-page validation in `src/proxy.ts`, then re-run both focused suites.
- [ ] Verify the retired product URL ending in `/EXB-2323-S436` remains a 404 and has no active internal link.

### Task 3: Review the workbook rows and record dispositions

**Files:**

- Read: `C:\Users\Rasa\Downloads\Farabak-page-indexing-audit.xlsx`
- Create: `outputs/01a1da38-8b94-7db0-8e21-07e5a31a31b6/Farabak-page-indexing-audit-updated.xlsx`

- [ ] Recheck the workbook''s P1 and P2 URLs, all historical noindex sitemap URLs, the Argus-2E duplicate, and the listed 404, redirect, alternate, and pagination cases against current production.
- [ ] Inspect Search Console stored and live statuses for the five priority templates and the historical noindex sitemap URLs when the authenticated session is available.
- [ ] In the existing `Live finding` and `Next action` columns, give every reported URL exactly one explicit disposition: `Fix`, `Expected exclusion`, or `Awaiting Google`. State a specific dependency or evidence needed where a case remains unresolved.
- [ ] Preserve the original URLs, audit fields, sheet structure, formulas, formatting, and historical Google crawl data. Do not add a tab or rewrite unrelated cells.
- [ ] Visually inspect the edited workbook and confirm each of its 326 URL rows has a disposition.

### Task 4: Verify the production release and hand back evidence

**Files:**

- Verify: `https://farabak.net/sitemap.xml`
- Verify: the two P1 source pages, replacement route, retired SKU route, priority templates, and valid/invalid pagination routes
- Update: the output workbook from Task 3

- [ ] Run the focused tests, lint on changed files, and a production build before release.
- [ ] Deploy the reviewed commit using the configured hosting workflow. Record the release or commit ID.
- [ ] Confirm both P1 links are absent from rendered production HTML, the replacement route returns 200 with a self-canonical, the retired `installing` and SKU routes return 404, and the moved category URL returns a permanent redirect.
- [ ] Confirm the live sitemap lists preferred, indexable URLs and excludes retired or duplicate variants.
- [ ] Run Search Console live tests on the priority URLs and request indexing for a small set of corrected canonical pages. Record live-test results separately from Google''s eventual indexing status.
- [ ] Save production results and unresolved dependencies in the workbook, then provide the release ID and the workbook.
