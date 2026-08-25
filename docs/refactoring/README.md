# Refactoring Plans — Status Tracker

> **Last Updated:** 2026-08-20  
> **Total Phases:** 11 (Phases 0–10)  
> **Total Estimated Effort:** ~65–90 hours (original 31–44 + new 34–46)  
> **Refactoring Work Window:** 2026-08-03 (18 commits, `eb39de5` → `670ace9`)

---

## Phase Status Overview

| Phase | File                                                                               | Title                                                | Status             | Started    | Completed  | Notes                                                                                                                                                                                                                                                                                        |
| ----- | ---------------------------------------------------------------------------------- | ---------------------------------------------------- | ------------------ | ---------- | ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 0     | [01-security-fixes.md](01-security-fixes.md)                                       | Security Fixes                                       | ✅ **Complete**    | 2026-08-03 | 2026-08-03 | All 45 admin routes authed, `your_jwt_secret` removed, single PrismaClient, console.log cleaned                                                                                                                                                                                              |
| 1     | [02-foundation.md](02-foundation.md)                                               | Foundation (Types, Utils, Patterns)                  | ✅ **Complete**    | 2026-08-03 | 2026-08-03 | `src/types/`, `src/lib/api-response.ts`, `src/lib/validators.ts`, `src/lib/auth.ts` + tests                                                                                                                                                                                                  |
| 2     | [03-design-system.md](03-design-system.md)                                         | Design System (Ant Design, Tailwind, CSS)            | ✅ **Complete**    | 2026-08-03 | 2026-08-11 | ConfigProvider + Tailwind tokens + RTL fixes done; all ~722 `!important` overrides migrated to Tailwind variants; globals.css for portal/print infra                                                                                                                                         |
| 3     | [04-api-routes.md](04-api-routes.md)                                               | API Routes (Validation, Errors, Consistency)         | ✅ **Complete**    | 2026-08-03 | 2026-08-19 | Auth + admin CRUD routes migrated to Zod; error responses standardized to `{success:false, error}`; `$queryRaw` audit done (0 injection risks)                                                                                                                                               |
| 4     | [05-component-architecture.md](05-component-architecture.md)                       | Component Architecture (Split Giants, Deduplicate)   | ✅ **Complete**    | 2026-08-03 | 2026-08-19 | TipTap/Accordion/Branches/Products/Warranty/LandingPage + blog dedup done; orphaned editor dupes deleted; ~40 pre-existing files still >300 lines (tracked)                                                                                                                                  |
| 5     | [06-ui-consistency.md](06-ui-consistency.md)                                       | UI Consistency (Buttons, Tables, Error Pages, RTL)   | ✅ **Complete**    | 2026-08-03 | 2026-08-19 | Unified antd wrappers in `src/components/ui/antd/` + warehouse migration; ~81 inline hex → `adminColors` tokens; 39 CSS files → logical properties; ErrorPage 19/19; build/tsc/908 tests pass                                                                                                |
| 6     | [07-code-quality.md](07-code-quality.md)                                           | Code Quality (TS Strict, Types, Tests, React Doctor) | ✅ **Complete**    | 2026-08-03 | 2026-08-19 | `noImplicitAny` removed (strict implies it), hooks/helpers typed with `unknown`, `console.log` removed from production, 133 `any` remain (tsc clean); React Doctor 24 suppressions audited — all stale (rules no longer fire), new violations documented for future work; 908/908 tests pass |
| 7     | [08-tailwind-v4-next-upgrade.md](08-tailwind-v4-next-upgrade.md)                   | Tailwind v4 Migration & Next.js Upgrade              | ✅ **Complete**    | 2026-08-20 | 2026-08-20 | Next.js 16+, Tailwind v4 (CSS-first), 332 physical CSS props → logical properties, 28 .module.css → Tailwind, shadcn/ui adoption                                                                                                                                                             |
| 8     | [09-component-architecture-completion.md](09-component-architecture-completion.md) | Component Architecture Completion                    | 🟡 **In Progress** | 2026-08-20 | —          | Split ~40 giant components (>300 lines): 4/5 done (NewProductModal, WarrantyStep, BranchInvoiceDetailsModal, useInvoiceManagement); BlogForm partial; 28 files remain >300 lines                                                                                                             |
| 9     | [10-lint-baseline-cleanup.md](10-lint-baseline-cleanup.md)                         | Lint Baseline Cleanup                                | ✅ **Complete**    | 2026-08-20 | 2026-08-20 | 1697 → 0 errors; lint:ci + husky/lint-staged hooks; tsc/build/908 tests pass; fixed pre-existing NewProductWizard infinite render loop + broken step-mock test paths                                                                                                                         |
| 10    | [11-type-safety-tests-doctor.md](11-type-safety-tests-doctor.md)                   | Type Safety, Tests & React Doctor                    | 🟢 **Not Started** | —          | —          | <20 `any` (justified), validation/auth branch coverage ≥80%, 241 React Doctor violations → <50                                                                                                                                                                                               |

---

## Detailed Findings (Verified 2026-08-08)

### Phase 0 — Security Fixes ✅ Complete

Verified against plan checklist:

- `grep "your_jwt_secret"` → **0 matches** ✅
- `new PrismaClient` → only in `src/lib/prisma.ts` ✅
- `console.log` in `src/lib/prisma.ts` → **0 matches** ✅
- Admin API routes: **45/45** have `requireAuth`/`verifyToken` (was 20 unprotected) ✅
- `src/lib/auth.ts` exists with `verifyToken`; `src/proxy.ts` + auth routes migrated ✅
- `src/utils/invoiceJwt.ts` fallback removed ✅

### Phase 1 — Foundation ✅ Complete

- All `src/types/*.ts` files exist (api, auth, branch, common, index, invoice, product, warranty) ✅
- `src/lib/api-response.ts`, `src/lib/validators.ts`, `src/lib/validation.ts` exist ✅
- Tests added: `api-response.test.ts`, `auth.test.ts`, `validation.test.ts` ✅

### Phase 2 — Design System ✅ Complete

Done:

- `ConfigProvider` in `src/app/layout.tsx` with `colorPrimary: "#00bfff"` + fa_IR locale ✅
- Tailwind tokens (`primary`, `secondary`, `dark-blue`, `brand.*`) in `tailwind.config.ts` ✅
- `bg-[#00bfff]` → **0 matches** (migrated to tokens) ✅
- RTL logical properties in `Header.module.css` + `FormStyles.module.css` ✅
- **shadcn/ui foundation (2026-08-08):** `src/lib/utils.ts` (`cn`), `components.json`, shadcn CSS-variable tokens in `globals.css` + `tailwind.config.ts` mapped to brand colors (primary `#00bfff`, secondary `#318ce7`, dark `#003262`, 8px radius), `tailwindcss-animate` + custom RTL `end`/`start` slide utilities ✅
- **23 shadcn primitives in `src/components/ui/`:** button, badge, card, input, label, textarea, separator, skeleton, switch, checkbox, dialog, alert-dialog, dropdown-menu, tooltip, popover, alert, progress, table, select, tabs, accordion, radio-group, scroll-area, toast (+`Toaster`/`useToast`) ✅
- **All ~722 `!important` styled-JSX overrides removed** → converted to Tailwind arbitrary variants with `!` prefix on component `className`/`rowClassName`/`popupClassName` ✅
- Portal z-index + print infrastructure consolidated in `src/app/admin/globals.css` (imported by admin layout) ✅
- `usePrint.ts` left as-is (legitimate print-window CSS in a `.ts` utility, out of tsx scope) ✅

Not done:

- Physical CSS properties in `.module.css`: **0 matches** (all 28 `.module.css` files migrated to Tailwind v4 utilities) ✅
- shadcn primitives not yet adopted across pages/admin (Ant Design still in use — migrate incrementally)

### Phase 3 — API Routes ✅ Complete

Verified against plan checklist:

- `npm run build` succeeds ✅
- `zod` v4.4.3 installed (package.json) ✅
- `src/lib/validation.ts` schemas + `validateBody`/`validateParams` helpers created ✅
- **Auth routes migrated** (login, signup, change-password, profile, forgot-password, verify-reset-code, reset-password, refresh-token, logout) — validate input, return 400 on invalid data ✅
- **Admin CRUD routes migrated** (products, branches, warehouses, invoices, users) — validate input with Persian error messages ✅
- Error responses follow `{success: false, error: "..."}` via `api-response` helpers (`errorResponse`/`unauthorizedResponse`/`notFoundResponse`/`serverErrorResponse`) ✅
- Frontend error readers updated to read `.error` (with `.message` fallback): `useApiMutation`, `useApiFetch`, `changePasswordHandler`, `editUserHandler`, `invoiceHandlers`, login page ✅
- `requireAuth` updated to return `unauthorizedResponse` ✅
- **`$queryRaw` audit** documented in `api-queryraw-audit.md`: 123 occurrences / 31 files categorized; **0 injection-prone**; 2 `$queryRawUnsafe` in `branches/my/invoices` flagged as future-risk (kept intentionally) ✅
- `grep '\$queryRaw.*\$\{' src/app/api/` → **0 matches** (no string-interpolated raw SQL) ✅
- All API routes use named exports → **0 `export default`** in `src/app/api/` ✅
- Tests: **908/908 pass** (142 files); `npx tsc --noEmit` clean ✅

### Phase 4 — Component Architecture ✅ Complete (2026-08-19)

Done:

- TipTap: 3 copies (2623 lines) → 1 shared (`src/components/editor/TipTapEditor.tsx` + Toolbar + extensions) ✅
- Accordion: shared `src/components/ui/ItemsAccordion.tsx`, both FAQ accordions use it ✅
- Branches: `branches/my/page.tsx` 2275→288, `branches/page.tsx` 1111→223, hooks + components extracted ✅
- ProductEditModal: split into `ProductForm` (799→272), section components, `ProductValidation`, `ProductImageUpload` ✅
- WarrantyManagementModal: split into Create/Update/Print modes ✅
- LandingPage: extracted into shared/showcase/sliders ✅
- Blog dedup: shared `src/components/blog/BlogForm.tsx` (472 L) + `BlogMetadataFields`/`BlogSEOPart`/`BlogCategoryManager`; `NewBlog.tsx` → 9-L wrapper, `BlogEditModal.tsx` → 14-L wrapper ✅
- Deleted 18 orphaned duplicate editor files (`ImageNode.tsx`, `VideoNode.tsx`, `Video.ts`, `Image.ts`, `VideoUploadModal.tsx`, `ToolbarButton.tsx`, `Divider.tsx` in `blogEditor/`, `productBlogCreator/`, `productBlogEditor/`) ✅
- Verification: `npm run build` ✅ · `npm test` 908/908 (142 files) ✅ · no `useState` in branches page.tsx files ✅

Remaining debt (pre-existing, tracked for follow-up):

- **~40 files codebase-wide still over 300 lines** (e.g. `NewProductModal.tsx` 851, `WarrantyStep.tsx` 830, `BranchInvoiceDetailsModal.tsx` 564, `useInvoiceManagement.tsx` 526, `BlogForm.tsx` 472, `WarrantyManagementModal.tsx` 436) — outside the split list of this phase
- Lint baseline: 635 pre-existing errors (prettier/import-order/unused-vars/`set-state-in-effect`); refactored files preserved the original `setState`-in-effect patterns

### Phase 5 — UI Consistency ✅ Complete (2026-08-19)

Done:

- `ErrorPage` created + adopted in **19/19** `error.tsx`/`not-found.tsx` files ✅
- Unified antd wrappers created in `src/components/ui/antd/`: `Button`, `DataTable`, `Modal`, `Input`, `AutoComplete` (project variants, Persian defaults) ✅
- Warehouse migration: `ButtonBase`/`InputBase`/`ModalBase`/`TableBase`/`AutoCompleteBase` → new antd components in `page.tsx`, `WarehouseFormModal.tsx`, `WarehousesTable.tsx`, `ProductsModal.tsx`; `warehouses/components/ui.tsx` deleted; 3 test files updated to mock `@/components/ui/antd/*` ✅
- Inline hex styles: ~81 hardcoded hex values → `adminColors.*` tokens (`src/constants/adminColors.ts`) or Tailwind classes; hex inside `style={{…}}` grep → **0 matches** ✅
- RTL: **39 CSS files** converted to logical properties (`padding-block/inline`, `margin-block/inline`, `inset-inline-*`, logical corner radii, `text-align: start/end`, `border-inline-*`, logical `@apply` utilities); physical `padding:`/`margin:`/`left:`/`right:`/`text-align` → **0 matches** (single-value symmetric `border-radius` kept as RTL-neutral) ✅
- Dead `not-found.module.css` files (×2) deleted; root `src/app/not-found.tsx` added; `<body>` already class-based (no inline style — no change needed) ✅
- Verification: `npm run build` ✅ · `npx tsc --noEmit` clean ✅ · `npm test` **908/908** (142 files) ✅

Deviations / notes:

- **`src/components/ui/antd/` subfolder** — the plan's paths `src/components/ui/Button.tsx` / `Input.tsx` would collide with the existing shadcn `button.tsx` / `input.tsx` on the case-insensitive Windows filesystem, so the antd wrappers live in the `antd/` subfolder. The earlier (pre-2026-08-08) antd wrappers referenced in the old note below were removed and recreated here as the adopted antd-consistency layer.
- Other admin sections adopt `@/components/ui/antd/*` incrementally as their components are touched (per the plan's "Why not replace all buttons now?").
- Remaining: repo-wide lint baseline (685 pre-existing prettier/import-order errors) untouched; `src/components/ui/DataTable.tsx`/`Modal.tsx` were already deleted in the working tree before this phase and nothing imports them.

### Phase 6 — Code Quality ✅ Complete (2026-08-19)

Done:

- `noImplicitAny` removed from tsconfig (strict implies it) ✅
- Hooks (`useApiFetch<T = unknown>`, `useApiMutation<TBody = unknown, TResponse = unknown>`) typed, `pricingHelper` typed ✅
- `console.log` in production code → **0 matches** ✅
- Test count: **142 test files / 908 tests** (pre-existing, not added in this phase) ✅
- Fixed `createProduct.test.ts` error (fake timers issue) ✅
- Auth route tests exist and pass (login, signup, refresh-token, change-password, profile, verify-reset-code, logout, signup) ✅

React Doctor audit completed:

- Ran `npx react-doctor .` — **241 issues** found across 686 files
- **All 24 existing suppressions** are stale (rules no longer fire in current React Doctor version)
- New violations documented for future work (top: 111 `no-transition-all`, 22 `server-sequential-independent-await`, 15 `no-loading-flag-reset-outside-finally`)
- Config left as-is with stale suppressions noted; suppression removal can be done when upgrading React Doctor rules

Remaining known debt (outside phase scope):

- **133 `: any`** occurrences in production code (same as baseline; tsc passes clean — these are in dynamic Prisma query results and complex admin components where `unknown` would require significant refactoring with no runtime benefit)
- Low branch coverage in `src/lib/validation.test.ts` (30.76%) and `auth.test.ts` (40%) — tests exist but could cover more error paths

### Phase 9 — Lint Baseline Cleanup ✅ Complete (2026-08-20)

Done:

- Baseline **1,697 lint messages** → `npm run format` + `npm run lint:fix` → 301 → subagent batch fixes (unused-vars, react-hooks compiler rules, misc) + targeted manual fixes → **0 errors, 0 warnings** ✅
- `eslint.config.mjs`: added ignores for `coverage/**`, `.agents/**`, `.remember/**`, `cypress/**` (fixed 14 parse errors from files outside the tsconfig project) ✅
- Removed stale `react-compiler/set-state-in-effect` disable comments (plugin not installed; active rule is `react-hooks/set-state-in-effect` from eslint-plugin-react-hooks v7) ✅
- `lint:ci` script added (`eslint --max-warnings=0 .`) and passing ✅
- Husky 9 + lint-staged 16 installed (`--legacy-peer-deps` due to pre-existing `hamburger-react` peer conflict); `.husky/pre-commit` runs `npx lint-staged`; `prepare: husky` + lint-staged config added to `package.json` ✅
- Fixed pre-existing `tsc --noEmit` errors: `branches/my/page.tsx` remapped to the new invoice-management context API (`state.list`/`actions.*`), `useInvoiceColumns.tsx` annotated `detail` params ✅
- Fixed a **pre-existing infinite render loop** in `NewProductWizardContext.tsx` — `actions` was recreated every render while wizard hooks ran sync effects depending on `actions` and calling `actions.set*` (a context dispatch), causing an endless dispatch/render cycle that hung `NewProductModal.test.tsx`. Fixed by memoizing `actions` on `[dispatch]` with a `stateRef` synced in an effect ✅
- Fixed broken step mocks in `NewProductModal.test.tsx`: `vi.mock` paths were wrong (`../../newProductModal/...` resolved past `components/`), so vitest silently no-oped them; corrected to `../newProductModal/...`, added the named step exports the wizard imports, rebuilt the `OverviewDetailsStep` mock to trigger the overview-details modal, and aligned two labels with StepNavigation ✅
- Verification: `npm run lint` 0/0 ✅ · `npm run lint:ci` ✅ · `npm run format:check` clean ✅ · `npx tsc --noEmit` clean ✅ · `npm test` **142 files / 908 tests** ✅ · `npm run build` succeeds ✅
- Remaining: 34 justified `eslint-disable` comments across 31 files (ref-guarded setState-in-effect init, intentional `any`) — minimal and documented

---

## Legend

| Status             | Meaning                                  |
| ------------------ | ---------------------------------------- |
| ✅ **Complete**    | All verification checklist items passed  |
| 🟡 **In Progress** | Work has started but not complete        |
| 🟢 **Not Started** | Plan exists but no work has begun        |
| 🔴 **Blocked**     | Waiting on dependency or external factor |

---

## Execution Order (Strict)

```
Phase 0 → Phase 1 → Phase 2 → Phase 3 → Phase 4 → Phase 5 → Phase 6
         → Phase 7 → Phase 8 → Phase 9 → Phase 10
```

**Dependencies:**

- Phase 0 must be first (security)
- Phase 1 must come before 3–10 (shared types/utils used everywhere)
- Phase 2 should come before 4–5, 7–8 (design system affects component code)
- Phases 3, 4, 5 can be interleaved but sequential is safer
- Phase 6 is last of original quality gates
- **Phase 7 (Tailwind v4/Next.js) must come before 8–10** — new styling foundation
- **Phase 8 (Component Architecture) should come before 9–10** — cleaner components easier to lint/test
- Phase 9 (Lint) and 10 (Types/Tests/Doctor) can run in parallel after 7–8

**New Phase Dependencies:**

- Phase 7 → 8 (Tailwind v4 utilities needed for component splits)
- Phase 7 → 9 (CSS migration affects lint rules)
- Phase 8 → 9, 10 (smaller components = fewer lint errors, better testability)
- Phase 9 → 10 (clean lint baseline makes type/test work smoother)

---

## How to Update This Tracker

When starting a phase:

1. Change status to `🟡 In Progress`
2. Add `Started` date
3. Work through the plan file

When completing a phase:

1. Run all verification checklist items from the plan file
2. Change status to `✅ Complete`
3. Add `Completed` date
4. Add any notes (issues encountered, deviations from plan)

---

## Quick Verification Commands

```bash
# Build check (run after every phase)
npm run build

# Security check (Phase 0 — should be zero results)
grep -r "your_jwt_secret" src/
grep -r "new PrismaClient" src/

# Design system check (Phase 2)
grep -r "!important" src/ --include="*.tsx"     # 0 (done)
grep -r "bg-\[#00bfff\]" src/                   # 0 (done)

# API validation check (Phase 3 — migrated auth/admin routes use safeParse)
grep -r "safeParse" src/lib/validation.ts

# TypeScript strict check (Phase 6)
npx tsc --noEmit

# Tests
npm test

# React Doctor
npx react-doctor .

# Phase 7 — Tailwind v4 / Next.js
grep -r "padding-(left|right):\|margin-(left|right):\|left:\|right:\|text-align:\s*(left|right)" src --glob "*.module.css"  # 0
ls src/**/*.module.css  # 0 files

# Phase 8 — Component Architecture
find src -name "*.tsx" -exec wc -l {} + | awk '$1 > 300'  # 0 files >300 lines

# Phase 9 — Lint Baseline
npm run lint  # 0 errors, 0 warnings

# Phase 10 — Type Safety / Tests / Doctor
rg -n ": any\b" src --glob "*.ts" --glob "*.tsx" | rg -v "__tests__|\.test\.|\.spec\." | wc -l  # < 20
npx react-doctor .  # < 50 violations
```

---

## Related Files

- **Master Plan:** [00-overview.md](00-overview.md)
- **Design Tokens:** [../../DESIGN.md](../../DESIGN.md)
- **Agent Guide:** [../../AGENTS.md](../../AGENTS.md)
