# Admin Modal Progressive Loading Implementation Plan

> **For agentic workers:** Execute this approved scope inline in the current session.

**Goal:** Show independently loaded product editor sections as they become ready and prevent saving any admin modal before its initial content has loaded.

**Architecture:** Keep the product editor's existing parallel requests and give each async section an inline loading/error/retry state. The product form tracks readiness for categories, overview, overview details, specs, and FAQs, and gates both the save button and submit handler on every required resource. Fix the contact information editor's unguarded footer save button with a loaded-state and retry guard.

**Tech Stack:** Next.js 16 App Router, React 19 client components, existing `useApiFetch` hook, TypeScript, Tailwind CSS.

**Spec:** User goal in this task: admin route/modal loading should be progressive, and save/submit must wait for all modal content.

## Global Constraints

- Preserve unrelated working-tree edits; the initial working tree is clean.
- Keep independent product editor data requests in parallel.
- Do not add or run tests in this task.
- Consult the installed Next.js streaming/loading guides before changing App Router behavior.

---

### Task 1: Gate product editor save on all initial data

**Files:**

- Modify: `src/app/admin/products/components/ProductForm.tsx`
- Modify: `src/app/admin/products/components/ProductFormActions.tsx`
- Modify: `src/app/admin/products/components/FilterModal.tsx`
- Modify: `src/app/admin/products/components/ProductCategorySection.tsx`
- Modify: `src/app/admin/products/components/ProductOverviewSection.tsx`
- Modify: `src/app/admin/products/components/ProductSpecsSection.tsx`
- Modify: `src/app/admin/products/components/EditModalOverview.tsx`
- Modify: `src/app/admin/products/components/EditModalOverviewDetails.tsx`
- Modify: `src/app/admin/products/components/EditModalFAQ.tsx`
- Modify: `src/app/admin/products/components/EditModalSpecs.tsx`

**Interfaces:**

- `ProductForm` owns a readiness map for category, overview, overview details, specs, and FAQs.
- Each async section reports ready only after its request succeeds; failures expose a retry action and stay not-ready.
- `ProductFormActions` receives `isContentReady` and disables Save until it is true; `ProductForm.handleSubmit` repeats the same guard.

- [x] Keep each current request independent; show its own loading or retry UI rather than replacing the entire modal.
- [x] Keep the product filter Apply action unavailable until filter options load; show a retry action on errors.
- [x] Mark categories ready only when category data exists and the request has settled without error.
- [x] Add ready callbacks and inline loading/error/retry UI to overview, overview details, FAQ, and specs sections.
- [x] Reject overview-details fetch failures instead of silently treating them as empty data.
- [x] Gate the submit button and submit handler on all five resources being ready.

### Task 2: Guard contact editor save during content loading

**Files:**

- Modify: `src/app/admin/pages/componets/ui/ContactUsEditor.tsx`

**Interfaces:**

- Use `useApiFetch` loading, error, and refetch state to distinguish loaded content from pending or failed content.
- Save remains disabled and the handler returns until contact data has loaded; failed loads expose a retry action.

- [x] Show the existing skeleton while loading and a retry message on fetch failure.
- [x] Disable Save and guard `handleSave` until data is loaded and a prior save is not in progress.

### Task 3: Stream the branches route independently from its product catalog

**Files:**

- Modify: `src/app/admin/branches/page.tsx`
- Modify: `src/app/admin/branches/hooks/useProductAssignment.tsx`
- Modify: `src/app/admin/branches/components/BranchList.tsx`

**Interfaces:**

- The route skeleton waits for branch rows only; the product catalog continues loading independently.
- `BranchList` receives `allProductsLoading` to keep product search unavailable until its options arrive.

- [x] End the route's initial skeleton when branches load, without waiting for the catalog request.
- [x] Keep catalog loading state separate from branch drawer product loading and show it in the product search field.
- [x] Wait for the product catalog before synchronizing a deep-linked `productId` into the search field.

### Task 4: Review the admin loading audit and run static checks

**Files:**

- No additional source files.

- [x] Confirm the admin dashboard and product route already start their independent requests concurrently, and identify any remaining modal save gaps.
- [x] Run ESLint on changed source files and the TypeScript project check; do not run tests.
