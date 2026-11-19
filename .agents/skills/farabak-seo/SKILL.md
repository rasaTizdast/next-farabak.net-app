---
name: farabak-seo
description: Diagnose why Farabak pages are missing from Google or rank below competitors. Use for indexing, organic rankings, Persian keyword mapping, competitor research, landing-page SEO, and release verification.
---

# Farabak SEO

1. Read [the workflow](../../../docs/seo-audits/workflow.md) for sources, defaults, and evidence requirements. Set the target environment and scope. Use Persian queries for the Iranian market by default. Start with the requested business segment or the X-ray catalog when the scope is open.
2. For pages missing from search, run `seo_indexing` and `seo_rankings` first. For competitor and keyword work, run `seo_competitors` and `seo_keywords` against the same query set. Use `seo_on_page` once target pages are selected. For a full baseline, start independent roles in parallel, then pass technical findings and query-to-page mappings into the on-page comparison. Use the project role files under `.codex/agents/`. If the session lacks custom agent support, apply the same role instructions directly.
3. Resolve disagreements with stronger evidence. For each priority URL, record current indexing evidence, Google performance, and the observed content or discovery gap where available. Preserve unknowns, give hypotheses a validation step, and prioritize confirmed index blockers, then discovery, then intent and click-through experiments.
4. Deliver a dated report under `docs/seo-audits/` for a requested baseline or repeat audit. Include a query-to-page watchlist and a prioritized list of fixes with acceptance checks. For a quick question, reply in chat using the same evidence rules. Use read-only audit access. Changes to production, Search Console, and published content follow the user's requested scope.
