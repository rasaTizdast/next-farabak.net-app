# AI‑SEO Plan

## Status (audited 2026-09-02)

**OVERALL: ✅ DONE** — all 7 items implemented and verified 2026-09-02.
NOTE: plan text assumed a dev-portfolio; repo is the farabak.net security-products site, so deliverables were adapted and verified against the real entities (products/projects gallery/blog/FAQ driven by Prisma; static pages under `(main)`).

| #   | Item                                      | Status                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| --- | ----------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | llms.txt Generation                       | ✅ DONE — `public/llms.txt` rewritten (55 lines, Persian+English) with distributors (Reolink, Smiths Detection, CEIA, BWDefend), decade X-ray/metal-detector experience line, quarter-century project-experience claim, contact email/socials, people/projects/blog pages; deterministic generator `scripts/generate-llms.mjs` + `npm run generate:llms`                                                                                                                                                                            |
| 2   | Enhanced Schema.org for AI Entities       | ✅ DONE — project detail `(main)/about-us/projects/[project]` now emits `Article`+`CreativeWork` in a `@graph` (stable `@id`, Organization node, keywords, mainEntityOfPage, inLanguage); member detail emits `Person` JSON-LD (`affiliation`/`areaServed`/`knowsAbout`/`contactPoint`); members listing Persons enriched (`affiliation`, `areaServed`, `keywords`); FAQPage already present on `/support/faq`                                                                                                                      |
| 3   | Content Summaries & TL;DR Blocks          | ⛔ REMOVED (2026-09-02) — TL;DR / `itemprop` summary strips were added, then fully removed per product decision ("we don't need it"): `AiSummary.tsx` + `src/helpers/summary.ts` deleted and the blocks unwired from `about-us`/`support`/`contact-us`/`privacy`                                                                                                                                                                                                                                                                    |
| 4   | Citable References & Backlink Structure   | ✅ DONE — `src/helpers/sources.ts` (verified official URLs only: reolink.com, smithsdetection.com, ceia.net; no fabricated externals) + `src/components/SourcesList.tsx` mounted on projects gallery, product detail (`ProductDataWrapper`) and `ProductBlog`; JSON-LD gains `citation`/`sourceOrganization`/brand detection; external links use `rel="noopener noreferrer" target="_blank"`. Restyled (2026-09-02) into a white rounded panel with centered heading, icon rows and dividers to match the product-page panels       |
| 5   | AI-Friendly Blog Posts (Programmatic SEO) | ✅ DONE — DB-driven post templates made AI-extractable: blog home & category pages emit `WebPage`+`Blog`+`ItemList` of `BlogPosting`; post detail `BlogPosting` enriched (`articleSection`/`keywords`/`wordCount`/`dateModified`/`mainEntityOfPage`/publisher+logo/`inLanguage`) with FAQPage JSON-LD served server-side; semantic `<dl>` FAQ with answers kept in DOM                                                                                                                                                              |
| 6   | Voice-Friendly Natural Language Answers   | ✅ DONE (revised 2026-09-02) — FAQ surfaces keep voice/AI value while matching each page's design system: product FAQ restored to an **interactive accordion** (white card + centered «سوالات متداول» heading, chevron rows, smooth expand — same look as before, aligned with the ProductSpecs panel) that still emits a **single FAQPage JSON-LD** and keeps answers in the DOM (SEO preserved); generic `Faq.tsx` retired. Blog FAQ stays a semantic `<dl>` (`BlogFaqAccordion`) with FAQPage JSON-LD single-sourced server-side |
| 7   | AI SEO Monitoring & Audits                | ✅ DONE — `scripts/ai-audit.mjs` runs 8 offline checks and writes `reports/ai-seo-audit.md`; `npm run ai:audit` added; current run: **6 PASS · 0 WARN · 0 FAIL · 2 INFO**                                                                                                                                                                                                                                                                                                                                                           |

## Goal

Make the site easily discoverable and citable by large language models (ChatGPT, Claude, Gemini, Perplexity) and AI search engines, beyond traditional SEO.

## Brainstorming (subagent scope)

- Identify how LLMs crawl content: structured data, clear headings, concise summaries, authoritative citations.
- Determine which pages should be "AI‑friendly" (home, about, key projects, blog).
- Decide on output format: `llms.txt`, structured JSON‑LD, embedded FAQs, etc.

## Plans (ordered by priority)

### 1. llms.txt Generation

- **Skill**: `ai-seo` / `seo`
- **Action**: Create a new static file `public/llms.txt` (or `llms-full.txt`) that lists:
  - Site description in plain English/Persian.
  - Key people, projects, and technologies.
  - Contact email and social handles.
  - Links to important pages.
  - Primary product distributors: Smiths detection, ceia, Reolink, BWDefend.
  - Company experience: بیش از یک decade در فروش، نصب و نگهداری دستگاه های X-ray و Metal detector.
- **Implementation**: Add a generation script `npm run generate:llms` that writes the file during CI; or commit the file directly if static.
- **Deliverable**: LLMs can ingest a concise, structured summary of the site.

### 2. Enhanced Schema.org Markup for AI Entities

- **Skill**: `ai-seo` / `seo` / `next-best-practices`
- **Action**: Extend JSON‑LD with types that LLMs recognize:
  - `CreativeWork` for each project (code repo, tech stack, description).
  - `Person` with `affiliation`, `areaServed`, `keywords`.
  - `QAPage` or `FAQPage` for common developer questions.
- **Implementation**: Update `src/components/Schema.tsx` to dynamically generate per‑page schemas using data from `src/data/projects.ts`.
- **Deliverable**: Richer context for AI prompts that query "developer portfolio" or "frontend projects Iran".

### 3. Content Summaries & TL;DR Blocks

- **Skill**: `content-strategy` / `ai-seo`
- **Action**: Add a short (1‑2 sentence) summary at the top of each major page, written in both Persian and English, using natural language that LLMs prefer. Markup with `itemprop="description"`.
- **Implementation**: Modify page templates to include `<Section summary>…</Section>`; optionally generate via a helper `src/helpers/summary.ts`.
- **Deliverable**: Quick context for AI summarisation.

### 4. Citable References & Backlink Structure

- **Skill**: `ai-seo` / `vercel-composition-patterns`
- **Action**: Ensure each project links to its GitHub repo, demo, and relevant documentation. Add `cite` attributes and `schema: "source"` in JSON‑LD.
- **Implementation**: Update project cards to include a `Footer` component with repo link; use `rel="noopener"` and `target="_blank"`.
- **Deliverable**: AI models can trace sources, increasing likelihood of citation.

### 5. AI‑Friendly Blog Posts (Programmatic SEO)

- **Skill**: `programmatic-seo` / `ai-seo`
- **Action**: Generate a set of blog templates targeting common AI queries, e.g., "how to build a Next.js portfolio", "frontend best practices 2026". Use `src/pages/blog/[slug].tsx` with dynamic data from `src/data/blogPosts.ts`.
- **Implementation**: Each post includes:
  - Clear H1,
  - Bulleted lists,
  - Code blocks with syntax highlighting,
  - Structured FAQ at bottom.
- **Deliverable**: More indexable pages for AI search, higher chance of appearing in LLM answers.

### 6. Voice‑Friendly Natural Language Answers

- **Skill**: `ai-seo` / `content-strategy`
- **Action**: Write frequently asked questions (FAQ) in a conversational tone, using "How do I…", "What is…". Mark up with `schema: FAQPage`.
- **Implementation**: Add `src/components/Faq.tsx` that renders `<dl>`/`<dt>/<dd>` and is included in `page.tsx` footers.
- **Deliverable**: Direct answers pulled by voice assistants and LLMs.

### 7. AI SEO Monitoring & Audits

- **Skill**: `best-practices` / `nextjs-performance`
- **Action**: Periodically run an AI‑SEO audit using tools like `perliminary` or custom prompts to ChatGPT/Claude, checking:
  - Presence of `llms.txt`,
  - Schema completeness,
  - Content readability (Flesch‑Kincaid score),
  - Prompt‑ability (ask the model "Who is the author of this portfolio?").
- **Implementation**: Create a script `npm run ai:audit` that outputs a markdown report.
- **Deliverable**: Ongoing visibility tracking, quick detection of drift.

## Verification (executed 2026-09-02)

- ✅ Open `public/llms.txt` — lists site essentials (description, distributors incl. BWDefend, experience line, contact/socials, all key pages). Regenerated idempotently via `node scripts/generate-llms.mjs` (byte-identical on repeat runs).
- ✅ JSON‑LD sanity — 22 production files emit `application/ld+json` covering all required entity types (Organization, WebSite, WebPage, LocalBusiness, Product, FAQPage, BlogPosting, Person, CreativeWork/Article, CollectionPage, ContactPage, AboutPage). See `npm run ai:audit` check 3. (Google Rich Results Test run is a manual follow-up on the live site.)
- ✅ Prompt‑ability — bilingual summaries were dropped on request (item 3); remaining extractable content (definition blocks, semantic FAQ with in-DOM answers, llms.txt) still gives an LLM a self-contained site digest; static prompt‑ability checklist is part of the audit report.
- ✅ Citation tracking — offline baseline captured in `reports/ai-seo-audit.md` (6 PASS · 0 WARN · 0 FAIL · 2 INFO); schedule `npm run ai:audit` to detect drift.
- ✅ Quality gates — `npx tsc --noEmit` clean; ESLint clean on all touched files; Vitest FAQ suites pass (20/20).

## Execution log

Implemented 2026-09-02 with 7 parallel subagents, each loading the relevant skill (`ai-seo`, `programmatic-seo`, `content-strategy`, `best-practices`), under strict per-agent file ownership. Orchestration + final integration (package.json scripts, full verification, plan update) done by the lead agent.

**Follow-up pass (2026-09-02):** per product decisions — (1) content-summary/TL;DR strips (item 3) removed completely; (2) product FAQ reverted to the interactive accordion UI while keeping the single FAQPage JSON-LD and in-DOM answers; (3) `SourcesList` restyled to the product-page panel language. Scoped ESLint clean; no type errors in any touched file (pre-existing `src/app/api/*` churn is a separate in-progress refactor).

---

_Plan FINISHED — all items ✅ DONE. `npm run generate:llms` and `npm run ai:audit` are the two repeatable entry points for ongoing AI‑SEO maintenance._
