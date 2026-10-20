# Warehouses audit

Scope: `/admin/warehouses` and its API, 2026-10-19.

## Fixed defects

- Editing sent POST to the warehouse detail endpoint, which implements PUT. Editing now uses PUT; creating retains POST.
- The product endpoint returns `{ data: products }`, but the page accepted only an array. The product search and products modal therefore received no options. The page now handles the actual envelope as well as the legacy array.
- The warehouse name search changed only the separate product search text and never populated the API `q` parameter. It now filters by name and resets pagination. The controls wrap on narrow screens.
- A failed DELETE still displayed a success notification. It now displays an error and retains the current list.
- Merely fetching the warehouse list executed a DELETE against inventory records before validating query parameters. Removed that mutation: listing inventory must be read-only, and any maintenance cleanup needs a separate explicit operation.

Each defect was reproduced by a failing regression before its fix. The exact red command was `pnpm exec vitest run src/app/admin/warehouses/page.test.tsx src/app/api/admin/warehouses/route.test.ts --pool=threads --maxWorkers=1 --no-isolate` (five failures). The first attempt could not start a worker while the host was overloaded; the retry ran the assertions after the dev server stopped.

Final isolated verification: `src/app/admin/warehouses/page.test.tsx` passed 4/4 and `src/app/api/admin/warehouses/route.test.ts` passed 1/1.

## Coverage and limitations

| Area                           | Coverage                                                  | Remaining live checks                                                 |
| ------------------------------ | --------------------------------------------------------- | --------------------------------------------------------------------- |
| List and warehouse-name search | Page/API regressions, source review                       | Authenticated browser, pagination, loading/error appearance           |
| Create/edit warehouse modal    | Existing component tests; PUT regression at page callback | QA-only create/edit through actual modal, validation and save loading |
| Delete warehouse               | Page failed-delete regression                             | Confirm/cancel and QA-only successful deletion                        |
| Product search                 | Actual response envelope regression                       | Autocomplete selection, URL/back navigation, filter counts            |
| Products modal                 | Existing component tests and source review                | QA-only add/change quantity/change grade/delete, keyboard interaction |
| Responsiveness                 | Header controls now wrap and input fits available width   | Desktop/mobile screenshots and table/modal overflow                   |

No live warehouse API calls or record mutations were performed during this audit. The server and browsers were deliberately stopped by the coordinator to recover host CPU and memory for deterministic checks. Existing test accounts are ready for a later browser pass; the coordinator owns their cleanup.

## Follow-up risks

- Product stock results group by individual grade quantity rather than aggregating all grades of the same product. Verify a QA product with multiple grades; duplicate warehouse rows or incorrect product-specific totals may result.
- Merging two grade rows currently performs separate update/delete requests; failed deletion can leave duplicated stock. This needs a transactional server-side merge before the flow can be considered reliable.
- The form's optional `disableSubmit` prop is declared but unused. Save actions also need a pending-state UI check to prevent repeated submissions.
