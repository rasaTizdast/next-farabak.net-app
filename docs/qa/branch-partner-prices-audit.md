# Branch Partner Prices QA Audit

Page: `/admin/branches/my/partner-prices`  
Scope: branch user product and partner price listing; direct product read and Admin-only partner price updates.

## Findings

- Product loading used `useApiFetch`, which exposed an error but the page had no retry control. The page now offers a retry action in the error state.
- Sortable table headers were clickable table cells with hand-written keyboard handlers. They are now real buttons with `aria-sort` on each column, so keyboard behavior and sort state are exposed consistently.
- The original-price column claimed its values were in rials while rendering toman when an exchange rate was available. The column labels now follow the displayed currency, and the rate warning is a status message.
- Searching while on a later page could leave pagination pointing past the filtered results. A focused regression covers returning to page one after filtering.
- This branch page is read-only. Its product list comes from `GET /api/admin/products`; the handler requires a valid session, and the Admin product `PATCH` handler rejects `Branch` users before applying an update. Existing product route tests cover that authorization and partner-price validation.

## Evidence

- Source review: `src/app/admin/branches/my/partner-prices/page.tsx`, `src/app/api/admin/products/route.ts`, `src/app/api/admin/products/[productId]/route.ts`, and `src/proxy.ts`.
- Regression coverage added: `src/app/admin/branches/my/partner-prices/page.test.tsx` covers retry, keyboard-accessible sorting/currency labeling, and search pagination reset. Vitest execution is pending the root agent's shared test-slot release.
- Existing update authorization coverage: `src/app/api/admin/products/[productId]/__tests__/route.test.ts` verifies a Branch PATCH receives 401, invalid partner prices are rejected, and a valid Admin update is persisted.
- Browser/responsive verification: pending. No live account or database mutation was used for this page audit.

## Remaining review

- Verify the page at desktop and narrow mobile widths with a Branch QA session.
- Confirm the read endpoint exposes only fields required by this branch page; its current response includes additional product fields that are not rendered here.
