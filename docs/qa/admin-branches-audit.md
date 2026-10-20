# Admin branch management audit

Scope: `/admin/branches`, its direct management components/hooks, branch create/update/delete APIs. `/admin/branches/my` and partner prices belong to separate audits. No live branch or stock mutations were performed by this audit.

## Findings and repairs

- **Authorization:** the branch creation, editing and deletion handlers accepted any authenticated role. Page restrictions in `proxy.ts` do not protect direct API requests. These mutations now require `Admin` before parsing bodies or issuing database queries. Regression coverage includes Public, Branch and Dealer rejection and successful administrator operations with mocked database responses.
- **Repeated initial loading:** `fetchAllProducts` had a new identity on every hook render, while the page's initial-load effect depended on it. Product/branch responses triggered renders and restarted both requests. The callback is now stable across renders.
- **Duplicate stock update:** a fired debounce timer stayed in the timer registry; a subsequent blur sent the same quantity again. Fired and flushed timers are now removed from the registry.
- **Stock reductions blocked:** quantity input used the current quantity as its minimum despite the API accepting integer quantities from zero. The input now permits integer values from zero and ignores fractional values.
- **Warranty retry retained stale error:** a successful retry updated the requests but left the prior error visible. Successful loads now clear the error state.

## Source inspection

Reviewed list pagination/product search, branch create/edit modal validation and cancellation, branch delete confirmation, product drawer width adaptation, assignment form and quantity editing, branch warranty tabs, and the corresponding branch/product route handlers. Branch table and product table provide horizontal overflow; drawer responds to resize. Create/edit modals reset on cancellation; edit fields populate from the selected branch.

The branch list remains displayed above the warranty tabs; this existing layout was not changed. Create/edit submit buttons lack pending-state protection and server validation messages are reduced to generic mutation errors. Branch creation/deletion and user-role changes are separate database writes, so transaction/rollback behavior remains a follow-up concern. Other branch-product APIs still need a dedicated authorization/ownership review before claiming complete API isolation.

## Verification evidence

The focused single-worker command was run twice (once before and once after the fixes):

```text
pnpm exec vitest run src/app/api/admin/branches/management.test.ts src/app/admin/branches/hooks/useProductAssignment.test.tsx src/app/admin/branches/components/__tests__/ProductTable.test.tsx src/app/admin/branches/components/__tests__/WarrantyRequests.test.tsx --pool=threads --maxWorkers=1 --fileParallelism=false
```

The combined run printed the Vite native-config warning and `RUN v4.1.11`, then produced no test-file names or counts for 40 seconds and was stopped. Running the component suites individually completed successfully:

| Focused file                                                            |    Result |
| ----------------------------------------------------------------------- | --------: |
| `src/app/api/admin/branches/management.test.ts`                         | 12 passed |
| `src/app/admin/branches/hooks/useProductAssignment.test.tsx`            |  1 passed |
| `src/app/admin/branches/components/__tests__/ProductTable.test.tsx`     |  3 passed |
| `src/app/admin/branches/components/__tests__/WarrantyRequests.test.tsx` |  8 passed |

All 24 focused Branch tests pass individually. The slow combined run appears related to importing the heavier Ant Design component suites together, rather than a failing assertion. Tests mock API/database or Ant Design boundaries and do not touch live data.

Prettier check passed for all changed branch handlers, hooks, components, tests, and this report. A scoped ESLint invocation produced no output after 40 seconds and was stopped while the shared test slot was handed to the Invoice audit; lint status is unverified.

## Remaining live CRUD paths

Not executed here: creating, editing or deleting a branch; assigning, reducing or removing stock; creating invoices; modifying warranty requests. Source review and mocked tests do not establish live mutation success or mobile visual correctness.
