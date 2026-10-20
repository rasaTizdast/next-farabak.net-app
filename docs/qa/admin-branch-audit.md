# Admin and Branch panel audit

Date: 2026-10-20

This index summarizes the page-scoped reviews. Focused component and mocked API tests verify source behavior; they do not establish authenticated browser behavior, persisted CRUD, object-storage uploads, or responsive appearance.

## Page coverage

| Panel page                          | Audit record                                            | Focused automated evidence                                                                | Live browser / CRUD |
| ----------------------------------- | ------------------------------------------------------- | ----------------------------------------------------------------------------------------- | ------------------- |
| `/admin`                            | [Dashboard](admin-dashboard-audit.md)                   | 3 page tests passed                                                                       | Not run             |
| `/admin/analytics`                  | [Analytics](admin-analytics-audit.md)                   | 5 page tests passed                                                                       | Not run             |
| `/admin/branches`                   | [Branch management](admin-branches-audit.md)            | 24 tests passed individually across API, assignment, product table, warranty requests     | Not run             |
| `/admin/branches/my`                | [Branch dashboard](branch-panel-audit.md)               | Stock/dashboard tests and 3 invoice-unit tests passed; see report for exact boundary      | Not run             |
| `/admin/branches/my/partner-prices` | [Branch partner prices](branch-partner-prices-audit.md) | 3 focused page tests passed                                                               | Not run             |
| `/admin/invoices`                   | [Invoices](invoices-audit.md)                           | 17 route and 3 dialog tests passed individually                                           | Not run             |
| `/admin/pages` (Blog management)    | [Blog](blog-audit.md)                                   | 70 focused form and write-route tests passed individually; page deletion suite 4/4        | Not run             |
| `/admin/partner-prices`             | [Partner prices](partner-prices-audit.md)               | 6 page and 16 product API tests passed; scoped lint and formatting passed                 | Not run             |
| `/admin/products`                   | [Products](products-audit.md)                           | 60 focused component, page and API tests passed individually                              | Not run             |
| `/admin/products/categories`        | [Product categories](product-categories-audit.md)       | 10 focused component tests passed individually                                            | Not run             |
| `/admin/settings`                   | [Settings](admin-settings-audit.md)                     | 13 focused page and user API tests passed individually; scoped lint and formatting passed | Not run             |
| `/admin/warehouses`                 | [Warehouses](warehouses-audit.md)                       | 4 page tests and 1 API read-only test passed                                              | Not run             |

Sidebar/navigation received a separate source review and its targeted suite passed 14/14. The `/admin/pages` deletion modal passed 4/4 after adding focus restoration to the test harness.

The Branch dashboard audit added invoice-line coverage for fully unwarranted quantities, partial warranty coverage, and the older single-code response; all 3 focused hook tests passed. Source review also found that the warranty-create flow validates a Branch user's own invoice access, then trusts a caller-supplied `branchId` for stock and persistence. Treat that mutation as an unresolved authorization issue until the API is corrected and covered by a regression test.

## Product and Blog priority

Product and Blog forms, uploads, validation, save state, retry behavior, deletion handling, and write-route authorization received the deepest source review and focused mocked tests. Product coverage includes explicit unavailable status, safe image replacement, preservation of edit drafts on failure, unloaded child data, and search debounce cleanup. Blog coverage includes draft/content preservation, metadata/content separation, editor and image handling, and Admin authentication for all 14 write handlers.

No live Product or Blog CRUD was attempted because the configured PostgreSQL host could not be reached. The exact test-only Admin/Branch creation run is `mvez3g67`; cleanup of its QA accounts and Branch (Branch ID 16) is also pending database availability. The temporary usernames are `qa_a_mvez3g67` and `qa_b_mvez3g67`. No product, article, image, or other ordinary record was created or changed during this audit.

## Verification boundary and remaining work

- All live browser, desktop/mobile responsive, persisted CRUD, and real object-storage verification remain pending. Focused tests mock those external boundaries.
- The saved temporary QA accounts may still exist. Once the database is reachable, run `node scripts/qa/panel-session.mjs cleanup-run mvez3g67` before creating another QA session, then perform the authenticated browser pass with a fresh QA session and test-only Product, Blog, and image records.
- The workspace has unrelated active landing-redesign and package/config edits. Keep those changes intact while reviewing or staging this audit.
- The project-wide type-check emitted no output within the bounded check and was stopped; it remains unverified. Earlier type-check output included active landing-redesign Three.js/import issues. A full test suite and production build are not claimed clean; focused panel checks are reported only in their page audit records.
