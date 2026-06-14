# Changelog

All notable changes since the optimization sprint checkpoint.

---

## [Uncommitted] — Current Session

### Added
- **Test infrastructure:** Vitest 4 + @testing-library/react + jsdom setup
  - `vitest.config.ts` — Vitest configuration with jsdom, path aliases, setup file
  - `src/test/setup.ts` — Jest-DOM matchers extension
  - `npm test` / `npm run test:watch` scripts in `package.json`
- **27 unit tests** across 5 test suites:
  - `pricingHelper` (11 tests) — null/zero prices, exchange rate, discounts
  - `invoiceHandlers` (4 tests) — add/get/check invoice API calls
  - `useInvoiceCookie` (6 tests) — save/get/clear/loading state
  - `InvoiceContext` (4 tests) — provider, add/remove products
  - `UserContext` (2 tests) — profile fetch, 401 handling
- **Shared types** to break circular imports:
  - `src/app/admin/invoices/components/ui/types.ts` — `ExpandedInvoiceItem` type
  - `src/app/admin/branches/my/invoices/components/types.ts` — `ExpandedInvoiceItem` + `ExtendedWarranty` types

### Changed
- **React 19 API migration:** `useContext` → `use()` in `InvoiceContext` and `UserContext`
- **React Compiler compatibility:** Extracted 7 try/catch blocks from `useInvoiceCookie.ts` into standalone `apiFetch`/`apiFetchData` helpers
- **Stable effect deps:** Used `useRef` for cookie functions in `InvoiceContext` to prevent unnecessary re-runs
- **Circular imports broken:** `BranchInvoiceDetailsModal`, `BranchWarrantyManagementModal`, `BranchWarrantyViewModal`, `AdminInvoiceDetailsModal`, `WarrantyManagementModal` now import types from `./types.ts` instead of each other
- **Removed unused dependency:** `npm-check` from `package.json`
- **Upgraded axios:** `1.7.9` → `1.17.0` (fixes Socket security alert)
- **Conditional hook fixed:** `BranchWarrantyViewModal.tsx` — moved `useEffect` before early return

---

## [34b5b6c] — perf: fix React Doctor issues + add loading/error states

### Added
- **AGENTS.md** — project conventions, installed skills, key commands, performance rules
- **DESIGN.md** — brand colors (#00bfff/#318ce7/#003262), IRANYekan font, breakpoints, CSS utilities, component patterns
- **OPTIMIZATION_MISSION.md** — master plan with phases, Persian strings, Suspense patterns, test templates
- **12 loading.tsx files** — all route segments that fetch data now have loading skeletons
- **4 error.tsx files** — main, products, admin, auth route segments with Persian error messages
- **10 skills.sh skills** installed in `.agents/skills/`:
  - next-best-practices, vercel-react-best-practices, web-design-guidelines
  - frontend-design, next-cache-components, vercel-composition-patterns
  - systematic-debugging, improve-codebase-architecture, tdd, extract-design-system

### Fixed
- **button-has-type** — 3 components (`FaqAccordion.tsx`, `BlogFaqAccordion.tsx`, `PrintButton.tsx`)
- **parallel awaits** — `Promise.all()` in contact-us, projects, specTemplates routes
- **chained filter+map→reduce** — `pricingHelper.ts`, `projects/[id]/route.ts`
- **early-return await ordering** — specTemplates/[id], invoice, pricingHelper
- **XSS vulnerability** — installed `isomorphic-dompurify` for `BlogFaqAccordion` answer content
- **Reduced total react-doctor issues:** 3726 → 1842 (**-51%**)

---

## [f5188a5] — chore: checkpoint before optimization sprint

Baseline commit. React Doctor score: 49/100 (3726 issues: 688 errors, 3038 warnings).

Initial project state with Next.js 16, React 19, Prisma 6, Ant Design 5, Tailwind 3.4.
