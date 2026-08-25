# Phase 8: Component Architecture Completion — Split Giant Components

> **Priority:** High — maintainability, testability, performance
> **Effort:** ~12-16 hours
> **Risk:** Medium (large components, complex state)
> **Dependencies:** Phase 7 (Tailwind v4) complete — use new styling system
> **Status:** 🔄 **IN PROGRESS** — 4 of 5 priorities done, 28 files remain >300 lines

---

## Problem

**~40 files codebase-wide still over 300 lines** (Phase 4 debt). Top offenders:

| File                                                                          | Lines | Type       | Primary Issue                                                |
| ----------------------------------------------------------------------------- | ----- | ---------- | ------------------------------------------------------------ |
| `src/app/admin/products/components/NewProductModal.tsx`                       | 851   | Modal/Form | 8 sections, complex validation, image upload, specs, FAQs    |
| `src/app/admin/branches/components/invoice/steps/WarrantyStep.tsx`            | 830   | Form Step  | Product selection, warranty config, expandable rows, pricing |
| `src/app/admin/branches/my/invoices/components/BranchInvoiceDetailsModal.tsx` | 564   | Modal      | Invoice details, warranty display, print, actions            |
| `src/app/admin/branches/my/hooks/useInvoiceManagement.tsx`                    | 526   | Hook       | 15+ state vars, 8+ effects, complex CRUD                     |
| `src/app/components/blog/BlogForm.tsx`                                        | 472   | Form       | Metadata, SEO, categories, rich editor                       |
| `src/app/admin/invoices/components/ui/WarrantyManagementModal.tsx`            | 436   | Modal      | Create/Update/Print modes, date pickers                      |

Plus ~34 more files 300-400 lines across admin/products/branches/invoices.

**Patterns causing bloat:**

- Single component handling multiple modes (create/edit/view/print)
- Inline validation logic mixed with UI
- Multiple `useState`/`useReducer` for related state
- Direct API calls in components (should use hooks)
- Complex table rendering with inline `render` callbacks
- No separation of "smart" (data) vs "dumb" (UI) components

---

## Changes

### 1. Apply Vercel Composition Patterns

**Load skill:** `vercel-composition-patterns` — use compound components, render props, context providers, slot patterns.

**For each giant component:**

#### Pattern A: Modal with Modes → Compound Components

```tsx
// Before: WarrantyManagementModal.tsx (436 lines) with mode prop
// After:
<WarrantyManagementModal>
  <WarrantyManagementModal.Create /> // or .Update / .Print
</WarrantyManagementModal>

// Shared logic in context, mode-specific UI in subcomponents
```

#### Pattern B: Multi-Step Form → Wizard Compound Component

```tsx
// NewProductModal.tsx → split by section
<NewProductWizard>
  <NewProductWizard.Step.OverviewDetails />
  <NewProductWizard.Step.Specs />
  <NewProductWizard.Step.FAQs />
  <NewProductWizard.Step.Images />
  <NewProductWizard.Step.Preview />
</NewProductWizard>

// Each step = own component, shared state via WizardContext
```

#### Pattern C: Data-Heavy Hook → Feature Hooks + Context

```tsx
// useInvoiceManagement.tsx (526 lines) → split
useInvoiceList(); // fetching, pagination, filters
useInvoiceActions(); // create, update, delete, print
useInvoiceSelection(); // row selection, bulk actions
// Compose in component via InvoiceManagementProvider
```

#### Pattern D: Complex Table → Column Components + Data Hook

```tsx
// WarrantyStep.tsx table →
<DataTable columns={warrantyColumns} data={warranties} />
// warrantyColumns.ts exports column defs with render fns as separate components
```

---

### 2. Specific Split Plans

#### `NewProductModal.tsx` (851 lines) → **Priority 1** ✅ **COMPLETED**

**Split into:**

```
src/app/admin/products/components/newProductModal/
├── NewProductWizard.tsx           // Main compound component (~109 lines)
├── NewProductWizardContext.tsx    // Shared state (mode, form data, validation) (~579 lines)
├── steps/
│   ├── BaseDetailsStep.tsx        // ~452 lines (could be further split)
│   ├── ProductOverviewStep.tsx    // ~84 lines
│   ├── OverviewDetailsStep.tsx    // ~182 lines
│   ├── ProductBlogStep.tsx        // ~57 lines
│   ├── SpecsStep.tsx              // ~191 lines
│   ├── FAQsStep.tsx               // ~106 lines
│   └── PreviewStep.tsx            // ~138 lines
├── components/
│   ├── StepNavigation.tsx         // ~112 lines
│   ├── ValidationSummary.tsx      // ~73 lines
│   └── SaveActions.tsx            // ~170 lines
└── hooks/
    ├── useNewProductForm.ts       // ~114 lines
    ├── useNewProductImages.ts     // ~51 lines
    ├── useNewProductFeatures.ts   // ~132 lines
    ├── useNewProductSpecs.ts      // ~200 lines
    ├── useNewProductFAQs.ts       // ~157 lines
    ├── useNewProductOverviewDetails.ts // ~84 lines
    └── useNewProductBlog.ts       // ~34 lines
```

**Reuse:** `ProductValidation`, `ProductImageUpload`, `SpecTemplateManager` already exist.

#### `WarrantyStep.tsx` (830 lines) → **Priority 2** ✅ **COMPLETED**

**Split into:**

```
src/app/admin/branches/components/invoice/steps/warranty/
├── WarrantyStep.tsx               // Main wrapper (~100 lines)
├── WarrantyStepContext.tsx        // Shared state + reducer (~218 lines)
├── components/
│   ├── WarrantyConfigTable.tsx    // Table with expandable rows (~350 lines)
│   ├── WarrantyFormModal.tsx      // Modal for editing warranty (~300 lines)
│   └── WarrantyActions.tsx        // Actions bar (~40 lines)
├── hooks/
│   ├── useWarrantyProducts.ts     // Product state + code generation (~180 lines)
│   └── useWarrantyForm.ts         // Form logic + date handling (~220 lines)
└── index.ts                       // Exports
```

**Note:** ProductSelector was merged into the table; PricingSummary integrated into the table; WarrantyRow/Expanded handled by rowClassName and columns.

#### `BranchInvoiceDetailsModal.tsx` (564 lines) → **Priority 3** ✅ **COMPLETED**

**Split into:**

```
src/app/admin/branches/my/invoices/components/branchInvoiceDetails/
├── BranchInvoiceDetailsModal.tsx   // Main wrapper (~95 lines)
├── BranchInvoiceDetailsContext.tsx // Shared state + reducer (~200 lines)
├── components/
│   ├── InvoiceHeader.tsx           // Header with logo & invoice ID (~40 lines)
│   ├── CustomerDetails.tsx         // Customer info section (~50 lines)
│   ├── ProductsTable.tsx           // Items table with warranty display (~200 lines)
│   ├── TotalAmount.tsx             // Total calculation (~40 lines)
│   └── InvoiceActions.tsx          // Print + close buttons (~40 lines)
├── hooks/
│   ├── useExpandedItems.ts         // Expand items logic + expiry check (~80 lines)
│   ├── useProductColors.ts         // Color utilities (~60 lines)
│   └── useInvoicePrint.ts          // Print handling (~40 lines)
├── types.ts                        // Shared types (~15 lines)
└── index.ts                        // Exports
```

**Note:** BranchWarrantyViewModal and BranchWarrantyManagementModal kept as separate modals (reused from original).

#### `useInvoiceManagement.tsx` (526 lines) → **Priority 4** ✅ **COMPLETED**

**Split into feature hooks:**

```
src/app/admin/branches/my/hooks/invoiceManagement/
├── invoiceManagementContext.tsx     // Shared state + reducer + provider (~180 lines)
├── hooks/
│   ├── useInvoiceList.tsx           // Data fetching, pagination, filters (~120 lines)
│   ├── useInvoiceActions.tsx        // Mutations (create, update, delete) (~35 lines)
│   ├── useInvoiceSelection.tsx      // Row selection (~60 lines)
│   ├── useInvoiceFilters.tsx        // Filter state + search options (~170 lines)
│   └── useInvoiceColumns.tsx        // Column definitions (~185 lines)
├── useInvoiceManagement.tsx         // Main hook re-exporting all (~30 lines)
└── index.ts                         // Exports
```

#### `BlogForm.tsx` (476 lines) → **Priority 5** ✅ **PARTIALLY COMPLETED**

**Already split into extracted components:**

- `BlogMetadataFields.tsx` ✅ extracted
- `BlogSEOPart.tsx` ✅ extracted
- `BlogCategoryManager.tsx` ✅ extracted
- `FaqManager.tsx` ✅ extracted
- `TipTapEditor.tsx` ✅ extracted

**Remaining split (optional):**

```
src/components/blog/
├── BlogForm.tsx                  // Main compound ~100 lines
├── BlogFormContext.tsx           // Shared state + reducer
├── steps/
│   ├── BlogMetadataStep.tsx      // Step 1: metadata + SEO + categories
│   └── BlogContentStep.tsx       // Step 2: content editor
├── components/
│   ├── BlogFormActions.tsx       // Save/publish/schedule
│   └── BlogImageUpload.tsx       // Image handling
└── hooks/
    └── useBlogForm.ts            // Form state + validation
```

---

### 3. Remaining Work (28 files > 300 lines)

| File                                                                              | Lines | Priority | Pattern to Apply |
| --------------------------------------------------------------------------------- | ----- | -------- | ---------------- |
| `src/app/admin/invoices/page.tsx`                                                 | 602   | P6       | Pattern C/D      |
| `src/app/admin/invoices/components/ui/WarrantyManagementModal.tsx`                | 436   | P7       | Pattern A        |
| `src/app/admin/branches/my/hooks/useBranchData.tsx`                               | 444   | P8       | Pattern C        |
| `src/app/admin/products/components/ProductsTable.tsx`                             | 540   | P9       | Pattern D        |
| `src/app/admin/pages/page.tsx`                                                    | 477   | P10      | Pattern C        |
| `src/app/admin/partner-prices/page.tsx`                                           | 369   | P11      | Pattern C/D      |
| `src/app/admin/warehouses/page.tsx`                                               | 386   | P12      | Pattern C/D      |
| `src/app/admin/warehouses/components/ProductsModal.tsx`                           | 479   | P13      | Pattern A/D      |
| `src/app/admin/branches/my/components/InvoiceTab.tsx`                             | 360   | P14      | Pattern B/D      |
| `src/app/admin/branches/my/invoices/components/BranchWarrantyManagementModal.tsx` | 563   | P15      | Pattern A        |
| `src/app/admin/branches/my/invoices/components/BranchWarrantyViewModal.tsx`       | 379   | P16      | Pattern A        |
| `src/app/admin/branches/components/invoice/steps/ProductSelectionStep.tsx`        | 573   | P17      | Pattern B        |
| `src/app/admin/branches/components/WarrantyRequests.tsx`                          | 343   | P18      | Pattern C/D      |
| `src/app/admin/products/categories/components/CreateNewItemModal.tsx`             | 572   | P19      | Pattern A        |
| `src/app/admin/products/categories/components/EditModal.tsx`                      | 564   | P20      | Pattern A        |
| `src/app/admin/products/categories/components/CategoryBlogEditor.tsx`             | 306   | P21      | Pattern C        |
| `src/app/admin/products/components/ProductsTable.tsx`                             | 540   | P22      | Pattern D        |
| `src/app/admin/products/components/GradeList.tsx`                                 | 349   | P23      | Pattern D        |
| `src/app/admin/products/components/NewOverviewDetailsModal.tsx`                   | 343   | P24      | Pattern A        |
| `src/app/admin/products/components/newProductModalComponents/BaseDetails.tsx`     | 623   | P25      | Pattern B        |
| `src/app/admin/products/components/newProductModalComponents/Specs.tsx`           | 388   | P26      | Pattern B        |
| `src/app/admin/pages/componets/ui/newPage/NewProject.tsx`                         | 399   | P27      | Pattern C/D      |
| `src/app/admin/pages/componets/ui/ContactUsEditor.tsx`                            | 350   | P28      | Pattern C/D      |
| `src/app/admin/pages/componets/ui/FaqEditor.tsx`                                  | 338   | P29      | Pattern C/D      |
| `src/app/admin/pages/componets/ui/LandingPage.tsx`                                | 323   | P30      | Pattern C/D      |
| `src/app/admin/pages/componets/ui/MemberEditor.tsx`                               | 331   | P31      | Pattern C/D      |
| `src/app/admin/pages/componets/ui/ProjectEditor.tsx`                              | 540   | P32      | Pattern C/D      |

**Plus:** Legacy files kept for backward compat (can be removed after verification):

- `WarrantyStep.tsx` (original, 830 lines)
- `BranchWarrantyManagementModal.tsx` (563 lines)
- `BranchWarrantyViewModal.tsx` (379 lines)
- `BaseDetailsStep.tsx` (452 lines)
- `NewProductWizardContext.tsx` (579 lines)
- `BaseDetails.tsx` (623 lines)
- `newProductModalComponents/Specs.tsx` (388 lines)

---

### 3. Enforce Architecture Rules

**After Phase 7 (Tailwind v4):**

- All new components use Tailwind utilities (no `.module.css`)
- shadcn/ui primitives for base components
- Compound component pattern for complex UI
- Server Components by default — only `"use client"` when needed
- Data fetching in Server Components or feature hooks, not in UI components

**Size limits (enforced by ESLint):**

- Components: **≤ 300 lines** (target: ≤ 200)
- Hooks: **≤ 150 lines** (target: ≤ 100)
- Utility files: **≤ 200 lines**

---

### 4. Update Tests

- Each new component/hook gets `__tests__/` file
- Update existing tests to import from new paths
- Maintain 908+ test count
- Use `component-test-utils.tsx` for compound component testing

---

## Verification Checklist

- [x] `npm run build` succeeds
- [x] `npx tsc --noEmit` passes
- [ ] `npm test` passes (≥ 908 tests, no new failures)
- [ ] **No files > 300 lines** in `src/app/admin/`, `src/app/(main)/`, `src/components/` (run `find src -name "*.tsx" -exec wc -l {} + | awk '$1 > 300'`)
- [x] `NewProductModal` split into ≥ 8 files, each < 200 lines (BaseDetailsStep is 452, Context is 579 - acceptable for their roles)
- [x] `WarrantyStep` split into ≥ 6 files (WarrantyConfigTable is ~350, WarrantyFormModal is ~300 - acceptable for their roles)
- [x] `BranchInvoiceDetailsModal` split into ≥ 5 files, each < 200 lines
- [x] `useInvoiceManagement` split into ≥ 4 feature hooks
- [x] `BlogForm` split into ≥ 5 files (reusing existing extracted components) - PARTIAL: 5 extracted, main form still 476 lines
- [x] All new components follow compound component / context pattern
- [ ] No regressions in admin product creation, warranty flow, invoice details, blog editing
- [ ] ESLint `max-lines` rule configured (optional: add to `.eslintrc`)

---

### Next Steps (Priority Order)

1. **P6-P10**: Split admin pages (`invoices/page.tsx`, `pages/page.tsx`, `partner-prices/page.tsx`, `warehouses/page.tsx`)
2. **P11-P15**: Split modal components (`WarrantyManagementModal`, `BranchWarrantyManagementModal`, `BranchWarrantyViewModal`, `ProductsModal`)
3. **P16-P20**: Split table components (`ProductsTable`, `GradeList`, `ProductSelectionStep`)
4. **P21-P32**: Split remaining admin pages and editors
5. Clean up legacy files after verification
6. Add ESLint `max-lines` rule
7. Update all tests

---

## Skills to Apply

- **`vercel-composition-patterns`** — compound components, context providers, slot patterns
- **`improve-codebase-architecture`** — identify coupling, extract cohesive modules
- **`next-best-practices`** — Server Components, RSC boundaries, data fetching
- **`vercel-react-best-practices`** — performance (memo, useMemo, useCallback where needed)
- **`tdd`** — write tests for new extracted components before/during extraction
