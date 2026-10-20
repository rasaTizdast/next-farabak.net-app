# Product category panel audit

Scope: `/admin/products/categories`, including category and subcategory create, edit, delete, banner, and rich-text table flows.

## Source review and changes

- Edit availability changed only the return value of its change handler, so the parent draft never received the selected boolean. The handler now updates `Available` explicitly.
- Edit-only rich text and SEO state could remain from the previous category because the initialization guard never reset. Opening an item or switching to a different item now initializes its keyword, blog, banner, and validation draft from that item.
- Edit and create dialogs could be dismissed with Escape during submission. Category saves now block Escape and disable close/tab actions while pending. Delete confirmations prevent duplicate requests and cannot dismiss until the request resolves; failed requests leave the dialog open for retry.
- Create, edit, delete, and the rich-text table builder now use the shared modal focus management. The table builder has a dialog name and remains scrollable on a short mobile viewport.
- Create/edit banners are limited to accepted image files at 2 MB, matching the displayed guidance. Create form validation now blocks invalid name/slug and oversized SEO data before sending.
- Sort headers now use real buttons; public-page actions are links without nested buttons and use safe new-tab rel values. The category table has a named, keyboard-focusable horizontal scroll region and a minimum readable width for narrow screens.
- Category-list failures previously rendered the same blank table as a valid empty database. The panel now distinguishes a true empty state and gives load failures a retry action without exposing raw server error text.

## Test evidence

Regression tests were added in:

- `src/app/admin/products/categories/components/__tests__/CategoryFields.test.tsx`
- `src/app/admin/products/categories/components/__tests__/CategoryRow.test.tsx`
- `src/app/admin/products/categories/components/__tests__/CategoryTable.test.tsx`
- `src/app/admin/products/categories/components/__tests__/EditModal.test.tsx`

They cover input validation feedback, safe links, empty versus failed load states and retry, exact-name delete confirmation, pending delete protection, availability changes, switching edit targets, invalid edit submission, and pending-save protection.

- `CategoryRow.test.tsx`: 1 passed.
- `EditModal.test.tsx`: 4 passed.
- `CategoryTable.test.tsx`: 3 passed (36.97 s total; 22.90 s module import).
- `CategoryFields.test.tsx`: 2 passed.

All 10 focused regression tests pass. Prettier completed successfully and `git diff --check` passed. A scoped ESLint run was attempted but remained silent for more than 35 seconds under host load, so it was stopped without a result.

## Browser and live CRUD evidence

No browser verification or live CRUD was performed by this page agent. No database rows or S3 objects were created or changed. Desktop/mobile rendering, image upload, category/subcategory persistence, edit persistence, delete behavior, and cleanup still need a sequential QA-account run after the orchestrator releases the browser/server slot.

## Remaining verification

- Run scoped ESLint and TypeScript checks when the shared host is available.
- With the authorized QA Admin, create a clearly labeled temporary category and subcategory, upload a small test banner, edit and verify each, then delete them and verify their banner objects are removed.
- Check the table, modals, and rich-text builder at desktop width and a 375 px viewport, including keyboard focus and Escape behavior.
