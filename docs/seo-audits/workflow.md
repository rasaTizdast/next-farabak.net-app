# Farabak SEO workflow

Start a local Codex chat in this repository with `$farabak-seo Compare our priority Persian search visibility with competitors and check whether the release is live.` You can also request one role by name for a narrower audit.

| Agent             | Delivers                                                                                      |
| ----------------- | --------------------------------------------------------------------------------------------- |
| `seo_indexing`    | Live URL and sitemap checks, Google inspection evidence if available, and release regressions |
| `seo_competitors` | Query-level rival URLs, comparable landing pages, and testable content gaps                   |
| `seo_keywords`    | Persian intent clusters, one target URL per cluster, and an ordered watchlist                 |
| `seo_rankings`    | Google Search impressions, clicks, CTR, average position, and period-over-period changes      |
| `seo_on_page`     | Page briefs for content, internal linking, structured data, and page experience               |

The **prompt hook** routes matching English and Persian SEO requests to `$farabak-seo`. The **patch hook** adds verification steps when Codex uses `apply_patch` on a public route or a shared SEO file. Both hooks are advisory. Changes made through a shell or editor can use the release checks below. If Codex asks for hook review, open **Settings → Hooks** in the desktop app or `/hooks` in the CLI. The manual skill invocation is available in either case. [Codex hooks](https://developers.openai.com/codex/hooks)

## Source skills

- Technical and on-page audits use the repository's `.agents/skills/seo-audit/SKILL.md`. Open its international reference for locale issues and `.agents/skills/core-web-vitals/SKILL.md` when testing performance. [SEO Audit on Skills.sh](https://www.skills.sh/coreyhaines31/marketingskills/seo-audit)
- Editorial and linking work use the local `.agents/skills/content-strategy/SKILL.md` and `.agents/skills/site-architecture/SKILL.md` and their applicable references. [Content Strategy](https://www.skills.sh/coreyhaines31/marketingskills/content-strategy) · [Site Architecture](https://www.skills.sh/coreyhaines31/marketingskills/site-architecture)
- Keyword and competitor work uses the upstream skill and its role-specific references. [Keyword Research on Skills.sh](https://www.skills.sh/quegenx/agent-skills/keyword-research) · [Skill source](https://github.com/Quegenx/agent-skills/blob/935b8a241aba255b6c790ed6c7426b6d148ab3eb/skills/marketing/keyword-research/SKILL.md) · [Keywords](https://github.com/Quegenx/agent-skills/blob/935b8a241aba255b6c790ed6c7426b6d148ab3eb/skills/marketing/keyword-research/KEYWORDS.md) · [Clustering](https://github.com/Quegenx/agent-skills/blob/935b8a241aba255b6c790ed6c7426b6d148ab3eb/skills/marketing/keyword-research/CLUSTERING.md) · [SEO Competitors](https://github.com/Quegenx/agent-skills/blob/935b8a241aba255b6c790ed6c7426b6d148ab3eb/skills/marketing/keyword-research/SEO-COMPETITORS.md)
- Ranking and indexing measurement uses the upstream Search Console skill. [Search Console on Skills.sh](https://www.skills.sh/quegenx/agent-skills/search-console) · [Skill source](https://github.com/Quegenx/agent-skills/blob/935b8a241aba255b6c790ed6c7426b6d148ab3eb/skills/marketing/search-console/SKILL.md) · [Opportunity sections](https://github.com/Quegenx/agent-skills/blob/935b8a241aba255b6c790ed6c7426b6d148ab3eb/skills/marketing/search-console/OPPORTUNITY-SECTIONS.md) · [API reference](https://github.com/Quegenx/agent-skills/blob/935b8a241aba255b6c790ed6c7426b6d148ab3eb/skills/marketing/search-console/API.md)

## Search Console inputs

Use OpenSEO's connected Search Console tools or user-provided exports. Verify the returned property is `https://farabak.net/` or the explicitly requested verified property. Pass the date range, search type and country explicitly. For Iran, Search Console uses `irn`. For a commercial competitor rank sample, verify market support before requesting data and record any geographic limits. With exports, request these together and carry their exact filters into the report.

OpenSEO's project website and connected Google property are separate settings. Verify the website host and market before using project defaults for competitor, rank tracking, or crawl tools. Use URL Inspection for individual index states. Use Search Console's Page Indexing report for the sitemap-wide count.

1. **Page indexing** with the sitemap filter and exclusion reasons, plus **Sitemaps** status and last read date.
2. **Search results → Performance** for the last two complete 28-day periods. Use Web search and comparable country/device slices. Export Queries and Pages with clicks, impressions, CTR, and position. For query-to-page analysis, use the API's `query` and `page` dimensions together or export Queries while filtering the report to each priority page. Separately exported Queries and Pages totals cannot establish which page ranked for a query.
3. **URL Inspection** for the watchlist URLs and a sample from each major exclusion reason. Record index status, last crawl, user-declared and Google-selected canonical, and the referring page when available.

For each finding record the date, URL, source, environment, observed evidence, and next check. Use `unknown` for unavailable metrics. A public GET or browser view establishes technical eligibility and visible content. URL Inspection establishes Google's recorded status. Search Console average position describes Farabak's observed impressions, and controlled SERPs describe a separate market, device, timestamp, and result depth. General web search provides competitor candidates. [Google search requirements](https://developers.google.com/search/docs/essentials/technical) · [Search Analytics API](https://developers.google.com/webmaster-tools/v1/searchanalytics/query) · [Metric definitions](https://support.google.com/webmasters/answer/7042828) · [URL Inspection](https://support.google.com/webmasters/answer/9012289)

## Release checks

1. Run `pnpm test src/app/sitemap.test.ts src/app/api/sitemap/__tests__/route.test.ts src/lib/data/sitemap-utils.test.ts src/lib/data/sitemap.test.ts src/lib/pagination.test.ts src/lib/seo 'src/app/(main)/products/not-found.test.ts'` or select the cases covering the changed behavior.
2. Check the target environment with public GETs and a browser where rendering matters. Inspect robots.txt, the XML sitemap, and a representative landing page, redirect, missing page, and paginated listing. Record actual status, canonical, robots directives, and discoverable links. Use the [November 19 baseline](2026-11-19-farabak-search-visibility-baseline.md) for routes and expected release signatures.
3. After a production release, repeat the same HTTP checks against `https://farabak.net`. Record the release time and the next Search Console inspection and performance observation. Use `node --test .codex/hooks/seo.test.mjs` to verify hook behavior when the hooks change.
