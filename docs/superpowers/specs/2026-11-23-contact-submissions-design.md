# Contact submissions design

## Goal

Visitors can submit the existing `/contact-us` consultation form inside the site. A successful database write confirms receipt with a Persian toast promising contact within 24 hours. Administrators can read submitted details later in the admin panel.

## Current behavior

`ContactInquiryForm.tsx` validates name, phone, and message, then opens a `mailto:` draft. Its submit button says «آماده‌سازی پیام». The contact page passes an email recipient from contact details and hides the form when those details are absent. The admin panel has an editor for public address, phone, and email, but no inquiry inbox. Prisma has a `contact_us` schema and no checked-in migrations.

## Data and submission

Add `ContactSubmission` in PostgreSQL `contact_us` with an integer generated ID, `name`, `phone`, optional `project`, `message`, and server-generated `createdAt`. Keep the original field labels. Store trimmed plain text, with the phone normalized from Persian/Arabic digits to ASCII and spaces/hyphens removed. Use explicit length limits: name 2–120 characters, phone 8–15 digits with optional leading `+`, project at most 160 characters, message 10–5000 characters. Reject malformed JSON and extra-large bodies with a 400 or 413 response; never return submitted personal data from the public endpoint.

`POST /api/contact-submissions` accepts anonymous JSON up to 24,576 bytes and validates it on the server before writing. Return 201 and a minimal success payload only after Prisma confirms the write. On storage failure, return a generic 500 and log a safe server-side error. Keep fields populated on errors. Disable repeat clicks while a request is in flight. Clear fields after success and show `toast.success("پیام شما ثبت شد. حداکثر تا ۲۴ ساعت آینده با شما تماس می‌گیریم.")`. The form works even if public contact details are unavailable. The page introduction and button text must describe actual sending, not email preparation.

The anonymous endpoint needs abuse protection. Use a hidden honeypot field that ordinary visitors never fill, bounded input/body size, and a deployment-level request limit for this path. A honeypot response must be indistinguishable from success and must not write a record. Document the required edge or reverse-proxy limit as a release requirement; do not invent an in-memory limit that fails across instances. The 24-hour promise means 24 elapsed hours from successful submission, so staff need an operational process to check the inbox within that window.

## Admin experience

Add `/admin/contact-submissions` to the admin-only sidebar. A dedicated read-only inbox shows newest submissions first, received timestamp in the admin locale, name, phone, optional project, and the complete message. Show a clear empty state, loading state, and recoverable error. Page the records with a stable `(createdAt, id)` cursor or descending ID cursor and a fixed page size of 25. Render user text as text, not HTML. No reply, status, deletion, or email notification is part of this feature.

`GET /api/admin/contact-submissions` authenticates with `requireAuth()` and checks `role.toLowerCase() === "admin"` before querying. Return 401 for missing/invalid credentials, 403 for a non-admin, and only the selected fields needed by the inbox. The existing `/admin` proxy remains an additional route guard; the API authorization is mandatory even if the proxy runs.

## Deployment and verification

Check in a reviewed SQL create-table script alongside the Prisma model because this repository has no tracked Prisma migration directory. Confirm the target database migration practice before applying the script. Deploy the table before the API and UI code. Do not apply schema changes to a live database during planning or unit tests.

Vitest coverage: server validation and persistence, malformed/oversize requests, database failure, honeypot, admin 401/403 and paged ordering, form validation, single in-flight submission, success toast/reset, failure preservation, and admin loading/empty/error/detail rendering. Run Prisma validation/generation, focused tests, lint, and build before release. A manual smoke test should submit one test inquiry and verify the same record appears in the admin inbox, then remove the test record through an approved database cleanup process.
