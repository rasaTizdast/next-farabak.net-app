# Product administration audit

Date: 2026-10-19. Scope: `/admin/products` and product APIs, excluding category administration.

## Confirmed bugs and repairs

| Flow                           | Root cause                                                              | Repair                                                                              | Evidence                                                                           |
| ------------------------------ | ----------------------------------------------------------------------- | ----------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| Create unavailable product     | Boolean fallback converted an explicit false to true                    | Persist the validated boolean directly                                              | API regression failed with true instead of false before repair                     |
| Replace image                  | Existing object was deleted before requesting/uploading its replacement | Upload directly to the endpoint's deterministic key; never predelete                | Three image helper regressions failed before repair                                |
| Failed image upload            | PUT errors returned null, allowing overall successful save              | Propagate upload failure; keep the edit form open                                   | Failed PUT regression                                                              |
| Failed product edit            | Form closed on main/image/overview failure                              | Preserve draft for retry                                                            | Component regression observed close callback after failed save                     |
| Partially failed product edit  | Specs/details/FAQ failures still reached success toast                  | Stop at failed stage and preserve form                                              | FAQ failure regression observed false success before repair                        |
| Save before related data loads | Null details and initial empty FAQs were submitted as replacement data  | Track unloaded FAQs separately; skip both replacement calls until loaded            | Component regression observed unwanted destructive replacement calls before repair |
| Search clear                   | Early return did not cancel existing debounce                           | Cancel timer before any search branch and on unmount                                | Page regression observed stale `q=router` request before repair                    |
| Delete product without images  | Storage folder 404 prevented database deletion                          | Treat missing storage folder as already removed; other failures still stop deletion | Page regression observed missing product DELETE before repair                      |
| Latest article draft           | A one-second debounce and empty editor mount could lose the latest text | Update wizard draft immediately and mount with the stored article                   | Draft restoration and immediate update regressions                                 |
| Dismiss during save            | Backdrop, Escape and wizard close could discard a pending operation     | Guard edit and create dismissal while saving; disable wizard close                  | Edit and wizard dismissal regressions                                              |

## Verification status

- Code review: create wizard and payload, edit form and child editors, image upload/signing/deletion integration, product list and deletion, product API create/update/delete reviewed.
- Automated tests use mocked HTTP, Prisma and authentication boundaries; they do **not** prove persisted CRUD or object storage behavior.
- Earlier regressions were observed failing before their corresponding repairs. The prior handoff reported 19 files / 143 tests passed before the last pending-save edits. That count is not verification of the final tree. The dismissal regressions were not observed running to completion in this continuation.
- Focused tests passed individually with one thread worker: `ProductBlogDraft.test.tsx` 2/2, `ProductImageUpload.test.ts` 3/3, `NewProductModal.test.tsx` 13/13, `ProductEditModal.test.tsx` 17/17, product page 2/2, create API 7/7, and product update API 16/16 (60 total). The combined directory run stopped at the Vitest RUN banner; isolated runs complete, though some component imports take over 90 seconds.
- Final scoped ESLint remains unverified; earlier attempts produced no diagnostics before being stopped. `git diff --check` and Prettier have passed on scoped files.
- Live browser and persisted product CRUD were not run. The QA Admin/Branch account creation had completed in the prior continuation, but the database host is now unreachable and the exact `cleanup-run mvez3g67` attempt cannot connect. No products, images, categories or other product records were created or changed, and no object-storage keys were written by this audit. Exact temporary account cleanup is still pending database availability.
- Upload fixture: `cypress/fixtures/test-image-2.jpg` exists (129369 bytes). Both wizard image fields accept `image/*`; the signing endpoint derives `.jpeg` from the `image/jpeg` MIME type and stores deterministic `productImages/<slug>/<slug>-mini.jpeg` and `-banner.jpeg` keys. These are code checks, not evidence of a successful live upload.

## Remaining review items

- Create helper currently logs optional feature/detail/spec/FAQ failures and returns overall success. The UI should expose partial creation without encouraging a duplicate creation attempt.
- Create uploads occur after the database product is created. An upload failure can leave a partial record; retrying the whole form has no explicit resume path.
- Storage upload keys are deterministic. Overwriting preserves the existing object on a failed request, but changing image extension can leave the previous extension in storage; cleanup needs a separate post-persistence lifecycle, not predeletion.
- Product deletion still spans object storage and the database without an atomic transaction across services. Storage removal can precede a failed database deletion.
- Live small-screen layout, keyboard navigation, wizard completion, edit persistence, stock/grade/QR dialogs, storage replacement and complete cleanup still require an authenticated QA session.
