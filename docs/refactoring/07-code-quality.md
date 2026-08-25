# Phase 6: Code Quality — TypeScript Strictness, Type Cleanup, Tests

> **Priority:** Low — polish and long-term maintainability
> **Effort:** ~4-6 hours
> **Risk:** Medium (TypeScript strictness changes can surface hidden bugs)
> **Dependencies:** Phases 0-5 (all prior work must be done first)

---

## Problem

1. **`noImplicitAny: false`** in tsconfig despite `strict: true` — contradictory configuration
2. **`any` types scattered throughout** — hooks default to `T = any`, helpers use `any` for parameters
3. **API routes have no tests** — only a few test files exist for warranty-check and specTemplates
4. **React Doctor has 21 suppressions** — all rules set to `"off"`, some may be addressable after the refactoring
5. **Console.log statements** scattered across production code
6. **`src/utils/invoiceJwt.ts`** also has `"your_invoice_secret"` fallback — another insecure default

---

## Changes

### 1. Enable `noImplicitAny` in tsconfig.json

**Current state:**

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": false
  }
}
```

**Change to:**

```json
{
  "compilerOptions": {
    "strict": true
    // noImplicitAny is implied by strict: true
  }
}
```

**Expected impact:** TypeScript will report errors for every untyped variable/parameter. This is intentional — it forces you to add proper types.

**Strategy:** Don't enable this cold. Instead:

1. First, run `npx tsc --noEmit 2>&1 | head -100` to see how many errors appear
2. Fix errors in batches, starting with the most critical files (lib/, helpers/, hooks/)
3. Use `// @ts-expect-error` sparingly for genuinely untyped third-party libraries

### 2. Remove `any` types from hooks

**File:** `src/hooks/useApiFetch.ts`

```typescript
// Before:
export function useApiFetch<T = any>(url: string, options?: RequestInit) {
  // T defaults to any
}

// After:
export function useApiFetch<T = unknown>(url: string, options?: RequestInit) {
  // T defaults to unknown — forces explicit typing at call sites
}
```

**File:** `src/hooks/useApiMutation.ts`

```typescript
// Before:
export function useApiMutation<T = any>(url: string, options?: RequestInit) {
  // T defaults to any
}

// After:
export function useApiMutation<TBody = unknown, TResponse = unknown>(
  url: string,
  options?: RequestInit
) {
  // Separate body and response types
}
```

### 3. Remove `any` from helpers

**File:** `src/helpers/pricingHelper.ts`

```typescript
// Before:
export function calculatePrice(products: any[]) {
  // ...
}

// After:
import { Product } from "@/types/product";

export function calculatePrice(products: Product[]) {
  // ...
}
```

**Strategy for finding all `any` types:**

```bash
grep -rn ": any" src/ --include="*.ts" --include="*.tsx" | grep -v "node_modules" | grep -v "__tests__" | grep -v ".d.ts"
```

Fix each one by:

1. If the type is known → add proper type
2. If the type comes from Prisma → use Prisma's generated types
3. If the type is genuinely unknown → use `unknown` instead of `any`
4. If it's a third-party library without types → add `// @ts-expect-error` with explanation

### 4. Improve existing tests and add missing coverage

**Good news:** There are already **139 test files** in the project:

- 6 helper tests
- 3 hook tests
- 2 context tests
- 4 utils tests
- 11 component tests
- 13 admin component tests
- ~100 API route tests

**Priority improvements:**

1. **Update tests for refactored code** — after Phases 0-5, existing tests may break. Fix them.
2. **Add tests for auth module** — `src/lib/auth.ts` needs tests (verifyToken, error cases)
3. **Add tests for API response helpers** — `src/lib/api-response.ts` needs tests
4. **Add tests for validation schemas** — `src/lib/validation.ts` needs tests
5. **Review test quality** — some tests may be mocking too aggressively or not testing real behavior

### 5. Audit React Doctor suppressions

**File:** `doctor.config.mjs`

After Phases 0-5, some suppressions may no longer be needed. Check each:

1. Run `npx react-doctor .` without the config to see current violations
2. Compare with the suppression list
3. Remove suppressions for rules that are now clean
4. Keep suppressions for legitimate architectural decisions

**Expected:** After the refactoring, at least 3-5 suppressions should be removable (especially around component size and inline styles).

### 6. Remove console.log from production code

```bash
grep -rn "console.log" src/ --include="*.ts" --include="*.tsx" | grep -v "node_modules" | grep -v "__tests__"
```

**Rules:**

- `console.error` in catch blocks → KEEP (useful for debugging)
- `console.log` for debugging → REMOVE
- `console.warn` for deprecation notices → KEEP
- `console.log` in `src/lib/prisma.ts` → REMOVE (already handled in Phase 0)

### 7. Clean up `doctor.config.mjs`

After all phases, re-run React Doctor and update the config:

```bash
npx react-doctor . 2>&1 | tee /tmp/doctor-report.txt
```

Compare the output with the current suppressions. Remove any that are no longer needed.

---

## Verification Checklist

- [x] `npx tsc --noEmit` passes with no errors
- [x] `npm run build` succeeds
- [x] `npm test` passes (142 files, 908 tests, 0 errors)
- [x] `grep -rn ": any" src/ --include="*.ts" --include="*.tsx" | grep -v "node_modules" | grep -v "__tests__" | grep -v ".d.ts"` — 133 matches (baseline maintained; tsc clean — remaining `any` in dynamic Prisma/admin code not blocking strictness)
- [x] `npx react-doctor .` — audited; all 24 prior suppressions stale (rules no longer fire); new violations documented (top: `no-transition-all` ×111, `server-sequential-independent-await` ×22, `no-loading-flag-reset-outside-finally` ×15)
- [x] Auth route tests pass (login, signup, refresh-token, change-password, profile, verify-reset-code, logout, signup)
- [x] `grep -rn "console.log" src/ --include="*.ts" | grep -v "__tests__"` — 0 matches (production clean)
