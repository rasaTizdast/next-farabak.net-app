# Branch dashboard audit

Scope: `/admin/branches/my`; excludes partner prices. Audited 2026-10-20.

## Verified fixes

- Retry previously retained the old error and authentication flag even after a successful request. Initial loading now resets both flags. A hook regression reproduced the failure before the fix.
- Changing product quantity and waiting two seconds, then leaving the input, submitted the same update again because the completed debounce timer remained registered. Completed/flushed timers are now removed. A regression drove the real hook's quantity render callback and proved two writes before the fix and one afterward.
- Own-stock lookup queried `branch_staff`, which does not exist in the Prisma schema and is inconsistent with the dashboard's `branch.UserID` association. It now resolves the authenticated owner's branch through Prisma before checking its stock. Tests verify owned stock and the missing-branch response.

## Coverage and remaining checks

| Area                                    | Coverage                                                             | Still needed                                                                                |
| --------------------------------------- | -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| Dashboard loading / retry               | Source review and regression                                         | Authenticated visual retry                                                                  |
| Products tab                            | Source review; debounce regression                                   | Desktop/mobile visual layout, pagination, add-product drawer, QA-only stock creation/update |
| Search other branches                   | Source review                                                        | Product selection/search, empty/error results, narrow-screen layout                         |
| Invoices and warranties tab             | Source review                                                        | Pagination, search, QA invoice create, details/print, standalone warranty view              |
| Warranty request tab                    | Own wrapper reviewed; shared request component belongs to root audit | QA request lifecycle and modal interaction                                                  |
| Warranty statistics tab                 | Source review                                                        | Authenticated response and responsive visual layout                                         |
| Invoice warranty management/view modals | Source review                                                        | Date controls, generation/create, cancellation, focus/keyboard and print                    |

The isolated `qa-branch` browser reached the login screen at the local server. The configured database was unavailable during this review, so authenticated UI and CRUD checks were not performed. No live records were created, edited, or deleted by this audit.

The browser's first open command timed out; `agent-browser doctor --offline --quick` reported six passing checks and zero failures, and the subsequent snapshot successfully showed the login form. Vitest's default workers stalled. The thread pool with one worker ran the stock and dashboard regression files successfully (four tests), although the overall later invocation failed to start an additional worker. Full-suite and browser claims should not be inferred from these targeted checks.

## Follow-up findings

- Invoice detail rendering now expands every invoice line to one row per purchased unit, including units without warranty. The branch invoice API supplies all warranty codes for each invoice line and orders them by warranty ID. A focused hook regression covers fully unwarranted quantity, partial coverage, and the legacy single-code shape; it passed 3/3. API/database integration and live partial/full coverage checks remain unverified.
- The invoice search autocomplete uses a fixed 500-pixel popup width; verify it at a 375-pixel viewport.
- Initial invoice loading reads a branch ref updated by a React effect immediately after scheduling branch state; the initial request can be skipped. Entering the invoices tab fetches again, but initial warranty badges may remain empty until then.
- Authorization source review found that warranty creation allows a Branch user to pass a `warrantyData.branchId` used for stock checks and persistence after invoice access was validated against that user's own branch. Confirm and constrain this behavior before marking warranty CRUD authorization verified.
