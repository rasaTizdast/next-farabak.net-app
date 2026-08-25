# Phase 9: Lint Baseline Cleanup — Fix 685+ Pre-existing Errors

> **Priority:** Medium — code health, CI/CD quality gate
> **Effort:** ~6-8 hours
> **Risk:** Low (automated fixes + targeted manual fixes)
> **Dependencies:** Phase 7 (Tailwind v4) complete — CSS changes may affect lint

---

## Problem

**685+ pre-existing lint errors** (Phase 4/5 debt) across categories:

| Category                            | Count | Description                                                                   |
| ----------------------------------- | ----- | ----------------------------------------------------------------------------- |
| `prettier/*`                        | ~300  | Formatting inconsistencies (quotes, semicolons, trailing commas, print width) |
| `import/order`                      | ~150  | Import sorting not matching config (external → internal → relative)           |
| `@typescript-eslint/no-unused-vars` | ~120  | Unused variables/parameters (often `_` prefix needed)                         |
| `react-hooks/exhaustive-deps`       | ~60   | Missing dependencies in `useEffect`/`useCallback`/`useMemo`                   |
| `react/no-unescaped-entities`       | ~30   | Unescaped `'` `"` `>` `<` in JSX text                                         |
| `jsx-a11y/*`                        | ~25   | Missing `alt`, `label`, `role`, `tabIndex`                                    |

**These were explicitly preserved during Phases 4-5** to avoid scope creep. Now dedicated cleanup phase.

---

## Changes

### 1. Automated Fixes (Run First)

```bash
# 1. Prettier — format all files
npm run format  # or: npx prettier --write "src/**/*.{ts,tsx,js,jsx,json,css,md}"

# 2. ESLint auto-fix (safe rules only)
npm run lint:fix  # or: npx eslint --fix "src/**/*.{ts,tsx}"

# 3. TypeScript unused vars — prefix with _ (manual review needed)
# npx eslint --fix --rule '@typescript-eslint/no-unused-vars: error' src/
```

**Expected resolution:** ~70-80% of errors (prettier, import/order, simple unused vars).

---

### 2. Manual Fixes by Category

#### A. `@typescript-eslint/no-unused-vars` (Remaining ~30-40)

**Strategy per occurrence:**

- **Function params** unused → prefix `_` (e.g., `(_err: Error) =>`)
- **Destructured imports** unused → remove from destructuring
- **Catch bindings** unused → `catch { }` (ES2019) or `catch (_) { }`
- **Intentional unused** (e.g., interface implementation) → `// eslint-disable-line @typescript-eslint/no-unused-vars` with comment

**Files to check:** Admin components with many props, hook return values, API route handlers.

#### B. `react-hooks/exhaustive-deps` (Remaining ~20-30)

**Strategy:**

- **Add missing deps** — if stable (primitive, `useMemo`/`useCallback` wrapped), add to array
- **Stabilize with `useMemo`/`useCallback`** — if object/function recreated each render
- **Use `eslint-disable-line` with justification** — only for legitimate patterns (e.g., `setState` in effect for URL sync, ref guards)
- **Refactor** — if effect does too much, split into multiple effects

**Common patterns in codebase:**

- Admin pages: `useEffect` with `fetch` + filter state → stabilize fetch with `useCallback`
- Form validation: `useEffect` syncing errors → use `useMemo` for error object
- Modal open/close: `useEffect` resetting form → keep deps minimal

#### C. `react/no-unescaped-entities` (~25)

**Fix:** Replace in JSX text:

- `'` → `&apos;` or `{\"'\"}`
- `"` → `"` or `{"\""}`
- `>` → `>`
- `<` → `<`

**Mostly in:** Persian text with quotes, error messages, tooltip content.

#### D. `jsx-a11y/*` (~20)

**Fix per rule:**

- `anchor-is-valid` — `<a>` without `href` → use `<button>` or add `href`
- `img-alt` — `<img>` without `alt` → add `alt=""` (decorative) or descriptive
- `label-has-associated-control` — `<label>` without `htmlFor`/`control` → fix association
- `no-noninteractive-element-interactions` — `<div onClick>` → use `<button role="button" tabIndex={0}>`
- `click-events-have-key-events` — `onClick` without `onKeyDown` → add keyboard handler

---

### 3. Configure ESLint for Future Prevention

**Update `.eslintrc` / `eslint.config.mjs`:**

```js
// Add to rules:
"prettier/prettier": "error",
"import/order": ["error", { "groups": ["external", "internal", "parent", "sibling", "index"] }],
"@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
"react-hooks/exhaustive-deps": "warn",  // warn to catch but not block
"react/no-unescaped-entities": "error",
"jsx-a11y/anchor-is-valid": "error",
"jsx-a11y/img-alt": "error",
"jsx-a11y/label-has-associated-control": "error",
```

**Add `lint:ci` script** that fails on warnings:

```json
"lint:ci": "eslint --max-warnings=0 src/"
```

---

### 4. Git Hooks (Optional but Recommended)

**Add `husky` + `lint-staged`:**

```bash
npm install -D husky lint-staged
npx husky install
npx husky add .husky/pre-commit "npx lint-staged"
```

**`package.json`:**

```json
"lint-staged": {
  "*.{ts,tsx}": ["eslint --fix", "prettier --write"],
  "*.{json,css,md}": ["prettier --write"]
}
```

---

### 5. Verify No Regressions

- `npm run build` succeeds
- `npm test` passes (142 files, 908 tests)
- `npx tsc --noEmit` passes
- Visual spot-check: admin forms, modals, tables still work

---

## Verification Checklist

> **Status: ✅ COMPLETE (2026-08-20)** — all items verified.

- [x] `npm run lint` → **0 errors, 0 warnings** (or only allowed warnings with justification comments)
- [x] `npm run format` → no changes (all files formatted)
- [x] `npm run build` succeeds
- [x] `npm test` passes (142 files, 908 tests)
- [x] `npx tsc --noEmit` passes
- [x] `grep -r "eslint-disable" src --include="*.ts" --include="*.tsx" | wc -l` — count disable comments (should be minimal, only for justified cases) — **34 across 31 files**, all justified
- [x] CI pipeline (if exists) runs `npm run lint:ci` and passes — `lint:ci` script added and green
- [x] Husky pre-commit hook installed and working (optional) — `.husky/pre-commit` → `npx lint-staged`

## Completion Notes (2026-08-20)

- Baseline was 1,697 lint messages, not the plan's ~685 estimate; resolved via `npm run format` + `npm run lint:fix` + subagent batch fixes + targeted manual fixes → **0 errors, 0 warnings**.
- ESLint uses `eslint-plugin-react-hooks` v7 (React Compiler–powered rules: `set-state-in-effect`, `static-components`, `purity`, `immutability`, `refs`, `incompatible-library`, `preserve-manual-memoization`); `eslint-plugin-react-compiler` is **not** installed, so stale `react-compiler/*` disable comments were removed.
- Fixed a pre-existing **infinite render loop** in `NewProductWizardContext.tsx` (unstable `actions` object in provider) that hung `NewProductModal.test.tsx`; fixed by memoizing `actions` on `[dispatch]` with a `stateRef` synced via `useEffect`.
- Fixed broken step mocks in `NewProductModal.test.tsx` (`vi.mock` paths resolved to nonexistent modules, so vitest silently ignored them).
- `husky`/`lint-staged` installed with `--legacy-peer-deps` (pre-existing `hamburger-react` peer conflict against React 19).

---

## Skills to Apply

- **`systematic-debugging`** — for each remaining error, identify root cause before fixing
- **`vercel-react-best-practices`** — exhaustive-deps fixes often reveal performance issues
- **`web-design-guidelines`** — a11y fixes improve accessibility
- **`next-best-practices`** — import order matches Next.js conventions
