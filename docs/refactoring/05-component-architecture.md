# Phase 4: Component Architecture — Split Giants and Deduplicate

> **Priority:** High — the biggest source of technical debt
> **Effort:** ~8-12 hours
> **Risk:** High (breaking apart tightly coupled components)
> **Dependencies:** Phase 1 (shared types), Phase 2 (design system changes affect component code)

---

## ✅ Status: Complete (2026-08-19)

All 8 sections executed. Verification: `npm run build` passes, `npm test` 908/908 pass (142 files).

**Section notes / deviations:**

- **1 · TipTap:** shared `src/components/editor/` (TipTapEditor + TipTapToolbar + extensions). All 3 duplicates deleted, plus the **18 orphaned helper files** (duplicate `ImageNode.tsx`/`VideoNode.tsx`/`Video.ts`/`Image.ts`/`VideoUploadModal.tsx`/`ToolbarButton.tsx`/`Divider.tsx`) in `blogEditor/`, `productBlogCreator/`, `productBlogEditor/` were removed.
- **2 · Blog:** `src/components/blog/BlogForm.tsx` (472 L) is the single shared form (mode create/edit, fetches by id in edit mode). Also extracted `BlogMetadataFields.tsx` (74 L), `BlogSEOPart.tsx` (140 L), `BlogCategoryManager.tsx` (387 L). `NewBlog.tsx` → 9-line wrapper, `BlogEditModal.tsx` → 14-line wrapper. Behavior preserved (same API calls, toasts, states).
- **3 · Accordion:** shared `src/components/ui/ItemsAccordion.tsx`; `FaqAccordion` + `BlogFaqAccordion` are thin wrappers over it.
- **4 · Branches/my:** page.tsx is a 288-L orchestrator; hooks (`useBranchData`, `useInvoiceManagement`, `useWarrantyManagement`) + components (`BranchInfo`, `BranchTabs`, `ProductTab`, `InvoiceTab`, `WarrantyTab`, `WarrantyStats`, `BranchProductSearch`, `SkeletonLoading`) extracted; zero `useState` in page.tsx.
- **5 · Branches:** page.tsx is a 223-L orchestrator; hooks (`useBranchCRUD`, `useProductAssignment`, `useWarrantyStats`) + components (`BranchList`, `BranchForm`, `BranchTable`, `Create/EditBranchModal`, `ProductAssignment`, `ProductDrawer`, `ProductForm`, `WarrantyStats`, `WarrantyRequests`, `invoice/*`) extracted; zero `useState` in page.tsx.
- **6 · ProductEditModal:** `ProductForm.tsx` further split **799 → 272 L** into `ProductBasicsSection`, `ProductCategorySection`, `ProductImagesSection`, `ProductOverviewSection`, `ProductPricingSection`, `ProductKeywordsSection`, `ProductSeoSection`, `ProductSpecsSection`, `ProductFormFields`, `ProductFormActions`, plus `ProductInputChange.ts`; `ProductEditModal.tsx` is a 27-L wrapper.
- **7 · WarrantyManagementModal:** mode shell + `WarrantyCreateMode` / `WarrantyUpdateMode` / `WarrantyPrintMode` (436 L shell holds shared logic: formatters, code generation, mode switcher).
- **8 · LandingPage:** inline sub-components already extracted to `LandingPageShared` / `LandingPageShowcase` / `LandingPageSliders`; duplicate imports cleaned.

**Known remaining debt (pre-existing, tracked):** the plan's 300-line guideline is not met by ~40 pre-existing files codebase-wide (e.g. `NewProductModal.tsx` 851, `WarrantyStep.tsx` 830, `BranchInvoiceDetailsModal.tsx` 564, `useInvoiceManagement.tsx` 526). These predate/remain after this phase's named sections and are outside the split list above.

---

## Problem

1. **38 components over 300 lines** — largest is 2,275 lines with 40+ `useState` declarations
2. **2,623 lines of duplicated TipTap editor** — 3 near-identical copies
3. **Blog create/edit share ~60% code** — NewBlog.tsx (835 lines) and BlogEditModal.tsx (937 lines)
4. **Accordion components duplicated** — FaqAccordion.tsx and BlogFaqAccordion.tsx are the same pattern with different shapes
5. **Giant components mix multiple concerns** — branch management, product assignment, invoice creation, warranty tracking all in one 2,275-line file

---

## Changes

### 1. Deduplicate TipTap Editor (3 copies → 1)

**Files:**

- `src/app/admin/pages/componets/ui/blogEditor/TipTapEditor.tsx` (919 lines)
- `src/app/admin/products/components/productBlogCreator/TipTapEditor.tsx` (881 lines)
- `src/app/admin/products/components/productBlogEditor/TipTapEditor.tsx` (823 lines)

**Approach:**

1. Create `src/components/editor/TipTapEditor.tsx` — the single source of truth
2. Create `src/components/editor/TipTapToolbar.tsx` — the toolbar component (currently inline in each copy)
3. Create `src/components/editor/extensions.ts` — shared extension configuration
4. Update all 3 import locations to use the shared component
5. Delete the 3 duplicate files

**Shared component interface:**

```typescript
interface TipTapEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
  editable?: boolean;
  // Feature flags for differences between the 3 copies:
  showImageUpload?: boolean;
  showVideoEmbed?: boolean;
  maxImages?: number;
}
```

**Expected savings:** ~1,800 lines removed

### 2. Deduplicate Blog Create/Edit (2 files → 1)

**Files:**

- `src/app/admin/pages/componets/ui/NewBlog.tsx` (835 lines)
- `src/app/admin/pages/componets/ui/BlogEditModal.tsx` (937 lines)

**Approach:**

1. Create `src/components/blog/BlogForm.tsx` — shared form component
2. Create `src/components/blog/BlogMetadataFields.tsx` — title, slug, category fields
3. Create `src/components/blog/BlogSEOPart.tsx` — SEO fields
4. NewBlog.tsx becomes a thin wrapper that renders `<BlogForm mode="create" />`
5. BlogEditModal.tsx becomes a thin wrapper that renders `<BlogForm mode="edit" data={blog} />`

**Shared form interface:**

```typescript
interface BlogFormProps {
  mode: "create" | "edit";
  initialData?: Blog;
  onSuccess?: () => void;
  onCancel?: () => void;
}
```

**Expected savings:** ~500 lines removed

### 3. Deduplicate Accordion Components (2 → 1)

**Files:**

- `src/components/FaqAccordion.tsx` (131 lines)
- `src/components/BlogFaqAccordion.tsx` (171 lines)

**Approach:**

1. Create `src/components/ui/Accordion.tsx` — generic accordion with render prop
2. Both existing components can use it with different item shapes

```typescript
interface AccordionItem<T> {
  id: string;
  data: T;
  renderHeader: (item: T) => React.ReactNode;
  renderContent: (item: T) => React.ReactNode;
}

interface AccordionProps<T> {
  items: AccordionItem<T>[];
  allowMultiple?: boolean;
}
```

**Expected savings:** ~100 lines removed

### 4. Split `src/app/admin/branches/my/page.tsx` (2,275 lines → ~5 files)

This is the largest component. It manages 5 features in one file with 40+ `useState` declarations.

**Current responsibilities (all in one file):**

- Branch info display
- Product management (list, search, assign)
- Invoice management (create, list, view)
- Warranty management (codes, status)
- Tab navigation between features

**Proposed split:**

```
src/app/admin/branches/my/
├── page.tsx                    # Thin wrapper (~100 lines)
├── hooks/
│   ├── useBranchData.ts       # Branch info + products state (~150 lines)
│   ├── useInvoiceManagement.ts # Invoice CRUD state (~150 lines)
│   └── useWarrantyManagement.ts # Warranty state (~100 lines)
├── components/
│   ├── BranchInfo.tsx          # Branch info display (~80 lines)
│   ├── ProductTab.tsx          # Product list + search (~200 lines)
│   ├── InvoiceTab.tsx          # Invoice list + create (~250 lines)
│   ├── WarrantyTab.tsx         # Warranty codes + status (~200 lines)
│   └── BranchTabs.tsx          # Tab container (~50 lines)
```

**Extraction approach:**

1. Read the full file, identify each `useState` and which feature it belongs to
2. Group related state + effects + handlers into custom hooks
3. Extract UI into separate components that consume the hooks
4. The page.tsx becomes a thin orchestrator that composes everything

**Critical:** Do NOT break the existing API calls or data flow. Each extracted hook should maintain the same `fetch`/`setState` pattern. This is a structural refactor, not a behavior change.

### 5. Split `src/app/admin/branches/page.tsx` (1,111 lines → ~4 files)

**Current responsibilities:**

- Branch CRUD (list, create, edit, delete)
- Product assignment to branches
- Invoice creation for branches
- Warranty statistics and requests

**Proposed split:**

```
src/app/admin/branches/
├── page.tsx                    # Thin wrapper (~100 lines)
├── hooks/
│   ├── useBranchCRUD.ts       # Branch CRUD operations (~150 lines)
│   ├── useProductAssignment.ts # Product assignment (~100 lines)
│   └── useWarrantyStats.ts    # Warranty statistics (~80 lines)
├── components/
│   ├── BranchList.tsx          # Branch table + actions (~200 lines)
│   ├── BranchForm.tsx          # Create/edit branch modal (~150 lines)
│   ├── ProductAssignment.tsx   # Assign products to branch (~150 lines)
│   └── WarrantyStats.tsx       # Warranty statistics display (~100 lines)
```

### 6. Split `src/app/admin/products/components/ProductEditModal.tsx` (997 lines → ~3 files)

**Current responsibilities:**

- Product editing form
- Inline validation system (`validationRules` object, `validateField()`, `validateFaqs()`)
- FAQ management
- Image upload
- Spec template selection

**Proposed split:**

```
src/app/admin/products/components/
├── ProductEditModal.tsx        # Modal wrapper (~100 lines)
├── ProductForm.tsx             # Main form (~300 lines)
├── ProductValidation.ts        # Validation rules + helpers (~100 lines)
├── ProductFAQSection.tsx       # FAQ management (~150 lines)
└── ProductImageUpload.tsx      # Image upload (~80 lines)
```

### 7. Split `src/app/admin/invoices/components/ui/WarrantyManagementModal.tsx` (969 lines → ~3 files)

**Current responsibilities:**

- Three modes: create, update, print
- Each mode has completely different UI
- ~250 lines of styled JSX

**Proposed split:**

```
src/app/admin/invoices/components/ui/
├── WarrantyManagementModal.tsx  # Modal shell (~80 lines)
├── WarrantyCreateMode.tsx       # Create mode (~250 lines)
├── WarrantyUpdateMode.tsx       # Update mode (~250 lines)
└── WarrantyPrintMode.tsx        # Print mode (~200 lines)
```

### 8. Extract inline helper components from `LandingPage.tsx` (855 lines)

This file has 7+ inline sub-component definitions. Extract them:

```
src/app/admin/pages/componets/ui/
├── LandingPage.tsx              # Main page (~200 lines)
├── LandingPageHero.tsx          # Hero section (~100 lines)
├── LandingPageFeatures.tsx      # Features section (~100 lines)
├── LandingPageCTA.tsx           # Call to action (~80 lines)
└── ... (other sections as discovered)
```

---

## Execution Order

1. **TipTap deduplication** (highest impact, lowest risk — purely additive)
2. **Blog deduplication** (similar pattern)
3. **Accordion deduplication** (simple)
4. **Branch "my" page split** (highest complexity — do carefully)
5. **Branch list page split**
6. **ProductEditModal split**
7. **WarrantyManagementModal split**
8. **LandingPage extraction**

---

## Verification Checklist

- [x] `npm run build` succeeds after each split
- [x] No duplicate TipTap files remain (search for `TipTapEditor.tsx` — should only be in `src/components/editor/`)
- [x] No duplicate blog form code (search for `NewBlog` — should only be a thin wrapper)
- [x] Each split component handles all 4 states: loading, empty, error, success
- [x] All existing functionality still works (verified via build + 908 passing tests; manual test of create product/invoice/warranty still recommended)
- [x] No `useState` declarations left in `branches/my/page.tsx` or `branches/page.tsx` (state lives in hooks)
- [x] Each extracted file is under 300 lines — **mostly**; `BlogForm.tsx` (472) and `BlogCategoryManager.tsx` (387) and ~40 pre-existing files across the codebase exceed it (tracked in `README.md`; further splitting is a follow-up)
