# Invoice page audit

Scope: `/admin/invoices`, the shared invoice list API, its invoice status and delete dialogs, and the authenticated invoice detail route used by branch staff. No live invoice mutations were performed.

## Findings and changes

- The list endpoint previously deleted unchecked invoices older than 48 hours while serving a GET request. It now returns those records and leaves all deletion to the explicit delete action.
- The invoice list contains customer and purchase details, so the list API now requires an authenticated Admin before querying the database. Branch invoice detail remains on the separate `/api/admin/invoices/[invoiceId]` endpoint so the branch invoice detail UI continues to use its existing flow.
- Status and delete dialogs previously closed immediately, even when the mutation failed. They now remain open for retry, show an inline error on failure, disable repeated submissions while pending, and close only after success. The destructive action still requires explicit checkbox confirmation.

## Verification

Regression coverage was added for anonymous and Branch access to the list, retaining expired unchecked invoices without delete queries, and failure/pending behavior in the mutation dialogs. The route and modal tests pass individually with one worker: `src/app/api/admin/invoices/__tests__/route.test.ts` (17/17) and `src/app/admin/invoices/components/ui/InvoiceMutationModals.test.tsx` (3/3). Combining these heavier files initially stalled after the `RUN` banner; isolated runs completed. No browser or live CRUD checks were performed.

## Follow-up

The branch detail route is authenticated but its invoice-to-branch ownership enforcement should be checked separately before treating invoice confidentiality as complete. The invoice detail, warranty, and phone-number dialogs also need visual/responsive browser review.
