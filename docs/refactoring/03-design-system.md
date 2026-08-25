# Phase 2: Design System — Ant Design ConfigProvider, Tailwind Tokens, CSS Cleanup

> **Priority:** High — fixes the root cause of 500+ lines of CSS overrides
> **Effort:** ~4-6 hours
> **Risk:** Medium (visual changes, need careful testing)
> **Dependencies:** Phase 1 (types must exist)

---

## Problem

1. **No Ant Design ConfigProvider** — Ant Design renders with default blue theme, then styled JSX overrides force dark blue colors. This causes flash of unstyled content and 500+ lines of `!important` CSS.
2. **No Tailwind color tokens** — brand colors exist as CSS custom properties in `globals.css` (`--primary-color: #00bfff`, etc.) but are NOT mapped to Tailwind, so components use hardcoded hex values like `bg-[#00bfff]`.
3. **3 competing styling systems** — Ant Design, Tailwind, and styled JSX all fighting each other.
4. **Physical CSS properties** — `padding: 0 10rem` and `border-radius: 0 20px 20px 0` break in RTL.

---

## Changes

### 1. Add Tailwind color tokens to `tailwind.config.ts`

**Current state:** `tailwind.config.ts` has custom breakpoints but no color tokens.

**Add these tokens:**

```typescript
// tailwind.config.ts — add to theme.extend.colors
colors: {
  primary: "#00bfff",
  secondary: "#318ce7",
  third: "#1e90ff",
  fourth: "#0e6aff",
  "dark-blue": "#003262",
  // Semantic aliases
  brand: {
    primary: "#00bfff",
    secondary: "#318ce7",
    accent: "#1e90ff",
    deep: "#0e6aff",
    dark: "#003262",
  },
},
```

**Why both `primary` and `brand.primary`?** The short names (`bg-primary`) are convenient for frequent use. The `brand.*` namespace is for cases where you want explicitness (`bg-brand-primary`).

### 2. Add Ant Design ConfigProvider to root layout

**File:** `src/app/layout.tsx`

Add a `<ConfigProvider>` wrapping the app with a custom theme that matches the brand:

```typescript
import { ConfigProvider } from "antd";
import faIR from "antd/locale/fa_IR";

// In the layout component:
<ConfigProvider
  locale={faIR}
  theme={{
    token: {
      colorPrimary: "#00bfff",
      colorLink: "#00bfff",
      colorLinkHover: "#318ce7",
      colorSuccess: "#52c41a",
      colorWarning: "#faad14",
      colorError: "#ff4d4f",
      fontFamily: "var(--font-iran-yekan), system-ui, arial",
      borderRadius: 8,
    },
    components: {
      Table: {
        headerBg: "#003262",
        headerColor: "#ffffff",
        rowHoverBg: "#f0f9ff",
      },
      Button: {
        primaryShadow: "0 2px 0 rgba(0,191,255,0.3)",
      },
      Modal: {
        contentBg: "#ffffff",
        headerBg: "#ffffff",
      },
    },
  }}
>
  {children}
</ConfigProvider>
```

**Why this matters:** With ConfigProvider, Ant Design components will natively use the brand colors. The 500+ lines of `!important` styled JSX overrides become unnecessary.

### 3. Migrate hardcoded colors to Tailwind tokens

**Search and replace pattern:**

| Before               | After                |
| -------------------- | -------------------- |
| `bg-[#00bfff]`       | `bg-primary`         |
| `text-[#00bfff]`     | `text-primary`       |
| `bg-[#003262]`       | `bg-dark-blue`       |
| `text-[#003262]`     | `text-dark-blue`     |
| `bg-[#318ce7]`       | `bg-secondary`       |
| `border-[#00bfff]`   | `border-primary`     |
| `hover:bg-[#318ce7]` | `hover:bg-secondary` |

**Scope:** Only migrate classes that appear in component JSX. Leave CSS custom properties in `globals.css` unchanged (they're still useful for non-Tailwind contexts).

### 4. Remove styled JSX overrides (biggest impact)

**Files with large styled JSX blocks to remove:**

| File                                                               | Lines of styled JSX | What it overrides                      |
| ------------------------------------------------------------------ | ------------------- | -------------------------------------- |
| `src/app/admin/branches/my/page.tsx`                               | ~300 lines          | Ant Design table, modal, button colors |
| `src/app/admin/branches/page.tsx`                                  | ~250 lines          | Same patterns                          |
| `src/app/admin/invoices/components/ui/WarrantyManagementModal.tsx` | ~250 lines          | Same patterns                          |
| `src/app/admin/branches/components/Styles.tsx`                     | ~230 lines          | Dark theme overrides                   |
| `src/app/admin/warehouses/styles.tsx`                              | ~122 lines          | Dark theme overrides                   |

**Process for each file:**

1. Read the styled JSX block
2. Identify what Ant Design component it's targeting (Table, Modal, Button, etc.)
3. If the ConfigProvider token covers it → remove the override
4. If it's a one-off custom style → convert to Tailwind classes on the component
5. If it's genuinely unique → keep as scoped `<style jsx>` (not `<style jsx global>`)

**Expected result:** Remove ~1,000+ lines of `!important` CSS overrides across the admin panel.

### 5. Fix RTL-breaking physical CSS properties

**File:** `src/app/(main)/_components/ui/header/Header.module.css`

```css
/* Before: */
padding: 0 10rem;

/* After: */
padding-inline: 0 10rem;
```

**File:** `src/app/auth/FormStyles.module.css`

```css
/* Before: */
border-radius: 0 20px 20px 0;

/* After (RTL-aware): */
border-start-end-radius: 20px;
border-end-end-radius: 20px;
border-start-start-radius: 0;
border-end-start-radius: 0;
```

**Search for other physical properties:**

```bash
grep -rn "padding:" src/ --include="*.css" | grep -v "padding-inline\|padding-block"
grep -rn "margin:" src/ --include="*.css" | grep -v "margin-inline\|margin-block"
grep -rn "border-radius:" src/ --include="*.css"
```

### 6. Audit `src/app/admin/warehouses/components/ui.tsx`

This file exports shared components (`ButtonBase`, `InputBase`, `ModalBase`, `TableBase`, `AutoCompleteBase`) but they're only used in the warehouses section. **Decision:** Keep them for now but note they exist. Phase 5 will evaluate whether to promote them to a shared component library.

---

## Verification Checklist

- [ ] `npm run build` succeeds
- [ ] No `!important` in styled JSX blocks (search: `grep -r "!important" src/ --include="*.tsx"`)
- [ ] `grep -r "bg-\[#00bfff\]" src/` returns zero results (all migrated to `bg-primary`)
- [ ] Ant Design components render with brand blue color (visual check)
- [ ] RTL pages render correctly (no flipped padding/border-radius)
- [ ] No flash of unstyled Ant Design components on page load
- [ ] Dark blue header/footer still renders correctly
