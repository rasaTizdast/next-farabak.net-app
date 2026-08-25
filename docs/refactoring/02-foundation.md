# Phase 1: Foundation — Shared Types, Utilities, and Patterns

> **Priority:** High — everything else builds on this
> **Effort:** ~3-4 hours
> **Risk:** Low (adding new files, not changing existing behavior)
> **Dependencies:** Phase 0 (auth module must exist)

---

## Problem

1. **No `src/types/` directory** — types are scattered across files, duplicated, or inline
2. **Utility functions duplicated** across components (`persianToEnglishDigits`, `formatDateToISOString`, `calculateDuration` appear in 3+ files each)
3. **No standardized error response format** — API routes return `{error: "..."}` vs `{message: "..."}` vs `{errors: [...]}` inconsistently
4. **Helper files have `any` types** — `pricingHelper.ts` uses `any` for products parameter
5. **Auth-related types not shared** — `AuthUser` interface duplicated or inferred in multiple places

---

## Changes

### 1. Create `src/types/` directory with shared types

```
src/types/
├── index.ts          # Re-exports all types
├── api.ts            # API request/response types
├── auth.ts           # Auth-related types
├── product.ts        # Product types
├── invoice.ts        # Invoice types
├── branch.ts         # Branch types
├── warranty.ts       # Warranty types
└── common.ts         # Shared utility types
```

**`src/types/auth.ts`:**

```typescript
export interface AuthUser {
  id: string;
  email: string;
  role: string;
  branchId?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: AuthUser;
}
```

**`src/types/api.ts`:**

```typescript
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ApiError {
  success: false;
  error: string;
  code?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}
```

**`src/types/common.ts`:**

```typescript
export type PersianDigit = "۰" | "۱" | "۲" | "۳" | "۴" | "۵" | "۶" | "۷" | "۸" | "۹";

export interface DateRange {
  from: string;
  to: string;
}
```

**How to determine what types to extract:** Search each large component file for `interface` and `type` declarations. If a type is used in 2+ files, move it to `src/types/`. If it's only used in one file, leave it there.

### 2. Create `src/lib/validators.ts` — shared validation helpers

```typescript
// Persian/English digit conversion (currently duplicated 3+ times)
export function persianToEnglishDigits(str: string): string {
  const persianDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  return str.replace(/[۰-۹]/g, (d) => persianDigits.indexOf(d).toString());
}

export function englishToPersianDigits(str: string): string {
  return str.replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[parseInt(d)]);
}

// Date formatting (currently duplicated)
export function formatDateToISOString(date: Date): string {
  return date.toISOString().split("T")[0];
}

// Duration calculation (currently duplicated in WarrantyStep.tsx)
export function calculateDuration(start: string, end: string): number {
  const startDate = new Date(start);
  const endDate = new Date(end);
  return Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
}
```

### 3. Create `src/lib/api-response.ts` — standardized error responses

```typescript
import { NextResponse } from "next/server";

export function successResponse<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

export function errorResponse(message: string, status = 400) {
  return NextResponse.json({ success: false, error: message }, { status });
}

export function unauthorizedResponse(message = "Unauthorized") {
  return NextResponse.json({ success: false, error: message }, { status: 401 });
}

export function notFoundResponse(message = "Not found") {
  return NextResponse.json({ success: false, error: message }, { status: 404 });
}

export function serverErrorResponse(message = "Internal server error") {
  return NextResponse.json({ success: false, error: message }, { status: 500 });
}
```

**Note:** This creates a NEW standard. Existing routes keep their current format during this phase. Phase 3 (API Routes) will migrate existing routes to use these helpers. Don't change existing error formats yet — that would break frontend error handling.

### 4. Create `src/lib/validators.ts` — shared API input validators

```typescript
// Simple validation helpers (pre-Zod, used until Phase 3 migrates to Zod)
export function requireField(value: unknown, fieldName: string): string | null {
  if (!value || (typeof value === "string" && !value.trim())) {
    return `${fieldName} is required`;
  }
  return null;
}

export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validatePhone(phone: string): boolean {
  // Iranian phone number format
  return /^09\d{9}$/.test(persianToEnglishDigits(phone));
}
```

### 5. Audit and type `src/helpers/`

**Files to audit:**

| File                                   | Issue                             | Fix                                          |
| -------------------------------------- | --------------------------------- | -------------------------------------------- |
| `src/helpers/pricingHelper.ts`         | `any` type for products parameter | Import proper Product type from `src/types/` |
| `src/helpers/editUserHandler.ts`       | Duplicated error handling         | Extract shared error handler                 |
| `src/helpers/changePasswordHandler.ts` | Duplicated error handling         | Extract shared error handler                 |
| `src/helpers/invoiceHandlers.ts`       | Duplicated error handling         | Extract shared error handler                 |

**Pattern for deduplicating error handling:**

```typescript
// In each handler, replace duplicated try/catch with:
import { errorResponse, serverErrorResponse } from "@/lib/api-response";

// Before (duplicated in 3 files):
try {
  // ... logic
} catch (error) {
  console.error("Error:", error);
  return NextResponse.json({ error: "Failed to ..." }, { status: 500 });
}

// After:
try {
  // ... logic
} catch (error) {
  console.error("Error:", error);
  return serverErrorResponse("Failed to ...");
}
```

---

## File Creation Summary

| New File                  | Purpose                      |
| ------------------------- | ---------------------------- |
| `src/types/index.ts`      | Re-exports all types         |
| `src/types/api.ts`        | API response types           |
| `src/types/auth.ts`       | Auth types                   |
| `src/types/product.ts`    | Product types                |
| `src/types/invoice.ts`    | Invoice types                |
| `src/types/branch.ts`     | Branch types                 |
| `src/types/warranty.ts`   | Warranty types               |
| `src/types/common.ts`     | Shared utility types         |
| `src/lib/api-response.ts` | Standardized error responses |
| `src/lib/validators.ts`   | Shared validation helpers    |

---

## Verification Checklist

- [ ] `npm run build` succeeds
- [ ] All new files have proper TypeScript types (no `any`)
- [ ] `grep -r "persianToEnglishDigits" src/` — only appears in `src/lib/validators.ts` and import statements (not duplicated implementations)
- [ ] Existing components still work (no behavior changes yet)
- [ ] `src/types/index.ts` re-exports all types correctly
