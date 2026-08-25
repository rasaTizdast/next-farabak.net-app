# AI‑SEO Plan

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

## Verification
- Open `public/llms.txt` and verify it lists site essentials.
- Use Google Rich Results Test on JSON‑LD.
- Prompt ChatGPT/Claude with "Give me a summary of this site: paste the llms.txt content" and assess completeness.
- Track citation frequency in AI responses (manual or via prompt logs).

---
*Parallel subagents can generate llms.txt, update schema, and write blog templates simultaneously.*