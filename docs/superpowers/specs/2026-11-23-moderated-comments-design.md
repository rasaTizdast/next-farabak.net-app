# Moderated blog and product comments

Status: approved for implementation by the user on 2026-11-23. Production migration and publishing remain outside scope until separately authorized.

## Goal and evidence

Let signed-in visitors comment on published blog articles and public product pages. Moderators approve content before anyone else can read it. The comments should help visitors resolve real questions in Persian and be visible in the page HTML after approval; search visibility is a hypothesis to measure, not a promised outcome.

On 2026-11-23, the live [CEIA article](https://farabak.net/support/blog/metal-detectors/ceia-chaya-metal-detector-brand-history) and [B400 product](https://farabak.net/products/reolink-cctv-camera/bullet/B400) rendered public pages with the current article reading column and product dossier layout. Repository inspection found `blog.Comments` stores only content, blog ID and a string date. `src/lib/data/blogs.ts` and `src/app/api/blogs/[slug]/route.ts` currently read all those rows, though the article component does not show them. Product comments do not exist. These observations do not establish Google indexing, ranking, or Core Web Vitals.

## Scope and decisions

- A visitor with a valid account may submit a top-level plain-text comment. The server takes the display name from the current `info.Client.FirstName` and `LastName`; the browser cannot supply or override it. Require both names before submission and link to the existing profile editing flow.
- Admins may submit a top-level comment with a custom public alias. This entry is stored with the real admin account ID and `ALIAS` presentation mode for audit, even though the public top-level comment shows the alias. It is never represented as a verified buyer or given rating markup.
- Admins may reply once or more to an approved top-level comment. Public replies display an explicit “پاسخ تیم فرابک” editorial label. Visitors cannot reply in the first release. No arbitrary-depth threading.
- Every new submission, including admin submissions and editorial replies, starts `PENDING`. Only an admin moderation action can publish it. Pending/rejected entries are visible only to admins; a submitter receives a private pending acknowledgment, not a public preview.
- Admin queue supports filtering by status and target type, viewing the parent and target link, approving, rejecting/hiding, and an internal moderation note. State changes record reviewer ID and time. Hiding an approved parent also hides its replies in public queries.
- No ratings, likes, attachments, HTML, or outbound links in comment bodies. Unicode plain text, 10–2,000 characters after trimming; alias 2–80 characters. Render via React text nodes, preserve line breaks with CSS, and treat URLs as text.
- Rate limit creation per account and cap body size before parsing. A valid cookie alone is insufficient: each write reloads the current account and role from the database.

## Architecture

Use one `support.PublicComment` table for both targets and the moderation queue. It has `blogId` or `productId` (exactly one), `parentId`, `actorId`, `displayName`, `presentation` (`MEMBER`, `ALIAS`, `EDITORIAL`, `LEGACY`), `status` (`PENDING`, `APPROVED`, `REJECTED`), body, timestamps, reviewer ID/note, and optional unique legacy blog-comment ID. Add foreign keys to `blog.Blogs`, `support.Product`, and `info.Client`, plus a check constraint for exactly one target and indexes for target/status/time and queue/status/time. Use a transaction for validating an approved same-target parent and inserting a reply. Keep the old `blog.Comments` table during rollout, migrate any rows into the new table as `PENDING`/`LEGACY` with a generic author label, and do not delete old rows until a separate reconciled cleanup. Existing legacy comments cannot be approved as an identified visitor without evidence.

The repository has a Prisma schema but no checked-in migration history. The implementation should add a reviewed, versioned SQL migration and a repeatable migration verification script. Deploy database changes before code; record row counts and test rollback on an isolated PostgreSQL copy. Do not run `prisma db push` against production.

`src/lib/comments/` owns validation, target resolution, submission, moderation, and public query projections. The public projection contains only approved body, display name, presentation, published date, and approved editorial replies. It never exposes actor IDs, email, phone, internal notes, or hidden rows. Mutations live in Route Handlers under `/api/comments` and `/api/admin/comments`; both perform server-side authorization. The admin page lives at `/admin/comments` and appears in the existing admin sidebar, not the branch sidebar.

Public comment lists are server components below the article body and below product FAQs, respectively. The form is a small client component using `UserContext` for display only; the server is authoritative. Keep article metadata/canonical and Product/BlogPosting structured data as they are. Use a cached approved-comments query tagged by target; approving or hiding expires that target tag immediately with `revalidateTag(tag, { expire: 0 })`. Do not put cookie-derived admin state into a shared cached component. Read auth state separately in a request-time boundary for the form. Preserve existing QR-only access checks and do not expose comments on unavailable/private targets.

## Design and accessibility

Use `DESIGN.md` and the live page layouts as the visual reference. The article section aligns with the article reading column and uses a quiet divider, an `h2`, compact cards, date/name hierarchy, and a clear pending message. The product section uses the existing technical dossier’s navy, action blue, pale surface, and modest-radius panels, with a `#comments` anchor after the FAQ and a matching product-tab link. Both use `PublicShell`/current responsive gutters, IRANYekan, RTL text and logical spacing. Admin uses the current admin shell and Ant Design patterns without changing global public tokens. Forms have visible labels, character feedback, keyboard focus, live submission status, and errors tied to fields; 320px and reduced-motion behavior are acceptance checks.

## SEO and integrity

Approved, useful comments appear as crawlable text on the canonical page; pending content must be absent from HTML, JSON-LD, public APIs, feeds, and counts. Pagination, if needed later, must keep crawlable access to approved comments; the initial release limits visible comments to the newest 20 and shows an accessible “more” control backed by a public approved-only endpoint. Do not emit `Review` or `AggregateRating` structured data or star visuals for admin alias content. Google’s [structured data policies](https://developers.google.com/search/docs/appearance/structured-data/sd-policies) and [review snippet guidance](https://developers.google.com/search/docs/appearance/structured-data/review-snippet) warn against fake or misleading review markup. Google’s [JavaScript SEO guidance](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics) supports making important text available in rendered HTML, and its [user-generated spam guidance](https://developers.google.com/search/docs/monitor-debug/prevent-abuse) supports moderation. On release, check public HTML and Search Console URL Inspection; compare later query/page performance using the same dates and filters. Do not infer ranking gains from the feature alone.

## Test and release contract

Write failing tests before each implementation slice. Cover database constraints and legacy migration against disposable PostgreSQL; validation and access control at service and route level; all public data paths for pending/rejected leakage; moderation transitions and cache expiry; member/admin/guest UI; RTL/keyboard/phone layouts; and browser flows with isolated test users and data. Include concurrency and stale-role tests. Run focused Vitest tests as each slice lands, then full test, lint, format check, Prisma generate, type/build, and Cypress flow. Public GET checks on both target types must show approved comments in initial HTML and never expose pending content. Release is complete only after production migration verification, public rendering checks, and a dated Search Console follow-up; visibility remains unproven until measured.

## Alternatives considered

Two separate comment tables would keep foreign keys simple but duplicate moderation logic and complicate the queue. A polymorphic target string/ID table would keep one queue but lose database foreign keys. A single table with nullable typed foreign keys and a database check keeps one moderation model and referential integrity, so it is the recommended approach.
