# Main route production audit — 2026-11-22

## Scope and method

- Target: `https://farabak.net`, production as observed on 2026-11-22.
- Source review: all 37 `page.tsx` templates under `src/app/(main)`, their data dependencies, route loading files, and inherited error boundaries. Compared loading and error fallback structure with settled route source where applicable.
- URL crawl: every one of the 497 URLs in the production sitemap. Dynamic pages were included individually: product details, product categories and subcategories, blog articles and categories, member pages, and the project detail.
- Rendered browser checks: homepage at 390 × 844; product listing and three product route levels; one blog article; contact form; warranty lookup; FAQ and tool pages; product-search empty/results states; Product Finder empty states; invalid product and blog URLs; and anonymous dashboard redirects.
- State checks used only blank form submissions and synthetic no-result/invalid URLs. No customer data, warranty code, inquiry, or account data was submitted.
- The user confirmed that anonymous dashboard redirects plus source review are sufficient; authenticated dashboard states are outside this audit.

## Sitemap crawl

All 497 sitemap URLs returned HTTP 200 without redirects. Every response had a non-empty title, canonical link, and at least one raw HTML H1. The counts were 399 product URLs, 86 support URLs, 8 company/about URLs, and 4 standalone URLs.

This confirms URL availability and metadata presence. It does not prove that every canonical points to the intended URL, that each raw H1 is visible after hydration, or that every response is current in Google's index. A hydrated browser check of `/products`, a Reolink category, subcategory, and product detail found exactly one visible H1 on each.

`/robots.txt` and `/sitemap.xml` returned HTTP 200. `/dashboard` and `/dashboard/all-invoices` redirected anonymous visitors to `/auth/login`, consistent with the requested access boundary.

## Rendered states

| Route or state                             | Production observation                                                                                                                                                                                     | Result |
| ------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| Homepage, mobile                           | At 390 × 844, the RTL layout and primary heading rendered; one visible H1.                                                                                                                                 | Pass   |
| Product routes                             | Listing, category, subcategory, and detail each rendered one visible H1.                                                                                                                                   | Pass   |
| Blog article                               | Article content and headings rendered. The Preferred Sources widget appeared as an accessible “Add to Preferred Sources” button, with a Persian deeplink also visible. The Google publisher script loaded. | Pass   |
| Contact, blank submit                      | Required name, phone, and project-description errors appeared with `role="alert"`; no message was prepared.                                                                                                | Pass   |
| Warranty, blank submit                     | The page announced “کد گارانتی را وارد کنید” in an alert before any lookup.                                                                                                                                | Pass   |
| Product search, no query                   | An intentional prompt asked the visitor to enter a search phrase.                                                                                                                                          | Pass   |
| Product search, no matches                 | A synthetic query returned an explicit no-products state.                                                                                                                                                  | Pass   |
| Product Finder board/report, no saved work | Both showed explicit empty states and a path to begin the questionnaire.                                                                                                                                   | Pass   |
| Invalid product/blog paths                 | Both returned branded not-found pages; invalid blog category returned 404.                                                                                                                                 | Pass   |
| FAQ and tool pages                         | FAQ content and representative calculator controls rendered.                                                                                                                                               | Pass   |

The article reload exposed the Google publisher runtime and its shadow-DOM button in the accessibility tree. Google's documentation recommends the standard JavaScript button and also supports a deeplink; neither is required for preferred-source eligibility. See [Google's Preferred Sources guide](https://developers.google.com/search/docs/appearance/preferred-sources).

## Loading and error coverage

All 37 route templates and their applicable loading/error source were reviewed. The checkout contains 29 route-level `loading.tsx` files and 7 `error.tsx` boundaries, with parent boundaries applying to nested routes. The fallback structures were compared with their settled route source.

I did not capture a deliberately slowed production navigation for every URL. Direct navigation usually completes too quickly to expose the transient fallback, so the loading assessment is source-based; it is not evidence of a browser-observed transition on all 497 URLs. The live error checks above cover representative route-level 404s and safe validation errors. Authenticated dashboard data/error states were not requested.

## Performance and browser evidence

- Three slow URLs from the initial multi-worker crawl were rechecked sequentially at low volume. Their follow-up response times varied rather than showing a persistent delay; no production performance defect was confirmed.
- The browser showed no page errors on the inspected blog article. The publisher script emitted its informational runtime log.
- PageSpeed Insights returned 403 during the audit and no current CrUX field data was obtained. No Lighthouse score or Core Web Vitals claim is made.
- The only mobile visual check was the homepage. Mobile layouts, keyboard flows, and live field performance for every route remain unverified.
- The source audit applied relevant Modern Web Guidance lookups (`html`, `optimize-script-priority`, and `accessible-error-announcement`) to the observed web-platform patterns. The guidance frames expert-vetted patterns as inputs to contextual review, not automatic defect reports. See [Chrome Modern Web Guidance](https://developer.chrome.com/docs/modern-web-guidance/).

## Findings and action

No new production defect was confirmed, so no application code change is warranted from this pass. The main issues recorded by the 2026-11-21 route audit are now reflected in production for the checked flows: Contact Us has its inquiry form, product search has intentional empty states, and invalid routes show branded 404s. The Preferred Sources button is also live.

The unresolved audit limits are measurement and state-transition coverage, not a demonstrated broken route: no PSI/CrUX result and no intentionally slowed production loading transition for every route. Authenticated dashboard data/error states were intentionally excluded at the user's direction. No deployment was performed.
