# Blog panel audit

Date: 2026-10-19

## Scope and changes

- Reviewed the shared Blog form, category picker, cover upload, editor, and the create/edit wrappers in `/admin/pages`.
- The form now preserves a manually selected slug, accepts existing absolute cover URLs, validates replacement image size/type, and releases temporary preview URLs.
- Returning from the editor to metadata reuses the newly created draft ID and preserves the latest editor content. Metadata changes use PATCH; content and publication state use PUT.
- Save guards disable duplicate submissions, editing, and close actions while a save is pending. API failures retain the form and expose retryable errors. Failed initial loads provide an error and retry instead of a blank editing form.
- Blog dialogs use Radix focus management and responsive wrapping. The edit wrapper keys the form by article ID, preventing stale state when switching records.
- Draft creation and category assignment are transactional. Metadata and category creation validate submitted values before storage.
- Added explicit authentication and Admin-role checks before request parsing or resource access for all 14 write handlers: article create/PATCH/PUT/delete, category create/delete, FAQ create/update/delete, QR create/delete, cover upload, video upload, and media deletion. Public read handlers were left unchanged.

## Automated verification

- Before the authorization fix, `pnpm exec vitest run src/app/api/blogs/__tests__/management-auth.test.ts --pool=threads --maxWorkers=1` failed all 28 assertions. Both missing sessions and Branch sessions reached parsing/database/storage code instead of returning 401/403. This established the regression across every write handler.
- The authorization test imports the actual route handlers. Existing successful mutation tests explicitly provide an Admin session.
- Removed unsupported Testing Library `exact` role-query options from the form tests; string accessible names already match exactly.
- Focused post-fix tests pass individually with one worker: authorization 28/28, `BlogForm.test.tsx` 7/7, create route 8/8, category route 16/16, update route 7/7 and delete route 4/4 (70 total). The combined form + route command still stopped at the RUN banner; isolated runs completed.

## Browser and live-data verification

No live Blog CRUD or upload was performed during this continuation. The configured database host was unreachable when QA account cleanup was retried, so no browser session or persisted QA mutation could be established. No existing article or category was modified, and this continuation created no live Blog records or storage objects requiring cleanup.

Still required: run the Admin browser flow using only uniquely named QA TEMP records; create/select a category, upload a fixture cover, create an article, edit metadata and content, verify persistence, delete via the UI, and verify exact record/object cleanup. Mobile modal layout and real editor interactions also remain unverified in a browser.

## Remaining limitations

- The shared `/admin/pages` delete-confirmation work is coordinated separately. This audit did not change that shared page.
- These checks cover the Blog routes and components; they do not establish a full-application security audit or a production build result.
