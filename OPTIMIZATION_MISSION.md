# Optimization Mission — next-farabak-app-v15

> **React Doctor Score:** 0/100 (Critical) — 38 errors, 112 warnings, 53 files affected
> **Goal:** 90+ / 100
> **Current constraints:** Score heavily penalized by React Compiler blocks (throw in try/catch) and fragmented useState patterns

---

## Current Status (2026-06-18)

| Category        | Errors | Warnings | Notes                                        |
| --------------- | ------ | -------- | -------------------------------------------- |
| Security        | 0      | 0        | Clean                                        |
| Bugs            | 5      | 69       | State-in-effect patterns dominate            |
| Performance     | 33     | 14       | React Compiler blocks (×4) + useState→useReducer (×29) |
| Accessibility   | 0      | 9        | role="button" on divs                        |
| Maintainability | 0      | 20       | Pure functions inside components             |
| **Total**       | **38** | **112**  |                                               |

**Impact:** Fixing top 3 issue categories would improve the score by +56%.

---

## Strategy: Parallel Agent Steps

All steps below are **independent and can run in parallel** by separate agents. Each step has its own file list and verification.

---

### Step 1 — Fix React Compiler `throw` in `try/catch` (×4 errors)

**Why:** React Compiler can't auto-memoize components that `throw` inside `try/catch`. This single pattern blocks compiler optimization in 4 components.

**Affected files:**
- `src/app/admin/products/categories/components/CreateNewItemModal.tsx:188,197`
- `src/app/admin/branches/page.tsx:72`
- `src/app/swagger/SwaggerClient.tsx:26`

**Fix pattern:** Extract the throwing logic into a standalone helper function, or restructure to avoid throw inside try/catch.

**Verification:** `npx react-doctor .` → 0 "ThrowStatement inside try/catch" errors

---

### Step 2 — Refactor useState → useReducer (×29 errors)

**Why:** Components with 3+ related `useState` calls cause fragmented re-renders. Group into `useReducer`.

**Top files to target (highest useState counts):**
- `src/app/admin/pages/componets/ui/LandingPage.tsx` — slider + product + loading state
- `src/app/admin/pages/componets/ui/BlogEditModal.tsx` — form data + errors + categories
- `src/app/admin/warehouses/page.tsx` — products + loading + selected
- `src/app/admin/branches/page.tsx` — users + branches + loading
- `src/app/admin/invoices/page.tsx` — invoices + filtered + loading
- `src/app/admin/branches/components/invoice/InvoiceModal.tsx` — multi-step invoice state

**Fix pattern:**
```tsx
type State = { data: T | null; loading: boolean; error: string | null };
type Action = { type: "FETCH_START" } | { type: "FETCH_SUCCESS"; data: T } | { type: "FETCH_ERROR"; error: string };
```

**Verification:** `npx react-doctor .` → ≤5 "useState could be useReducer" warnings

---

### Step 3 — Fix State Synced to Prop Inside Effect (×5 errors)

**Why:** Adjusting state after prop change in useEffect causes an extra render with stale UI.

**Affected files:**
- `src/app/admin/branches/my/invoices/components/BranchWarrantyManagementModal.tsx:124-125`
- `src/app/admin/products/categories/components/EditModal.tsx:83`
- `src/app/admin/pages/componets/ui/MemberEditor.tsx:51`
- `src/app/admin/products/components/EditModalFAQ.tsx:42`
- (1 more)

**Fix pattern:** Use render-time adjustment with `prev` prop comparison instead of useEffect:
```tsx
if (prop !== prevProp) { setPrevProp(prop); setX(...); }
```

**Verification:** `npx react-doctor .` → 0 "State synced to a prop inside an effect" errors

---

### Step 4 — Fix React Doctor Bug Warnings (×69 warnings)

**Sub-step 4a — Derived value copied into state (×18)**
Files: WarrantManagementModal, BlogEditModal, ProjectEditor, EditModalSpecs, ProductTable, EditModal, MemberEditor, EditModalFAQ, FaqManager
Fix: Derive values during render instead of copying through useEffect

**Sub-step 4b — Multiple setState in one effect (×6)**
Files: ContactUsEditor, BlogEditModal, ActivityEditor, ProjectEditor, MemberEditor, warehouses/page
Fix: Combine into useReducer or batch

**Sub-step 4c — Event logic handled in effect (×18)**
Files: Various warranty/invoice modals, BlogEditModal, ProjectEditor, EditModalSpecs, FaqManager
Fix: Run side effects in event handlers, not watched from useEffect

**Sub-step 4d — Intl formatter rebuilt each call (×10)**
Files: WarrantyManagementModal, BranchWarrantyManagementModal, WarrantyStep
Fix: Hoist `new Intl.NumberFormat(...)` / `Intl.DateTimeFormat(...)` to module scope

**Sub-step 4e — Pure function rebuilt every render (×15)**
Files: pages/page.tsx, CreateNewItemModal, InvoiceModal, BranchProductSearch, etc.
Fix: Move pure functions to module scope (outside component)

**Verification:** `npx react-doctor .` → ≤20 total bug warnings

---

### Step 5 — Accessibility Fixes (×9 warnings)

**Affected files:**
- `src/app/admin/components/Sidebar.tsx:80`
- `src/app/(main)/_components/ui/hambugerMenu/HamburgerMenu.tsx:57`
- `loading.tsx` files in 7 routes

**Fix:** Replace `role="button"` on `<div>` with actual `<button>` element. For loading skeletons, use `role="status"` + `aria-label`.

**Verification:** `npx react-doctor .` → 0 "Role used instead of HTML tag" warnings

---

### Step 6 — Chained Array Iterations (×2 warnings)

**Affected files:**
- `src/app/admin/pages/componets/ui/ProjectEditor.tsx:49-52`

**Fix:** Combine `.filter().map()` → single `.reduce()` pass.

**Verification:** `npx react-doctor .` → 0 "Chained array iterations" warnings

---

### Step 7 — Final Verification

```bash
npx react-doctor .
npx vitest run
npm run lint
npm run build
```

**Target:** Score ≥90/100, 0 errors, ≤20 warnings, all tests passing, lint clean, build successful.

---

## Appendix — Current React Doctor Snapshot

| Metric  | Count |
| ------- | ----- |
| Score   | 0/100 |
| Errors  | 38    |
| Warnings| 112   |
| Files   | 53    |
| Share   | `https://react.doctor/share?p=next-farabak.net-app&s=0&e=38&w=112&f=53` |

---

## Effort Estimate

| Step | Description | Est. Time | Impact |
| --- | --- | --- | --- |
| 1 | Fix React Compiler throw-in-try (×4) | ~30min | 4 errors → 0 |
| 2 | useState → useReducer (×29) | ~2-3h | 29 errors → 0 |
| 3 | Fix state synced to prop (×5) | ~30min | 5 errors → 0 |
| 4 | Fix bug warnings (×69) | ~3-4h | Warnings → ~10 |
| 5 | Accessibility (×9) | ~30min | 9 warnings → 0 |
| 6 | Chained iterations (×2) | ~15min | 2 warnings → 0 |
| 7 | Final verification | ~30min | — |
| **Total** | | **~8-10h** | **0 errors, ≤12 warnings** |
