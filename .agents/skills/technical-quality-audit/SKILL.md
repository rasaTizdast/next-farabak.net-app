---
name: technical-quality-audit
description: Audit a Farabak route, page, component, or project area for current technical SEO, AEO/GEO readiness, Next.js and React practices, UX, accessibility, Lighthouse, PageSpeed Insights, metadata, and structured data. Use whenever asked to check, review, audit, or improve the quality or search readiness of a specific part of this Next.js project.
---

# Technical Quality Audit

Review the requested scope and return evidence-backed findings. The default mode is read-only: identify concrete issues and propose focused fixes without changing files. If the user explicitly asks for implementation, work only within that scope and follow the project instructions for code changes.

## Audit procedure

1. **Set scope.** Resolve the requested URL, route, component, or directory to its owning route and dependencies. Include relevant layouts, shared header/footer, data source, CSS, metadata, image assets, and route handlers. State what you inspected and what could not be inspected.
2. **Load current guidance.** Read the applicable local Next.js guide from `node_modules/next/dist/docs/` for this project's installed version before judging or changing framework-specific code. Read applicable project skills: `next-best-practices`, `react-patterns`, `nextjs-performance`, `core-web-vitals`, `accessibility`, `web-design-guidelines`, and `farabak-seo`; use the relevant parts rather than importing unrelated workflows. Apply the Modern Web Guidance lookup below to web-platform concerns in scope. Browse current primary documentation for claims that can change. Prefer official Next.js, React, Google Search Central, Chrome Lighthouse, PageSpeed Insights, web.dev, W3C/WAI, and Schema.org sources. Include access date and source links in the report. Treat third-party recommendations as hypotheses until confirmed by primary guidance.
3. **Inspect implementation and output.** Trace source to rendered HTML where possible. Check both source and the actual rendered page, since metadata, server rendering, client components, streaming, proxy behavior, and structured data can differ at runtime. For a public URL, inspect mobile and desktop; use the browser if available. Do not claim a live behavior from source alone.
4. **Measure page experience.** For a public URL, use PageSpeed Insights and/or Lighthouse when available. Report URL, date, device, Lighthouse version if shown, category scores, and field versus lab metrics separately. Use CrUX field data for real-user outcomes and Lighthouse lab data for diagnosis; note when CrUX has insufficient data. Use current Core Web Vitals thresholds from official guidance and identify the 75th-percentile field context. Never present a lab score as a field result or a single run as a stable site-wide result. For local/unavailable URLs, say measurement was unavailable and give a reproducible validation step instead.
5. **Audit every applicable domain below.** Mark each as pass, issue, or not applicable, and support issues with file/line, rendered evidence, or a measurement. Do not pad the report with generic advice.
6. **Prioritize.** Order findings by user impact and search/crawl impact, then implementation effort. Distinguish confirmed defects from risks or hypotheses. Give each finding severity (blocker/high/medium/low), confidence (high/medium/low), a concrete recommendation, and a verifiable acceptance check.
7. **Report readiness.** Summarize the most important blockers, overall technical readiness (ready / needs work / blocked, with a brief reason), coverage limits, and the next validation steps. Keep editorial content gaps separate from technical findings; the purpose is technical readiness before a content program.

## Modern Web Guidance lookup

Use [Chrome's Modern Web Guidance](https://developer.chrome.com/docs/modern-web-guidance/) for applicable HTML, CSS, browser API, accessibility, performance, security, and browser compatibility questions. Search for the specific observed pattern or proposed improvement with `npx --yes modern-web-guidance@latest search "<English use case>"`, select relevant guide IDs, then read them with `npx --yes modern-web-guidance@latest retrieve "<guide-id>"`. If retrieval saves a large guide to a temporary file, read that file in full. Use the retrieved rules, caveats, and verification steps to assess the actual implementation; cite the guide ID and source link in any resulting finding. If the CLI is unavailable, use the corresponding guide in Chrome's [catalog](https://developer.chrome.com/docs/modern-web-guidance/guides) and record that limitation. A guide lookup is complete when each relevant recommendation has been checked against the inspected code and the page's actual behavior where observable.

For an explicitly requested legacy-pattern or modernization audit, run `npx --yes modern-web-guidance@latest legacy-scan <scoped-path> --json`. Check each match against its `keepWhen` and `dropWhen` context before reporting it; scanner output alone is a candidate, not a confirmed defect. Keep the scan within the requested scope and preserve the agent's read-only audit mode.

Determine browser support from the project's stated browser targets. If none are stated, use Modern Web Guidance's default **Baseline Widely available** as the recommendation target, label that assumption, and check support and fallbacks before recommending a newer feature. Prefer progressive enhancement for features outside the target; propose conditional polyfills only when necessary. Treat volatile features and origin trials as out of scope unless the user explicitly requests them. Reconcile Chrome guidance with the installed Next.js docs, WCAG, and Google Search Central where those authorities govern the finding. A newer platform feature is an option, not by itself evidence that working code is defective.

## Review domains

### Crawlability and index signals

- Verify intended HTTP status, route discovery, robots directives, sitemap inclusion and canonical consistency. Check that robots rules do not block pages or assets needed for rendering, and that noindex is intentional.
- Check redirects, duplicate URL variants, trailing slash/host behavior, pagination or query URL handling, and localized URL/alternate links when relevant.
- Compare raw server HTML with browser-rendered content where relevant. Confirm primary content and metadata do not depend on a user interaction or an unavailable client-only fetch.
- Check internal links to the page and links from it: descriptive anchors, crawlable `href` values, useful next steps, and no avoidable orphaning.

### Metadata, semantics, and structured data

- Inspect title, description, canonical, robots, Open Graph/social metadata, language/locale, heading hierarchy, landmarks, image alternatives, and meaningful link text. Confirm values are route-specific, accurate, non-empty, and derived from trusted page data.
- Inspect JSON-LD and other structured data for valid syntax, supported properties, correct entity relationships, and parity with visible content. Recommend only schema that accurately describes the page and is supported by the relevant search feature. Check Google's current feature documentation and policies before promising rich-result eligibility.
- Flag hidden, fabricated, stale, or mismatched markup. Schema.org vocabulary alone does not guarantee a Google rich result.
- For AEO/GEO, assess machine-readable accessibility of the same useful, factual page content: crawlability, clear page/entity identity, semantic structure, descriptive metadata, direct answer organization where it serves users, and reliable source facts. Do not prescribe special `llms.txt`, keyword chunking, FAQ markup, or schema as ranking shortcuts without current primary-source support. AEO/GEO visibility is not guaranteed by technical compliance.

### Next.js and React implementation

- Match findings to the installed framework and React version. Read the relevant local Next.js docs for App Router or Pages Router, metadata, JSON-LD, image/font handling, rendering, caching, routing, and proxy behavior as applicable.
- Review server/client boundaries, unnecessary client JavaScript, data fetching and duplicate work, Suspense/streaming implications, caching correctness, error/loading states, and React purity/hooks rules.
- Check image sizing/format/loading priority and responsive behavior, font loading, third-party scripts, hydration work, and bundle costs where they affect the target page.
- Prefer the framework's current built-in capabilities when appropriate, but do not recommend migration or abstractions without evidence of a real defect.

### UX, accessibility, and page experience

- Inspect mobile and desktop layouts for readability, content hierarchy, navigation, focus visibility, keyboard operation, touch target usability, form labeling/errors, contrast, motion preferences, and clear interaction feedback.
- Check semantic HTML and accessible names/states for interactive controls. Evaluate whether the main task or page purpose is apparent, and whether overlays, sticky UI, or media obscure or shift content.
- Connect UX observations to specific user impact. Use WCAG 2.2 guidance where applicable, but distinguish an observed accessibility failure from a general design preference.

### Lighthouse and PageSpeed

- Cover Lighthouse Performance, Accessibility, Best Practices, and SEO categories, while remembering that automated checks sample only part of quality and do not replace manual UX or accessibility review.
- Examine the relevant audits and diagnostics rather than optimizing a score in isolation. Relate performance work to LCP, INP, CLS, and, when available, TTFB. Verify that the actual target route is measured and preserve the report link or reproducible command when available.
- Keep PageSpeed's CrUX field data separate from Lighthouse lab diagnostics. Do not infer origin-wide quality from one route or device.

## Report format

### Scope and method

- Target:
- Inspected:
- Guidance checked (with access date):
- Modern Web Guidance (guide IDs, browser target, or reason not applicable/unavailable):
- Measurements (URL, device, date, field/lab):

### Findings

For each finding, include:

`[Severity] Title — evidence (file:line, rendered behavior, or measurement). Impact and confidence. Recommended change. Acceptance check. Sources.`

### Domain status

| Domain                         | Status | Evidence or limitation |
| ------------------------------ | ------ | ---------------------- |
| Crawlability and index signals |        |                        |
| Metadata and semantics         |        |                        |
| Structured data                |        |                        |
| Next.js and React              |        |                        |
| UX and accessibility           |        |                        |
| Lighthouse and PageSpeed       |        |                        |
| AEO/GEO technical readiness    |        |                        |

### Readiness and next steps

Give a one-paragraph readiness judgment and a short, ordered fix list. If no issues are found in a domain, state what evidence was checked; avoid claiming comprehensive compliance from a narrow sample.

## Primary references

At each audit, verify the current versions and follow relevant linked guidance:

- [Next.js App Router docs](https://nextjs.org/docs/app)
- [React Rules](https://react.dev/reference/rules)
- [Google Search Central](https://developers.google.com/search/docs)
- [Google guidance for generative AI features in Search](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide)
- [Google structured data policies](https://developers.google.com/search/docs/appearance/structured-data/sd-policies)
- [PageSpeed Insights](https://pagespeed.web.dev/)
- [PageSpeed Insights documentation](https://developers.google.com/speed/docs/insights/v5/about)
- [Lighthouse documentation](https://developer.chrome.com/docs/lighthouse/)
- [Chrome Modern Web Guidance](https://developer.chrome.com/docs/modern-web-guidance/)
- [Web Vitals](https://web.dev/articles/vitals)
- [WCAG 2.2](https://www.w3.org/TR/WCAG22/)
- [Schema.org](https://schema.org/)
