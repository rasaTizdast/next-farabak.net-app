# `$queryRaw` Audit — API Routes

This document is the output of the audit described in **`docs/refactoring/04-api-routes.md` → Section 5 — "Audit `$queryRaw` usage"** (plan step 3: _Document the `$queryRaw` audit results in a separate file_). It categorizes every raw-SQL call under `src/app/api/` so a future engineer can plan conversion to Prisma's query builder.

> **حوزه اسکن:** فقط `src/app/api/**/route.ts` — فایل‌های تست (`__tests__/route.test.ts`) که `$queryRaw` را فقط برای mock کردن استفاده می‌کنند، خارج از این ممیزی هستند.

---

## Summary / خلاصه

| Metric                             | Value                                                            |
| ---------------------------------- | ---------------------------------------------------------------- |
| Total files affected               | **31** (route.ts) + 5 test files (mocks only)                    |
| Total occurrences                  | **123** (`$queryRaw` + `$queryRawUnsafe`)                        |
| `$queryRawUnsafe` occurrences      | **2** (both in one file)                                         |
| String-interpolated / risk queries | **2** (both parameterized — **no injection**; see Risk findings) |

| Category                                                                       | Occurrences (primary) |
| ------------------------------------------------------------------------------ | --------------------- |
| `simple-select` → `findMany()` / `findFirst()`                                 | 49                    |
| `aggregate` → `aggregate()` / `groupBy()` / `count()`                          | 22                    |
| `complex-join` → likely stay raw (or `include`/nested read)                    | 20                    |
| `insert/update/delete` → `create()` / `update()` / `delete()` / `updateMany()` | 30                    |
| `dynamic/string-interpolated` (injection surface)                              | 2                     |

_Note: several queries are hybrids (e.g. a LEFT JOIN with `COUNT(CASE WHEN ...)` + `GROUP BY` counts as both `complex-join` and `aggregate`); each occurrence is counted once by its strongest category, so per-file rows below may show multi-category entries._

---

## Risk Findings / یافته‌های امنیتی

**تعداد کوئری‌های واقعاً تزریق‌پذیر: 0 (صفر).** ✅

- **No query injects a value via `${...}` directly into the SQL string.** Every tagged-template `$queryRaw` call passes values as template parameters (e.g. `WHERE "branchid" = ${branchId}`), which Prisma parameterizes — safe.
- The only 2 string-built queries are in **`src/app/api/admin/branches/my/invoices/route.ts`**, and both are **parameterized** (positional `$1..$n` + spread args), so they are **not injectable**:
  - **Line 206** — `prisma.$queryRawUnsafe(query, ...invoiceIds)` where `query` is built with `${placeholders}` (a list of `$1, $2, …`), never with raw values:
    ```ts
    const placeholders = invoiceIds.map((_, i) => `$${i + 1}`).join(", ");
    const query = `SELECT "Invoice_Details" FROM "info"."Invoice_Details" WHERE "Invoiceid" IN (${placeholders})`;
    const invoiceDetailsIds = await prisma.$queryRawUnsafe(query, ...invoiceIds);
    ```
  - **Line 238** — `prisma.$queryRawUnsafe(query, branchId, ...detailIds)` using `$1` for `branchId` and `$2..$n+1` for a `NOT IN` list.

- ⚠️ **Ongoing hygiene risk (not a bug):** the `IN (${placeholders})` / `NOT IN` pattern above is the classic place where a future change (e.g. string-concatenating a value instead of passing it as an arg) would introduce injection. If these stay raw, they must keep passing values as separate arguments.
- `grep -rn '\$queryRaw.*\$\{' src/app/api/` (the check prescribed in plan §5) returns **only parameterized tagged-template interpolations** and the two `$queryRawUnsafe` placeholder builders above — no raw value interpolation found.

---

## By-File Table

| File                                                      | Occ | Categories                                                                        | Notes                                                                                                                                                                     |
| --------------------------------------------------------- | --- | --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `admin/branches/[branchId]/invoices/route.ts`             | 4   | simple-select ×3, complex-join ×1                                                 | `Invoice` + `Invoice_Details` + `warranty` reads; nested N+1 in `Promise.all`; converts to `findMany` + `include`                                                         |
| `admin/branches/[branchId]/products/[productId]/route.ts` | 4   | simple-select ×2, DML ×2                                                          | `branchproduct` by composite key; converts easily to `update`/`delete`                                                                                                    |
| `admin/branches/[branchId]/products/route.ts`             | 7   | simple-select ×4, complex-join ×1, DML ×2                                         | JOIN `branchproduct`+`Product`; INSERT/UPDATE quantity — converts to `upsert`/`update`                                                                                    |
| `admin/branches/[branchId]/route.ts`                      | 8   | simple-select ×4, DML ×3, aggregate ×1                                            | `support.branch` CRUD + `info.Client` role update; all convert to Prisma                                                                                                  |
| `admin/branches/check-product/route.ts`                   | 3   | simple-select ×1, aggregate ×2                                                    | Uses `::text` casts; `count()` convertible                                                                                                                                |
| `admin/branches/current/route.ts`                         | 1   | simple-select ×1                                                                  | `branch` by `UserID` → `findFirst`                                                                                                                                        |
| `admin/branches/my/invoices/route.ts`                     | 9   | simple-select ×3, aggregate ×1, complex-join ×3, **dynamic ×2 ($queryRawUnsafe)** | **Only file with `$queryRawUnsafe`** (L206, L238). Dynamic `IN`/`NOT IN` builders are parameterized (safe) but keep them raw or refactor to `in:` filters. Also heavy N+1 |
| `admin/branches/my/requests/route.ts`                     | 2   | complex-join ×1, aggregate ×1                                                     | 4-table join (warranty+branch+product+invoice) → keep raw or restructure                                                                                                  |
| `admin/branches/my/route.ts`                              | 2   | simple-select ×1, aggregate ×1                                                    | `branch` + `branchproduct` COUNT/SUM per branch                                                                                                                           |
| `admin/branches/my/stock/route.ts`                        | 1   | simple-select ×1                                                                  | Queries **`branch_staff` — not in Prisma schema** → must stay raw                                                                                                         |
| `admin/branches/product-quantity/[productId]/route.ts`    | 1   | aggregate ×1                                                                      | `SUM(quantity)` → `branchproduct.aggregate`                                                                                                                               |
| `admin/branches/route.ts`                                 | 9   | simple-select ×2, aggregate ×3, complex-join ×2, DML ×2                           | Branch list w/ product COUNT+SUM (EXISTS + GROUP BY); INSERT/UPDATE branch + Client role                                                                                  |
| `admin/invoices/[invoiceId]/route.ts`                     | 3   | simple-select ×2, complex-join ×1                                                 | invoice + details + warranty-by-detail; converts to `include`                                                                                                             |
| `admin/invoices/route.ts`                                 | 8   | simple-select ×3, complex-join ×2, DML ×3                                         | Invoice list; POST inserts Invoice_Details/warranty + decrements `branchproduct`; branch-auth join                                                                        |
| `admin/users/route.ts`                                    | 1   | complex-join ×1                                                                   | `Client` LEFT JOIN `branch` + `CASE WHEN has_branch`; keep raw or use relation filter                                                                                     |
| `admin/warehouses/[warehouseId]/products/route.ts`        | 6   | simple-select ×4, DML ×2                                                          | `ProductGradeId::text = 'null'` null-handling logic → `upsert` with nullable grade is tricky, keep raw                                                                    |
| `admin/warehouses/[warehouseId]/route.ts`                 | 5   | complex-join ×1, simple-select ×1, DML ×3                                         | warehouse + productCount/totalQuantity aggregates; UPDATE with `COALESCE`                                                                                                 |
| `admin/warehouses/product-quantity/[productId]/route.ts`  | 1   | aggregate ×1                                                                      | `SUM(quantity)` → `warehouseproduct.aggregate`                                                                                                                            |
| `admin/warehouses/route.ts`                               | 9   | DML ×2, aggregate ×3, complex-join ×3, simple-select ×1                           | L11 orphan-cleanup `DELETE ... NOT IN (SELECT …)` → keep raw; list queries COUNT/SUM per warehouse                                                                        |
| `admin/warranty/check/route.ts`                           | 1   | simple-select ×1                                                                  | warranty code uniqueness → `findFirst`                                                                                                                                    |
| `admin/warranty/check-status/route.ts`                    | 2   | simple-select ×1, DML ×1                                                          | L65 UPDATE **in a loop** → replace with `updateMany`                                                                                                                      |
| `admin/warranty/create/route.ts`                          | 6   | simple-select ×2, aggregate ×4                                                    | branch lookup + authorization COUNT checks → `count()`                                                                                                                    |
| `admin/warranty/delete/route.ts`                          | 1   | simple-select ×1                                                                  | branch lookup → `findFirst`                                                                                                                                               |
| `admin/warranty/generate/route.ts`                        | 1   | simple-select ×1                                                                  | warranty code existence → `findFirst`                                                                                                                                     |
| `admin/warranty/generate-batch/route.ts`                  | 1   | simple-select ×1                                                                  | `LIKE ${prefix + "-%"}` parameterized (safe) → `findMany(where: { startsWith })`                                                                                          |
| `admin/warranty/requests/route.ts`                        | 6   | complex-join ×3, aggregate ×2, DML ×1                                             | 4-table warranty request listing (keep raw or restructure); COUNT + UPDATE status                                                                                         |
| `admin/warranty/statistics/route.ts`                      | 2   | aggregate/complex-join ×2                                                         | `LEFT JOIN` + `COUNT(CASE WHEN status)` + `GROUP BY branch` → keep raw                                                                                                    |
| `admin/warranty/update/route.ts`                          | 2   | simple-select ×1, DML ×1                                                          | branch lookup; incremental `UPDATE branchproduct`                                                                                                                         |
| `public/warranty-check/route.ts`                          | 3   | complex-join ×1, DML ×2                                                           | warranty lookup LEFT JOIN invoice; status→'Requested' UPDATEs → `update`                                                                                                  |
| `specTemplates/[id]/route.ts`                             | 8   | simple-select ×4, DML ×4                                                          | `SpecTemplate`/`SpecTemplateItem` CRUD — models exist in Prisma, converts to `specTemplate` / `specTemplateItem`                                                          |
| `specTemplates/route.ts`                                  | 6   | simple-select ×4, DML ×2                                                          | list + per-template item queries (**N+1**) → `findMany` + `include`; INSERT with `RETURNING` → `create`                                                                   |

---

## Recommendations / توصیه‌ها

1. **No injection vulnerability exists today** — treat the 2 `$queryRawUnsafe` calls in `branches/my/invoices/route.ts` as a _future-risk_ item: keep them parameterized, or better, replace the dynamic `IN`/`NOT IN` builders with Prisma `where: { id: { in: [...] } }`.
2. **Convert `simple-select` (49) first** — trivial, low risk: every referenced table (`branch`, `branchproduct`, `warehouse`, `warehouseproduct`, `warranty`, `Invoice`, `Invoice_Details`, `Client`, `Product`, `ProductGrade`, `SpecTemplate`, `SpecTemplateItem`) already has a Prisma model with the correct `@@schema` mapping (`info`/`support`), so `prisma.<model>.findMany/findFirst` works as-is.
3. **Convert DML (30) next** — `create`/`update`/`delete`/`updateMany` cover nearly all; watch for the composite-key `branchproduct`/`warehouseproduct` rows (Prisma uses generated `@id` columns like `branchproductid`, so use `update({ where: { branchproductid } })` or `upsert`).
4. **Eliminate loops** — `warranty/check-status` (UPDATE in loop → `updateMany`), `branches/my/invoices` and `specTemplates` (N+1 reads → `findMany` + `include`), `invoices` POST (INSERTs in loop → `createMany` inside `$transaction`).
5. **Use `prisma.<model>.count()` / `.aggregate()`** for the 22 aggregate queries — most are plain `COUNT(*)`, `COUNT(DISTINCT …)`, `SUM`, `COALESCE`; only the `CASE WHEN status` + `GROUP BY` stats (`warranty/statistics`, branch/warehouse lists) justify staying raw.
6. **Keep raw** (with parameterized inputs): the 4+ table joins in `warranty/requests`, `branches/my/invoices` (L240), `warranty/statistics`, the `DELETE ... NOT IN (SELECT …)` cleanup in `warehouses/route.ts:11`, and **`branches/my/stock/route.ts:38` which targets `branch_staff` (no Prisma model)**.
7. **`$queryRawUnsafe` rule going forward:** allow only with positional parameters passed as separate arguments (current pattern is already compliant); never concatenate a value into the SQL string.
8. **Consistent typing:** replace the `Record<string, unknown>[]` casts with the existing interfaces (`InvoiceRaw`, `WarrantyRaw`, `SpecTemplate`, `SpecTemplateItem`) once converted, and reuse `formatBigIntResults` where raw output is unavoidable.
9. **Order of work:** `warranty/*` and `branches/*` auth/lookup queries (they mix raw + builder already) are the best first slice; `warehouses/*` grade-null logic and statistics stay for last.
