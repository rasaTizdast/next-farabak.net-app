# Optimization Mission — next-farabak-app-v15

> **React Doctor Score:** 0/100 (Critical) — 175 errors, 1090 warnings, 175 files affected
> **Goal:** 90+ / 100
> **Last Scan:** 2026-06-21

---

## Current Status (2026-06-21)

| Category        | Errors | Warnings | Notes                                              |
| --------------- | ------ | -------- | -------------------------------------------------- |
| Security        | 0      | 23       | Unescaped JSON in HTML/script sink (×15)           |
| Bugs            | 32     | 404      | setState-in-effect (×28), pure functions (×83)     |
| Performance     | 143    | 114      | React Compiler blocks (throw-in-try, impure calls) |
| Accessibility   | 0      | 338      | Control missing accessible label (×145)            |
| Maintainability | 0      | 211      | Large component hard to read (×41)                 |
| **Total**       | **175** | **1090** |                                                    |

**Impact:** Fixing top 3 error categories would improve the score by ~60%.

---

## Strategy: Priority-Ranked Steps

Steps are ordered by **impact-to-effort ratio**. Each step is independent and can run in parallel.

---

### ✅ Step 1 — Fix React Compiler `throw` in `try/catch` (×many)

**Why:** React Compiler can't auto-memoize components that `throw` inside `try/catch`. This is the single biggest compiler block.

**Affected files (representative):**
- `src/app/admin/products/categories/components/CreateNewItemModal.tsx:190,199`
- `src/app/admin/branches/page.tsx:113,157,245`
- `src/app/admin/branches/components/WarrantyRequests.tsx:63,123`
- `src/app/admin/branches/my/page.tsx:131,202,287,626,671`
- `src/app/admin/branches/components/invoice/InvoiceModal.tsx:145`
- `src/app/admin/branches/my/components/BranchProductSearch.tsx:54`
- `src/app/admin/invoices/components/ui/WarrantyManagementModal.tsx:180`
- `src/app/admin/invoices/page.tsx:128`
- `src/app/admin/pages/componets/ui/blogEditor/VideoUploadModal.tsx:71`
- `src/app/admin/pages/page.tsx:158`
- `src/app/admin/partner-prices/page.tsx:35,148`
- `src/app/admin/products/components/DeleteOverviewDetailButton.tsx:34`
- `src/app/admin/products/components/NewOverviewDetailsModal.tsx:105`
- `src/app/admin/products/components/ProductsTable.tsx:233`
- `src/app/admin/products/components/productBlogEditor/VideoUploadModal.tsx:71`
- `src/app/admin/warehouses/components/ProductsModal.tsx:82,123`
- `src/app/admin/warehouses/page.tsx:81`
- `src/app/(main)/support/warranty-tracking/ClientWarrantyTracking.tsx:46,58,74,86`
- `src/app/swagger/SwaggerClient.tsx:26`
- `src/context/UserContext.tsx:38`

**Fix pattern:** Extract throwing logic into standalone helper functions, or restructure to avoid `throw` inside `try/catch`.

**Verification:** `npx react-doctor .` → 0 "throw inside try/catch" errors

---

### ✅ Step 2 — Replace Impure Function Calls During Render (×4)

**Why:** `Date.now()` called during render breaks React Compiler memoization.

**Affected files:**
- `src/app/(main)/products/[category]/[subcategory]/[product]/components/ProductDataWrapper.tsx:102`

**Fix pattern:** Use `useEffect` or pass timestamp as a prop instead of calling `Date.now()` during render.

**Verification:** `npx react-doctor .` → 0 "impure function" errors

---

### ✅ Step 3 — Stop Accessing Refs During Render (×6)

**Why:** Ref `current` access during render breaks the compiler.

**Affected files:**
- `src/app/(main)/products/[category]/[subcategory]/[product]/components/ui/SimilarProductsSlider.tsx:66`

**Fix pattern:** Move ref reads to event handlers or effects.

**Verification:** `npx react-doctor .` → 0 "ref access during render" errors

---

### ✅ Step 4 — Fix setState Inside Effects (×28 errors)

**Why:** Calling `setState` synchronously inside `useEffect` cascades renders.

**Affected files (key):**
- `src/app/admin/branches/components/ProductTable.tsx:35`
- Plus ~27 more across admin components

**Fix pattern:** Derive values during render, use event handlers instead of effects, or refactor to `useReducer`.

**Verification:** `npx react-doctor .` → 0 "setState in effect" errors

---

### Step 5 — Refactor useState → useReducer (×40 warnings)

**Why:** Components with 3+ related `useState` calls trigger separate renders per call.

**Top files to target (highest useState counts):**
- `src/app/admin/pages/componets/ui/LandingPage.tsx` — slider + product + loading state
- `src/app/admin/branches/my/page.tsx` — products, invoices, loading, pagination
- `src/app/admin/branches/page.tsx` — users, branches, loading, modals, products
- `src/app/admin/pages/componets/ui/BlogEditModal.tsx` — form data + errors + categories
- `src/app/admin/warehouses/page.tsx` — products + loading + selected
- `src/app/admin/invoices/page.tsx` — invoices + filtered + loading

**Fix pattern:**
```tsx
type State<T> = { data: T | null; loading: boolean; error: string | null };
type Action<T> =
  | { type: "FETCH_START" }
  | { type: "FETCH_SUCCESS"; data: T }
  | { type: "FETCH_ERROR"; error: string };
```

**Verification:** `npx react-doctor .` → ≤20 "useState could be useReducer" warnings

---

### Step 6 — Fix Unescaped JSON in HTML/script (×15 Security Warnings)

**Why:** `JSON.stringify` in HTML/script markup is an XSS vector.

**Affected files:**
- `src/app/(main)/about-us/activity/page.tsx:100`
- `src/app/(main)/about-us/members/page.tsx:138`
- `src/app/(main)/about-us/page.tsx:48`
- `src/app/(main)/about-us/projects/[project]/page.tsx:130`
- `src/app/(main)/about-us/projects/page.tsx:98`
- `src/app/(main)/contact-us/page.tsx:79`
- `src/app/(main)/page.tsx:219`
- `src/app/(main)/products/[category]/[subcategory]/[product]/components/ProductDataWrapper.tsx:243`
- `src/app/(main)/products/_components/CategoryPageWrapper.tsx:236`
- `src/app/(main)/products/_components/ProductGridWrapper.tsx:200`
- `src/app/(main)/products/_components/SubcategoryPageWrapper.tsx:208`
- `src/app/(main)/support/blog/[blogCategory]/[blog]/page.tsx:252`
- `src/app/(main)/support/faq/page.tsx:42`
- `src/app/_components/ui/Breadcrumb.tsx:50`
- `src/components/BlogFaqAccordion.tsx:162`

**Fix pattern:** Use HTML-safe serializer or `<script type="application/json">` with `JSON.parse`.

**Verification:** `npx react-doctor .` → 0 "Unescaped JSON in HTML" warnings

---

### Step 7 — Fix Bug Warnings (High-impact)

**Sub-step 7a — Pure function rebuilt every render (×83)**
Move pure functions to module scope (outside component).

**Sub-step 7b — Derived value copied into state (×18)**
Derive values during render instead of copying through `useEffect`.

**Sub-step 7c — Multiple setState in one effect (×6)**
Combine into `useReducer` or batch with `unstable_batchedUpdates`.

**Sub-step 7d — Event logic handled in effect (×18)**
Run side effects in event handlers, not watched from `useEffect`.

**Sub-step 7e — Intl formatter rebuilt each call (×10)**
Hoist `new Intl.NumberFormat()` / `Intl.DateTimeFormat()` to module scope.

**Verification:** `npx react-doctor .` → ≤40 total bug warnings

---

### Step 8 — Accessibility Fixes (×338 warnings)

**Sub-step 8a — Control missing accessible label (×145)**
Add `aria-label` or `<label>` to all form controls, icons, buttons without text.

**Sub-step 8b — role="button" on divs (×9)**
Replace `<div role="button">` with actual `<button>` elements.

**Sub-step 8c — Loading skeletons (×7)**
Use `role="status"` + `aria-label` on loading skeletons.

**Verification:** `npx react-doctor .` → ≤100 accessibility warnings

---

### Step 9 — Maintainability (×211 warnings)

**Sub-step 9a — Large component hard to read (×41)**
Break components >200 lines into smaller sub-components.

**Verification:** `npx react-doctor .` → ≤100 maintainability warnings

---

### Step 10 — Final Verification

```bash
npx react-doctor .
npx vitest run
npm run lint
npm run build
```

**Target:** Score ≥90/100, 0 errors, ≤100 warnings, all tests passing, lint clean, build successful.

---

## Appendix — Current React Doctor Snapshot

| Metric    | Count   |
| --------- | ------- |
| Score     | 0/100   |
| Errors    | 175     |
| Warnings  | 1090    |
| Files     | 175     |
| Share     | `https://react.doctor/share?p=next-farabak.net-app&s=0&e=175&w=1090&f=175` |

---

## Effort Estimate

| Step | Description | Est. Time | Impact |
| --- | --- | --- | --- |
| 1 | Fix throw-in-try/catch (×many) | ~2h | ~30 errors → 0 |
| 2 | Fix impure calls (Date.now) (×4) | ~15min | 4 errors → 0 |
| 3 | Fix ref access during render (×6) | ~15min | 6 errors → 0 |
| 4 | Fix setState in effect (×28) | ~2h | 28 errors → 0 |
| 5 | useState → useReducer (×40) | ~3h | 40 warnings → ~10 |
| 6 | Fix unescaped JSON XSS (×15) | ~1h | 15 security warnings → 0 |
| 7 | Fix bug warnings (×83+) | ~4h | Warnings → ~40 |
| 8 | Accessibility sweep (×338) | ~3h | 338 warnings → ~100 |
| 9 | Maintainability (×211) | ~4h | 211 warnings → ~100 |
| 10 | Final verification | ~30min | — |
| **Total** | | **~20h** | **0 errors, ≤100 warnings** |
