# Admin settings audit

Date: 2026-10-20

Scope: `/admin/settings`, `/api/admin/users`, `/api/admin/users/admins`, and the password-change endpoint used by the page.

## Findings and changes

- The intended responsive two-column layout did not apply because the settings grid container omitted the `grid` display utility. The container now uses a one-column mobile layout and two columns at `md`.
- Password and phone inputs relied on placeholder text for their visible names. They now have persistent labels, appropriate autocomplete/input modes, native required/minimum-length constraints, and submit through forms so Enter works.
- A failed or empty retry could leave users from an earlier phone search visible. Each search now clears old results and selection first and trims surrounding whitespace from the number.
- Admin demotion previously ran immediately. It now requires a Radix alert dialog confirmation; pending requests cannot dismiss it, and failures leave it open for another attempt. The current account is visibly marked and cannot be demoted through the UI.
- `/api/admin/users` exposed the branch-eligible user list without authentication. Both its GET and POST now require an Admin session. `/api/admin/users/admins` now requires the Admin role for both listing and demotion, and rejects a request to demote the signed-in account.

## Verification

- Added `page.test.tsx` coverage for submitting a trimmed phone search, confirming demotion, and clearing stale results after an empty retry.
- Added `access.test.ts` coverage for unauthenticated listing, denying Branch users access to administrator data/mutations, and blocking self-demotion. Updated existing user-route tests for the new access boundary.
- Focused Vitest runs passed individually: `page.test.tsx` (3/3), `access.test.ts` (3/3), and existing `/api/admin/users` `route.test.ts` (7/7), for 13 passing tests. The last file took 92.15 seconds overall, with Vitest output beginning after imports.
- No live database mutations or browser checks were performed in this page-scoped audit.

## Remaining checks

- Verify the page at desktop and mobile widths using an Admin QA account, including dialog keyboard behavior and password validation. Password changes and account-role mutations must use QA users only.
