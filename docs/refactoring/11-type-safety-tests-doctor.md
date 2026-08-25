# Phase 10: Type Safety, Test Coverage & React Doctor Violations

> **Priority:** Medium — long-term maintainability, bug prevention
> **Effort:** ~8-10 hours
> **Risk:** Low-Medium (type changes, test additions)
> **Dependencies:** Phases 7-9 complete

---

## Problem

Three tracked debt areas from Phase 6:

### 1. **133 `: any` occurrences** in production code (tsc clean but not ideal)

**Locations:** Dynamic Prisma query results, complex admin components, API route handlers

- `src/app/admin/branches/components/invoice/steps/WarrantyStep.tsx` — table render callbacks
- `src/app/admin/invoices/components/ui/WarrantyManagementModal.tsx` — mutate props
- `src/app/admin/branches/my/hooks/useInvoiceManagement.tsx` — hook return types
- `src/app/api/admin/invoices/route.ts` — Prisma raw query results
- `src/app/api/admin/branches/my/invoices/route.ts` — complex aggregations
- `src/app/(main)/products/_components/*.tsx` — product data mapping
- `src/utils/invoiceJwt.ts:27` — `new SignJWT(data as any)`

### 2. **Low branch coverage** in core lib tests

| Test File                              | Branch Coverage | Gap                                                             |
| -------------------------------------- | --------------- | --------------------------------------------------------------- |
| `src/lib/__tests__/validation.test.ts` | 30.76%          | `validateBody`/`validateParams` error paths                     |
| `src/lib/__tests__/auth.test.ts`       | 40%             | `verifyToken` error cases (expired, invalid signature, missing) |

### 3. **241 React Doctor violations** (Phase 6 audit)

**Top actionable violations:**
| Rule | Count | Severity | Fix Approach |
|------|-------|----------|--------------|
| `no-transition-all` | 111 | Performance | Replace `transition: all` with explicit properties |
| `server-sequential-independent-await` | 22 | Performance | Parallelize independent `await` with `Promise.all` |
| `no-loading-flag-reset-outside-finally` | 15 | Bug | Move `setLoading(false)` into `finally` block |
| `exhaustive-deps` | 4 | Bug | Add missing deps or stabilize with `useCallback` |
| `effect-needs-cleanup` | 4 | Bug | Return cleanup fn from `useEffect` |
| `no-create-object-url-without-revoke` | 8 | Bug | Call `URL.revokeObjectURL()` in cleanup |
| `no-fetch-response-used-without-status-check` | 10 | Bug | Check `response.ok` / status before parsing |
| `control-has-associated-label` | 5 | Accessibility | Associate `<label>` with input via `htmlFor` |
| `jsx-no-constructed-context-values` | 2 | Performance | Memoize context value with `useMemo` |

---

## Changes

### 1. Eliminate Remaining `any` Types (Target: < 20, all justified)

**Strategy per location:**

#### A. Prisma Dynamic Results → Generated Types

```ts
// Before: const result: any = await prisma.$queryRaw`...`
// After:
import { Prisma } from "@prisma/client";
type InvoiceWithWarranty = Prisma.InvoiceGetPayload<{
  include: { details: { include: { warranty: true } } };
}>;
const result: InvoiceWithWarranty[] = await prisma.$queryRaw<InvoiceWithWarranty[]>`...`;
```

#### B. Table Render Callbacks → Row Type

```tsx
// Before: render: (_: any, record: any) => ...
// After:
import type { AdminInvoice } from "@/types/invoice";
render: (_: unknown, record: AdminInvoice) => ...
```

#### C. Mutate/Action Props → Mutation Function Types

```ts
// Before: generateWarrantyMutate: any
// After:
import { UseMutationResult } from "@tanstack/react-query";
generateWarrantyMutate: UseMutationResult<WarrantyResponse, Error, WarrantyCreateInput>;
```

#### D. `invoiceJwt.ts` — `SignJWT` Payload

```ts
// Before: new SignJWT(data as any)
// After:
import type { JWTPayload } from "jose";
interface InvoiceJWTPayload extends JWTPayload {
  invoiceId: number;
  branchId: number;
}
new SignJWT(data as InvoiceJWTPayload);
```

#### E. Genuinely Unknown → `unknown` + Narrowing

```ts
// Before: catch (error: any)
// After:
catch (error: unknown) {
  const message = error instanceof Error ? error.message : "Unknown error";
}
```

**Rule:** No new `@ts-expect-error` unless third-party library genuinely lacks types. Document each.

---

### 2. Improve Test Branch Coverage

#### A. `validation.test.ts` — Target: ≥ 80% branches

**Add tests for:**

- `validateBody(schema, invalidBody)` → returns `errorResponse` with `issues` array
- `validateBody(schema, null)` → handles gracefully
- `validateParams(schema, { id: "not-a-number" })` → Zod coercion failure
- `validateParams(schema, {})` → missing required params
- Edge cases: empty arrays, optional fields, nested objects

#### B. `auth.test.ts` — Target: ≥ 80% branches

**Add tests for `verifyToken`:**

- Valid token → returns payload
- Expired token → throws `TokenExpiredError`
- Invalid signature → throws `JWSSignatureVerificationFailed`
- Malformed token → throws `JWTMalformed`
- Missing token → throws `JWTMissing`
- Wrong audience/issuer → throws appropriate error
- `requireAuth` with valid/invalid/expired/missing cookies

**Use `jose` test utilities** — `SignJWT` with controlled exp/claims.

#### C. General Test Quality

- Remove over-mocking (e.g., don't mock `prisma` if integration test is feasible)
- Test real behavior: API routes hit real handlers, components render with real context
- Add integration tests for critical flows: login → protected route, create invoice → warranty

---

### 3. Fix React Doctor Violations

**Load skills:** `react-doctor`, `vercel-react-best-practices`, `systematic-debugging`

#### A. `no-transition-all` (111) — **Highest Impact**

**Find:** `rg -rn "transition:\s*all" src --glob "*.css" --glob "*.tsx"`
**Fix:** Replace with explicit properties:

```css
/* Before */
.btn {
  transition: all 0.2s;
}
/* After */
.btn {
  transition:
    background-color 0.2s,
    border-color 0.2s,
    color 0.2s,
    box-shadow 0.2s;
}
```

**Tailwind v4:** Use `transition-colors`, `transition-shadow`, `transition-transform` utilities instead.

#### B. `server-sequential-independent-await` (22)

**Find in API routes:** `rg -rn "await.*\nawait" src/app/api --glob "*.ts"`
**Fix:** Parallelize independent queries:

```ts
// Before:
const user = await getUser(id);
const settings = await getSettings(id);
// After:
const [user, settings] = await Promise.all([getUser(id), getSettings(id)]);
```

#### C. `no-loading-flag-reset-outside-finally` (15)

**Pattern:** `setLoading(true); try { ... } catch { setLoading(false); } setLoading(false);`
**Fix:** Move all `setLoading(false)` into `finally { }` block.

#### D. `exhaustive-deps` (4) + `effect-needs-cleanup` (4)

**Fix per systematic-debugging:** Add deps / add cleanup / use `useCallback` / split effects.

#### E. `no-create-object-url-without-revoke` (8)

**Find:** `URL.createObjectURL`
**Fix:**

```ts
const url = URL.createObjectURL(blob);
useEffect(() => () => URL.revokeObjectURL(url), []);
```

#### F. `no-fetch-response-used-without-status-check` (10)

**Fix:** Check `response.ok` or `status < 400` before `.json()`.

#### G. Accessibility (5 `control-has-associated-label`, etc.)

**Fix:** Ensure every `<input>` has `<label htmlFor="id">` or wrapping `<label>`.

#### H. `jsx-no-constructed-context-values` (2)

**Fix:** Wrap context value in `useMemo`:

```tsx
const value = useMemo(() => ({ user, login, logout }), [user]);
```

---

### 4. Clean Up Stale React Doctor Suppressions

**Current `doctor.config.mjs`** has 24 suppressions for rules that no longer fire.
**Action:** Remove all suppressions where rule doesn't appear in current scan. Keep only if:

- Rule fires and is architecturally justified (document why)
- Rule is deprecated/renamed (update to new name)

**Result:** Minimal, accurate `doctor.config.mjs` matching current codebase.

---

## Verification Checklist

- [ ] `npx tsc --noEmit` passes
- [ ] `npm test` passes (≥ 908 tests, branch coverage: validation ≥ 80%, auth ≥ 80%)
- [ ] `rg -n ": any\b" src --glob "*.ts" --glob "*.tsx" | rg -v "__tests__|\.test\.|\.spec\." | wc -l` → **< 20** (all with justification comments)
- [ ] `npm run build` succeeds
- [ ] `npx react-doctor .` — violations reduced from 241 (target: < 50, all documented)
- [ ] `no-transition-all` → **0** (replaced with explicit/Tailwind)
- [ ] `server-sequential-independent-await` → **0** (parallelized)
- [ ] `no-loading-flag-reset-outside-finally` → **0** (moved to finally)
- [ ] `doctor.config.mjs` — only suppressions for currently-firing rules with accurate comments
- [ ] No regressions in admin flows, auth, product/invoice management

---

## Skills to Apply

- **`tdd`** — write failing tests for auth/validation error cases first, then implement
- **`systematic-debugging`** — for each React Doctor violation, find root cause before fixing
- **`react-doctor`** — run after changes, validate violation reduction
- **`vercel-react-best-practices`** — `Promise.all`, `useMemo`/`useCallback`, `finally` patterns
- **`next-best-practices`** — API route error handling, type-safe Prisma
- **`improve-codebase-architecture`** — identify where `any` indicates missing abstraction
