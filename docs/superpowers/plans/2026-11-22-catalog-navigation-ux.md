# Catalog Navigation and Listing UX Plan

> **For agentic workers:** Execute each task in order and verify it before moving on.

**Goal:** Prevent long mega-menu labels from being clipped, simplify the first viewport on category and subcategory listings without dropping catalog content, and measure the production build with Unlighthouse.

**Architecture:** Keep the current two-pane desktop menu and catalogue sections. Widen the detail links by using two columns and natural text wrapping. Move the category selector below the page intro, tighten the intro spacing, and make only the long top editorial guide collapsible with native `<details>` so its full content remains available.

**Tech Stack:** Next.js 16 App Router, React 19, Tailwind CSS 4, Vitest, Unlighthouse CLI.

**Spec:** User request and attached screenshots; visual constraints in `DESIGN.md`.

## Global Constraints

- Keep every existing catalogue section, link, and product result.
- Keep menu text readable at 320px through desktop widths; do not apply truncation to category or subcategory names.
- Use native keyboard-accessible disclosure behavior for the editorial guide.
- Preserve RTL layout, current typography and Farabak color roles, server rendering, and product metadata.
- Run Unlighthouse on the local production build with representative public catalogue and support routes.
- Preserve unrelated working-tree changes; do not stage `AGENTS.md`, `.agents/skills/technical-quality-audit/`, or `.codex/agents/technical-quality-auditor.toml`.

---

### Task 1: Reflow mega-menu labels

**Files:**

- Modify: `src/app/(main)/_components/ui/productsMegaMenu/ProductsMegaMenuContent.tsx`
- Add: `src/app/(main)/_components/ui/productsMegaMenu/ProductsMegaMenuContent.test.tsx`

- [x] Test that a long subcategory label remains untruncated and is rendered in a wrapping link after its category is activated.
- [x] Remove `truncate` from detail links; use two columns, natural wrapping, explicit line-height, and scroll within the panel when content exceeds viewport height.
- [x] Keep the category rail, active category heading, close-on-navigation, Escape behavior, and hover/focus switching intact.
- [x] Run the mega-menu component test and changed-file lint.

### Task 2: Clean the category and subcategory first viewport

**Files:**

- Modify: `src/app/(main)/products/_components/CategoryPageWrapper.tsx`
- Modify: `src/app/(main)/products/_components/ProductGridWrapper.tsx`
- Modify: `src/app/(main)/products/_components/ProductGrid.tsx`
- Modify/add: `src/app/(main)/products/_components/ProductGrid.test.tsx`
- Modify: `src/app/(main)/products/_components/BlogContent.tsx` only if needed for the guide presentation.

- [x] Keep the H1 and short description first, then place the existing category selector after the intro rather than above it.
- [x] Tighten only catalogue intro spacing and heading scale; leave the shared `PageIntro` behavior unchanged for other routes.
- [x] Put the complete top editorial guide inside a native closed `<details>` disclosure with a clear visible summary; keep its existing content and leave the banner, result bar, grid, pagination, and bottom editorial content in place.
- [x] Test ordering and guide content retention in rendered component output.
- [x] Run product-grid, category, subcategory, and loading skeleton tests.

### Task 3: Build and measure with Unlighthouse

**Files:**

- Add: `docs/audits/2026-11-22-unlighthouse-public-routes.md`
- No dependency changes unless the CLI cannot run through `pnpm dlx`.

- [x] Build with the repository command and start `next start` on a local port.
- [x] Run Unlighthouse against explicit representative URLs for home, product root, category, subcategory, search, support, FAQ, and product finder on mobile and desktop.
- [x] Keep generated scan databases and JSON output in `%TEMP%` rather than committing bulky generated data.
- [x] Review route scores and critical performance findings; fix regressions in the current scope and re-run affected routes.

### Task 4: Review, verify, and publish

**Files:**

- Review all changes from the current and prior audit work in the shared main branch.
- No worktree currently exists.

- [x] Run focused tests, the relevant full test suite, TypeScript, changed-file lint, and formatting checks; record known unrelated failures.
- [x] Review the final diff for unrelated files, visual regressions, metadata/logic regressions, and generated files.
- [ ] Keep the existing audit work in coherent commits and commit this redesign separately.
- [ ] Fetch `origin/main`, verify the local branch can fast-forward push, then push `main` after the build, tests, review, and Unlighthouse checks are complete.

## Verification notes

- Production build passed on Next.js 16.4.5; `pnpm lint:ci` passed; TypeScript passed.
- Focused UI/loading tests passed. Full `pnpm test` has 9 failures in existing multipart-upload API tests where Undici rejects the mocked `File` value; 1,578 tests passed.
- Full Unlighthouse run covered 18 public routes on mobile and desktop (36 checks), averaging 97.99%. A focused post-fix run covered 6 routes on both devices (12 checks), averaging 99.33%; mean LCP was 1.035s and maximum CLS was 0.0032.
- The Googlebot user-agent response for `/products` places its generated description metadata inside `<head>`; no indexing metadata change was needed. Search and finder workflow routes retain their intentional `noindex` behavior.
- Browser-rendered category and subcategory first viewports were inspected; all prior catalogue sections and guide content remain available. Long menu labels are covered by component tests and wrapping styles.
