# Production sitemap audit — partial first pass

**Observed:** 2026-11-10. **Sitemap:** `https://farabak.net/sitemap.xml` returned HTTP 200 and listed 439 URLs. Search Console last reported sitemap/index coverage on 2026-11-06.

## Request results

The first pass checked all 439 sitemap URLs with 16 concurrent GET requests. It completed 384 HTML responses with HTTP 200. Those 384 responses had an HTML canonical, a non-empty H1, and no `noindex` directive; the declared canonicals matched their sitemap URLs. No redirect was observed among these completed responses.

The pass did not complete cleanly: 40 requests returned HTTP 502, and 15 responses began with HTTP 200 but their bodies ended with `terminated`. The failed responses clustered after the concurrent scan began. Three later single-URL checks returned HTTP 200 for the homepage, a Reolink subcategory, and the X-ray article, but took 14.17s, 19.93s, and 13.41s respectively. Treat the 502 count as inconclusive rather than as 40 confirmed broken routes; the origin was slow during verification. Do not use these incomplete responses to infer robots or structured-data status.

The [first-pass CSV](./2026-11-10-production-sitemap-first-pass.csv) contains every sitemap URL and the initial/final status, redirect chain, final URL, content type, HTML canonical, robots directives, H1 count, JSON-LD types, Open Graph image URL, and fetch error. It is a partial production snapshot; a clean, rate-limited full audit remains outstanding for the post-release check. It does not include URL-by-URL Search Console issue exports or image fetch checks.

## Search Console snapshot

The Page indexing report, last updated 2026-11-06, showed 178 indexed and 324 not indexed: 244 discovered but not crawled, 34 crawled but not indexed, 15 excluded by `noindex`, 15 duplicate without user-selected canonical, 8 not found, 8 alternate with a proper canonical, and 0 duplicate with Google-selected canonical.

The live sitemap includes `/products`, `/products/x-ray`, and `/support/blog/x-ray/what-is-x-ray-inspection`. URL Inspection on 2026-11-10 reported `/products` and `/products/x-ray` as indexed; both live tests passed and both showed one valid breadcrumb. The article was “URL is unknown to Google” with no referring sitemap detected, although its live test passed and said it can be indexed. This discrepancy needs a later sitemap recrawl check.

## Release state

Liara showed the running `farabak-next` app on release v312 (`ca58dd8`, branch `Development`, started 2026-11-09 13:43 Tehran time). The production route checks still showed the old `/page/1` behavior, old CTX 9800 alias response, and missing product image URLs. The local fixes have not been deployed.
