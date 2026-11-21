# Crawlability Recovery Implementation Plan

**Status as of 21 November 2026:** Tasks 1–4, the local/production regression checks, and the scoped documentation/lockfile commit and push are complete. Germany is the requested application target. Liara account/release verification and the Google live URL tests remain external follow-ups; see the verification report.

**Goal:** implement the actionable audit repairs, commit and deploy them to Liara, then verify the real production responses.

**Architecture:** keep the existing App Router and public data layer. Repair resource-aware content negotiation, provide dynamic public catalog Markdown, make initial HTML usable without script execution, and preserve anonymous/QR access boundaries. Bound exchange-rate delays and align sitemap eligibility with public pages.

**Tech stack:** installed Next.js 16.4.5, React 19, Prisma/PostgreSQL, Vitest, curl/Python/browser checks, Liara CLI. No new dependency or infrastructure-provider change.

**Spec:** `docs/audits/seo-crawlability-audit.md`, particularly F01–F07 and T01–T09. The user explicitly authorized implementation, commit, deployment and verification on November 20.

## Global constraints and rulings

- Preserve the unrelated deleted product JSON/spreadsheet files; stage only task-owned paths.
- No fabricated price, stock, review, distributor or certification claims. No training-bot policy changes.
- Do not weaken authentication, publish QR keys, or change DNS/firewall rules speculatively.
- Source fixes and tests precede deployment. Record failures honestly; Google indexing/ranking recovery is not an immediate deployment acceptance gate.
- Ruling: proceed with the previously reviewed audit tickets as approved design; a second design/deployment permission gate is unnecessary after the user's explicit instruction.
- Ruling: use dedicated task agents for independent sitemap and currency changes, as required by the subagent-driven-development workflow; parent integrates and reviews. Agents do not commit or stage shared files.

## Pre-flight interface review

| Tasks                              | Shared interface/files                           | Resolution                                                                                         |
| ---------------------------------- | ------------------------------------------------ | -------------------------------------------------------------------------------------------------- |
| Negotiation and HTML rendering     | Proxy, Next config, public URLs                  | Parent owns both; verify actual built server, not only mocked proxy response headers               |
| Catalog Markdown and product Brand | Public product data and verified category brands | Parent owns both; one explicit category-to-brand helper; no inference from arbitrary model strings |
| Sitemap and public catalog         | `Available`/QR eligibility                       | Agent modifies sitemap data/helper/tests only; parent uses the same anonymous eligibility criteria |
| Currency and rendering             | `getUsdToRialRate(): Promise<{rate:number        | null}>`                                                                                            | Preserve signature and provider priority/unit normalization; bound total work |
| Tests and deployment               | Same release working tree                        | Tests isolated by file ownership; parent performs the single full build and final staging/deploy   |

## Task 1 — Sitemap public eligibility

- [x] Add a failing fixture containing available public and available QR-protected products; expect only the public URL/category to be emitted.
- [x] Update `src/lib/data/sitemap.ts` and helper eligibility as needed. Preserve unpublished blog filtering and truthful sitemap dates.
- [x] Run `pnpm exec vitest run src/lib/data/sitemap.test.ts src/lib/data/sitemap-utils.test.ts src/app/sitemap.test.ts`.
- [x] Review the diff for key leakage and fallback behavior.

## Task 2 — Bound currency-provider work

- [x] Add a failing timeout test with providers that never complete; the public result must resolve `{ rate: null }` within one documented total budget.
- [x] Update `src/lib/data/usd2rial.ts` using a shared deadline/abort signal while preserving BRS → PriceToDay → Jahankhahan preference, Toman/Rial handling and current return type.
- [x] Run `pnpm exec vitest run src/lib/data/usd2rial.test.ts`; test success, invalid results, provider failure, timeout and aborted body parsing.
- [x] Ensure errors do not log API-key-bearing URLs.

## Task 3 — Resource-aware HTML/Markdown and entity data

- [x] Add failing regression tests for explicit media exclusions, valid category/product Markdown, unknown/QR-only resources, canonical Link/indexability, and authoritative B400/Blackmagic brands.
- [x] Repair `src/lib/contentNegotiation.ts`, `src/proxy.ts`, Markdown route/data modules and Product JSON-LD helper usage. Static representations must use verified restrained company facts; dynamic catalog Markdown uses existing public data helpers.
- [x] Valid canonical category/B400 Markdown must return 200, model/brand/description/specifications/internal links and canonical identity. Real missing/key-only paths remain 404. Unsupported formats use 406; HTML-acceptable unsupported page representations fall back to HTML.
- [x] Repeat focused Vitest tests and inspect diff for sensitive-data/authorization changes.

## Task 4 — Initial HTML extraction and response headers

- [x] Capture the existing built-server failure using a no-script/hidden-content-excluding extractor and a JavaScript-disabled browser when supported.
- [x] Read installed streaming/cache/metadata docs and implementation before choosing the smallest supported change that returns core public content visibly in initial HTML. Preserve normal interactive rendering and caches.
- [x] Verify final Vary includes Accept without removing required framework tokens whenever representation depends on Accept. Check actual runtime responses.
- [x] Add a reusable read-only production verification script that checks HTML/Markdown, canonical/robots, visible product data, redirects, sitemap families, invalid paths and private-route redirects.

## Task 5 — Build, review, commit and deploy

- [x] Run targeted tests, changed-file lint/format and production build; resolve failures, then review the whole diff for scope/security regressions.
- [ ] Identify the correct existing Liara account/app without creating resources or displaying secrets; inspect sanitized relevant logs and runtime/deployment status where accessible.
- [x] Commit only scoped fixes/tests/docs and push the task branch if appropriate. Preserve unrelated deletions. Follow-up commit `a4cc0b88` contains the audit/evidence updates and malformed-lockfile repair; the unrelated deletions and `liara.json` working-copy change remain uncommitted.
- [ ] Deploy the exact committed release to the existing Germany app using Liara's supported CLI/API; observe terminal deployment state rather than restarting on observation timeout.
- [ ] Repeat production HTTP/body/robots/sitemap/redirect/metadata/Markdown checks and independent international probes; record the release ID and outcomes.
- [x] Inspect priority Google stored status separately from live eligibility. Submit recrawl only through an authorized supported interface; if unavailable, document the exact remaining UI action without claiming submission. Stored status captured; the live test and request were unavailable in the signed-out UI, so the exact remaining action is recorded in the verification report.
- [x] Write `docs/audits/crawlability-recovery-verification.md` with before/after evidence, tests, commit/release identity and any remaining external limitations.

## Completion criteria

The committed production release passes the actual public-resource checks, not merely unit tests. Historical hosting causality and Google's future indexing/ranking choices stay labeled separately. Deployment/access blockers require evidence and continued safe progress; they are not a reason to claim completion early.
