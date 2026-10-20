# Admin analytics page audit

## Scope

Reviewed `/admin/analytics` and its data/configuration boundary. This page is a static overview that links to an optional external Umami dashboard. It has no CRUD actions, modal flows, or dedicated analytics API, so no database records or uploads were created.

## Source review

- `src/app/admin/analytics/page.tsx` now validates the configured dashboard URL as an absolute HTTP(S) URL without embedded credentials. Invalid, relative, or unsafe values use the existing unconfigured state.
- The external dashboard opens in a new tab with `noopener noreferrer`.
- The overview remains readable without the optional dashboard URL. Cards use a one-column mobile layout and three columns at large widths; outer/card spacing scales down on narrow screens.
- Removed pointer-driven React state for decorative hover effects; motion now uses CSS and respects reduced-motion preferences.
- Corrected the Persian copy that previously included the English placeholder “userable”.
- `src/proxy.ts` checks `/admin/*` access and redirects authenticated non-Admin users; there is no page-specific API authorization to assess. This is source evidence only; live role access was not browser-tested.

## Tests

- Added `src/app/admin/analytics/page.test.tsx` for configured URL attributes, unsafe/incomplete URL fallback, and no-config content.
- Test execution is pending the root orchestrator's shared test slot.

## Browser evidence

- Not run in this scoped task. No authenticated browser session or viewport screenshots were available.

## Remaining limitation

The page presents an overview and external-dashboard link only; it does not render analytics metrics itself. Confirming the configured Umami destination requires the deployment's runtime public environment value.
