# Phase 0: Security Fixes

> **Priority:** CRITICAL — do this first
> **Effort:** ~1-2 hours
> **Risk:** Low (changes are small and isolated)
> **Dependencies:** None

---

## Problem

1. **11 files use insecure JWT fallback** — `process.env.JWT_SECRET || "your_jwt_secret"`. If the env var is missing, the app silently uses an insecure default instead of failing.
2. **No shared `verifyToken` function** — each API route duplicates JWT verification logic (extract cookie, import jose, call jwtVerify, handle errors).
3. **Missing auth on some admin routes** — need to verify all `/api/admin/` routes have JWT checks.
4. **Separate PrismaClient instances** — 9 files create `new PrismaClient()` instead of using the shared singleton from `src/lib/prisma.ts`, causing connection pool exhaustion.
5. **Console.log in production** — `src/lib/prisma.ts` has debug logging that should be removed.

---

## Changes

### 1. Create shared auth module: `src/lib/auth.ts`

```typescript
import { jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("Missing JWT_SECRET environment variable");
}

const secret = new TextEncoder().encode(JWT_SECRET);

export interface AuthUser {
  id: string;
  email: string;
  role: string;
  branchId?: string;
}

export async function verifyToken(cookieHeader: string | null): Promise<AuthUser> {
  if (!cookieHeader) {
    throw new Error("No cookies provided");
  }

  const token = cookieHeader
    .split(";")
    .find((c) => c.trim().startsWith("token="))
    ?.split("=")[1];

  if (!token) {
    throw new Error("No token found");
  }

  const { payload } = await jwtVerify(token, secret);
  return payload as unknown as AuthUser;
}

export function getTokenFromCookie(cookieHeader: string | null): string | undefined {
  if (!cookieHeader) return undefined;
  return cookieHeader
    .split(";")
    .find((c) => c.trim().startsWith("token="))
    ?.split("=")[1];
}
```

**Key design decision:** The `if (!JWT_SECRET)` check at module level means the app will crash on startup if the env var is missing — this is intentional. It's better to fail loudly than silently use an insecure default.

### 2. Remove JWT fallbacks from all 11 files

**Files to change:**

| #   | File                                                | Change                                                                                  |
| --- | --------------------------------------------------- | --------------------------------------------------------------------------------------- |
| 1   | `src/proxy.ts`                                      | Replace local JWT_SECRET + verify logic with `import { verifyToken } from "@/lib/auth"` |
| 2   | `src/app/api/admin/branches/current/route.ts`       | Same                                                                                    |
| 3   | `src/app/api/admin/products/all/route.ts`           | Same                                                                                    |
| 4   | `src/app/api/admin/branches/check-product/route.ts` | Same                                                                                    |
| 5   | `src/app/api/admin/branches/my/route.ts`            | Same                                                                                    |
| 6   | `src/app/api/admin/branches/my/invoices/route.ts`   | Same                                                                                    |
| 7   | `src/app/api/auth/change-password/route.ts`         | Same                                                                                    |
| 8   | `src/app/api/auth/refresh-token/route.ts`           | Same                                                                                    |
| 9   | `src/app/api/auth/profile/route.ts`                 | Same                                                                                    |
| 10  | `src/app/api/auth/signup/route.ts`                  | Same                                                                                    |
| 11  | `src/app/api/auth/login/route.ts`                   | Same                                                                                    |

**Pattern for each file:**

Before:

```typescript
import { jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

// ... later in handler:
const token = cookieHeader?.split(";").find(...)
const { payload } = await jwtVerify(token, new TextEncoder().encode(JWT_SECRET));
```

After:

```typescript
import { verifyToken } from "@/lib/auth";

// ... in handler:
const user = await verifyToken(cookieHeader);
```

### 3. Add auth to 20 unprotected admin routes

**CRITICAL FINDING:** 20 out of 45 admin routes have **zero authentication**. Any unauthenticated user can access them.

**Routes needing auth added:**

| #   | File                                                                       | Risk                      |
| --- | -------------------------------------------------------------------------- | ------------------------- |
| 1   | `src/app/api/admin/branches/route.ts`                                      | Branch CRUD — full access |
| 2   | `src/app/api/admin/branches/[branchId]/route.ts`                           | Branch edit/delete        |
| 3   | `src/app/api/admin/branches/[branchId]/products/route.ts`                  | Branch products           |
| 4   | `src/app/api/admin/branches/[branchId]/products/[productId]/route.ts`      | Branch product CRUD       |
| 5   | `src/app/api/admin/branches/[branchId]/invoices/route.ts`                  | Branch invoices           |
| 6   | `src/app/api/admin/branches/product-quantity/[productId]/route.ts`         | Product quantity          |
| 7   | `src/app/api/admin/products/route.ts`                                      | Product CRUD              |
| 8   | `src/app/api/admin/products/filterData/route.ts`                           | Product filter data       |
| 9   | `src/app/api/admin/products/[productId]/amount-limits/route.ts`            | Amount limits             |
| 10  | `src/app/api/admin/warehouses/route.ts`                                    | Warehouse CRUD            |
| 11  | `src/app/api/admin/warehouses/[warehouseId]/route.ts`                      | Warehouse edit/delete     |
| 12  | `src/app/api/admin/warehouses/[warehouseId]/products/route.ts`             | Warehouse products        |
| 13  | `src/app/api/admin/warehouses/[warehouseId]/products/[productId]/route.ts` | Warehouse product CRUD    |
| 14  | `src/app/api/admin/warehouses/product-quantity/[productId]/route.ts`       | Product quantity          |
| 15  | `src/app/api/admin/invoices/[invoiceId]/route.ts`                          | Invoice edit/delete       |
| 16  | `src/app/api/admin/warranty/check/route.ts`                                | Warranty check            |
| 17  | `src/app/api/admin/faqs/route.ts`                                          | FAQ CRUD                  |
| 18  | `src/app/api/admin/faqs/[id]/route.ts`                                     | FAQ edit/delete           |
| 19  | `src/app/api/admin/pages/route.ts`                                         | Page management           |
| 20  | `src/app/api/admin/users/admins/route.ts`                                  | Admin user list           |

**For each route, add at the top of every handler:**

```typescript
import { verifyToken } from "@/lib/auth";

// At the start of GET/POST/PUT/DELETE handlers:
const cookieHeader = request.headers.get("cookie");
try {
  await verifyToken(cookieHeader);
} catch {
  return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
}
```

**The entire warehouses subtree is completely unprotected.**

### 4. Remove duplicate PrismaClient instances

**9 files create `new PrismaClient()`:**

| #   | File                                                          |
| --- | ------------------------------------------------------------- |
| 1   | `src/app/api/faqs/product/[id]/route.ts`                      |
| 2   | `src/app/api/admin/users/route.ts`                            |
| 3   | `src/app/api/blogs/manage/[blogId]/faqs/route.ts`             |
| 4   | `src/app/api/blogs/faqs/[faqId]/route.ts`                     |
| 5   | `src/app/api/blogs/[slug]/route.ts`                           |
| 6   | `src/app/api/blogs/[slug]/faqs/route.ts`                      |
| 7   | `src/app/api/productOverviewDetails/delete/[id]/route.ts`     |
| 8   | `src/app/api/productOverviewDetails/checkUsage/[id]/route.ts` |
| 9   | `src/app/api/auth/reset-password/route.ts`                    |

**Change each to:**

```typescript
import prisma from "@/lib/prisma";
// Remove: const prisma = new PrismaClient();
```

### 5. Fix `src/utils/invoiceJwt.ts` JWT fallback

```typescript
// Before:
const INVOICE_SECRET = process.env.JWT_SECRET || "your_invoice_secret";

// After:
const INVOICE_SECRET = process.env.JWT_SECRET;
if (!INVOICE_SECRET) {
  throw new Error("Missing JWT_SECRET environment variable");
}
```

### 6. Clean up `src/lib/prisma.ts`

Remove the `console.log` statements on lines 22, 32, 35. The production Prisma client should not log on every initialization.

---

## Verification Checklist

After making all changes:

- [ ] `npm run build` succeeds
- [ ] `grep -r "your_jwt_secret" src/` returns zero results
- [ ] `grep -r "new PrismaClient" src/` returns only `src/lib/prisma.ts`
- [ ] `grep -r "console.log" src/lib/prisma.ts` returns zero results
- [ ] All 45 admin API routes have `verifyToken` calls (20 routes currently missing auth)
- [ ] `grep -rL "verifyToken\|jwtVerify" src/app/api/admin/` returns zero results (all routes have auth)
- [ ] Test login flow: user can still log in and access admin pages
- [ ] Test that missing JWT_SECRET env var causes app to crash on startup (not silent fallback)
