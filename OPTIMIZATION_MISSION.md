# Optimization Mission — next-farabak-app-v15

> **React Doctor Score:** 49/100 (Critical)  
> **Goal:** 70+ / 100  
> **Est. Effort:** 2–3 weeks  
> **Repository:** `C:\Users\Rasa\Desktop\next-farabak-app-v15`

---

## Progress Tracker

| Phase | Status | Notes |
|-------|--------|-------|
| **0 — Preparation & Snapshot** | ✅ Complete | Read all relevant files, saved baseline report (`react-doctor-baseline.json`) |
| **1 — Commit Current Changes** | 🔄 In progress | Staging and committing all current changes |
| **2 — Install skills.sh Skills** | ❌ Not started | 10 skills for opencode agent |
| **3 — AGENTS.md & DESIGN.md** | ❌ Not started | Project conventions + design tokens |
| **4 — Fix React Doctor Issues** | ❌ Not started | Performance, renders, UI states |
| **5 — Write & Run Tests** | ❌ Not started | Vitest unit + Cypress E2E |
| **6 — Final Verification** | ❌ Not started | Lint, build, react-doctor, all tests |

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Phase 0 — Preparation & Snapshot](#2-phase-0--preparation--snapshot)
3. [Phase 1 — Commit Current Changes](#3-phase-1--commit-current-changes)
4. [Phase 2 — Install skills.sh Skills](#4-phase-2--install-skillssh-skills)
5. [Phase 3 — Initialize AGENTS.md & DESIGN.md](#5-phase-3--initialize-agentsmd--designmd)
6. [Phase 4 — Fix React Doctor & Best Practice Issues](#6-phase-4--fix-react-doctor--best-practice-issues)
7. [Phase 5 — Write & Run Tests](#7-phase-5--write--run-tests)
8. [Phase 6 — Final Verification](#8-phase-6--final-verification)
9. [Appendix A — Persian UI Strings](#appendix-a--persian-ui-strings)
10. [Appendix B — Suspense & Loading Patterns](#appendix-b--suspense--loading-patterns)
11. [Appendix C — Design System Reference](#appendix-c--design-system-reference)
12. [Appendix D — Testing Patterns & Conventions](#appendix-d--testing-patterns--conventions)

---

## 1. Project Overview

### Stack
| Layer | Technology |
|-------|-----------|
| **Framework** | Next.js `^16.0.7` (App Router) |
| **UI Library** | React `^19.2.1` |
| **Language** | TypeScript `~5.6.0` |
| **Styling** | Tailwind CSS `^3.4.16` + `@tailwindcss/typography` + CSS Modules |
| **UI Components** | Ant Design `^5.24.5` + `@ant-design/icons` |
| **Database ORM** | Prisma `^6.1.0` (PostgreSQL) |
| **State** | React Context (`UserContext`, `InvoiceContext`) |
| **Auth** | JWT (`jose`) + HTTP-only cookies |
| **Forms** | React Hook Form + Yup |
| **HTTP Client** | Axios |
| **Testing** | Cypress `^15.0.0` (E2E) |
| **Compiler** | `babel-plugin-react-compiler` (experimental) |

### Key Directories
```
src/
├── app/
│   ├── layout.tsx              # Root layout (fonts, context providers, GA)
│   ├── globals.css             # Global styles + Tailwind + custom CSS
│   ├── (main)/                 # Public route group
│   │   ├── layout.tsx          # Header, Footer, BackToTop, WhatsApp
│   │   ├── page.tsx            # Homepage (SSR + ISR, dynamic imports)
│   │   ├── products/           # Products (3-level category hierarchy)
│   │   ├── dashboard/          # User dashboard (client-side, protected)
│   │   ├── about-us/           # About, members, projects, activity
│   │   ├── contact-us/         # Contact form
│   │   └── support/            # Support pages (blog, FAQ)
│   ├── admin/                  # Admin panel (client-side, protected)
│   │   ├── layout.tsx          # Sidebar layout
│   │   ├── page.tsx            # Admin dashboard
│   │   ├── branches/           # Branch management
│   │   ├── invoices/           # Invoice management
│   │   ├── products/           # Product CRUD
│   │   ├── warehouses/         # Warehouse management
│   │   ├── analytics/          # Analytics
│   │   └── settings/           # Settings
│   ├── auth/                   # Auth routes (login, signup)
│   ├── api/                    # 29 API endpoint groups
│   └── swagger/                # API docs
├── components/                 # Shared components (FAQ, accordion)
├── context/                    # React Context providers
├── hooks/                      # Custom hooks
├── lib/                        # Library init (Prisma)
├── utils/                      # Utility functions
├── helpers/                    # Business logic helpers
└── constants/                  # Static JSON data
```

### Current Structure: No `loading.tsx` / `error.tsx` Files
- **`loading.tsx`:** 0 files exist (all loading is handled inline with `useState`)
- **`error.tsx`:** 0 files exist (all errors handled inline with `toast.error()` or console logging)
- **`not-found.tsx`:** 3 files exist (`(main)/`, `(main)/products/`, `(main)/support/blog/`)

---

## 2. Phase 0 — Preparation & Snapshot

**Purpose:** Read all relevant files to understand the full current state before making any changes.

### 2.1 Git State
```powershell
cd C:\Users\Rasa\Desktop\next-farabak-app-v15
git status --short
git diff --stat
git log --oneline -10
```

### 2.2 Files to Read for Context
| File | Purpose |
|------|---------|
| `package.json` | Dependencies, scripts |
| `next.config.mjs` | Performance settings |
| `tsconfig.json` | TypeScript config |
| `tailwind.config.ts` | Design tokens, breakpoints |
| `src/app/globals.css` | Global styles, CSS variables |
| `prisma/schema.prisma` | Database schema |
| `src/app/layout.tsx` | Root layout structure |
| `src/app/(main)/layout.tsx` | Main layout (header, footer) |
| `src/app/(main)/page.tsx` | Homepage (ISR, dynamic imports pattern) |
| `src/context/InvoiceContext.tsx` | Invoice state management |
| `src/context/UserContext.tsx` | User auth state management |
| `src/hooks/useInvoiceCookie.ts` | Invoice cookie hook |
| `src/helpers/pricingHelper.ts` | Pricing logic |
| `src/app/api/products/search/route.ts` | Search API (has Set issues) |
| `src/app/api/contact-us/route.ts` | Contact API (has serial await issues) |
| `src/app/api/projects/[id]/route.ts` | Projects API (has parallel issues) |
| `src/app/api/invoice/route.ts` | Invoice API |
| `cypress.config.ts` | Test configuration |

### 2.3 Save React Doctor Report (Baseline)
```powershell
npx react-doctor . --json > react-doctor-baseline.json
```

---

## 3. Phase 1 — Commit Current Changes

**Purpose:** Create a clean baseline commit before starting any work.

```powershell
git add -A
git commit -m "chore: checkpoint before optimization sprint"
```

**Verify:**
```powershell
git status  # should show "nothing to commit, working tree clean"
```

---

## 4. Phase 2 — Install skills.sh Skills

**Purpose:** Install 10 project-level skills for the opencode agent.

### 4.1 Add .gitignore Entry
Add to `.gitignore`:
```
# skills.sh project-level skill files
.skills/
skills-lock.json
```

### 4.2 Install All Skills
Run from project root:

```powershell
# 1. Next.js App Router best practices (file conventions, RSC boundaries)
npx skills add vercel-labs/next-skills --skill next-best-practices --agent opencode -y

# 2. React/Next.js performance rules (69 rules across 8 categories)
npx skills add vercel-labs/agent-skills --skill vercel-react-best-practices --agent opencode -y

# 3. Web design guidelines (Vercel UI guidelines)
npx skills add vercel-labs/agent-skills --skill web-design-guidelines --agent opencode -y

# 4. Frontend design patterns (visual polish)
npx skills add anthropics/skills --skill frontend-design --agent opencode -y

# 5. Next.js caching (PPR, `use cache`, cacheLife, cacheTag)
npx skills add vercel-labs/next-skills --skill next-cache-components --agent opencode -y

# 6. Component composition patterns
npx skills add vercel-labs/agent-skills --skill vercel-composition-patterns --agent opencode -y

# 7. Systematic debugging workflow
npx skills add obra/superpowers --skill systematic-debugging --agent opencode -y

# 8. Codebase architecture improvement
npx skills add mattpocock/skills --skill improve-codebase-architecture --agent opencode -y

# 9. Test-driven development patterns
npx skills add mattpocock/skills --skill tdd --agent opencode -y

# 10. Extract design system from existing code
npx skills add arvindrk/extract-design-system --skill extract-design-system --agent opencode -y
```

### 4.3 Verify Installation
```powershell
npx skills list --json
```

Expected: 10 skills with `"scope": "project"` and `"agents": ["opencode"]`.

### 4.4 User Restart Required
**STOP HERE — Require user confirmation to restart the terminal so skills are available.**

```markdown
>[!IMPORTANT]
>Skills installed. Please restart the terminal/agent session so the skills
>are loaded into context. Run `npx skills list` to verify.
```

---

## 5. Phase 3 — Initialize AGENTS.md & DESIGN.md

### 5.1 Create AGENTS.md

File: `AGENTS.md`

Contents:
```markdown
# Agent Guide for next-farabak-app-v15

## Installed Skills (skills.sh)
- `vercel-labs/next-skills/next-best-practices` — App Router conventions
- `vercel-labs/agent-skills/vercel-react-best-practices` — React/Next.js perf
- `vercel-labs/agent-skills/web-design-guidelines` — Vercel UI guidelines
- `anthropics/skills/frontend-design` — Frontend design patterns
- `vercel-labs/next-skills/next-cache-components` — Caching patterns
- `vercel-labs/agent-skills/vercel-composition-patterns` — Component composition
- `obra/superpowers/systematic-debugging` — Debugging workflow
- `mattpocock/skills/improve-codebase-architecture` — Architecture patterns
- `mattpocock/skills/tdd` — TDD patterns
- `arvindrk/extract-design-system/extract-design-system` — Design system extraction

## Project Conventions

### Language & Direction
- **Language:** Persian (RTL)
- **UI text:** All user-facing strings in Persian
- **CSS:** Tailwind with RTL-first configuration
- **Font:** IRANYekan variable font (`localFont` from `src/app/fonts/`)

### Code & Architecture
- **Framework:** Next.js 16 (App Router)
- **React:** React 19 with experimental React Compiler (`babel-plugin-react-compiler`)
- **Component boundaries:** Prefer Server Components by default; add `"use client"` only when needed (hooks, event handlers, browser APIs)
- **Fetching:** Server-side fetch with ISR (`next: { revalidate }`) for public pages; Apollo-style client fetch for admin pages
- **State:** React Context (UserContext, InvoiceContext) — no external state lib
- **Styling:** Tailwind utility classes + CSS Modules for complex layouts
- **Database:** Prisma ORM (PostgreSQL, multi-schema)

### Key Commands
```bash
npm run dev          # prisma generate + next dev
npm run build        # prisma generate + next build
npm run lint         # ESLint check
npm run lint:fix     # ESLint auto-fix
npm run format       # Prettier format
npx cypress open     # E2E tests
npx vitest           # Unit tests
```

### File Organization
```
src/app/             # App Router pages + API routes
src/components/      # Shared components (not page-specific)
src/context/         # React Context providers
src/hooks/           # Custom hooks
src/lib/             # Library initialization
src/utils/           # Utility functions
src/helpers/         # Business logic helpers
src/constants/       # Static JSON data
```

### Design Tokens (from DESIGN.md)
See `DESIGN.md` for complete design system reference.

## Performance Rules
1. Always use `next/dynamic` for below-fold components
2. Use `loading.tsx` for each route segment that fetches data
3. Use `error.tsx` for each route segment with proper Persian error messages
4. Wrap all `"use client"` data-fetching sections in `<Suspense>` boundaries
5. Every data-dependent component must handle: loading → empty → error → success states
6. Images: Use `next/image` with explicit width/height, `placeholder="blur"`, WebP/AVIF
7. Fonts: Use `next/font/local` with `display="swap"`, `preload: true`
8. Avoid `await` in loops — use `Promise.all()`
9. Avoid `array.includes()` in loops — use `Set`
10. Avoid `dangerouslySetInnerHTML` — use sanitized HTML rendering (DOMPurify)
```

### 5.2 Create DESIGN.md

**Approach:** First run the `extract-design-system` skill to analyze the existing codebase, then create DESIGN.md based on its output.

#### 5.2.1 Run Design System Extraction
```powershell
# Use the extract-design-system skill to analyze the project
# Follow the skill's instructions for extracting colors, typography, spacing, etc.
```

#### 5.2.2 DESIGN.md Contents

```markdown
# Design System — next-farabak-app-v15

## Brand Colors
| Token | Value | Usage |
|-------|-------|-------|
| `--primary-color` | `#00bfff` | Primary buttons, links, active states |
| `--secondary-color` | `#318ce7` | Secondary elements, hover states |
| `--third-color` | `#1e90ff` | Tertiary accents |
| `--fourth-color` | `#0e6aff` | Darker accents |
| `--dark-blue-color` | `#003262` | Headers, footer, dark sections |

## Typography
| Token | Value |
|-------|-------|
| Primary font | `IRANYekanXVF.woff` (variable, weight 100–1000) |
| CSS variable | `--font-iran-yekan` |
| `font-display` | `swap` |
| Fallback | `system-ui, arial` |

### Usage
```css
font-family: var(--font-iran-yekan);
```

## Spacing & Layout
- **Breakpoints:** mobile: 577px, sm: 640px, md: 768px, lg: 1024px, xl: 1280px, 2xl: 1400px
- **Direction:** RTL (right-to-left)
- **Container:** responsive padding, max-width handled by Tailwind

## Component Patterns

### Cards
- `glass-card` utility class (backdrop-blur, semi-transparent background)
- Product cards have image + title + price + add-to-invoice button
- Category cards are horizontal sliders

### Form Inputs
- `.input-field` — standard text input
- `.textarea-field` — multi-line input
- `.file-input` — file upload with drag-and-drop (react-dropzone)

### Tables
- `.responsive-table-wrapper` for horizontal scroll on mobile
- Used extensively in admin panels (Ant Design tables)

### Accordion
- Custom `FaqAccordion` component in `src/components/`
- Uses `content-visibility: auto` for performance

## UI States
All data-driven components must implement these states (text in Persian):

### Loading
- Skeleton loaders (pulsing gray rectangles matching content shape)
- Use `content-visibility: auto` for below-fold sections
- Existing: `SkeletonLoader`, `ProductTableSkeleton`, `BlogSkeleton`, `SkeletonFeatures`, `SkeletonLoading`

### Empty
- Persian: `"محصولی یافت نشد"` / `"داده‌ای برای نمایش وجود ندارد"` / "آیتمی یافت نشد"
- Optional: illustrative icon or simple illustration

### Error
- Persian: `"خطا در دریافت اطلاعات"` / `"خطا در برقراری ارتباط"` / "خطا: {description}"
- Retry button: `"تلاش مجدد"` / `"دوباره تلاش کنید"`
- Toast for non-blocking operations (using `react-hot-toast`)
- Inline error message for blocking failures

### Success
- Persian: `"با موفقیت انجام شد"` / `"اطلاعات ذخیره شد"` / `"عملیات موفق"`
- Toast notification (using `react-hot-toast`)

## Custom Animations
- `fade-in` (scale + opacity) — defined in tailwind config
- `animate-pulse` — Tailwind default, used for skeleton loaders
- `animate-spin` — Tailwind default, used for loading spinners
```

---

## 6. Phase 4 — Fix React Doctor & Best Practice Issues

**Purpose:** Fix all issues identified by React Doctor, implement proper UI states, and apply skills best practices.

### 6.1 Performance Issues (Critical — TTFB Impact)

#### 6.1.1 React Compiler Blocked by try/catch/finally
**Files:** `src/hooks/useInvoiceCookie.ts`

**Problem:** 7 blocks prevent React Compiler auto-memoization because try/catch/finally aren't supported yet.

**Fix approach:**
1. Extract inline try/catch logic into standalone helper functions in a separate file (e.g., `src/helpers/invoiceCookieHelpers.ts`)
2. Replace `useCallback` usage — let React Compiler handle memoization (remove `useCallback` wrappers where React Compiler is enabled)
3. The `useInvoiceCookie` hook should call these helpers rather than having inline try/catch

**Reference:** `src/hooks/useInvoiceCookie.ts:21,33,54,69,90,101`

#### 6.1.2 `await` Inside Loops (Sequential → Parallel)
**Files:**
- `src/app/api/contact-us/route.ts:58,72` — for-loop with await
- `src/app/api/projects/[id]/route.ts:86,102,218` — for…of and do-while with await
- `src/app/api/projects/route.ts:111,124` — for…of with await
- `src/app/api/specTemplates/route.ts:31,68` — for…of with await
- `src/app/api/specTemplates/[id]/route.ts:88` — for…of with await

**Fix pattern:**
```typescript
// BEFORE
for (const item of items) {
  await processItem(item);
}

// AFTER
await Promise.all(items.map(item => processItem(item)));
```

#### 6.1.3 Independent `await`s Run Sequentially
**Files:**
- `src/app/api/projects/[id]/route.ts:112` — 4 sequential awaits
- `src/app/api/projects/[id]/route.ts:236` — 3 sequential awaits
- `src/app/api/contact-us/route.ts:10` — 3 sequential awaits

**Fix pattern:**
```typescript
// BEFORE
const a = await fetchA();
const b = await fetchB();
const c = await fetchC();

// AFTER
const [a, b, c] = await Promise.all([fetchA(), fetchB(), fetchC()]);
```

#### 6.1.4 Array Lookup Inside Loop (`includes` → `Set`)
**File:** `src/app/api/products/search/route.ts:166,173,178,183,188`

**Fix pattern:**
```typescript
// BEFORE
for (const term of terms) {
  if (keywordArray.includes(term)) { ... }
}

// AFTER
const keywordSet = new Set(keywordArray);
for (const term of terms) {
  if (keywordSet.has(term)) { ... }
}
```

#### 6.1.5 Chained Array Iterations (`.filter().map()` → single pass)
**Files:**
- `src/app/api/projects/getProjectData/[slug]/route.ts:29`
- `src/app/api/projects/[id]/route.ts:91,107`
- `src/app/api/sitemap/route.ts:134`
- `src/helpers/pricingHelper.ts:67`

**Fix pattern:**
```typescript
// BEFORE
const result = items.filter(item => item.active).map(item => item.name);

// AFTER (single pass)
const result = items.reduce((acc, item) => {
  if (item.active) acc.push(item.name);
  return acc;
}, []);
```

#### 6.1.6 `await` Before Early-Return Guard
**Files:**
- `src/app/api/invoice/route.ts:289`
- `src/app/api/specTemplates/[id]/route.ts:61`
- `src/helpers/pricingHelper.ts:16`

**Fix pattern:**
```typescript
// BEFORE
const data = await fetchData();
if (!shouldProceed) return;

// AFTER
if (!shouldProceed) return;
const data = await fetchData();
```

### 6.2 Render & Bug Issues

#### 6.2.1 Missing `useEffect` Dependencies
**File:** `src/context/InvoiceContext.tsx:136,163`

**Fix:** Review the effect dependencies carefully:
- Line 136: Replace ref-based deps with proper callback ref pattern
- Line 163: Stabilize `debounceSaveInvoice` with `useCallback` or move inside effect

#### 6.2.2 Client Fetch for Server Data
**File:** `src/app/swagger/page.tsx:23`

**Options:**
1. (Preferred) If swagger-ui-react supports it, move to a server component
2. (Fallback) Use `next/dynamic` with `ssr: false` to avoid blocking render
3. Add a loading skeleton while swagger loads

#### 6.2.3 Missing Page Metadata
**File:** `src/app/swagger/page.tsx`

**Fix:** Add:
```typescript
export const metadata: Metadata = {
  title: "مستندات API | فراباک",
  description: "مستندات کامل API فروشگاه فراباک",
};
```

#### 6.2.4 Circular Imports
**Files:**
- `src/app/admin/branches/my/invoices/components/BranchInvoiceDetailsModal.tsx` ↔ `BranchWarrantyViewModal.tsx`
- `src/app/admin/branches/my/invoices/components/BranchInvoiceDetailsModal.tsx` ↔ `BranchWarrantyManagementModal.tsx`
- `src/app/admin/invoices/components/ui/AdminInvoiceDetailsModal.tsx` ↔ `WarrantyManagementModal.tsx`

**Fix:** Extract shared types/interfaces/utils into a third file that both import from.

#### 6.2.5 Buttons Missing Explicit Type
**Files:**
- `src/components/BlogFaqAccordion.tsx:113`
- `src/app/components/ui/PrintButton.tsx:17`
- `src/components/FaqAccordion.tsx:86`

**Fix:** Add `type="button"` to prevent accidental form submission:
```tsx
<button type="button" onClick={...}>
```

#### 6.2.6 `dangerouslySetInnerHTML` XSS Risk
**File:** `src/components/BlogFaqAccordion.tsx:161`

**Fix:** Use DOMPurify or a similar sanitizer:
```bash
npm install isomorphic-dompurify
```
```typescript
import DOMPurify from "isomorphic-dompurify";

<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content) }} />
```

### 6.3 Maintainability & Code Quality

#### 6.3.1 Giant Component (InvoiceProvider — 323 lines)
**File:** `src/context/InvoiceContext.tsx`

**Fix:** Split into smaller files:
- `src/context/InvoiceContext.tsx` — just the context creation + types
- `src/context/InvoiceProvider.tsx` — the provider component
- `src/context/useInvoice.ts` — the consumer hook

#### 6.3.2 Delete Unused Files
```text
src/app/(main)/products/_components/CategoryGrid.tsx
src/app/_components/mdx/Headings.tsx
src/app/_components/mdx/Image.tsx
src/app/_components/mdx/Link.tsx
src/app/_components/mdx/Lists.tsx
src/app/_components/mdx/Paragraph.tsx
src/app/_components/mdx/Section.tsx
src/app/_components/mdx/index.ts
src/app/_components/ui/BlogSkeleton.tsx
src/app/admin/branches/my/components/WarrantyRequests.tsx
src/app/admin/pages/componets/ui/newPage/NewFaq.tsx
src/app/admin/products/categories/components/SortableHeader.tsx
src/app/admin/products/categories/components/TextBlogEditor.tsx
src/app/admin/products/components/ConfirmationModal.tsx
src/app/admin/products/components/Modal.tsx
src/app/admin/products/helper/formatPrice.ts
```

#### 6.3.3 Remove Unused Exports
```text
src/context/InvoiceContext.tsx — `InvoiceContext` (only `InvoiceContext.Provider` used)
src/helpers/invoiceHandlers.ts — `checkUserInvoice`
src/helpers/pricingHelper.ts — `getPriceRangeForSchema`
src/utils/invoiceJwt.ts — `storeInvoiceCookie`, `getInvoiceCookie`, `deleteInvoiceCookie`, `setClientInvoiceCookie`, `getClientInvoiceCookie`
src/utils/jalaliDate.ts — `getCurrentJalaliDateTime`, `gregorianToJalali`
```

#### 6.3.4 Remove Unused Dependencies
From `package.json`:
```json
"dependencies": {
  "@persian-tools/persian-tools": "...",   // unused
  "@tiptap/extension-underline": "...",    // unused
  "class-variance-authority": "...",        // unused
  "npm-check": "...",                       // unused
  "pg": "..."                               // unused (Prisma manages PG)
}
"devDependencies": {
  "baseline-browser-mapping": "..."         // unused
}
```

**Note:** `sharp` is detected as unused by react-doctor but is actually used by Next.js for image optimization. **Do NOT remove it.**

#### 6.3.5 Remove Redundant Manual Memoization
**File:** `src/hooks/useInvoiceCookie.ts:17,50,86`

Since React Compiler is enabled, `useCallback` is redundant:
```typescript
// BEFORE
const saveInvoiceToCookie = useCallback(async (...) => { ... }, []);

// AFTER (React Compiler handles it)
const saveInvoiceToCookie = async (...) => { ... };
```

### 6.4 UI States Implementation (Persian)

#### 6.4.1 Add `loading.tsx` Files
Create `loading.tsx` for every route segment that lacks one. These show skeleton loaders.

**Routes needing `loading.tsx`:**
```text
src/app/(main)/loading.tsx                    # Homepage loading
src/app/(main)/products/loading.tsx            # Products listing loading
src/app/(main)/products/[category]/loading.tsx # Category page loading
src/app/(main)/products/[category]/[subcategory]/loading.tsx
src/app/(main)/products/[category]/[subcategory]/[product]/loading.tsx
src/app/(main)/dashboard/loading.tsx           # Dashboard loading
src/app/auth/login/loading.tsx                 # Auth page loading
src/app/auth/signup/loading.tsx
src/app/admin/loading.tsx                      # Admin loading
```

**Pattern for `loading.tsx`:**
```tsx
export default function Loading() {
  return (
    <div className="animate-pulse space-y-4 p-4">
      {/* Match the shape of the actual page content */}
      <div className="h-8 w-48 rounded bg-gray-200" />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-64 rounded-lg bg-gray-200" />
        ))}
      </div>
    </div>
  );
}
```

#### 6.4.2 Add `error.tsx` Files
Routes needing `error.tsx`:
```text
src/app/(main)/error.tsx
src/app/(main)/products/error.tsx
src/app/admin/error.tsx
src/app/auth/error.tsx
```

**Pattern for `error.tsx`:**
```tsx
"use client";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <p className="mb-4 text-lg text-red-500">خطا در دریافت اطلاعات</p>
      <p className="mb-6 text-sm text-gray-500">{error.message}</p>
      <button
        onClick={reset}
        className="rounded-lg bg-blue-500 px-6 py-2 text-white hover:bg-blue-600"
      >
        تلاش مجدد
      </button>
    </div>
  );
}
```

#### 6.4.3 Add Empty State Components
Create reusable empty state component:
```tsx
// src/components/ui/EmptyState.tsx
interface EmptyStateProps {
  message?: string; // default: "آیتمی یافت نشد"
  icon?: React.ReactNode;
}

export function EmptyState({ message = "آیتمی یافت نشد", icon }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center text-gray-400">
      {icon}
      <p className="mt-4 text-lg">{message}</p>
    </div>
  );
}
```

**Components to add `EmptyState` to:**
- Product listing pages (when search/filter returns nothing)
- Admin tables (when no records exist)
- Dashboard invoice list
- Blog/Faq accordion sections
- Category sliders (empty categories)

#### 6.4.4 Wrap Data-Fetching Sections in `<Suspense>`
**Components that need `<Suspense>` boundaries:**
- `CategorySlider` — already has `<Suspense fallback={<SkeletonLoader />}>`
- Product grid on homepage — already using `next/dynamic`
- Product listing pages — wrap fetch results
- Dashboard sections — wrap each data section
- Admin panel sections — wrap table data areas

**Pattern:**
```tsx
import { Suspense } from "react";
import { SkeletonLoader } from "@/app/_components/ui/SkeletonLoader";

export default function Page() {
  return (
    <div>
      <h1>عنوان صفحه</h1>
      <Suspense fallback={<SkeletonLoader amount={4} />}>
        <ProductListSection />
      </Suspense>
    </div>
  );
}
```

### 6.5 Apply Best Practices from Skills

After installing skills, load and follow guidance from:
1. `vercel-react-best-practices` — 69 performance rules across 8 categories
2. `next-best-practices` — App Router file conventions, RSC boundaries
3. `next-cache-components` — PPR, `use cache`, `cacheLife`, `cacheTag`
4. `vercel-composition-patterns` — Component architecture
5. `web-design-guidelines` — UI correctness patterns

**Areas to specifically check:**
- Server/Client component boundaries are correct
- `generateMetadata()` is used for SEO on all public pages
- Data fetching uses proper caching strategies (ISR vs dynamic)
- No data waterfalls in page components
- All interactive elements have proper ARIA attributes

---

## 7. Phase 5 — Write & Run Tests

### 7.1 Install Vitest for Unit Tests

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
```

Add to `package.json` scripts:
```json
"test": "vitest run",
"test:watch": "vitest"
```

Create `vitest.config.ts`:
```typescript
import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "jsdom",
    setupFiles: "./src/test/setup.ts",
    globals: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
```

Create `src/test/setup.ts`:
```typescript
import "@testing-library/jest-dom";
```

### 7.2 Unit Tests (Vitest)

#### 7.2.1 Hooks

**File:** `src/hooks/useInvoiceCookie.test.ts`
```typescript
import { renderHook, act } from "@testing-library/react";
// Mock fetch globally
// Test: saveInvoiceToCookie sends correct request
// Test: saveInvoiceToCookie handles API error
// Test: getInvoiceFromCookie returns invoice data
// Test: deleteInvoiceCookie sends delete request
// Test: error state is cleared on retry
// Test: loading state is correct during fetch
```

**File:** `src/hooks/useUser.test.ts` (if exists)
```typescript
// Test: returns user data after successful profile fetch
// Test: returns null user when not authenticated
// Test: logout clears user state
```

#### 7.2.2 Context

**File:** `src/context/InvoiceContext.test.tsx`
```typescript
import { render, screen, fireEvent } from "@testing-library/react";
// Test: addProductToInvoice adds product
// Test: removeProductFromInvoice removes product
// Test: updateProductQuantity updates quantity
// Test: getProductQuantity returns correct qty
// Test: clearInvoice clears all products
// Test: TotalAmount is calculated correctly (with and without discount)
```

#### 7.2.3 Helpers

**File:** `src/helpers/pricingHelper.test.ts`
```typescript
// Test: getPriceWithDiscount calculation
// Test: getPriceForSchema function
// Test: getPriceRangeForSchema (if not removed)
// Test: edge cases (zero quantity, negative discount)
```

**File:** `src/helpers/invoiceHandlers.test.ts`
```typescript
// Test: checkUserInvoice logic
// Test: invoice total calculation
```

#### 7.2.4 Utility Functions

**File:** `src/utils/jalaliDate.test.ts`
```typescript
// Test: getCurrentJalaliDateTime format
// Test: gregorianToJalali conversion (if not removed)
// Test: Persian date formatting
```

**File:** `src/utils/invoiceJwt.test.ts`
```typescript
// Test: invoice data encryption/decryption
// Test: jwt creation and verification
```

### 7.3 E2E Tests (Cypress) — Enhanced

#### 7.3.1 Enhance Existing Tests

**File:** `cypress/e2e/userInvoice.cy.ts`
- Add error state test (mock API failure → verify Persian error message)
- Add empty state test (visit invoice with no products → verify empty message)
- Add loading state test (verify skeleton appears while data loads)
- Test invoice with discount products
- Test quantity update boundary (min/max)

**File:** `cypress/e2e/productEntry.cy.ts`
- Add validation error tests (empty fields → Persian error messages)
- Add duplicate product test
- Add image upload error handling

**File:** `cypress/e2e/productEdit.cy.ts`
- Test saving with invalid data
- Test concurrent edits conflict

**File:** `cypress/e2e/CategoryAndSubCategory.cy.ts`
- Test empty category (no products → Persian empty state)
- Test category with many products
- Test navigation depth

#### 7.3.2 New E2E Tests

**File:** `cypress/e2e/auth.cy.ts`
```typescript
// Test: login with valid credentials
// Test: login with invalid credentials → Persian error
// Test: signup form validation
// Test: protected route redirect when not logged in
// Test: logout
```

**File:** `cypress/e2e/aboutUs.cy.ts`
```typescript
// Test: about us page renders
// Test: members section loads
// Test: projects list loads
// Test: activity timeline renders
```

**File:** `cypress/e2e/contactUs.cy.ts`
```typescript
// Test: contact form renders all fields
// Test: form validation (empty fields → Persian error)
// Test: successful submission → Persian success toast
// Test: API failure → Persian error message with retry
```

**File:** `cypress/e2e/invoiceFlow.cy.ts`
```typescript
// Test: full flow: browse → add to invoice → view invoice → clear invoice
// Test: multiple products in invoice
// Test: quantity adjustments
// Test: invoice persists across page navigation
// Test: invoice syncs across tabs
```

### 7.4 Test Data Strategy

**Rule:** All tests that write to the database MUST clean up after themselves.

**Pattern for Cypress tests:**
```typescript
describe("Feature", () => {
  const TEST_MARKER = `__test_${Date.now()}`;

  before(() => {
    // Create test data via API
    cy.request("POST", "/api/test/setup", { marker: TEST_MARKER });
  });

  after(() => {
    // Clean up test data via API
    cy.request("DELETE", "/api/test/teardown", { marker: TEST_MARKER });
  });

  it("should work correctly", () => { ... });
});
```

**Pattern for Vitest tests:**
```typescript
import { prisma } from "@/lib/prisma";

const TEST_MARKER = `__test_${crypto.randomUUID()}`;

beforeAll(async () => {
  // Create test record
  await prisma.product.create({
    data: { /* ... */ name: `Test Product ${TEST_MARKER}` },
  });
});

afterAll(async () => {
  // Delete test record
  await prisma.product.deleteMany({
    where: { name: { contains: TEST_MARKER } },
  });
  await prisma.$disconnect();
});
```

### 7.5 Run Tests

```bash
# Vitest (unit)
npm test

# Cypress (E2E — interactive)
npx cypress open

# Cypress (E2E — headless)
npx cypress run

# All tests
npm test && npx cypress run
```

---

## 8. Phase 6 — Final Verification

### 8.1 Lint Check
```powershell
npm run lint
```
Must pass with zero errors. Fix any remaining issues.

### 8.2 TypeScript Check
```powershell
npx tsc --noEmit
```
Must pass with zero errors.

### 8.3 Build Check
```powershell
npm run build
```
Must succeed. Verify no build warnings.

### 8.4 Re-run React Doctor
```powershell
npx react-doctor . --verbose
```
Target score: **70+ / 100** (from baseline of 49).

### 8.5 Re-run All Tests
```powershell
npm test && npx cypress run
```
100% pass rate.

### 8.6 Manual Verification Checklist
- [ ] Homepage loads with sliders, products showcase, projects, support sections
- [ ] Product categories render correctly in slider
- [ ] Product drill-down works (category → subcategory → product)
- [ ] Add to invoice flow works end-to-end
- [ ] User login/logout works
- [ ] Dashboard loads with user invoice data
- [ ] Admin panel CRUD operations work (products, branches, invoices, warehouses)
- [ ] Contact form submits correctly
- [ ] About/members/projects pages render
- [ ] API docs (swagger) loads
- [ ] All Persian error/empty states display correctly
- [ ] All loading skeletons display and then resolve
- [ ] No console errors in dev or production mode

### 8.7 Final Commit
```powershell
git add -A
git commit -m "feat: performance optimization sprint

- Install 10 skills.sh skills for AI-assisted development
- Add AGENTS.md and DESIGN.md documentation
- Fix React Compiler blocks in useInvoiceCookie
- Fix sequential awaits (Promise.all) across API routes
- Fix array includes → Set in product search
- Fix chained array iterations (filter+map → reduce)
- Fix early-return await ordering
- Add loading.tsx and error.tsx files for all route segments
- Add Persian empty/error/loading/success UI states
- Add Suspense boundaries for data-fetching sections
- Split InvoiceContext into manageable files
- Add Vitest unit tests for hooks, context, helpers
- Enhance Cypress E2E test coverage
- Remove unused files, exports, dependencies
- Fix circular imports in invoice modals
- Fix button types and XSS sanitization"
```

---

## Appendix A — Persian UI Strings

### Loading States
```typescript
"در حال بارگذاری..."          // Loading...
"لطفاً صبر کنید..."           // Please wait...
"در حال دریافت اطلاعات..."     // Fetching data...
"در حال ذخیره..."             // Saving...
"در حال پردازش..."            // Processing...
"در حال بروزرسانی..."          // Updating...
```

### Empty States
```typescript
"آیتمی یافت نشد"                              // No items found
"محصولی یافت نشد"                              // No products found
"داده‌ای برای نمایش وجود ندارد"                 // No data to display
"هنوز هیچ آیتمی اضافه نشده است"                 // No items added yet
"نتیجه‌ای برای جستجوی شما یافت نشد"             // No search results found
"سبد خرید شما خالی است"                        // Your cart is empty
"هیچ فاکتوری ثبت نشده است"                     // No invoices created
"هیچ دسته‌بندی وجود ندارد"                     // No categories available
```

### Error States
```typescript
"خطا در دریافت اطلاعات"                         // Error fetching data
"خطا در برقراری ارتباط با سرور"                 // Connection error
"خطا در ذخیره اطلاعات"                         // Error saving data
"عملیات با خطا مواجه شد"                       // Operation failed
"خطا در آپلود فایل"                            // File upload error
"اطلاعات نامعتبر است"                           // Invalid data
"دوباره تلاش کنید"                              // Try again
"تلاش مجدد"                                     // Retry
"خطا: "                                         // Error prefix
```

### Success States
```typescript
"عملیات با موفقیت انجام شد"                     // Operation successful
"اطلاعات با موفقیت ذخیره شد"                   // Data saved successfully
"محصول با موفقیت به فاکتور اضافه شد"            // Product added to invoice
"فاکتور با موفقیت ثبت شد"                      // Invoice saved successfully
"تغییرات با موفقیت اعمال شد"                   // Changes applied successfully
"پیام شما با موفقیت ارسال شد"                  // Message sent successfully
"با موفقیت حذف شد"                             // Deleted successfully
"وارد شدید"                                     // Logged in
"خروج موفق"                                     // Logged out
```

---

## Appendix B — Suspense & Loading Patterns

### Pattern 1: Route-Level Loading (`loading.tsx`)
```tsx
// src/app/(main)/products/loading.tsx
export default function ProductsLoading() {
  return (
    <div className="animate-pulse space-y-6 p-4" role="status" aria-label="در حال بارگذاری">
      {/* Category slider skeleton */}
      <div className="flex gap-4 overflow-hidden">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-40 w-64 flex-shrink-0 rounded-xl bg-gray-200" />
        ))}
      </div>
      {/* Product grid skeleton */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="space-y-3 rounded-lg bg-gray-100 p-4">
            <div className="h-48 w-full rounded-md bg-gray-200" />
            <div className="h-4 w-3/4 rounded bg-gray-200" />
            <div className="h-4 w-1/2 rounded bg-gray-200" />
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Pattern 2: URL Query Param Loading
For pages that use search params or filter states, use `useNavigation`-aware loading.

### Pattern 3: Section-Level Suspense
For client components that fetch data:
```tsx
import { Suspense } from "react";

function UserInvoices() {
  return (
    <div>
      <h2 className="text-xl font-bold">فاکتورهای من</h2>
      <Suspense fallback={<InvoiceListSkeleton />}>
        <InvoiceList />
      </Suspense>
    </div>
  );
}
```

### Pattern 4: Existing `SkeletonLoader` Component
Reuse `src/app/_components/ui/SkeletonLoader.tsx` with `amount` prop:
```tsx
import SkeletonLoader from "@/app/_components/ui/SkeletonLoader";

<Suspense fallback={<SkeletonLoader amount={8} />}>
  <CategorySlider />
</Suspense>
```

---

## Appendix C — Design System Reference

### CSS Variables (`src/app/globals.css:20-27`)
```css
--primary-color: #00bfff;
--secondary-color: #318ce7;
--third-color: #1e90ff;
--fourth-color: #0e6aff;
--dark-blue-color: #003262;
--font-iran-yekan: "IranYekan", sans-serif;
```

### Tailwind Config (`tailwind.config.ts`)
```typescript
breakpoints: { mobile: "577px", "2xl": "1400px" }
animations: { "fade-in": { "0%": { opacity: 0, transform: "scale(0.95)" }, "100%": { opacity: 1, transform: "scale(1)" } } }
plugins: [typography]
```

### Global CSS Utilities (`src/app/globals.css`)
- `.glass-card` — backdrop-blur, semi-transparent background
- `.input-field` — standard text input
- `.textarea-field` — multi-line input
- `.file-input` — file upload input
- `.prose-view` — blog content styling (TipTap output)
- `.scrollbar-hide` — hide scrollbar
- `.responsive-table-wrapper` — horizontal scroll for tables on mobile

### Custom Font (`src/app/layout.tsx:13-20`)
```typescript
const iranYekanFont = localFont({
  src: "./fonts/IRANYekanXVF.woff",
  variable: "--font-iran-yekan",
  weight: "100 1000",
  display: "swap",
  preload: true,
  fallback: ["system-ui", "arial"],
});
```

---

## Appendix D — Testing Patterns & Conventions

### Cypress Test Structure
```typescript
describe("Feature Name", () => {
  const TEST_MARKER = `__test_${Date.now()}`;
  const baseUrl = "http://localhost:3000";

  before(() => {
    cy.request("POST", "/api/test/setup", { marker: TEST_MARKER });
  });

  after(() => {
    cy.request("DELETE", "/api/test/teardown", { marker: TEST_MARKER });
  });

  beforeEach(() => {
    cy.visit(baseUrl);
  });

  it("should show loading state initially", () => {
    cy.get('[aria-label="در حال بارگذاری"]').should("be.visible");
  });

  it("should show empty state when no data", () => {
    cy.contains("آیتمی یافت نشد").should("be.visible");
  });

  it("should show error state on API failure", () => {
    cy.intercept("GET", "/api/endpoint", { statusCode: 500 });
    cy.contains("خطا در دریافت اطلاعات").should("be.visible");
    cy.contains("تلاش مجدد").should("be.visible").click();
  });

  it("should show data on success", () => {
    // ... assert data renders correctly
  });

  it("should handle success action", () => {
    // ... perform action, assert toast
    cy.contains("عملیات با موفقیت انجام شد").should("be.visible");
  });
});
```

### Vitest Test Structure
```typescript
import { describe, it, expect, vi, beforeAll, afterAll } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { prisma } from "@/lib/prisma";

const TEST_MARKER = `__test_${crypto.randomUUID()}`;

describe("useInvoiceCookie", () => {
  beforeAll(async () => {
    // Create test data
    await prisma.invoice.create({
      data: {
        // ... testMarker field
      },
    });
  });

  afterAll(async () => {
    // Clean up
    await prisma.invoice.deleteMany({
      where: { marker: TEST_MARKER },
    });
    await prisma.$disconnect();
  });

  it("should start with loading false", () => {
    const { result } = renderHook(() => useInvoiceCookie());
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("should set loading during save", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    });

    const { result } = renderHook(() => useInvoiceCookie());

    await act(async () => {
      await result.current.saveInvoiceToCookie({ ... });
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("should handle API error", async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error("Network error"));

    const { result } = renderHook(() => useInvoiceCookie());

    await act(async () => {
      await result.current.saveInvoiceToCookie({ ... });
    });

    expect(result.current.error).toBe("خطا در ذخیره اطلاعات");
    expect(result.current.isLoading).toBe(false);
  });
});
```

### Data Cleanup Convention
All tests that create database records MUST:
1. Use a unique marker (UUID or timestamp) in a dedicated field
2. Delete records matching that marker in `after()` / `afterAll()`
3. Prefer API-based cleanup over direct DB access where possible
4. Use `prisma.$transaction` for atomic cleanup when multiple related records are involved

---

## Execution Order Summary

```
Phase 0 (Snapshot)
  ├─ Read all relevant files
  ├─ Save baseline React Doctor report
  └─ Document current state

Phase 1 (Commit)
  └─ git add -A && git commit

Phase 2 (Skills) — STOP for user restart
  ├─ Add .gitignore entries
  ├─ Install 10 skills.sh skills
  └─ Verify with `npx skills list`

Phase 3 (Documentation)
  ├─ Run extract-design-system skill
  ├─ Create AGENTS.md
  └─ Create DESIGN.md

Phase 4 (Fixes)
  ├─ Performance issues (12 sub-tasks)
  ├─ Render/bug issues (6 sub-tasks)
  ├─ Maintainability (5 sub-tasks)
  ├─ UI states (loading.tsx, error.tsx, empty, Suspense)
  └─ Apply skills best practices

Phase 5 (Tests)
  ├─ Install Vitest
  ├─ Write unit tests (hooks, context, helpers, utils)
  ├─ Enhance Cypress E2E tests (existing + new)
  └─ Run all tests

Phase 6 (Verification)
  ├─ npm run lint
  ├─ npx tsc --noEmit
  ├─ npm run build
  ├─ npx react-doctor . --verbose (target: 70+)
  ├─ npm test && npx cypress run
  ├─ Manual verification checklist
  └─ Final commit
```
