# Contact Submissions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Save `/contact-us` inquiries and let administrators read them, with a 24-hour confirmation toast after a successful save.

**Architecture:** A new anonymous POST route validates and writes a `contact_us.ContactSubmission` row. The existing client form calls that route. A separately authorized admin GET route serves a paged, read-only inbox at `/admin/contact-submissions`.

**Tech Stack:** Next.js 16 App Router, React 19, Prisma/PostgreSQL, Zod, Vitest/Testing Library, Tailwind CSS v4, `react-hot-toast`.

**Spec:** `docs/superpowers/specs/2026-11-23-contact-submissions-design.md`

## Global Constraints

- Preserve unrelated changes in the original `main` checkout. Work on `codex/contact-submissions-feature` in this worktree.
- Before writing Next.js code, install dependencies in this worktree if necessary and read the applicable `node_modules/next/dist/docs/` route-handler and page guides, as required by `AGENTS.md`.
- Use the existing `contact_us` PostgreSQL schema and `@/lib/prisma`; no live database changes during local unit tests.
- Keep the exact validation limits, 24,576-byte request cap, and success toast text in the spec. Show that toast only after a 201 response.
- Serve inbox data only after a server-side Admin role check. Render message content as text.
- Use a reviewed SQL rollout script; verify the production database change procedure before applying it. Configure a deployment-level request limit for the anonymous POST route before release.

## File map

| File                                                                 | Responsibility                                                             |
| -------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| `prisma/schema.prisma`                                               | `ContactSubmission` model and descending lookup index.                     |
| `prisma/sql/2026-11-23-contact-submissions.sql`                      | Idempotent create-table/index script for the existing `contact_us` schema. |
| `src/lib/contact-submissions.ts`                                     | Shared Zod input validation, digit normalization, and response types.      |
| `src/app/api/contact-submissions/route.ts`                           | Anonymous validated write; small success response.                         |
| `src/app/api/contact-submissions/route.test.ts`                      | Public API success, invalid, abuse, and failure cases.                     |
| `src/app/(main)/contact-us/_components/ContactInquiryForm.tsx`       | Send request, in-flight state, toast, reset/error behavior.                |
| `src/app/(main)/contact-us/_components/ContactInquiryForm.test.tsx`  | Form behavior and accessibility checks.                                    |
| `src/app/(main)/contact-us/page.tsx` and `page.test.tsx`             | Accurate copy; form independent of contact-info availability.              |
| `src/app/api/admin/contact-submissions/route.ts` and `route.test.ts` | Authorized cursor-paged list and access tests.                             |
| `src/app/admin/contact-submissions/page.tsx` and `page.test.tsx`     | Read-only inbox and its UI states.                                         |
| `src/app/admin/components/Sidebar.tsx`                               | Admin-only inbox link.                                                     |

### Task 1: Persist valid submissions

**Files:** Create `prisma/sql/2026-11-23-contact-submissions.sql`, `src/lib/contact-submissions.ts`, `src/app/api/contact-submissions/route.ts`, `src/app/api/contact-submissions/route.test.ts`; modify `prisma/schema.prisma`.

**Interfaces:** POST JSON `{name, phone, project, message, website}`. Success: HTTP 201 `{ok: true}`. `website` is a honeypot and is never stored. Prisma delegate: `prisma.contactSubmission`.

The validation contract is:

```ts
type ContactSubmissionInput = {
  name: string; // trimmed, 2–120 characters
  phone: string; // ASCII digits after normalization; optional leading +, 8–15 digits
  project: string; // trimmed, 0–160 characters; persist null if blank
  message: string; // trimmed, 10–5000 characters
  website: string; // optional empty honeypot, never persisted
};
```

- [x] **Step 1: Read the installed Next.js route-handler guide and inspect current API test mocking.** Install with `pnpm install --frozen-lockfile` if this worktree lacks `node_modules`. Check route conventions before code changes.
- [x] **Step 2: Write failing API tests.** Mock `prisma.contactSubmission.create`. Assert valid Persian-digit phone is normalized and persisted once, returns 201 and `{ok:true}`; invalid name/phone/message/project returns 400 without a write; malformed JSON returns 400; body over 24,576 bytes returns 413; filled `website` returns 201 without a write; rejected database write returns 500 without echoing the inquiry. Run `pnpm test -- src/app/api/contact-submissions/route.test.ts` and verify the new tests fail.
- [x] **Step 3: Add schema and SQL.** Use `ContactSubmission` with `id Int @id @default(autoincrement())`, `name String @db.VarChar(120)`, `phone String @db.VarChar(16)`, `project String? @db.VarChar(160)`, `message String @db.VarChar(5000)`, `createdAt DateTime @default(now()) @db.Timestamptz(6)`, `@@index([id(sort: Desc)])`, and `@@schema("contact_us")`. SQL must create the same table and index with matching quoted column names/types, with `CREATE TABLE IF NOT EXISTS` and `CREATE INDEX IF NOT EXISTS`. Confirm generated SQL with Prisma's diff tooling before release; review any mismatch.
- [x] **Step 4: Implement shared validation and POST.** Read the request stream with a cumulative 24,576-byte cap before JSON parsing; do not trust `Content-Length` alone. Trim text, map Persian/Arabic digits to ASCII before phone validation, reject unknown keys except `website`, and use `safeParse`. For a filled honeypot return `{ok:true}` without DB access. The successful write follows this shape:

```ts
await prisma.contactSubmission.create({
  data: {
    name: input.name,
    phone: input.phone,
    project: input.project || null,
    message: input.message,
  },
});
return NextResponse.json({ ok: true }, { status: 201 });
```

Use a generic Persian failure message for 500, and no-store headers on responses.

- [x] **Step 5: Verify and commit.** Run `pnpm prisma:generate`, `pnpm exec prisma validate`, and the focused test. Commit only Task 1 files. Record that deploying the SQL script requires checking the target database's existing migration practice and the deployment-level request limit.

### Task 2: Send from the public form

**Files:** Modify `src/app/(main)/contact-us/_components/ContactInquiryForm.tsx`, its test, `src/app/(main)/contact-us/page.tsx`, and `page.test.tsx`.

**Interfaces:** Calls `POST /api/contact-submissions` with the four visible field values plus empty `website`; treats only `response.ok` as success. No recipient prop.

The success branch must follow this order:

```ts
const response = await fetch("/api/contact-submissions", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ ...values, website }),
});
if (!response.ok) throw new Error("Submission failed");
setValues(initialValues);
toast.success("پیام شما ثبت شد. حداکثر تا ۲۴ ساعت آینده با شما تماس می‌گیریم.");
```

- [x] **Step 1: Replace the mailto test with failing send tests.** Mock `fetch` and `react-hot-toast`. Assert invalid fields never call fetch; valid fields submit once even after a second click; 201 triggers the exact 24-hour success toast and clears fields; 400/500/network failures preserve fields and show an error without a success toast; the form works when public contact details are empty. Run focused form and page tests to see the failure.
- [x] **Step 2: Implement submit behavior.** Make `handleSubmit` async; keep field-level errors and `aria-invalid`; post JSON; set the in-flight state before request, disable the button, restore it on failure, and clear only after success. Replace `window.open`/timer/mailto and recipient-dependent errors. Add a visually hidden, non-focusable `website` input for bots; keep it out of normal keyboard flow and accessibility reading. Mount one `Toaster` for the contact page or reuse a verified public app provider.
- [x] **Step 3: Update contact-page copy and availability.** Change the intro from email-draft wording to direct submission. Set the button to «ارسال پیام» / «در حال ارسال…». Keep the form rendered when address/email/phone data is absent, while retaining the existing contact-info fallback for that section. Update the page test for this case.
- [x] **Step 4: Verify and commit.** Run focused form and page tests, `pnpm lint:ci` on the touched files, and commit Task 2 files.

### Task 3: Authorized admin inbox API

**Files:** Create `src/app/api/admin/contact-submissions/route.ts` and `route.test.ts`.

**Interfaces:** `GET /api/admin/contact-submissions?cursor=<positive-id>` returns `{items: ContactSubmission[], nextCursor: number | null}` with 25 records per page, newest ID first. Only Admin may call it.

The query shape is:

```ts
const rows = await prisma.contactSubmission.findMany({
  where: cursor ? { id: { lt: cursor } } : undefined,
  orderBy: { id: "desc" },
  take: 26,
  select: { id: true, name: true, phone: true, project: true, message: true, createdAt: true },
});
const items = rows.slice(0, 25);
const nextCursor = rows.length > 25 ? items.at(-1)!.id : null;
```

- [x] **Step 1: Write failing route tests.** Mock `requireAuth` and `prisma.contactSubmission.findMany`. Assert 401 response passes through when unauthenticated, Branch receives 403 and does not query Prisma, Admin gets 25 selected fields in descending ID order, a 26th row supplies `nextCursor`, the next request uses `id < cursor`, invalid cursor returns 400, and DB failure returns a generic 500. Run the focused test and confirm failure.
- [x] **Step 2: Implement GET.** Call `requireAuth()` before parsing/querying; check `auth.role?.toLowerCase() === "admin"`. Validate one positive integer cursor. Use `take: 26`, `orderBy: {id: "desc"}`, `where: cursor ? {id: {lt: cursor}} : undefined`, and `select` for `id,name,phone,project,message,createdAt`. Return 25 rows plus the cursor of the last returned row only if more rows exist. Set no-store headers.
- [x] **Step 3: Verify and commit.** Run the focused route test and commit only Task 3 files.

### Task 4: Admin read-only view

**Files:** Create `src/app/admin/contact-submissions/page.tsx` and `page.test.tsx`; modify `src/app/admin/components/Sidebar.tsx`.

**Interfaces:** Fetches the Task 3 GET endpoint; shows each record's full plain-text message; a «نمایش بیشتر» button requests `nextCursor` until null.

- [x] **Step 1: Write failing UI tests.** Mock the GET endpoint. Assert initial loading, newest-first records with full name/phone/project/message/date, empty response copy, retry after fetch error, pagination that appends without duplicates, and no message markup interpreted as HTML. Assert the sidebar exposes the route only in the admin item set. Run focused tests and confirm failure.
- [x] **Step 2: Build the page.** Follow the existing admin styling and RTL layout. Use semantic headings and a list of cards suitable for mobile, `dir="ltr"` for phone numbers, accessible loading/error states, a retry control, and a load-more control. Display `createdAt` with `Intl.DateTimeFormat("fa-IR", {dateStyle:"medium", timeStyle:"short"})`; never use `dangerouslySetInnerHTML` for visitor content. Add the sidebar link with a mail icon.
- [x] **Step 3: Verify and commit.** Run focused UI tests, lint, and commit Task 4 files.

### Task 5: Release verification

**Files:** Update the spec or a release note only if verification reveals a concrete correction. No production mutation in this task without release authorization.

- [x] **Step 1: Run gates.** The six focused Vitest files passed (48 tests), `pnpm lint:ci` passed, and Prettier passed for every changed Markdown/TypeScript file. Repository-wide `pnpm format:check` reports 238 pre-existing formatting issues in `.agents/skills`; those unrelated files were left untouched. `pnpm build` compiled successfully and passed TypeScript, then failed while collecting product-page data because no safe database credentials were configured and the temporary build-only credentials were rejected. No database records were written.
- [ ] **Step 2: Check deployment prerequisites.** The SQL table and descending index were compared against the Prisma schema and match. Still required before release: verify the target database's schema rollout procedure, configure an upstream request limit for `POST /api/contact-submissions` (none is represented in the checked-in `liara.json`), and name the staff owner for the 24-hour inbox response.
- [ ] **Step 3: Smoke test in a safe environment.** Not run: no verified isolated database is configured for this worktree. The route, form, inbox, pagination, and role checks are covered by mocked unit tests. Before any integration smoke test, use an isolated database and document how its test row will be removed; do not use production for this check.
