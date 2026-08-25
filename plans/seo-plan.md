# SEO Plan

## Goal
Improve search engine visibility and rankings for the Next.js portfolio site, targeting Persian-language queries and global keywords, while ensuring proper structured data, meta tags, and content architecture.

## Brainstorming (to be done with subagents)
- Identify key pages: home, about, projects, blog, contact.
- Determine primary keywords in Persian and English (e.g., "فراورده رزومه", "nextjs portfolio", "web developer iran").
- Assess current meta tags, headings, and content for optimization gaps.
- Plan structured data (Organization, Person, Project, FAQ) using Schema.org.

## Plans (ordered by priority)

### 1. Metadata Standardization
- **Skill**: `seo` / `next-best-practices`
- **Action**: Create a `src/constants/meta.ts` file with default meta tags per page, using Persian titles/descriptions where appropriate.
- **Implementation**: Use `next/head` in each page's Server Component or `metadata` export in Next.js 16 App Router.
- **Deliverable**: Consistent, keyword‑rich `<title>` and `<meta name="description">` on every public page.

### 2. Structured Data (Schema.org)
- **Skill**: `seo` / `ai-seo`
- **Action**: Add JSON‑LD scripts for:
  - `Organization` (site brand, social profiles).
  - `Person` (author name, expertise, picture).
  - `WebSite` with `search` action.
  - `FAQ` or `HowTo` for blog/project pages.
- **Implementation**: `src/components/Schema.tsx` component that renders `<script type="application/ld+json">`; invoke from layout or specific pages.
- **Deliverable**: Enhanced rich‑results eligibility in Google/Search.

### 3. URL & Route SEO
- **Skill**: `next-best-practices` / `programmatic-seo`
- **Action**: Ensure clean, semantic URLs (e.g., `/projects/:slug`, `/blog/:slug`). Generate sitemap dynamically with `next-sitemap` or custom script, including Persian slugs transliterated.
- **Implementation**: Add `[slug].tsx` routes, `generateSitemap` in `next-sitemap.config.js`, add `robots.txt` via `src/app/robots.ts`.
- **Deliverable**: Crawlable structure, proper hreflang for Persian/English variants.

### 4. Content & Heading Optimization
- **Skill**: `seo` / `content-strategy`
- **Action**: Audit existing content for keyword density, heading hierarchy (H1‑H6), and internal linking. Create a content template ensuring each page has one H1, logical sub‑headings, and keyword‑rich Persian text.
- **Implementation**: `src/helpers/contentHelper.ts` with functions to validate heading structure.
- **Deliverable**: Consistent, SEO‑friendly content across the site.

### 5. Image SEO
- **Skill**: `next-best-practices` / `core-web-vitals`
- **Action**: Use `next/image` with `fill` or explicit `width`/`height`, `blurDataURL`, and `loading="lazy"`. Add `alt` text describing images in Persian/English as appropriate.
- **Implementation**: Refactor all `<img>` tags to `next/image`; add a script to generate `alt` from file names or a metadata map.
- **Deliverable**: Faster LCP, better image indexation.

### 6. Internal Linking & Navigation
- **Skill**: `next-best-practices` / `vercel-composition-patterns`
- **Action**: Build a strategic internal linking matrix (home ↔ projects, blog categories, contact). Use a `Link` component that adds `rel="noopener"` and `target="_blank"` where needed.
- **Implementation**: `src/components/InternalLink.tsx`; update navigation layouts.
- **Deliverable**: Distributed link equity, improved user journey.

## Verification
- Run `npm run seo:audit` (custom script) to check meta completeness, schema validity, and sitemap status.
- Use Google Search Console and Lighthouse to monitor improvements.
- Track keyword ranking changes monthly.

---
*Plan can be executed in parallel by subagents: one handles metadata & schema, another image SEO, another sitemap/robots.*