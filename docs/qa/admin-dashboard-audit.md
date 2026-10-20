# Admin dashboard QA audit

Scope: `/admin` dashboard only. This covers the dashboard report and exchange-rate data flow, the responsive summary-card layout, accessible loading/error states, and links into Admin features. No database mutations or browser-authenticated CRUD were performed.

## Findings and changes

- The report skeleton omitted the dashboard title and exposed decorative skeleton blocks to assistive technology. The loading view now retains the page heading and hides the visual placeholders from the accessibility tree.
- An empty store divided by zero while calculating invoice and product progress widths. Empty totals now render `0%` widths.
- A null or failed exchange-rate lookup previously kept displaying “در حال دریافت...” after the request had settled. The card now distinguishes loading from unavailable, and a numeric zero is rendered as a rate.
- Summary cards use a one-column, two-column, then three-column grid at the existing breakpoints. Removing hover scaling prevents the cards from extending beyond narrow viewports. Product and invoice navigation cards have an explicit visible keyboard focus outline.
- The two dashboard feature links point to `/admin/products` and `/admin/invoices`.

## Evidence and verification

- Added `src/app/admin/page.test.tsx` for the loading heading/status, zero-count progress, settled unavailable-rate state, and Products/Invoices destinations.
- `pnpm exec vitest run src/app/admin/page.test.tsx --pool=threads --maxWorkers=1 --no-file-parallelism` passed: 1 test file, 3 tests.
- Static inspection confirmed the report API is read-only and uses the Admin role check; no live data was changed.
- Browser checks at mobile and desktop widths remain pending.
