# Moderated Comments Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add moderated, database-backed comments to public blog and product pages, with member names, admin aliases, editorial replies, and an admin review queue.

**Architecture:** A single `support.PublicComment` table references either a blog or product and retains the real actor for audit. A shared comment service enforces identity, target visibility, validation, moderation, and approved-only projection. Server-rendered lists and small client forms sit within existing public layouts; a separate admin route manages the queue.

**Tech Stack:** Next.js 16.4.5 App Router with Cache Components, React 19, Prisma 6/PostgreSQL, TypeScript, Vitest, Testing Library, Cypress, Tailwind CSS v4, Ant Design admin UI.

**Spec:** `docs/superpowers/specs/2026-11-23-moderated-comments-design.md`

## Global Constraints

- Work only in the attached comments worktree; preserve the staged blog edit in the original checkout.
- Each new comment and editorial reply starts `PENDING`, including admin-authored entries.
- Member display names come from current `info.Client.FirstName` and `LastName`; custom aliases and editorial replies require current database role `Admin`.
- Plain text only: 10–2,000 trimmed characters; alias 2–80 characters. No HTML, active links, stars, ratings, attachments, or user supplied outbound links.
- Public queries, APIs, feeds, counts, and structured data must never expose pending/rejected entries, reviewer notes, account IDs, or contact fields.
- An approved parent is required for an editorial reply; hiding a parent hides its replies.
- Use the `DESIGN.md` public shell, RTL/IRANYekan and current admin shell. Check 320, 390, 768, 1024, and 1440px, keyboard, and reduced motion.
- Next.js guide source: `node_modules/next/dist/docs/01-app/01-getting-started/15-route-handlers.md` and `03-api-reference/04-functions/revalidateTag.md`; read the worktree's installed copy after dependencies are installed. Route Handler GET is request-time by default, and `{ expire: 0 }` is required when hiding approved content immediately.
- All tests and database rehearsal use `TEST_DATABASE_URL` for an isolated disposable PostgreSQL database; the test setup must reject a URL equal to `DATABASE_URL`. No live schema change or content publication is part of this plan.

---

## File ownership map

| Area             | Files and responsibility                                                                                                                                                                                                                                                                                        |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Schema/migration | `prisma/schema.prisma`, `prisma/sql/2026-11-23-public-comments.sql`, `scripts/verify-public-comments-migration.mjs`: typed foreign keys, constraints, indexes, legacy backfill, repeatable verification.                                                                                                        |
| Domain           | `src/lib/comments/types.ts`, `validation.ts`, `service.ts`, `queries.ts`, `cache.ts`: request shapes, identity and policy, writes, approved-only projection, tag names.                                                                                                                                         |
| Public API       | `src/app/api/comments/route.ts`, `src/app/api/comments/[targetType]/[targetId]/route.ts`: submit and approved-only pagination.                                                                                                                                                                                  |
| Admin API/UI     | `src/app/api/admin/comments/route.ts`, `src/app/api/admin/comments/[commentId]/route.ts`, `src/app/admin/comments/page.tsx`, `src/app/admin/comments/CommentsManager.tsx`, `src/app/admin/components/Sidebar.tsx`: queue and decisions.                                                                         |
| Public UI        | `src/components/comments/CommentForm.tsx`, `CommentList.tsx`, `CommentSection.tsx`, the article page, product `ProductDataWrapper.tsx`, `ProductTabs.tsx`: comment presentation and entry.                                                                                                                      |
| Existing reads   | `src/lib/data/blogs.ts`, `src/app/api/blogs/route.ts`, `src/app/api/blogs/category/[categorySlug]/route.ts`, `src/app/api/blogs/[slug]/route.ts`, `src/app/api/blogs/getBlogData/[id]/route.ts`: approved-only counts/projections where public; admin-only detail can retain private data behind explicit auth. |
| Tests            | Focused `*.test.ts(x)` beside domain/UI and `__tests__/route.test.ts` beside APIs; `cypress/e2e/comments.cy.ts` for role/moderation flows.                                                                                                                                                                      |

### Task 1: Database model and legacy migration

**Files:** Modify `prisma/schema.prisma`; create `prisma/sql/2026-11-23-public-comments.sql`, `scripts/verify-public-comments-migration.mjs`, `src/lib/comments/schema.test.ts`.

**Interfaces:** Produces Prisma `PublicComment`, `CommentStatus` and `CommentPresentation`; SQL creates check constraints and indexes Prisma cannot express.

- [x] **Step 1: Write a failing isolated PostgreSQL migration test.** Mark the file `// @vitest-environment node`. Assert exactly one target ID, an existing target/account FK, status default `PENDING`, unique legacy ID, and that two executions of the backfill create one row per legacy comment. Require `TEST_DATABASE_URL` distinct from `DATABASE_URL`.
- [x] **Step 2: Run the migration test and confirm failure.** `pnpm test src/lib/comments/schema.test.ts` should fail because the model/table does not exist.
- [x] **Step 3: Add the schema and reviewed SQL.** The core shape is:

  ```prisma
  enum CommentStatus {
    PENDING
    APPROVED
    REJECTED
    @@schema("support")
  }
  enum CommentPresentation {
    MEMBER
    ALIAS
    EDITORIAL
    LEGACY
    @@schema("support")
  }
  model PublicComment {
    id Int @id @default(autoincrement())
    blogId Int?
    productId Int?
    parentId Int?
    actorId Int?
    displayName String @db.VarChar(80)
    body String @db.VarChar(2000)
    status CommentStatus @default(PENDING)
    presentation CommentPresentation
    createdAt DateTime @default(now()) @db.Timestamptz(6)
    publishedAt DateTime? @db.Timestamptz(6)
    reviewedAt DateTime? @db.Timestamptz(6)
    reviewerId Int?
    reviewNote String? @db.VarChar(1000)
    legacyBlogCommentId Int? @unique
    blog Blogs? @relation(fields: [blogId], references: [id], onDelete: Cascade)
    product Product? @relation(fields: [productId], references: [ProductId], onDelete: Cascade)
    actor Client? @relation("commentActor", fields: [actorId], references: [UserID])
    reviewer Client? @relation("commentReviewer", fields: [reviewerId], references: [UserID])
    parent PublicComment? @relation("commentReplies", fields: [parentId], references: [id])
    replies PublicComment[] @relation("commentReplies")
    @@index([blogId, status, createdAt])
    @@index([productId, status, createdAt])
    @@index([actorId, createdAt])
    @@index([status, createdAt])
    @@schema("support")
  }
  ```

  Add inverse relations to `Blogs`, `Product`, and `Client`. SQL must enforce `(blogId IS NULL) <> (productId IS NULL)` and `parentId <> id`, and backfill legacy rows as `PENDING`/`LEGACY` with `displayName = 'کاربر پیشین'` and `legacyBlogCommentId`. Preserve the old table. The verification script prints source and imported counts and fails on mismatches.

- [x] **Step 4: Run `pnpm prisma:generate` and the disposable-database test.** Confirm Prisma relations compile and repeat backfill has no duplicates; record rollback rehearsal.
- [x] **Step 5: Commit this independently reviewable slice.** `git add prisma/schema.prisma prisma/sql/2026-11-23-public-comments.sql scripts/verify-public-comments-migration.mjs src/lib/comments/schema.test.ts && git commit -m "feat: add moderated comment storage"`.

### Task 2: Comment policy, submission service, and public projection

**Files:** Create `src/lib/comments/types.ts`, `validation.ts`, `service.ts`, `queries.ts`, `cache.ts` and matching tests.

**Interfaces:** `submitComment(input: CommentSubmission, actorId: number): Promise<{ id: number; status: "PENDING" }>`; `listApprovedComments(target: CommentTarget, cursor?: number): Promise<PublicCommentPage>`; `moderateComment(id: number, decision: "APPROVED" | "REJECTED", reviewerId: number, note?: string): Promise<void>`; `commentTag(target: CommentTarget): string`.

- [x] **Step 1: Write failing service tests** for identity and display name, missing first/last name, admin alias permission, editorial reply permission and same-target approved parent, unpublished/QR-only target rejection, trimmed plain text length, pending-by-default, rate limit, stale JWT role, approval/rejection idempotence, and approved-only projection. A representative test:

  ```ts
  expect(
    await submitComment(
      { target: { type: "blog", id: 7 }, body: "  پرسش درباره نصب  ", mode: "member" },
      18
    )
  ).toMatchObject({ status: "PENDING" });
  expect(prisma.publicComment.create).toHaveBeenCalledWith(
    expect.objectContaining({
      data: expect.objectContaining({ actorId: 18, displayName: "علی رضایی", status: "PENDING" }),
    })
  );
  ```

- [x] **Step 2: Run `pnpm test src/lib/comments` and confirm red.** The service files are absent.
- [x] **Step 3: Implement the minimum service.** Define `CommentTarget = { type: "blog" | "product"; id: number }`. Reload `Client` for every write and check current `Role`. Resolve only published non-QR blogs and available non-QR products. In a transaction, check reply parent target/status and create the row. Limit to 5 submissions per account per 10 minutes using a serializable transaction and retry serialization conflicts; return 429 after the cap. Cap request body at 8 KiB. Reject `mode`/`alias`/`parentId` combinations outside the two allowed admin modes. Public projection selects only safe fields and approved top-level rows with approved editorial replies, newest 20, cursor sorted by `(createdAt,id)`.
- [x] **Step 4: Run tests and `pnpm prisma:generate`; fix only failing cases.** Add an isolated database concurrency test showing two simultaneous requests cannot exceed the cap and reply/parent state stays consistent.
- [x] **Step 5: Commit.** `git add src/lib/comments && git commit -m "feat: enforce comment moderation policy"`.

### Task 3: Public and admin Route Handlers

**Files:** Create `src/app/api/comments/route.ts`, `src/app/api/comments/[targetType]/[targetId]/route.ts`, `src/app/api/admin/comments/route.ts`, `src/app/api/admin/comments/[commentId]/route.ts` and route tests.

**Interfaces:** `POST /api/comments` returns 202 `{id,status:"PENDING"}`; `GET /api/comments/:targetType/:targetId?cursor=` returns an approved-only page; `GET /api/admin/comments?status=&targetType=&cursor=` returns admin queue; `PATCH /api/admin/comments/:commentId` accepts `{decision,note}`.

- [ ] **Step 1: Write failing route tests** using `createApiTestContext`: anonymous 401, member alias/reply 403, malformed input 400, private target 404, rate cap 429, successful 202, non-admin queue/decision 403, admin queue safe pagination, and duplicate/conflicting decisions 409. Assert `Origin` matches site origin for writes and a database role check blocks a demoted admin despite an old Admin JWT.
- [ ] **Step 2: Run the route tests and confirm failure.** `pnpm test src/app/api/comments src/app/api/admin/comments`.
- [ ] **Step 3: Add thin handlers.** Use `requireAuth()` plus the service’s fresh-user check. Parse JSON with a strict schema; do not trust client role/name. Map domain errors to stable HTTP codes. Set `Cache-Control: no-store` for admin and submission responses. After a public state change call `revalidateTag(commentTag(target), { expire: 0 })` and revalidate the affected public path if its HTML cache still serves old comments. Keep the approved GET free of account-specific fields.
- [ ] **Step 4: Run route and service tests; commit.** `git add src/app/api/comments src/app/api/admin/comments && git commit -m "feat: expose moderated comment endpoints"`.

### Task 4: Close existing public blog data leaks

**Files:** Modify `src/lib/data/blogs.ts`, `src/app/api/blogs/route.ts`, `src/app/api/blogs/category/[categorySlug]/route.ts`, `src/app/api/blogs/[slug]/route.ts`, `src/app/api/blogs/getBlogData/[id]/route.ts` and their existing tests.

**Interfaces:** Public blog detail and counts use only `PublicComment` rows with `APPROVED`; admin-only blog editing data needs explicit `Admin` authorization before returning private moderation details.

- [ ] **Step 1: Write failing regression tests** that seed one approved, one pending, one rejected legacy/new comment. Assert public detail, category/list counts and `/api/blogs/[slug]` expose only the approved row and count `1`. Assert the management detail endpoint denies a member before including private data.
- [ ] **Step 2: Run focused tests and confirm leak assertions fail.** `pnpm test src/lib/data/blogs.test.ts src/app/api/blogs` (add `blogs.test.ts` if absent).
- [ ] **Step 3: Replace old `Comments: true` public includes** with approved-only counts/projections from the new table. Retire the public old-table mapping. Inspect every `rg -n 'Comments: true|blog\.Comments' src` match; for each public match either filter by approval or remove the field. Keep legacy rows quarantined.
- [ ] **Step 4: Run all blog API and page tests; commit.** `git add src/lib/data/blogs.ts src/lib/data/blogs.test.ts src/app/api/blogs && git commit -m "fix: hide unapproved blog comments from public reads"`.

### Task 5: Public article and product UI

**Files:** Create `src/components/comments/CommentForm.tsx`, `CommentList.tsx`, `CommentSection.tsx` and tests. Modify article `src/app/(main)/support/blog/[blogCategory]/[blog]/page.tsx`, product `src/app/(main)/products/[category]/[subcategory]/[product]/components/ProductDataWrapper.tsx`, `.../components/ui/ProductTabs.tsx`, and their tests.

**Interfaces:** `<CommentSection target={target} variant="article" | "product" />`; `<CommentForm target={target} />` uses `UserContext` for affordances only and posts to `/api/comments`.

- [ ] **Step 1: Write failing component/page tests.** Assert guest login CTA, member name with no alias field, admin alias and editorial reply controls, pending acknowledgment, submit error/focus state, approved-only list, editorial badge, and product `#comments` navigation. Assert the article section follows the body and the product section follows the FAQ.
- [ ] **Step 2: Run `pnpm test src/components/comments 'src/app/(main)/support/blog/[blogCategory]/[blog]' 'src/app/(main)/products/[category]/[subcategory]/[product]'` and confirm red.**
- [ ] **Step 3: Build the UI** with Tailwind v4 utilities and `PublicShell` alignment. Use a semantic `section` with `h2`, `<time>`, list items, `white-space: pre-wrap`, visible labels, `aria-describedby` validation, and an `aria-live="polite"` status. If profile names are missing, link to `/dashboard/edit-user`. Keep the server list independent from the auth-aware form; place the latter behind Suspense/request-time auth so the approved HTML can be cached safely.
- [ ] **Step 4: Run component/page tests and visually check 320/390/768/1024/1440px, keyboard and reduced motion.** Verify no comment leaks into metadata or Product/BlogPosting JSON-LD and no `Review`/`AggregateRating` markup appears.
- [ ] **Step 5: Commit.** `git add src/components/comments 'src/app/(main)/support/blog/[blogCategory]/[blog]/page.tsx' 'src/app/(main)/products/[category]/[subcategory]/[product]' && git commit -m "feat: add public comment sections"`.

### Task 6: Admin review page

**Files:** Create `src/app/admin/comments/page.tsx`, `src/app/admin/comments/CommentsManager.tsx` and tests; modify `src/app/admin/components/Sidebar.tsx` and its test.

**Interfaces:** `/admin/comments` shows a paginated queue with status and target filters, target link, author mode, parent context, approve/reject/hide actions, and note input.

- [ ] **Step 1: Write failing UI tests** for a pending queue row, an alias comment’s real admin actor in admin-only context, editorial reply context, filter and pagination, approval and hide confirmations, loading/error/empty states, and admin-only sidebar navigation.
- [ ] **Step 2: Run `pnpm test src/app/admin/comments src/app/admin/components/__tests__/Sidebar.test.tsx` and confirm red.**
- [ ] **Step 3: Implement the page** using current admin theme and Ant Design table/form conventions. The page fetches only the admin API, keeps filters in URL query parameters, updates queue state after decisions, and shows a decision error without pretending publication succeeded. Hide decisions require an internal note; retain who reviewed and when.
- [ ] **Step 4: Run admin tests and keyboard/RTL checks; commit.** `git add src/app/admin/comments src/app/admin/components/Sidebar.tsx src/app/admin/components/__tests__/Sidebar.test.tsx && git commit -m "feat: add comment moderation queue"`.

### Task 7: End-to-end verification and release gate

**Files:** Create `cypress/e2e/comments.cy.ts`; update focused test fixtures and `docs/seo-audits/` with a dated release verification note when a real release occurs.

- [ ] **Step 1: Write browser tests first** with disposable users and database: guest sees login prompt; member submits and sees pending; public HTML/API stays unchanged; admin approves; a fresh anonymous GET sees body/name; admin alias stays audit-linked; editorial reply has label; admin hides parent and both parent/replies disappear immediately. Exercise a private/QR-only target and script-like text.
- [ ] **Step 2: Run Cypress against an isolated test app/database and confirm each scenario.** Use the project's existing Cypress config and seed/cleanup helpers; do not point it at production.
- [ ] **Step 3: Run final gates:** `pnpm prisma:generate`, `pnpm test`, `pnpm lint:ci`, `pnpm format:check`, `pnpm build`, and the isolated Cypress suite. Check generated Prisma types and inspect actual initial HTML for one article and product after approval/hiding.
- [ ] **Step 4: Rehearse deployment** on a database clone: backup, apply SQL, run the migration verifier twice, compare legacy/source counts, deploy code, then public GET smoke tests. Roll back the application version and database migration on the clone to establish a recovery path.
- [ ] **Step 5: After an authorized production release,** record timestamp, canonical/status and approved/pending HTML results on `https://farabak.net`, then schedule Search Console URL Inspection and same-filter query/page performance checks. Do not claim indexing or ranking movement before those dated measurements.
- [ ] **Step 6: Commit test and release documentation** separately from code changes.

## Self-review checklist

- Database, member identity, admin alias, editorial reply, moderation queue, public SEO rendering, and TDD each have a task and acceptance test.
- The old blog API/read paths are explicitly included so pending content cannot escape through a side route.
- Production database and content writes are gated by a separate authorized deployment; this plan itself changes no live state.
