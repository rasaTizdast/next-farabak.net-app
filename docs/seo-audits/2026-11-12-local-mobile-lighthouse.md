# Local mobile Lighthouse snapshot — 2026-11-12

Captured against the built release worktree at `http://localhost:3100`. Lighthouse 12.8.2, Chrome headless, mobile form factor and simulated throttling, 412 × 823 viewport, DPR 1.75, 150 ms RTT, 1,638 kbps simulated download, and 4× CPU slowdown. Each route was run once. These are local lab observations, not field data; Search Console's supplied snapshot had no affected mobile Core Web Vitals URLs. A localhost run has a different host and image/cache/network conditions from the production baseline, so do not compare the values as a production before/after result.

| Template                 | LCP element        |      LCP |    CLS |      TBT |      FCP | Speed Index |   TTFB |
| ------------------------ | ------------------ | -------: | -----: | -------: | -------: | ----------: | -----: |
| Home                     | HI-SCAN hero image | 4,966 ms |      0 | 1,127 ms | 1,666 ms |    2,403 ms |  84 ms |
| All products listing     | Intro text         | 4,795 ms |      0 | 2,922 ms | 1,696 ms |    4,308 ms | 112 ms |
| X-ray category           | Intro text         | 4,730 ms |  0.071 | 2,184 ms | 1,606 ms |    3,734 ms | 161 ms |
| Blackmagic category      | Intro text         | 4,747 ms |      0 | 2,165 ms | 1,578 ms |    2,709 ms | 132 ms |
| CTX 5800 product         | Product image      | 4,502 ms |  0.118 |   833 ms | 1,571 ms |    3,381 ms | 138 ms |
| X-ray inspection article | Article title      | 4,661 ms | 0.0006 | 1,025 ms | 1,574 ms |    2,855 ms | 109 ms |

## Interpretation

- The homepage hero and CTX 5800 product image are identified as the LCP elements. Lighthouse recognized the CTX image as not lazy-loaded and the priority hint audit passed. Listing/category LCP is introductory text, so product-card images were not promoted to high priority; offscreen cards remain lazy-loaded with reserved image frames.
- One X-ray category run recorded CLS 0.071, attributed to the results region, and one CTX 5800 run recorded CLS 0.118, attributed to streamed content moving the footer. These are single-run lab observations; repeat on a stable production-like host before changing layout behavior.
- A repeat Lighthouse attempt for the X-ray category returned `NO_FCP` without metrics; direct local HTTP requests to the category and CTX page still returned full `200` HTML. No repeat values are reported, so the CLS findings remain single-run observations.
- The SEO category scored 1.00 on the home page and 0.92 on the other five templates because Lighthouse marked its `meta-description` audit as missing. Direct completed-response checks found the description in the streamed document for both a normal Chrome user agent and `Googlebot`. The installed Next.js 16 `generateMetadata` guide says streamed metadata is appended after the initial UI and is interpreted by bots that execute JavaScript and inspect the full DOM, including Googlebot. This is not a missing `generateMetadata` result; no global `htmlLimitedBots` override was added.
- The local server log included upstream timeouts for unrelated HI-SCAN S3 assets and Next.js unstable-current-time warnings during category prerendering. These may affect lab timing; neither is presented as resolved by this SEO patch.

Raw JSON reports are in `%TEMP%\farabak-seo-local-lighthouse-2026-11-12` on the machine that ran this check: `home.json`, `products.json`, `products-x-ray.json`, `products-blackmagic.json`, `products-x-ray-airport-luggage-ctx-5800.json`, and `support-blog-x-ray-what-is-x-ray-inspection.json`.
