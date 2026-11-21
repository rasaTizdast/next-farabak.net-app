# Farabak SEO, crawlability, and retrieval investigation

- **Investigated:** 20 November 2026 (Asia/Tehran). HTTP timestamps in evidence are UTC.
- **Site:** https://farabak.net · **Repository baseline:** `a32f9d03`
- **Scope:** investigation and implementation tickets. No application code, DNS, hosting, firewall, or production configuration was changed.

## A. Executive summary

Farabak is internationally reachable over HTTPS and is partially indexed by Google. The evidence does **not** support a current global outage, a blanket robots block, complete deindexing, or a broken advertised IPv6 address. It does support a real decline in search exposure, incomplete discovery of important URLs, and defects in the application's alternative Markdown responses.

The three immediate actions are:

1. Repair content negotiation: public Reolink category and product URLs return **200 as HTML but 404 as Markdown**, even when the client also accepts HTML. Successful Markdown responses at the canonical homepage/contact URLs additionally carry `X-Robots-Tag: noindex`.
2. Verify and improve content extraction without JavaScript. Product content exists in the downloaded HTML, but most B400 text is inside hidden streaming containers; the rendered browser displays it correctly. Google/Bing receive the B400 canonical in the head, while the tested OpenAI user agents receive it later in the body. This is an extraction risk, not proof of a Google rendering failure.
3. Complete crawl/indexing recovery using the current canonical URLs and hosting logs. Google's recorded index still contains the old B400 `/ip/B400` alias, while the preferred `/bullet/B400` URL is unknown. The current alias redirect works. Other important pages are discovered but not indexed.

**Search decline is confirmed.** Search Console's property/date aggregation reports:

| Equal 28-day window          | Clicks | Impressions |                     CTR | Average position |
| ---------------------------- | -----: | ----------: | ----------------------: | ---------------: |
| 23 September–20 October 2026 |    194 |       1,957 |                   9.91% |            10.20 |
| 21 October–17 November 2026  |    125 |       1,576 |                   7.93% |            14.85 |
| Change                       | −35.6% |      −19.5% | −1.98 percentage points |    Worse by 4.65 |

These are Google Search Console observations, not estimates from a third-party ranking service. Average position is an impression-weighted metric, not a fixed position for every query. The dataset ends on November 17 and cannot measure the outcome of the move back to Germany on November 19. [Evidence: daily data](evidence/2026-11-20/gsc-daily.json).

The user reports that the gradual loss began about five or six months ago around a move to Iran, and that hosting moved back to Germany yesterday. That association is plausible historical context, but **historical routing failure has not been proven**. Neither moving back yesterday nor successful tests today establishes what crawlers experienced over the intervening months.

**International access:** independent Check-Host nodes in Iran, Germany, the Netherlands, the UK, the US, Türkiye, and Canada returned HTTP 200 for the homepage, robots.txt, and the Reolink category: 21 successful remote observations. This is a point-in-time result, not an uptime guarantee or an authentic OpenAI crawler test. [Remote results](evidence/2026-11-20/remote-checks-results.json).

**Ping:** two local ICMP echo requests timed out while HTTPS requests succeeded. This confirms that ping is unsuitable as the sole health check here. A gateway/firewall dropping ICMP is possible; the exact device or policy responsible is unverified. Ping failure does not demonstrate failure of TCP port 443, TLS, or HTTP. [Ping evidence](evidence/2026-11-20/ping.json).

**ChatGPT retrieval:** the web tool initially reported “not accessible” for the homepage, robots.txt, and sitemap without a network error or HTTP status. Later it returned a cached homepage snapshot marked crawled last month and a Reolink category snapshot marked crawled yesterday; B400 and robots.txt still failed through that tool. Therefore the original claim that Farabak can never be retrieved is too broad. Provider cache/discovery differences, incomplete indexing, content negotiation, and streaming extraction are supported areas to investigate. Their individual contribution to the exact failed request remains unknown without a matching server-side request record.

**Confidence:** high in the measured HTTP/DNS/Google states and the negotiation defects; moderate in the extraction risk; low in any claim assigning the historical loss specifically to Iranian routing or a proprietary ranking algorithm. No confirmed sitewide P0 outage was found.

## B. Technical diagnostic results

Status describes the observed test, not a claim about all future requests. HTTP redirects below are shown before following them; the evidence preserves headers and final results.

| Test                                                 | Target                                      | Expected result                            | Actual result                                                                                                                                    | Status                                                         | Evidence                                                                                                            |
| ---------------------------------------------------- | ------------------------------------------- | ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| DNS A through three public resolver addresses        | Apex and www; 1.1.1.1, 8.8.8.8, 9.9.9.9     | Consistent reachable address               | All returned `185.208.181.159`                                                                                                                   | Confirmed pass                                                 | [DNS](evidence/2026-11-20/dns-public-resolvers.json)                                                                |
| Nameservers                                          | Apex                                        | Active authoritative delegation            | `ns1.liara.zone`, `ns2.liara.zone`                                                                                                               | Confirmed observation                                          | Same DNS evidence                                                                                                   |
| CNAME                                                | Apex and www                                | Valid records if used                      | No CNAME data; both have A answers                                                                                                               | Confirmed; not an error                                        | Same DNS evidence                                                                                                   |
| AAAA / IPv6                                          | Apex and www                                | No broken advertised address               | No AAAA data; forced IPv6 curl cannot resolve an IPv6 destination                                                                                | Bad-AAAA hypothesis rejected                                   | [IPv6](evidence/2026-11-20/curl-ipv6.json)                                                                          |
| IPv4 HTTPS                                           | Apex                                        | 200 with content                           | Forced IPv4 curl succeeds                                                                                                                        | Confirmed pass                                                 | [IPv4](evidence/2026-11-20/curl-ipv4.json)                                                                          |
| DNSSEC DS/DNSKEY/SOA                                 | Apex, same three resolvers                  | No validation-related resolution failure   | NOERROR, no DS/DNSKEY answers, SOA answers; AD unset                                                                                             | Consistent with unsigned delegation; no observed DNSSEC outage | [DNSSEC](evidence/2026-11-20/dnssec-soa.json)                                                                       |
| DNS over HTTPS attempts                              | Google, Cloudflare, Quad9 endpoints         | Resolver response                          | Connections reset or timed out from this environment                                                                                             | Environment limitation, not evidence Farabak DNS is broken     | [DoH attempts](evidence/2026-11-20/dns-doh.json)                                                                    |
| HTTPS GET and HEAD                                   | Apex homepage                               | 200                                        | Both 200                                                                                                                                         | Confirmed pass                                                 | [Baseline](evidence/2026-11-20/http-baseline.json)                                                                  |
| HTTPS www GET and HEAD                               | www homepage                                | Permanent redirect to apex                 | 308 → apex → 200                                                                                                                                 | Confirmed pass                                                 | Baseline                                                                                                            |
| HTTP apex GET and HEAD                               | Apex homepage                               | HTTPS redirect                             | 301 → HTTPS apex → 200                                                                                                                           | Confirmed pass                                                 | Baseline                                                                                                            |
| HTTP www GET and HEAD                                | www homepage                                | HTTPS/apex redirect                        | 301 → HTTPS www → 308 → HTTPS apex → 200                                                                                                         | Pass; two hops                                                 | Baseline                                                                                                            |
| TLS trust and hostnames                              | Apex and www                                | Valid trusted certificate                  | Python verified TLS 1.3; curl verification succeeds; separate certificates expire January 30, 2027                                               | Confirmed pass from tested client                              | [TLS](evidence/2026-11-20/tls.json)                                                                                 |
| Robots GET and HEAD                                  | `/robots.txt`                               | Public text response                       | 200, `text/plain`, 1,064 bytes                                                                                                                   | Confirmed pass                                                 | Baseline                                                                                                            |
| Sitemap GET and HEAD                                 | `/sitemap.xml`                              | Public valid XML                           | 200, `application/xml`; 485 unique HTTPS apex URLs; no fabricated lastmod values                                                                 | Confirmed pass for XML/URL structure                           | [URLs](evidence/2026-11-20/sitemap-urls.json)                                                                       |
| Remote HTTPS                                         | Three targets × seven countries             | Public access                              | 21/21 HTTP 200; same destination IPv4                                                                                                            | Confirmed point-in-time access                                 | Remote results above                                                                                                |
| Representative desktop/mobile and bots               | Homepage                                    | No anonymous UA block                      | 12/12 GET responses 200 HTML                                                                                                                     | UA-only blocking not reproduced                                | [Bot tests](evidence/2026-11-20/bot-accept-tests.json)                                                              |
| Googlebot, bingbot, OAI-SearchBot, ChatGPT-User      | Robots, Reolink category, B400              | Accessible                                 | All 12 deeper GET tests return 200                                                                                                               | Confirmed from local request source                            | Same bot tests                                                                                                      |
| Markdown negotiation                                 | Reolink category and B400                   | Equivalent resource or acceptable fallback | 404 for both Markdown-only and Markdown-preferred/HTML-acceptable requests                                                                       | Confirmed defect F01                                           | Same bot tests                                                                                                      |
| Markdown indexing policy                             | Homepage/contact at canonical URL           | Consistent public indexability             | 200 Markdown with `X-Robots-Tag: noindex`; HTML is indexable                                                                                     | Confirmed inconsistency F01                                    | Same bot tests                                                                                                      |
| HTML response Vary                                   | Canonical HTML pages                        | Includes Accept when representation varies | Next.js RSC/encoding tokens present; Accept absent; Markdown includes Accept                                                                     | Confirmed header defect F04                                    | Baseline and bot tests                                                                                              |
| Raw content and rendered DOM                         | Reolink category and B400                   | Useful public catalog information          | Headings, links, descriptions, specifications and JSON-LD in full body; browser renders them; substantial text is in hidden streaming containers | Presence confirmed; non-JS extraction risk F02                 | [HTML content](evidence/2026-11-20/html-content.json), [bot streaming](evidence/2026-11-20/bot-stream-content.json) |
| Public canonical and robots                          | Sampled catalog, contact, about, blog       | Self-canonical, indexable                  | Current tested valid HTML pages self-canonical with index/follow                                                                                 | Confirmed sample pass                                          | Baseline and [supplement](evidence/2026-11-20/supplement-http.json)                                                 |
| B400 alias                                           | `/products/reolink-cctv-camera/ip/B400`     | Permanent redirect to preferred URL        | 308 → `/products/reolink-cctv-camera/bullet/B400` → 200                                                                                          | Current redirect works                                         | Supplement                                                                                                          |
| Pagination                                           | Reolink `/page/2`                           | Accessible self-canonical page             | 200, self-canonical, index/follow                                                                                                                | Confirmed pass                                                 | Supplement                                                                                                          |
| Invalid pages                                        | Nonexistent route/subcategory and page 9999 | Real 404, noindex, no homepage canonical   | All three return 404; noindex; no canonical                                                                                                      | Confirmed pass                                                 | Supplement                                                                                                          |
| Private navigation                                   | Anonymous `/admin`, `/dashboard`            | Login required                             | 307 → `/auth/login`; final login 200/noindex                                                                                                     | Protection preserved for sampled navigation                    | Supplement                                                                                                          |
| Authentic Google history                             | Reolink category                            | Successful Google crawl                    | Search Console: mobile crawl successful November 18, indexed, self-canonical                                                                     | Confirmed historical authentic access                          | [Inspection](evidence/2026-11-20/gsc-inspection.json)                                                               |
| Current authentic AI/Bing crawl                      | Provider source IPs                         | Successful request in access logs          | No edge/access-log access; spoofed UAs cannot prove origin-specific treatment                                                                    | Unverified                                                     | Checklist F                                                                                                         |
| Google aggregate indexing/manual actions/host status | Search Console reports                      | Inspect actual reports                     | URL Inspection/performance available through connector; Chrome UI inspection stopped; aggregate reports not read                                 | Unverified, not “all clear”                                    | Checklist F                                                                                                         |
| Bing index status                                    | Bing Webmaster Tools                        | Inspect property                           | No connected authenticated Bing report                                                                                                           | Unverified                                                     | Checklist F                                                                                                         |

### Architecture and production configuration

The application is Next.js 16.4.5 / React 19.3.1, App Router, PostgreSQL via Prisma, with Cache Components enabled. Public routes use server-side data functions with `use cache`; client components handle interactive controls and invoice/auth flows. The root UserProvider renders its children rather than withholding the site until login/profile fetching completes. Public product/category pages are therefore not uniformly client-only.

Reviewed entry points include `package.json`, `next.config.mjs`, `liara.json`, `.liaraignore`, `src/proxy.ts`, root/main layouts, homepage/TrustLanding, catalog/category/subcategory/product templates, blog metadata, contact/about/support, robots/sitemap implementations, public data helpers, authentication handling, Markdown routes, schema output, and error/404 behavior. No custom Dockerfile or nginx configuration was found in the repository scan. `public/web.config` contains an IIS SPA rule; there is no evidence that Liara's active Next.js runtime consumes it.

`liara.json:5` configures **build** location Germany; the user separately confirms the application moved back to Germany on November 19. The file alone does not prove runtime region. `liara.json:13` mounts a disk at `.next/server/app`. Liara's [App Router ISR instructions](https://docs.liara.ir/paas/nextjs/how-tos/use-isr/) explicitly document that mount, so its existence is not a confirmed bug. Verify disk/build consistency after the regional migration rather than removing it blindly. The same guide contains Pages Router examples; use the installed Next.js 16 documentation for actual Cache Components behavior.

`JWT_SECRET` and `REFRESH_TOKEN_SECRET` are required at proxy module initialization. Missing production values could break public requests, but the sampled successful production requests reject that as the current universal failure. `DATABASE_URL` drives public catalog rendering; sitemap fallback and data-error handling need monitoring. Environment **names and usage**, not secret values, were inspected. `.liaraignore` excludes `.env*`, `.next`, local tooling, and documentation from uploads.

Current source is not proof of the exact deployed SHA. Working production canonicals, redirects and sitemap changes match several recent fixes, but release identity and deployment logs remain external checks. No fresh production build, application test run, or deployment was performed for this documentation-only investigation.

### DNS, region, and ping interpretation

HostIran is the registrar according to the user; publicly returned authoritative nameservers are Liara's. These are separate roles. Do not change records in an inactive registrar-hosted zone and expect the live Liara zone to change. Both apex and www resolve consistently in the tested public resolver queries. These queries originate from one local network; remote HTTP probes provide the separate international vantage points.

No AAAA is advertised, so IPv6-only access is unavailable but there is no incorrect IPv6 address for dual-stack crawlers to prefer. DS/DNSKEY results are consistent with an unsigned zone; enabling DNSSEC is not an identified ranking fix. The tests cannot certify every authoritative server, cache, or resolver worldwide. No IP geolocation inference is used to contradict the user's runtime region.

### Google visibility and indexing detail

| Inspected URL (paths relative to apex)      | Google's stored state on November 20 | Last recorded crawl / canonical detail                                                                  |
| ------------------------------------------- | ------------------------------------ | ------------------------------------------------------------------------------------------------------- |
| `/`                                         | Submitted and indexed                | November 15; selected/declared apex match                                                               |
| `/products`                                 | Submitted and indexed                | November 10; no declared canonical recorded then; current HTML has one                                  |
| `/products/reolink-cctv-camera`             | Submitted and indexed                | November 18; successful mobile crawl; selected/declared match                                           |
| `/products/reolink-cctv-camera/bullet/B400` | URL unknown to Google                | No crawl recorded                                                                                       |
| `/products/reolink-cctv-camera/ip/B400`     | Submitted and indexed                | September 1; Google retained alias despite declared bullet canonical; alias now redirects               |
| `/products/reolink-cctv-camera/bullet`      | Discovered, currently not indexed    | No completed fetch recorded                                                                             |
| `/products/reolink-cctv-camera/ip`          | Submitted and indexed                | November 14; no declared canonical recorded then; current template declares one                         |
| `/products/reolink-cctv-camera/ip/RLC-811A` | Discovered, currently not indexed    | No completed fetch recorded                                                                             |
| `/contact-us`                               | Discovered, currently not indexed    | Sitemap and referring pages known                                                                       |
| `/support/blog`                             | Submitted and indexed                | October 29; old declared homepage canonical differs from selected blog canonical; fixed in current HTML |
| `/support/blog/reolink/reolink-products`    | Submitted and indexed                | November 16; selected/declared match                                                                    |
| `/products/blackmagic`                      | Submitted and indexed                | November 14                                                                                             |
| `/about-us`                                 | Inspection unavailable               | Connector timed out twice; not evidence of a site timeout                                               |

Sources: [first inspection batch](evidence/2026-11-20/gsc-inspection.json), [additional inspection batch](evidence/2026-11-20/gsc-more_inspection.json). These results describe Google's stored index, not a live URL test. The selected alias can remain in that stored state until Google processes the current redirect. Eight sampled URLs are recorded indexed, four are not indexed, and one is unknown because inspection failed; this is not an estimate of sitewide indexed-page counts.

The main losses in the page aggregation are more informative than a single sitewide average:

| Page                         | Clicks before → after | Impressions before → after | Average position before → after |
| ---------------------------- | --------------------: | -------------------------: | ------------------------------: |
| Reolink applications article |               76 → 39 |                  669 → 471 |                       4.9 → 4.8 |
| Reolink category             |                22 → 4 |                  430 → 210 |                       6.1 → 6.4 |
| Homepage                     |               31 → 24 |                    99 → 87 |                       2.7 → 2.7 |

Windows are September 23–October 20 versus October 21–November 17. These page aggregates include different aggregation behavior from the property/date totals; do not force their totals to reconcile or sum query rows into site totals. Anonymized queries are absent from query-level output. [Before pages](evidence/2026-11-20/gsc-pages_previous.json), [after pages](evidence/2026-11-20/gsc-pages28.json).

The Reolink category's after-period CTR is 1.90% versus 5.12% before. Lower exposure and CTR, with a relatively stable aggregate position, account arithmetically for its click loss. This does not establish why exposure/CTR changed; query demand, query mix, SERP composition, snippets, and competition remain alternatives. The applications article also receives searches for earbuds/“AirPod” terminology, which is not the same purchase intent as surveillance cameras. Do not rewrite a working camera-software guide to chase unrelated earbud traffic. [Query/page evidence](evidence/2026-11-20/gsc-query-page.json).

For November 4–10 versus November 11–17, `/products/x-ray` impressions increased from 11 to 101 and its average position changed from 38.2 to 66.9. This materially shifts the sitewide metric toward lower positions without showing that every established page collapsed. [Previous seven days](evidence/2026-11-20/gsc-pages_previous7.json), [recent seven days](evidence/2026-11-20/gsc-pages_recent7.json).

The 12-month series shows monthly average position around 5.9–6.7 in May–July, 10.1–10.9 in August–October, and 17.0 in November through the 17th. March is a separate severe low-volume interval (7 clicks, 134 impressions); its cause is unverified. Month lengths, the partial November period, query mix and demand make raw monthly comparisons unsuitable as proof of hosting causality. The exact Iran migration date and historical server/crawl logs are still needed. [Year history](evidence/2026-11-20/gsc-year-daily.json). Google's [traffic-drop investigation guide](https://developers.google.com/search/docs/monitor-debug/debugging-search-traffic-drops) supports separating technical issues, demand and ranking changes instead of inferring a penalty from one graph.

### Robots, sitemap, content, and entity recognition

Production robots.txt permits public catalog/blog/contact pages. `OAI-SearchBot`, Googlebot, bingbot, Claude-SearchBot, Claude-User and Perplexity-User fall under the permissive wildcard where no dedicated group exists. Missing a dedicated group is not itself a block. GPTBot and ClaudeBot are already explicitly allowed by existing policy; this audit did not add or broaden training permission. Search crawling, user-triggered retrieval and model training are separate purposes. OpenAI explicitly separates [OAI-SearchBot, GPTBot and ChatGPT-User](https://developers.openai.com/api/docs/bots); Anthropic [documents its three roles separately](https://privacy.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler).

Robots exclusions cover `/admin/` and `/dashboard/`; individual AI groups also exclude `/api/admin/`. Slash-prefix exclusions are not access control and do not reliably cover every exact root spelling. The sampled private roots require login. Preserve authorization checks regardless of robots policy. [Google robots guidance](https://developers.google.com/search/docs/crawling-indexing/robots/intro).

The 485 sitemap URLs include 69 Reolink family URLs, 238 Blackmagic, 52 X-ray, 18 industrial CCTV, and 77 blog-family URLs, plus other categories/support/company pages. XML parsing, uniqueness, hostname/protocol and absence of query/fragment/whitespace defects passed. All 485 destinations were **not** fetched in this audit. Product/category publication filters exist; blogs exclude QR-key content. Products do not explicitly exclude QR-key content in the sitemap query: see F06. Database failure can reduce the sitemap to ten fallback URLs while still returning 200, so HTTP status alone is an insufficient sitemap monitor.

Current HTML provides Persian language/direction, catalog headings, model links, company identity and contact details. The Reolink category uses both ریولینک and رئولینک, links model families, and gives selection advice. It is linked from the public site and actually indexed. A separate duplicate “Reolink brand landing page” is therefore not the first action. The category can already establish that Farabak supplies Reolink for the Iranian market; discoverability and trustworthy evidence still determine whether another system selects it.

Structured data was inspected in raw HTML and in the rendered Reolink product/category browser DOM. The homepage includes Organization/WebSite/WebPage; listings include CollectionPage/ItemList/BreadcrumbList; B400 includes Product and breadcrumbs, with an additional BlogPosting script visible after rendering. Schema is **not absent**. B400's Product node lacks Brand because its model-only Type does not contain “Reolink” (F05). Its technical content also mixes camera/NVR wording and includes an unsupported superlative in supplementary copy; verify model facts and remove unsupported claims through editorial review. No price, stock, reviews, ratings, merchant eligibility, or formal distributorship was independently verified. Do not invent Offer or LocalBusiness fields to satisfy a validator. Quote/invoice access can require login without blocking the public catalog.

### Competitor comparison

| Site / tested page                                                                    | Measured accessibility and structure                                                                                                                     | Relevant difference / limit                                                                                                                                                                       |
| ------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Farabak Reolink category                                                              | Local 200, self-canonical/indexable; raw content present; rendered catalog works; web tool can return a cached category snapshot                         | Negotiated Markdown fails; important content is in hidden stream segments; some models remain undiscovered                                                                                        |
| [Maxa Reolink category](https://maxasecurity.com/product-category/cctv/reolink-cctv/) | Local 200; self-canonical/indexable; visible raw H1 and explanatory copy; robots 200; sitemap.xml redirects to sitemap_index.xml; web retrieval succeeds | Conventional directly extractable brand/category text; this observation does not prove superior rankings/backlinks                                                                                |
| [Kiyan Daria Reolink brand](https://kiyandaria.com/brand/reolink)                     | Local 200; self-canonical/indexable; raw brand/catalog content; robots and sitemap index 200; web retrieval succeeds                                     | The brand page is accessible even though its robots blocks several AI agents and Bing on `/pro/` product routes; permissive training access is not required for its observed brand-page retrieval |
| [Fallahnet homepage](https://fallahnet.com/)                                          | Local homepage, robots and sitemap index 200; product links and schema present; web tool homepage retrieval fails                                        | Not every competitor is consistently retrievable either. The tested homepage alone cannot establish a current Reolink assortment or a superior citation position                                  |

Evidence: [HTTP comparison](evidence/2026-11-20/supplement-http.json), [parsed content](evidence/2026-11-20/supplement-content.json). Fallahnet's domain was identified from its public business channel and then tested directly. No competitor accounts, inventories, backlink datasets, conversion rates or authenticated Search Console properties were accessed. Search results establish discoverability of specific pages, not complete indexing or a controlled Iranian Google rank. No paid ranking/backlink research was run.

## C. Root cause analysis

### F01 — Public URL behavior changes incorrectly with Accept

**Priority/severity:** P1/high. **Status:** confirmed defect; contribution to the exact ChatGPT failure unverified.

**Cause and evidence:** `src/proxy.ts:303–317` negotiates Markdown for all public page paths and rewrites them to `/markdown/...`. `src/lib/markdownContent.ts:87` has only six static page entries. `src/app/markdown/[[...slug]]/route.ts:14–19` returns 404 for missing entries. Thus valid category/product URLs become false 404s under Markdown negotiation. That route's line 32 also applies noindex to successful responses, including internally rewritten canonical public URLs. The static homepage copy at `src/lib/markdownContent.ts:9` carries “official/main importer” claims separately from the current homepage's more restrained content.

**Affected URLs:** Reolink category, B400, and other dynamic paths subject to this rewrite; homepage/contact for observed noindex inconsistency. **Search impact:** standard HTML Google requests passed; other representations can have conflicting resource/indexability signals. **AI impact:** clients preferring Markdown can lose the entire catalog. No evidence establishes the failed web tool's actual Accept header.

**Solution:** negotiate only representations implemented for the requested resource; fall back to HTML when acceptable; use 406 for a genuinely unsupported representation rather than inventing a resource 404. Derive supported alternate content from the same verified public data. Distinguish a separate `/markdown/...` URL's policy from a representation of the canonical URL.

**Verification:** request existing and missing resources with HTML, wildcard, Markdown-only, and Markdown-preferred plus HTML headers; assert resource-consistent status, public data, canonical/indexing policy and private-route behavior. Repeat against production after an approved deployment.

### F02 — Streaming content requires better non-JavaScript extraction verification

**Priority/severity:** P1/high for retrieval compatibility. **Status:** hidden streaming placement confirmed; failed extraction by a specific provider is highly plausible but unproven.

**Cause and evidence:** `next.config.mjs:22` enables Cache Components. Product `page.tsx:86` wraps `ProductDataWrapper` in Suspense; `ProductDataWrapper.tsx:68` defers with `io()`. Category `page.tsx:48` uses `connection()`. In the baseline B400 body, 8,110 of 8,312 extracted text characters have a hidden ancestor, including H1. Bot samples show the same hidden-content behavior. Googlebot/bingbot get the canonical in head; OAI-SearchBot/ChatGPT-User B400 samples do not. Browser rendering confirms substantial product text/specifications, so this is not a missing-data or wholly client-fetched catalog diagnosis.

**Affected URLs:** sampled product/category/contact/blog pages, with different degrees of deferred content. **Search impact:** Google can render JavaScript and has successful crawl records; do not infer universal nonindexability. **AI impact:** an extractor that ignores hidden segments or stops before deferred metadata may see little usable content.

**Solution:** make essential public product identity, summary, links and metadata robustly available to simple consumers while retaining interaction/loading behavior. Read the installed Next.js Cache Components/metadata guidance before choosing the rendering boundary. Adding bots to `htmlLimitedBots` affects metadata; the observed Googlebot body demonstrates that it alone does not prove a usable non-JS body. Avoid different marketing facts for different bots.

**Verification:** compare raw HTML, an extractor that excludes hidden/script content, a real browser with JavaScript disabled, a normal rendered browser, and supported Markdown for the same public data. No JavaScript-disabled browser test was completed in this audit. The [installed metadata guide](../../node_modules/next/dist/docs/01-app/03-api-reference/04-functions/generate-metadata.md) explains streamed metadata and HTML-limited bots.

### F03 — Google's stored discovery and canonical state is incomplete

**Priority/severity:** P1/high. **Status:** confirmed index states; underlying historical cause unverified.

**Cause and evidence:** inspection reports B400 canonical unknown, the old alias indexed with a different selected canonical, and contact/bullet/RLC-811A discovered but not indexed. Current alias redirect and self-canonicals pass. Blog index's stored homepage canonical is older than the current corrected HTML. This is consistent with incomplete crawl/consolidation after recent fixes, not proof that the current redirects are broken.

**Affected files:** `src/proxy.ts:214` onward (product canonical resolution), product metadata `page.tsx:49–73`, `src/lib/data/product-page-validation.ts:90–99`, `src/app/(main)/support/blog/page.tsx:25`, sitemap data. **Affected URLs:** the explicit inspection table above. **Search/AI impact:** some preferred model/company URLs are absent from Google's recorded index; AI systems with separate discovery pipelines can also lag, but their exact index state is unavailable.

**Solution:** retain one-hop permanent aliases and correct internal links, confirm sitemap processing, inspect live target responses, then request recrawling of a small priority sample through Search Console. Record before/after selected canonicals and last crawl. No requests were submitted during the audit. [Google canonical guidance](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls).

**Verification:** canonical B400 becomes known/crawled; alias eventually consolidates to target; contact and priority model outcomes are tracked individually. An indexing request is not proof of indexing and cannot guarantee ranking.

### F04 — Production HTML drops Accept from Vary

**Priority/severity:** P2/medium. **Status:** confirmed response-header defect; cache mixing not observed.

**Cause and evidence:** `src/proxy.ts:30–33` and `next.config.mjs:64–68` attempt to declare Accept, but actual rendered HTML headers retain RSC/encoding variation without Accept. Markdown responses include Accept. The exact framework/edge overwrite point needs tracing. HTML also returns private/no-store cache directives, limiting the demonstrated shared-cache risk today.

**Affected URLs:** sampled HTML routes serving alternate representations. **Search/AI impact:** a future or misconfigured cache could select the wrong representation. No cache poisoning or stale shared-cache body was demonstrated.

**Solution/verification:** merge Accept with Next.js-required Vary tokens at the final serving layer; preserve cache control. Inspect final production headers and alternate HTML/Markdown requests through the actual cache. Do not replace Vary with only Accept or enable caching indiscriminately.

### F05 — Model-only product names lose authoritative Brand metadata

**Priority/severity:** P2/medium. **Status:** confirmed on B400.

**Cause:** `ProductDataWrapper.tsx:99` calls `detectBrand(productData.Type)`; B400's Type is just `B400`. `src/helpers/sources.ts:102` searches text tokens and cannot infer a brand absent from that text. Brand is consequently missing from the rendered Product node, although visible breadcrumbs/description provide context.

**Affected URL:** B400; other model-only names may be affected but were not exhaustively counted. **Search/AI impact:** weaker explicit entity linkage; not an indexing blocker or proof of why a provider omitted Farabak.

**Solution/verification:** use verified brand/category data rather than fragile model-name parsing; verify visible and structured brand agreement for Reolink, Blackmagic and unbranded examples. Keep valid quote-only Product markup without fabricated Offer/review/availability fields. Review B400's camera/NVR copy separately against manufacturer documentation.

### F06 — Sitemap public-eligibility filters omit the product QR restriction

**Priority/severity:** P2/medium. **Status:** source gap confirmed; presence of affected production rows unverified.

**Cause:** `src/lib/data/sitemap.ts:34` selects `Available: true` products without excluding `QrCode_Key`; `src/lib/data/product-page-validation.ts:83–84` requires a matching key whenever that field exists, including available products. The sitemap helper does not receive the QR restriction. Blogs already exclude QR-key rows at `sitemap.ts:65`.

**Affected URLs:** only products satisfying both conditions, if any exist; no individual live URL is asserted affected. **Search/AI impact:** potential sitemap entries that anonymous visitors cannot open. Never publish QR keys to make a sitemap URL work.

**Solution/verification:** align sitemap eligibility with anonymous page eligibility; test available public, unavailable, key-protected, expired and malformed-category cases. Validate against counts/statuses without exposing keys. Keep failure monitoring because the ten-URL fallback can mask database errors behind HTTP 200 (`src/app/sitemap.ts:18–21`).

### F07 — Cold catalog rendering can wait on sequential currency providers

**Priority/severity:** P2/medium. **Status:** dependency and timeout budget confirmed in source; production timeout causality possible, not reproduced.

**Cause:** category/subcategory `page.tsx:51–57` awaits `getUsdToRialRate()` before returning the catalog. `src/lib/data/usd2rial.ts:9,80–89` tries three providers sequentially with a 15-second per-fetch timeout. On an unsuccessful cold path this can consume roughly 45 seconds plus overhead; caching at line 107 changes how often users encounter it. Successful measured requests do not prove that worst case occurred.

**Affected URLs:** catalog listings and other callers. **Search/AI impact:** intermittent slow responses could limit crawling/retrieval; current baseline TTFB is roughly 1–3.3 seconds for sampled HTML, not an outage.

**Solution/verification:** measure provider/cache timing in Germany, keep catalog text usable when live pricing is unavailable, and set a bounded response budget without weakening accurate price handling. Test all-provider failure and stale/missing rates; verify no fake price/stock claims. Do not attribute the historic traffic decline to this path without timing/log evidence.

### Hypotheses not established as root causes

| Hypothesis                                             | Classification                            | Reason / next discriminating evidence                                                                               |
| ------------------------------------------------------ | ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| Entire site inaccessible internationally               | Rejected at test time                     | Seven independent countries returned 200; does not resolve historical uptime                                        |
| Broken AAAA preferred by crawlers                      | Rejected                                  | No AAAA advertised in tested answers                                                                                |
| Current invalid SSL certificate                        | Rejected for tested clients               | Trusted hostname-verified TLS succeeds                                                                              |
| Blanket robots/noindex on normal public HTML           | Rejected for sampled pages                | Public robots allow, HTML index/follow; Markdown exception is F01                                                   |
| Bot UA alone blocked at application/edge               | Rejected for tested strings/source        | 24 HTML/robots requests succeeded; authentic provider IP treatment still unknown                                    |
| No server-generated content/schema                     | Rejected                                  | Raw and rendered evidence contain content/schema; visibility/extraction caveat is F02                               |
| Iran-region routing caused the gradual decline         | Possible                                  | User timeline supports investigation, not causality; historic host/crawl logs needed                                |
| Current WAF/provider-IP block                          | Unverified                                | No edge/access logs or WAF event records; successful international probes cannot exclude a provider-specific policy |
| Google manual action/security issue                    | Unverified                                | Those reports were not read; partial indexing alone cannot rule out an action                                       |
| `.next/server/app` disk mount is inherently wrong      | Rejected as an unsupported recommendation | Liara documents it; active release/mount consistency still needs verification                                       |
| Low backlinks/authority explain omission               | Unverified                                | No reliable backlink comparison obtained; do not infer from sparse search output                                    |
| A special llms.txt/schema file guarantees AI citations | Rejected                                  | No such guarantee established; accessibility/indexability/content come first                                        |

## D. Prioritized action plan

| Priority         | Action                                                                                                    | Owner / prerequisite                                                    |
| ---------------- | --------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| P0 — conditional | If authentic logs reveal persistent DNS/TLS/403/5xx/timeout failures, address that specific failure first | Hosting owner; obtain status/path/source evidence before changing rules |
| P1               | Fix F01's false Markdown 404s and inconsistent same-URL indexability                                      | Application; ticket T01                                                 |
| P1               | Make essential public content reliably extractable and test with JS disabled                              | Application; T02, with current Next.js docs                             |
| P1               | Complete priority indexing/canonical recovery and migration log correlation                               | SEO/hosting; T03 and T04                                                |
| P2               | Preserve correct Vary and test actual caches                                                              | Application/edge; T05                                                   |
| P2               | Use authoritative product Brand and correct unsupported/mismatched copy                                   | Application/catalog owner; T06                                          |
| P2               | Align sitemap public eligibility and detect fallback shrinkage                                            | Application; T07                                                        |
| P2               | Bound price-provider impact after measuring cold requests                                                 | Application/hosting; T08                                                |
| P3               | Add ongoing checks, track useful Iranian purchase queries, review training-bot policy separately          | Maintainer; T09                                                         |

No current confirmed P0 warrants a DNS/provider change. The strongest reason to fix F01 before writing new SEO pages is that it demonstrably loses existing catalog resources for a supported client preference. Content expansion/backlink campaigns have a less certain mechanism until access and indexing discrepancies are handled. No blanket firewall disable, paid subscription, or training-crawler enablement is recommended.

## E. Implementation tickets

### T01 — Repair alternate representations of public resources

- **Priority / complexity / access:** P1; medium; repository, then approved production deployment.
- **Description/root cause:** F01; broad proxy rewrite targets a six-entry static map and applies alternate-route noindex to canonical resources.
- **Files:** `src/proxy.ts`, `src/lib/contentNegotiation.ts`, `src/lib/markdownContent.ts`, `src/app/markdown/[[...slug]]/route.ts`; related tests.
- **Requirements:** route-aware available representations, acceptable HTML fallback, accurate 404 versus 406, consistent public eligibility/indexing policy; shared verified facts; preserve authorization and genuine missing-resource behavior.
- **Dependencies:** choose supported representation policy; review current Next.js proxy/route-handler docs. Does not require DNS changes.
- **Acceptance:** category/B400 remain usable under every supported Accept combination; a request accepting HTML never gets a false resource 404 because Markdown is absent; private/key-only content remains private.
- **Required tests/verification:** negotiation table including q=0/exclusions and wildcard; public/private/missing-resource integration tests; repeat production curl status/body/header matrix.

### T02 — Establish a usable non-JavaScript catalog response

- **Priority / complexity / access:** P1; medium–high; repository and staging/browser verification.
- **Description/root cause:** F02; essential content is deferred into hidden streaming segments; tested AI user agents have later product metadata.
- **Files:** product `page.tsx` and `ProductDataWrapper.tsx`; category/subcategory/listing wrappers; `next.config.mjs` only if evidence requires it.
- **Requirements:** same correct product/category facts available without executing hydration; maintain accessibility, interactive controls, cache correctness and QR protection. Measure before changing streaming globally.
- **Dependencies:** T01; installed Next.js 16 Cache Components/metadata guidance; representative production data.
- **Acceptance:** JS-disabled browser and a hidden-content-excluding extractor expose model, brand, summary, key specs and relevant links; metadata is discoverable by supported clients; normal rendering still works.
- **Required tests/verification:** raw/head extraction, JS-off and JS-on browser comparison, Googlebot/OpenAI UA samples, production timing and data consistency. Metadata-only tests do not close this ticket.

### T03 — Reconcile priority Google indexing and canonical aliases

- **Priority / complexity / access:** P1; small–medium; Search Console; repository only if a live defect is found.
- **Description/root cause:** F03; Google's stored state lags or omits preferred URLs; current live redirects/canonicals are already correct in the sample.
- **Affected files/URLs:** sitemap/metadata/proxy verification; B400 alias/target, contact, bullet category, RLC-811A, blog index.
- **Requirements:** record indexed and live-test results, last crawl, declared/selected canonical, sitemap processing and referring pages. After confirming live correctness, submit a small priority recrawl sample through the normal UI.
- **Dependencies:** complete T01/T02 verification; current GSC property access. No mass indexing-submission API dependency.
- **Acceptance:** each priority URL has a recorded outcome and next action; target becomes discoverable/crawled where Google permits, or remaining exclusions have evidence; no claim of guaranteed indexing/ranking.
- **Required tests/verification:** live HTTP/HTML plus repeated stored URL Inspection after actual recrawl; alias is one-hop permanent. An accepted indexing request alone is insufficient.

### T04 — Correlate the Iran/Germany migration with genuine crawler requests

- **Priority / complexity / access:** P1 diagnostic; medium; external Liara/edge/Search Console access.
- **Description/root cause:** historical hosting causality and current provider-specific blocks are unverified.
- **Affected files:** `liara.json` as reference; no mandatory code change. Application request logging only if edge logs are insufficient and separately reviewed.
- **Requirements:** obtain exact migration/release times, runtime region, app/edge error/restart history, crawl host-status history and sanitized crawler access rows; verify bot identities against current provider documentation.
- **Dependencies:** hosting owner/log availability; no DNS/WAF mutation authorized by this ticket.
- **Acceptance:** distinguish “request never reached edge,” “edge denied,” “origin failed,” and “origin served correct body”; correlate the actual failed retrieval when possible; document retention gaps explicitly.
- **Required tests/verification:** seven-country HTTPS sample plus authentic Google/OpenAI/Bing request samples or a precise statement of what the logs cannot establish. ICMP is not the uptime criterion.

### T05 — Preserve representation variation in final response headers

- **Priority / complexity / access:** P2; medium; repository plus hosting/cache inspection.
- **Description/root cause:** F04; configured Accept variation is absent in final HTML.
- **Files:** `src/proxy.ts`, `next.config.mjs`; serving-layer config only if overwrite is located there.
- **Requirements:** preserve all framework-required Vary values and existing private/no-store policies; ensure HTML/Markdown cache separation if caching is introduced.
- **Dependencies:** T01's representation policy; identify final response writer.
- **Acceptance:** Accept appears in final headers whenever representation depends on it; RSC tokens remain; alternating requests do not mix bodies/types.
- **Required tests/verification:** deployed response-header assertions and cache-hit/miss matrix on actual infrastructure, not just mocked proxy tests.

### T06 — Correct product entity data and model-specific copy

- **Priority / complexity / access:** P2; medium; repository plus catalog/editorial owner.
- **Description/root cause:** F05; brand inferred only from Type; supplemental B400 content mixes device terminology and unsupported claims.
- **Files:** `ProductDataWrapper.tsx`, `src/helpers/sources.ts`, public product data selectors; catalog fields rendered by `ProductBlog.tsx`/overview components.
- **Requirements:** verified brand source, visible/structured agreement, accurate B400 terminology, authoritative references; no invented offers, stock, certifications, ratings or exclusive-importer claims.
- **Dependencies:** catalog fact verification; changes to stored editorial data require the normal owner workflow.
- **Acceptance:** B400 Product declares verified Reolink brand; Blackmagic/unbranded samples remain correct; supplementary claims are substantiated or removed.
- **Required tests/verification:** server/rendered JSON-LD semantic checks, manufacturer fact review, Rich Results Test where applicable. Rich-result eligibility is separate from ordinary indexing.

### T07 — Match sitemap eligibility to anonymous public routes

- **Priority / complexity / access:** P2; small–medium; repository; production data counts optional and sanitized.
- **Description/root cause:** F06 plus silent ten-entry fallback risk.
- **Files:** `src/lib/data/sitemap.ts`, `sitemap-utils.ts`, `product-page-validation.ts`, `src/app/sitemap.ts`; their existing tests.
- **Requirements:** exclude key-protected/unavailable/unpublished content consistently, keep canonical route resolution aligned, and alert on generation fallback or unexpected family/count shrinkage without publishing keys.
- **Dependencies:** public-eligibility policy; database failure fixtures.
- **Acceptance:** all generated URLs are anonymously eligible; sitemap remains valid on failure but reduced coverage is observable; truthful lastmod only when backed by real per-URL timestamps.
- **Required tests/verification:** eligibility fixture matrix, XML/domain/duplicate checks, failure-path test and sampled live destination checks.

### T08 — Bound catalog latency when exchange-rate providers fail

- **Priority / complexity / access:** P2; medium; repository and runtime timings.
- **Description/root cause:** F07; sequential rate fetches precede useful listing response.
- **Files:** `src/lib/data/usd2rial.ts`, category/subcategory/paginated listing callers and pricing components.
- **Requirements:** measure cache-cold provider delays; keep catalog descriptions/links available when pricing is unknown; use a documented total timeout/stale-data policy; retain correct Toman/Rial handling.
- **Dependencies:** T02 rendering boundaries; pricing policy approval only if changing displayed stale-price semantics.
- **Acceptance:** all-provider failure cannot impose three sequential 15-second waits before essential catalog text; missing prices are represented accurately.
- **Required tests/verification:** simulated timeouts, provider fallback and stale/missing cases; production cold/warm timings. A single fast warm request does not establish the bound.

### T09 — Add deployment and search-health regression checks

- **Priority / complexity / access:** P3; medium; repository CI plus an existing independent monitoring host.
- **Description/root cause:** catch recurrence of F01–F07 and distinguish app health from ICMP.
- **Files:** future CI/diagnostic scripts and documentation; no workflow was added by this audit.
- **Requirements:** implement section G using existing/free tooling; do not add subscriptions, broad crawler allowances or automated production mutations.
- **Dependencies:** agreed supported routes/representations, canonical origin, deployment identity, suitable monitoring runtime.
- **Acceptance:** checks fail for false Markdown 404, public noindex, missing canonical/visible core content, wrong origin, sitemap collapse, redirect loop or certificate failure; private routes remain protected.
- **Required tests/verification:** deliberately broken fixtures/staging responses demonstrate that checks detect the intended failures; one successful page cannot validate the whole site.

## F. External infrastructure checklist

These are read-only checks unless a later change is explicitly approved. Report names are more reliable than guessed console menu labels; hosting UI labels can change.

| Where to inspect                                        | Exact information needed                                                                                                                                   | How to interpret / next step                                                                                                                                |
| ------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Liara `farabak-next` application overview/releases      | Runtime region, active release/build ID, deployment/restart timestamps around November 19, previous Iran migration date                                    | Germany build setting alone does not prove runtime region; compare actual release to tested public behavior                                                 |
| Liara application logs/metrics                          | OOM/restarts, CPU/memory, DB connection/timeout errors, public 5xx, sitemap-generation failures, rate-provider timings                                     | Match times to Google crawl failures and retrieval attempts. Do not infer an outage from unrelated build mirror slowness                                    |
| Liara domain/TLS settings                               | Apex and www mappings, HTTPS enforcement, certificate expiry/renewal and any custom-domain proxy                                                           | Expected redirects/certificates are documented above; investigate discrepancies before editing DNS                                                          |
| Liara disks/filesystem                                  | Which disk is mounted at `.next/server/app`, migration/copy behavior, active build's route/static files and permissions                                    | Mount follows documented ISR pattern; stale/mixed release files would require concrete file/release evidence before remediation                             |
| Liara/edge HTTP access logs                             | UTC time, host, path without sensitive query values, source IP, UA, Accept, status, bytes, upstream duration, request ID; samples for robots/category/B400 | Correct public response proves that request reached origin; no origin row requires checking edge logs, not declaring the request never happened             |
| Authoritative DNS zone at Liara; delegation at HostIran | Live NS, apex/www A, any AAAA, TTL, SOA serial; registrar DS if present                                                                                    | Current expected A is `185.208.181.159`, NS are Liara; confirm against the live application domain instructions rather than blindly pinning this IP forever |
| Any CDN or upstream proxy                               | Actual provider/zone, origin target, cache rules, country/IP/ASN filters, challenge events and Vary handling                                               | “I did not configure a WAF” does not prove provider-managed protections are absent. No Cloudflare deployment was established by this audit                  |
| Firewall/bot rules                                      | Denials/challenges/rate limits matching genuine crawler IPs, with rule IDs and times                                                                       | Compare observed sources to current official ranges; narrowly correct a demonstrated false positive rather than disabling protection                        |
| Search Console → Settings → Crawl stats → Host status   | Host availability, robots retrieval, DNS resolution and server connectivity history; response codes/download time by date                                  | Current green status can coexist with historical problems; record the period around region changes and the latest 90-day graph                              |
| Search Console → Page indexing                          | Last update, indexed/not-indexed totals, reasons and examples, with all-known-pages and submitted-sitemap filters distinguished                            | “Discovered” is not proof of a completed crawl. Indexed counts alone do not explain rankings                                                                |
| Search Console → Sitemaps                               | Submitted sitemap URL, last read, processing status, discovered URLs and errors                                                                            | Public XML 200 does not establish Google processed the latest 485-URL sitemap                                                                               |
| Search Console → URL Inspection                         | Indexed result plus Test live URL for the priority table; rendered HTML/screenshot/resources where available                                               | Stored results can lag fixes; separate live eligibility, crawl time and actual indexed state                                                                |
| Search Console → Security & Manual Actions              | Manual actions report and Security issues report, exact current result                                                                                     | These were not inspected; do not mark them “fine” from performance/URL Inspection alone                                                                     |
| Search Console → Performance                            | Same query/page/country/device comparisons before/after migration, including Iran                                                                          | Latest finalized connector data ends November 17. Compare future finalized windows after actual recrawl; do not treat day-one movement as recovery proof    |
| Bing Webmaster Tools                                    | farabak.net property, Sitemaps status/last fetch, URL Inspection and Site Explorer for homepage/category/B400; crawl errors                                | Bing results remain unknown. Do not substitute Google status or a site: query for Bing's own records                                                        |

For authentic bot identification, use Google's [reverse-then-forward DNS or current crawler IP ranges](https://developers.google.com/crawling/docs/crawlers-fetchers/verify-google-requests), Bing's [verification guidance](https://www.bing.com/webmasters/help/how-to-verify-bingbot-3905dc26), OpenAI's role-specific published JSON linked from its [crawler documentation](https://developers.openai.com/api/docs/bots), and Perplexity's [crawler/user IP lists](https://docs.perplexity.ai/docs/resources/perplexity-crawlers). OpenAI currently links `https://openai.com/searchbot.json`, `https://openai.com/chatgpt-user.json`, and `https://openai.com/gptbot.json`; fetch the current lists at verification time rather than hard-coding them in this report. A claimed User-Agent is insufficient authentication. Anthropic's linked official documentation describes its roles; no authenticated Anthropic source request was observed.

Do not collect Authorization headers, cookies, JWTs, environment values or QR keys in an SEO log/export. Liara's [logging guide](https://docs.liara.ir/paas/nextjs/how-tos/set-logs/) explains access to application logging; its example logs authorization values, which should **not** be copied into this diagnostic workflow.

The user authorized checking the open Chrome session. Browser control stopped because it could not reliably establish Chrome's current URL; no actions were taken in that session. The connector nevertheless supplied verified Search Console performance/URL Inspection data. To close the remaining UI-only gaps, provide the named report values or sanitized exports/screenshots for Crawl stats/Host status, Page indexing, Sitemaps, Manual actions and Security issues. The historical November 13 counts in the older repository release report are not used as current totals.

## G. Regression prevention

Use existing Node/Python/curl, Vitest and browser tooling where available. These checks are recommendations/tickets, not newly installed monitors or scheduled jobs.

| Stage               | Check and meaningful failure condition                                                                                                                                    |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Local/unit          | Accept negotiation and route coverage matrix, including quality exclusions, missing representations and true missing resources; reject false 404s                         |
| Local/unit          | Product public eligibility shared with sitemap/validation; available/key-only/expired/unpublished/unavailable cases                                                       |
| Local/unit          | Metadata/canonical origin and product brand from authoritative data; no automatic homepage canonical on unique pages                                                      |
| Local/unit          | Pricing provider timeout budget, all-provider failure and Toman/Rial conversion correctness                                                                               |
| CI production build | Assert essential product/category content with JS disabled and enabled; test actual generated server response rather than component mocks alone                           |
| CI build output     | Validate robots groups and intended public/private paths; parse sitemap XML, uniqueness, protocol/host and expected page families                                         |
| CI integration      | Check actual GET/HEAD, redirects, anonymous protection, public indexability, canonical uniqueness/head placement for supported consumers and Vary merging                 |
| CI schema           | Parse server and rendered JSON-LD; semantic brand/name/URL checks and truthful Offer policy. Google Rich Results Test remains a separate external check                   |
| Post-deploy         | Require recorded release identity, homepage/category/product/contact/blog/robots/sitemap checks and invalid-page/private-route controls                                   |
| Post-deploy         | Alternate HTML/Markdown requests, bot UAs and cache hit/miss conditions; no CAPTCHA/challenge/login body at a public URL                                                  |
| Production          | HTTPS GET from Iran and at least two independent international locations; check status **and expected body text**, not just ping or HEAD                                  |
| Production          | Certificate trust/hostname/expiry for apex and www; alert before renewal failure                                                                                          |
| Production          | Sitemap family/count change alert and explicit generation-error signal; permit legitimate catalog changes with review rather than hardcoding 485 forever                  |
| Production          | Track 5xx/429/timeouts/blocked crawler events and cold/warm TTFB; authenticate real crawler samples                                                                       |
| Search review       | Revisit priority URL Inspection outcomes and equal-period query/page/country data after recrawl; indexability, indexing, rankings and citations are separate measurements |

Example read-only reproductions (PowerShell; use `curl.exe`, not the curl alias):

```powershell
curl.exe -sS -D - -o NUL https://farabak.net/products/reolink-cctv-camera
curl.exe -sS -D - -o NUL -H 'Accept: text/markdown, text/html;q=0.9' https://farabak.net/products/reolink-cctv-camera
curl.exe -sS -D - -o NUL -H 'Accept: text/markdown' https://farabak.net/
curl.exe -sS -L --max-redirs 5 -D - -o NUL https://farabak.net/products/reolink-cctv-camera/ip/B400
curl.exe -sS -A 'OAI-SearchBot' https://farabak.net/products/reolink-cctv-camera/bullet/B400
curl.exe -sS https://farabak.net/robots.txt
curl.exe -sS https://farabak.net/sitemap.xml
```

Capture response bodies as well as headers when verifying extraction. A 200 empty shell, a hidden streaming payload, a cached outdated snapshot, and a fully usable non-JS page are different results. Local spoofed bot tests must remain labeled as such.

## Coverage, evidence, and remaining uncertainty

| Requested phase               | Evidence / outcome                                                                                                                           |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| 1. Architecture/configuration | Relevant public/auth/data/metadata/deployment paths inspected; current source versus production distinguished                                |
| 2. DNS/domain                 | Three resolver addresses, A/AAAA/CNAME/NS, DNSSEC/SOA, IPv4/IPv6 tested; historical propagation unverified                                   |
| 3. HTTP/network               | Core GET/HEAD, redirects, TLS, bodies/headers/timings; supplementary public/private/invalid-route probes                                     |
| 4. Bots                       | Twelve representative UAs plus deeper four-agent samples; authentic Google history; other genuine source-IP outcomes unavailable             |
| 5. Geographic                 | Seven countries, three resources, 21 successes; historical uptime not established                                                            |
| 6. Robots                     | Source and live text checked; public access permitted; training/search/user roles distinguished                                              |
| 7. Sitemap                    | Source, valid XML, 485 unique origin-correct URLs, families and fallback reviewed; QR eligibility gap; no full 485-URL crawl                 |
| 8. Indexability/metadata      | Public HTML canonicals/index directives, error pages, aliases, stored versus current canonical discrepancies                                 |
| 9. SSR/JavaScript             | Raw HTML and normal rendered Reolink product/category compared; hidden segments and metadata placement measured; JS-off browser still needed |
| 10. Search indexing           | First-party year/daily/page/query/country data and 13 unique URL inspections attempted; aggregate UI/Bing reports remain unverified          |
| 11. Hosting/WAF/deployment    | Repo and official Liara docs reviewed; no authenticated hosting/edge logs; exact required records listed                                     |
| 12. SEO/AEO/GEO               | Supplier/market/model/contact clarity, schema and content consistency examined; third-party authority/citation algorithms unverified         |
| 13. Competitors               | Three live HTTP/robots/sitemap comparisons and raw content; no claim of measured competitor Google rank/backlink superiority                 |

The report is a completed investigation deliverable, **not a claim that the defects have been fixed or that the historical cause is fully established**. The strongest supported explanation is a combination of real search exposure loss, incomplete discovery/consolidation, broken alternate representations and extraction risks. A provider-specific networking or cache limitation remains possible. Resolving that last causal question requires a matching genuine retrieval/access-log trace and the named historical hosting/crawl reports; inventing a definitive DNS, country-block or penalty diagnosis would exceed the evidence.

The [evidence index](evidence/2026-11-20/README.md) explains provenance and limits for each artifact. [Observation notes](evidence/2026-11-20/observation-notes.json) preserve the user-reported timeline, rendered-browser checks and web-tool behavior; [source fingerprints](evidence/2026-11-20/source-fingerprints.json) identify the inspected repository entry points.

The evidence directory contains public HTTP/DNS observations and first-party Search Console exports. Account emails, credentials, cookies and environment values are not required for this report. Raw temporary bodies were used for parsing; durable parsed bodies, headers and results are saved alongside it. Existing unrelated product JSON and spreadsheet deletions were preserved.
