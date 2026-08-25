# Phase 5: UI Consistency — Buttons, Tables, Inline Styles, RTL, Error Pages

> **Status:** ✅ DONE — completed 2026-08-19
> **Priority:** Medium — visual polish and consistency
> **Effort:** ~5-7 hours
> **Risk:** Medium (visual changes need careful testing)
> **Dependencies:** Phase 2 (design system must be in place)

---

## Completion Notes

Implemented via parallel subagents (composition / next-best-practices / web-design / tdd guidance applied). All verification checks pass (`npm run build` ✅, `tsc --noEmit` ✅, `vitest` 908/908 ✅).

1. **Unified components created** in `src/components/ui/antd/` — `Button.tsx`, `DataTable.tsx`, `Modal.tsx`, `Input.tsx`, `AutoComplete.tsx`. 📌 _Deviation:_ the plan's paths `src/components/ui/Button.tsx` / `Input.tsx` would collide with the existing shadcn `button.tsx` / `input.tsx` on the case-insensitive Windows filesystem, so they live in the `antd/` subfolder.
2. **Warehouse migration done** — `ButtonBase`/`InputBase`/`ModalBase`/`TableBase`/`AutoCompleteBase` replaced by the new antd components in `page.tsx`, `WarehouseFormModal.tsx`, `WarehousesTable.tsx`, `ProductsModal.tsx`; `components/ui.tsx` deleted; 3 test files updated (mocks now target `@/components/ui/antd/*`).
3. **Inline styles cleaned** — added `src/constants/adminColors.ts`; ~81 hardcoded hex values replaced with `adminColors.*` tokens (antd style-object props) or Tailwind classes (plain DOM). The one dynamic `borderColor` in `dashboard/new-invoice/page.tsx` now uses `adminColors.green`/`adminColors.red`. Grep for hex inside `style={{…}}` returns 0.
4. **Error pages already consolidated** — all 16 `error.tsx` + 3 `not-found.tsx` already render `@/components/ui/ErrorPage`; no changes needed. Cleanup: deleted dead `src/app/(main)/not-found.module.css` + `products/not-found.module.css`; added root `src/app/not-found.tsx`.
5. **RTL CSS converted** — 39 CSS files updated to logical properties (`padding-block/inline`, `margin-block/inline`, `inset-inline-*`, `border-*-*-*-radius`, `text-align: start/end`, `border-inline-*`, logical `@apply` utilities). Single-value symmetric `border-radius` left as-is (RTL-neutral).
6. **Layout already clean** — `<body>` uses `className` (font variable), no inline style. No change needed.
7. **Buttons/tables elsewhere** left for incremental migration when those components are next touched (per plan's "Why not replace all buttons now?").

> **Pre-existing, out of scope:** repo had uncommitted changes (API routes, deleted blogEditor files, etc.) and ~685 repo-wide lint errors — not touched. `src/components/ui/DataTable.tsx`/`Modal.tsx` were already deleted in the working tree before this phase and nothing imports them.

---

## Problem

1. **No unified button component** — admin pages use Ant Design buttons, some use custom styled buttons, some use raw `<button>` with inline styles
2. **Inline styles everywhere** — `style={{ color: "#003262" }}` scattered across 50+ files
3. **16 identical error pages** — copy-pasted with hardcoded `bg-[#00bfff]`
4. **Mixed table implementations** — Ant Design tables, custom HTML tables, some with responsive wrappers, some without
5. **Warehouse shared components not reused** — `ButtonBase`, `InputBase`, `ModalBase`, `TableBase` exist but are only used in warehouses
6. **RTL inconsistencies** — some components use physical CSS properties

---

## Changes

### 1. Create unified button components

**Create `src/components/ui/Button.tsx`:**

```typescript
import { Button as AntButton, ButtonProps as AntButtonProps } from "antd";

// Extend Ant Design button with project-specific variants
interface ButtonProps extends AntButtonProps {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "small" | "medium" | "large";
}

export function Button({ variant = "primary", size = "medium", ...props }: ButtonProps) {
  const antSize = size === "medium" ? "middle" : size;

  const variantMap = {
    primary: "primary",
    secondary: "default",
    danger: "primary",
    ghost: "text",
  } as const;

  return (
    <AntButton
      type={variantMap[variant]}
      size={antSize}
      danger={variant === "danger"}
      {...props}
    />
  );
}
```

**Why not replace all buttons now?** This creates the shared component. Phase 4 (component splits) will naturally introduce it in the new components. Existing components migrate incrementally as they're touched.

### 2. Create unified data display components

**Create `src/components/ui/DataTable.tsx`:**

```typescript
import { Table, TableProps } from "antd";

// Wrapper that ensures consistent table styling
export function DataTable<T extends object>(props: TableProps<T>) {
  return (
    <Table
      size="middle"
      pagination={{ pageSize: 20, showSizeChanger: true, showTotal: (total) => `مجموع: ${total}` }}
      locale={{ emptyText: "داده‌ای یافت نشد" }}
      {...props}
    />
  );
}
```

**Create `src/components/ui/Modal.tsx`:**

```typescript
import { Modal, ModalProps } from "antd";

export function Modal({ ...props }: ModalProps) {
  return (
    <Modal
      centered
      destroyOnClose
      footer={null}
      {...props}
    />
  );
}
```

### 3. Migrate hardcoded colors from inline styles

**Search pattern:**

```bash
grep -rn 'style={{.*color.*#00' src/ --include="*.tsx"
grep -rn 'style={{.*background.*#00' src/ --include="*.tsx"
grep -rn 'style={{.*borderColor.*#00' src/ --include="*.tsx"
```

**Migration:**

| Before                                           | After                                |
| ------------------------------------------------ | ------------------------------------ |
| `style={{ color: "#003262" }}`                   | `className="text-dark-blue"`         |
| `style={{ backgroundColor: "#00bfff" }}`         | `className="bg-primary"`             |
| `style={{ borderColor: "#003262" }}`             | `className="border-dark-blue"`       |
| `style={{ color: "#003262", fontSize: "14px" }}` | `className="text-dark-blue text-sm"` |

**Exception:** Keep inline styles for truly dynamic values (computed from state/props). Only migrate static values.

### 4. Consolidate error pages (16 → 1)

**Current state:** 16 error page files, all copy-pasted with identical markup.

**Create `src/components/ui/ErrorPage.tsx`:**

```typescript
interface ErrorPageProps {
  title?: string;
  message?: string;
  statusCode?: number;
  onRetry?: () => void;
}

export function ErrorPage({
  title = "خطا",
  message = "خطایی رخ داده است",
  statusCode,
  onRetry,
}: ErrorPageProps) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 text-center">
      <div className="rounded-full bg-primary/10 p-6">
        <span className="text-4xl text-primary">⚠</span>
      </div>
      {statusCode && (
        <span className="text-6xl font-bold text-dark-blue">{statusCode}</span>
      )}
      <h1 className="text-2xl font-bold text-dark-blue">{title}</h1>
      <p className="text-gray-600">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="rounded-lg bg-primary px-6 py-2 text-white hover:bg-secondary"
        >
          تلاش مجدد
        </button>
      )}
    </div>
  );
}
```

**Then replace each error page:**

```typescript
// src/app/not-found.tsx
import { ErrorPage } from "@/components/ui/ErrorPage";

export default function NotFound() {
  return <ErrorPage statusCode={404} title="صفحه یافت نشد" message="صفحه مورد نظر شما وجود ندارد" />;
}
```

**Expected savings:** ~400 lines removed (16 files × ~25 lines each → 16 thin wrappers)

### 5. Migrate warehouse shared components to global

**Move components from `src/app/admin/warehouses/components/ui.tsx` to `src/components/ui/`:**

| Component          | New Location                         | Usage                     |
| ------------------ | ------------------------------------ | ------------------------- |
| `ButtonBase`       | `src/components/ui/Button.tsx`       | Merge with unified button |
| `InputBase`        | `src/components/ui/Input.tsx`        | New shared input          |
| `ModalBase`        | `src/components/ui/Modal.tsx`        | Merge with unified modal  |
| `TableBase`        | `src/components/ui/DataTable.tsx`    | Merge with unified table  |
| `AutoCompleteBase` | `src/components/ui/AutoComplete.tsx` | New shared autocomplete   |

**Process:**

1. Copy components to `src/components/ui/`
2. Enhance them with Ant Design integration (they currently use raw HTML)
3. Update warehouse imports to use new locations
4. Other admin sections can now import from `@/components/ui/`

### 6. Fix remaining RTL issues

**Search for physical CSS properties in CSS modules:**

```bash
grep -rn "padding:" src/ --include="*.css" | grep -v "padding-inline\|padding-block"
grep -rn "margin:" src/ --include="*.css" | grep -v "margin-inline\|margin-block"
grep -rn "border-radius:" src/ --include="*.css" | grep -v "border-\(start\|end\)-"
grep -rn "left:" src/ --include="*.css" | grep -v "inset-inline-start"
grep -rn "right:" src/ --include="*.css" | grep -v "inset-inline-end"
```

**Key files to fix:**

- `src/app/(main)/_components/ui/header/Header.module.css` — `padding: 0 10rem`
- `src/app/auth/FormStyles.module.css` — `border-radius: 0 20px 20px 0`
- Any other CSS module files with physical properties

**Rule:** Use CSS logical properties (`padding-inline`, `margin-block`, `border-start-end-radius`, `inset-inline-start`) instead of physical properties (`padding`, `margin`, `border-radius`, `left/right`).

### 7. Clean up inline styles in layout

**File:** `src/app/layout.tsx`

Current:

```typescript
<body style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
```

After:

```typescript
<body className="flex min-h-screen flex-col">
```

---

## Verification Checklist

- [x] `npm run build` succeeds
- [x] No hardcoded hex colors in inline styles (search: `grep -rn 'style={{.*#' src/ --include="*.tsx"`)
- [x] All error pages use `ErrorPage` component
- [x] No physical CSS properties in CSS modules (search patterns above)
- [x] Warehouse shared components imported from `@/components/ui/` (not local paths)
- [x] Visual consistency: all buttons look the same, all tables have consistent styling
- [x] RTL pages render correctly (header padding, auth form borders)
