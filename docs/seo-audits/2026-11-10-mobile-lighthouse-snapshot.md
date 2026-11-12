# Mobile Lighthouse baseline (pre-release)

Captured 2026-11-10T17:33:32.057Z (each URL was run once). Lighthouse 12.8.2, Chrome headless, mobile form factor with simulated throttling. These are lab observations, not CrUX field data; Search Console reported no affected mobile Core Web Vitals URLs in the supplied snapshot. Scores are omitted because the CLI result did not contain category scores.

| Template                 | LCP element                                                                        |     LCP |   CLS |    TBT |     FCP | Speed Index | Server response |
| ------------------------ | ---------------------------------------------------------------------------------- | ------: | ----: | -----: | ------: | ----------: | --------------: |
| Home                     | دستگاه بازرسی بار Smiths Detection HI-SCAN 6040 DV روی نقاله در محیط فرودگاه       | 3470 ms | 0.003 | 436 ms | 2028 ms |     5952 ms |          462 ms |
| All products listing     | مدل‌ها و راهکارهای مناسب پروژه‌تان را با مشخصات روشن، تصویر واقعی محصول و مسیر ار… | 4019 ms |     0 | 539 ms | 1818 ms |     3097 ms |          127 ms |
| X-ray category           | مدل‌ها و راهکارهای مناسب پروژه‌تان را با مشخصات روشن، تصویر واقعی محصول و مسیر ار… | 3901 ms |     0 | 382 ms | 1790 ms |     2561 ms |           94 ms |
| Blackmagic category      | مدل‌ها و راهکارهای مناسب پروژه‌تان را با مشخصات روشن، تصویر واقعی محصول و مسیر ار… | 3943 ms |     0 | 437 ms | 1801 ms |     2529 ms |          106 ms |
| CTX 5800 product         | تصویر CTX 5800                                                                     | 3652 ms |     0 | 375 ms | 1632 ms |     2486 ms |           43 ms |
| X-ray inspection article | دستگاه ایکس‌ری بازرسی دونما HI-SCAN 6040 DV                                        | 4248 ms |     0 | 288 ms | 2221 ms |     2905 ms |           72 ms |

## LCP phase breakdown

| Template                 | TTFB phase | Load delay | Load time | Render delay | LCP selector                                                                  |
| ------------------------ | ---------: | ---------: | --------: | -----------: | ----------------------------------------------------------------------------- |
| Home                     |    1206 ms |       0 ms |   2253 ms |        11 ms | `div.relative > figure.relative > picture.block > img.size-full`              |
| All products listing     |     834 ms |       0 ms |      0 ms |      3185 ms | `div.w-full > header.flex > div.flex > p.text-base`                           |
| X-ray category           |     805 ms |       0 ms |      0 ms |      3096 ms | `div.w-full > header.flex > div.flex > p.text-base`                           |
| Blackmagic category      |     852 ms |       0 ms |      0 ms |      3092 ms | `div.w-full > header.flex > div.flex > p.text-base`                           |
| CTX 5800 product         |     703 ms |     652 ms |   1073 ms |      1225 ms | `div.grid > section.h-full > div.flex > img.size-full`                        |
| X-ray inspection article |    1231 ms |    1572 ms |   1074 ms |       371 ms | `div.grid > article#article-content > header.mb-8 > img.bg-(--farabak-paper)` |

## Decisions from the baseline

- The homepage LCP image already emits a high-priority fetch hint.
- The product listing cards use `SmartImage`, which defaults to `loading="lazy"`; their image frames reserve a square aspect ratio. The measured listing LCP element was text, so no product card was incorrectly promoted to LCP priority.
- The CTX 5800 detail image was eager but lacked a high fetch priority and a responsive `sizes` value. The code now adds `fetchPriority="high"` and a viewport-aware size.
- The article cover was marked `priority`, but its rendered image lacked `fetchpriority="high"`. `BlogCover` now emits the high fetch hint for prioritized covers, and the detail cover uses a mobile size matched to the measured content width.
- Re-run these six URLs after deployment with the same Lighthouse version and settings. Compare repeated runs or PageSpeed field data before making further performance changes.

The raw Lighthouse JSON files remain in the task temporary directory `farabak-seo-lighthouse-2026-11-10`; the compact values are also in `2026-11-10-mobile-lighthouse-snapshot.csv`.
