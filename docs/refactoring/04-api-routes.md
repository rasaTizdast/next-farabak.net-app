# Phase 3: API Routes — Validation, Error Format, HTTP Consistency

> **Priority:** Medium — improves reliability and developer experience
> **Effort:** ~4-5 hours
> **Risk:** Low (API changes are internal, frontend handles errors already)
> **Dependencies:** Phase 0 (auth module), Phase 1 (error response helpers)

---

## Problem

1. **No input validation** — 45 API routes use either manual `if (!field)` checks or zero validation at all. Zero routes use Yup or Zod.
2. **Inconsistent error formats** — some routes return `{error: "..."}`, others `{message: "..."}`, others `{success: true}`, and others wrap data in named keys like `{faqs}` or `{faq}`.
3. **157 raw SQL queries** (`$queryRaw`) across 36 files — no validation, SQL injection risk
4. **All routes use `export async function` pattern** (good) but parameter typing is inconsistent — some use `Request`, some use `NextRequest`, some have no type annotation
5. **2 different inline `verifyToken` variants** — one reads cookies directly, another takes a token parameter

---

## Changes

### 1. Install Zod

```bash
npm install zod
```

**Why Zod over Yup?** Yup is already used for form validation on the frontend, but Zod is better for API validation because:

- Zod schemas can infer TypeScript types (single source of truth)
- Zod is faster (pure JS, no code generation)
- Zod works great with Next.js API routes
- Can share schemas between frontend and backend later

### 2. Create `src/lib/validation.ts` — shared validation schemas

```typescript
import { z } from "zod";

// Common schemas
export const idParamSchema = z.object({
  id: z.string().min(1, "ID is required"),
});

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

// Product schemas
export const createProductSchema = z.object({
  name: z.string().min(1, "نام محصول الزامی است"),
  price: z.number().min(0, "قیمت نمی‌تواند منفی باشد"),
  categoryId: z.string().min(1, "دسته‌بندی الزامی است"),
  description: z.string().optional(),
  // ... add fields as you discover them in the codebase
});

export const updateProductSchema = createProductSchema.partial();

// Invoice schemas
export const createInvoiceSchema = z.object({
  branchId: z.string().min(1, "شعبه الزامی است"),
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.number().int().min(1),
        price: z.number().min(0),
      })
    )
    .min(1, "حداقل یک آیتم الزامی است"),
  // ... add fields as discovered
});

// Blog schemas
export const createBlogSchema = z.object({
  title: z.string().min(1, "عنوان الزامی است"),
  slug: z.string().min(1, "slug الزامی است"),
  content: z.string().min(1, "محتوا الزامی است"),
  // ... add fields as discovered
});

// Auth schemas
export const loginSchema = z.object({
  email: z.string().email("ایمیل نامعتبر است"),
  password: z.string().min(1, "رمز عبور الزامی است"),
});

export const signupSchema = z.object({
  email: z.string().email("ایمیل نامعتبر است"),
  password: z.string().min(6, "رمز عبور باید حداقل ۶ کاراکتر باشد"),
  name: z.string().min(1, "نام الزامی است"),
  // ... add fields as discovered
});
```

### 3. Create validation helper for API routes

```typescript
// src/lib/validation.ts (continued)

import { NextRequest } from "next/server";
import { z } from "zod";
import { errorResponse } from "./api-response";

export async function validateBody<T extends z.ZodType>(
  request: NextRequest,
  schema: T
): Promise<{ data: z.infer<T> } | { error: Response }> {
  try {
    const body = await request.json();
    const result = schema.safeParse(body);
    if (!result.success) {
      const errorMessage = result.error.errors.map((e) => e.message).join(", ");
      return { error: errorResponse(errorMessage, 400) };
    }
    return { data: result.data };
  } catch {
    return { error: errorResponse("Invalid JSON body", 400) };
  }
}

export function validateParams<T extends z.ZodType>(
  params: Record<string, string>,
  schema: T
): { data: z.infer<T> } | { error: Response } {
  const result = schema.safeParse(params);
  if (!result.success) {
    const errorMessage = result.error.errors.map((e) => e.message).join(", ");
    return { error: errorResponse(errorMessage, 400) };
  }
  return { data: result.data };
}
```

### 4. Migrate routes incrementally

**Start with auth routes** (highest security impact):

| Route                                       | Validation to add            |
| ------------------------------------------- | ---------------------------- |
| `src/app/api/auth/login/route.ts`           | `loginSchema` on POST body   |
| `src/app/api/auth/signup/route.ts`          | `signupSchema` on POST body  |
| `src/app/api/auth/change-password/route.ts` | Validate old/new password    |
| `src/app/api/auth/profile/route.ts`         | Validate profile update body |

**Then admin CRUD routes:**

| Route                                     | Validation to add              |
| ----------------------------------------- | ------------------------------ |
| `src/app/api/admin/products/all/route.ts` | `createProductSchema` on POST  |
| `src/app/api/admin/branches/route.ts`     | Branch create/update schema    |
| `src/app/api/admin/invoices/route.ts`     | `createInvoiceSchema` on POST  |
| `src/app/api/admin/warehouses/route.ts`   | Warehouse create/update schema |

**Migration pattern for each route:**

```typescript
// Before:
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    // No validation — Prisma throws cryptic errors
    const product = await prisma.product.create({ data: body });
    return NextResponse.json(product);
  } catch (error) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

// After:
import { validateBody } from "@/lib/validation";
import { createProductSchema } from "@/lib/validation";
import { successResponse, errorResponse, serverErrorResponse } from "@/lib/api-response";

export async function POST(request: NextRequest) {
  const { data, error } = await validateBody(request, createProductSchema);
  if (error) return error;

  try {
    const product = await prisma.product.create({ data });
    return successResponse(product);
  } catch (error) {
    console.error("Failed to create product:", error);
    return serverErrorResponse("Failed to create product");
  }
}
```

### 5. Audit `$queryRaw` usage (157 occurrences)

**Don't fix all 157 in this phase.** Instead:

1. **Categorize** the `$queryRaw` calls by type:
   - Simple SELECT queries → can be converted to Prisma `findMany`/`findFirst`
   - Complex JOINs → may need to stay as raw SQL
   - Aggregate queries → can often use Prisma `aggregate`
   - Dynamic queries with string concatenation → **SECURITY RISK**, prioritize fixing

2. **Flag any with string interpolation** (SQL injection risk):

   ```bash
   grep -rn '\$queryRaw.*\$\{' src/app/api/
   ```

   These are the highest priority to fix — they should use `$queryRawUnsafe` with parameterized queries, or better yet, Prisma's query builder.

3. **Document** the `$queryRaw` audit results in a separate file for future reference. Don't fix them all now — that's a separate, larger effort.

### 6. Ensure consistent HTTP method exports

All API route files should use named exports:

```typescript
export async function GET(request: NextRequest) { ... }
export async function POST(request: NextRequest) { ... }
export async function PUT(request: NextRequest) { ... }
export async function DELETE(request: NextRequest) { ... }
```

Check for any routes that use `export default` or other patterns and normalize them.

---

## Verification Checklist

- [ ] `npm run build` succeeds
- [ ] `npm install zod` completed
- [ ] Auth routes validate input (test with invalid data — should return 400, not 500)
- [ ] Admin CRUD routes validate input (test with missing required fields)
- [ ] Error responses follow `{success: false, error: "..."}` format
- [ ] `grep -rn '\$queryRaw.*\$\{' src/app/api/` — flagged any SQL injection risks
- [ ] All API routes use named exports (GET, POST, etc.)
