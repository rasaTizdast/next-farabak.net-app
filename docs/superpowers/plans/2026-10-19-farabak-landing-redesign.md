# Farabak Landing Redesign Implementation Plan

> **For agentic workers:** Use the project's subagent-driven-development workflow for bounded implementation and review. The user explicitly requested this plan followed by implementation in this session; proceed without another approval gate. Track steps with checkboxes.

**Goal:** Deliver a distinctive, fast Persian homepage that demonstrates Farabak's credibility to consumers and enterprise buyers.

**Architecture:** Server-render content and database evidence. Isolate Motion, Lenis and a procedural Three.js scene in deferred disposable client modules. Use scoped styles and a typed publication gate for trust content.

**Tech Stack:** Existing Next.js 16.4.2 / React 19.3.1 / Prisma / TypeScript / local IRANYekan; add motion, lenis, three and @types/three only.

**Spec:** docs/superpowers/specs/2026-10-19-farabak-landing-design.md

## Global constraints

- Trust is the primary goal; consumer and enterprise visitors have equal importance.
- Registration is confirmed in Solar Hijri 1381: display “از ۱۳۸۱”.
- No fictional testimonials, metrics, brands-as-partners, credentials, or exact Gregorian date.
- Keep route/evidence server-rendered; JavaScript and 3D are progressive enhancement.
- Honor reduced motion/save-data; mobile has explicit 3D opt-in.
- Preserve existing generated Next.js AGENTS rules and all unrelated edits.
- Read relevant node_modules/next/dist/docs before framework code. Already reviewed server/client boundaries, lazy loading, use-cache and image docs; priority is deprecated.
- Work in existing Development checkout. No staging/reset/automatic commit, migration, or deployment.
- Keep .agents/skills authoritative; no duplicated or machine-wide skill setup.
- User instruction to start implementation supersedes earlier approval checkpoints.

## Skills and existing context

Use writing-plans for this plan; frontend-design for art direction and visual critique; cro for trust and buyer journeys; accessibility for contrast/keyboard/motion; next-best-practices and nextjs-performance for boundaries/caching/lazy loading; writing-for-agents for AGENTS.md; test-driven-development for meaningful behavior tests.

Current route src/app/(main)/page.tsx contains a hidden H1 and carousel; projects are disabled. Shared layout supplies main/header/footer/contact widgets. Global anchors default to black and html scroll-behavior is smooth. SmartImage begins hidden and attaches timers, so use plain next/image on the new homepage. Project data is cached; showcase query currently is not. Testimonial/stats models and local camera models do not exist. Keep untracked data/products and unrelated admin/API work intact.

## File map

| File                                                                 | Responsibility                                           |
| -------------------------------------------------------------------- | -------------------------------------------------------- |
| AGENTS.md                                                            | Concise local skill routing and plan pointer             |
| src/content/homepage-proof.ts                                        | Confirmed history and approved testimonial contract      |
| src/lib/homepage-proof.ts                                            | Pure publication/URL/media normalization                 |
| src/lib/homepage-proof.test.ts                                       | Tests for unsafe/unapproved content and valid inputs     |
| src/lib/data/homepage.ts                                             | Cached showcase and resilient independent homepage feeds |
| src/app/_components/LandingPage/TrustLanding.tsx                     | Server composition and evidence content                  |
| src/app/_components/LandingPage/landing.module.css                   | Tokens, layout, responsiveness                           |
| src/app/_components/LandingPage/CameraPoster.tsx                     | Static SVG optical composition                           |
| src/app/_components/LandingPage/SecurityScene.tsx                    | Deferred client gate and controls                        |
| src/app/_components/LandingPage/security-scene.ts                    | Efficient Three.js model and lifecycle                   |
| src/app/_components/LandingPage/LandingExperience.tsx                | Motion and Lenis lifecycle                               |
| src/app/(main)/page.tsx                                              | Entry point, factual metadata and JSON-LD                |
| src/app/api/landingPage/showcase_products/route.ts and [id]/route.ts | Tag invalidation on current showcase writes              |
| package.json / pnpm-lock.yaml                                        | Append dependencies, preserve existing edits             |

## Data interfaces

```ts
export type HomepageTestimonial = {
  quote: string;
  name: string;
  role: string;
  source: string;
  approvedForPublication: boolean;
};
export type ShowcaseItem = {
  id: number;
  title: string;
  desc: string;
  image: string;
  link: string;
};
export type SceneController = {
  setActive(active: boolean): void;
  setPointer(x: number, y: number): void;
  dispose(): void;
};
```

Map actual showcase schema fields once at the data boundary. No Prisma/env secret imports in client modules. Use success/error status independently from feed content.

## Task 1: Plan and Codex entry points

- [x] Review project, skills, existing edits and bundled framework docs; obtain independent read-only design/architecture advice.
- [x] Save complete plan and design spec before source edits.
- [x] Add compact skill routing to AGENTS.md: .agents/skills location, explicit $skill examples, design/Next/performance/a11y/documentation routes and this plan.
- [x] Preserve existing commands, conventions and generated Next rules.

Completion: saved documents are reviewable and Codex can find relevant repo skills without reproducing 62 descriptions.

## Task 2: Evidence data and tests

- [x] Write failing tests for approved/unapproved quote filtering, required attribution/source, unsafe javascript/external navigation, internal duplicate-slash normalization, valid bucket image and malformed media paths.
- [x] Implement pure functions publishedTestimonials(), normalizeInternalLink(), resolveHomepageImage().
- [x] Add typed empty testimonial list and confirmed history data. Quotes render only when approved with attribution/source; no empty testimonial UI.
- [x] Create cached showcase query (four cards, ascending order, selected fields) with cache tag showcase-products and hours lifetime; invalidate tag in showcase POST/PATCH/DELETE alongside existing revalidatePath.
- [x] Reuse getProjects(); fetch feeds concurrently, capture failures independently, retain up to three project records and a published-reference count only after success.

Verification: focused Vitest tests pass; feed failure cannot produce a false statistic; path/media helpers reject unsafe sources.

## Task 3: Spatial hero and dependencies

- [x] Add matching static SVG composition: camera shell, dark glass optics, mount, coverage plane, architectural lines; SVG gradient IDs must be unique.
- [x] Add motion, lenis, three and @types/three using pnpm; preserve existing manifest/lock changes.
- [x] Build procedural illustrative camera geometry, silver-white housing, dark lens, blue detail, simple lighting, sparse architectural grid; no manufacturer model or specification claim.
- [x] Implement createSecurityScene(container): SceneController with ResizeObserver, DPR <=1.5, finite intro, shallow pointer response, one canvas and complete disposal.
- [x] Client gate waits for load/visibility/capability; no reduced-motion/save-data autoload. Mobile has a native 3D opt-in; poster remains until successful initialization.
- [x] Add pause/resume native button; stop animation when offscreen/tab hidden, clean up frame handles, observers and event listeners on unmount. Keep poster on import/WebGL failure.

Verification: poster renders server-side without JS; reduced-motion/save-data make no Three.js request; control works by keyboard; no required drag; no offscreen renderer loop.

## Task 4: Full homepage composition and visual polish

- [x] Build scoped CSS token system exactly matching spec, responsive max-width layout, intentional display typography, RTL logical spacing, explicit foregrounds.
- [x] Hero visible H1, specific company work copy, confirmed history, two destination CTAs, optical caption and understated illustration context.
- [x] Linked evidence band, asymmetric genuine project gallery, two equal buyer paths, curated product gallery, company/history/support, approved testimonials if available, closing advice CTA.
- [x] Stable section IDs and H1/H2/H3 hierarchy; decorative scene aria-hidden; clear link labels; skip destination.
- [x] Keep shared navigation/search/account/mobile menu/footer behavior. Only narrowly polish shared header if browser inspection shows a real need.
- [x] Use next/image with dimensions/aspect ratio/sizes for genuine assets. Empty/failed project/product feeds show honest capability/catalog links without invented records or technical errors.

Responsive: 1440px two-column hero/asymmetric projects; 1024px smaller scene; 768px stacked hero/two-column cards; 390/360px single-column proof and wrapped CTAs; no overflow at 320px. Preserve clearance for floating support widgets.

Verification: desktop/mobile screenshots show good hierarchy, composition and line length; no clipped Persian text or inaccessible overlay; actual links/images work.

## Task 5: Motion, scroll, route and schema

- [x] Motion small API dynamically loaded after content; reveal targets remain visible in server HTML and animate once using opacity/translate.
- [x] Lenis only fine-pointer desktop without reduced-motion/save-data. Preserve anchors/touch/keyboard; temporarily override global CSS smooth scrolling and restore on cleanup or media changes.
- [x] Replace old carousel route composition with TrustLanding; preserve old slider/editor code used elsewhere.
- [x] Coherent metadata/canonical/OpenGraph and Organization/WebSite/WebPage IDs. Omit incorrect 2020 and unverified membership/licenses/hours. Show “از ۱۳۸۱” in visible copy.
- [x] Do not import scene runtime into the server route or an app-wide client provider.

Verification: view-source includes headline/CTAs/evidence; reduced-motion is quiet; root app unaffected; metadata remains serialized safely.

## Task 6: Validation and review

- [x] Format only changed files, focused ESLint, focused behavior tests and TypeScript check. Record unrelated existing failures; avoid unrelated fixes.
- [x] Start existing dev server after prisma generate and inspect desktop/mobile through supported browser; collect screenshots and console issues. Diagnose setup failures instead of claiming a preview.
- [x] Check static fallback, scene opt-in/pause, reduced-motion handling, native controls, anchors, data failures, image loading, headings and focus through source review, focused tests and browser inspection.
- [x] Run production build if environment permits; inspect the deferred scene behavior. Record actual observations, not invented Lighthouse results.
- [ ] Independent final code review of implementation files. A reviewer was dispatched but could not complete due its usage limit; root performed source and rendered self-review.
- [x] Mark completed steps and record missing client proof content or validation limitations.
- [x] Return plan/spec/file links and user-facing result, with evidence and constraints. No deployment.

## Self-review

Every requirement maps to tasks: trust/equal audience (2,4), 3D/visual taste (3,4), Motion/Lenis (5), speed/RTL/responsiveness/a11y (3–6), Codex readiness (1). Interfaces are shared by their consumers. No mocked endorsement or unverified numeric proof is authorized. Refine composition after rendered critique while preserving the declared direction.

## Execution log

2026-10-19: User authorized writing this plan then implementation. Existing branch Development has unrelated admin/API/manifest edits. Two read-only reviews completed. Shell/apply_patch startup is unusually slow; use the available Node filesystem tools for scoped writes. Preserve all unrelated work and avoid automatic commits.

2026-10-20: Implemented the homepage, typed proof gate, cached server feeds, scoped responsive design, SVG fallback, procedural deferred Three.js scene, Motion reveals, Lenis desktop scroll, factual schema and showcase cache invalidation. The confirmed ۱۳۸۱ date is described as registration; unapproved testimonials and metrics are absent. The responsive hero width bug found during phone review was fixed. The page was inspected at 320, 390, 768, 1024, 1268 and 1440 px with no document overflow; the production browser showed one desktop canvas, zero canvases before phone opt-in, and one after opt-in. Pause/resume was exercised. Production browser console: no warnings or errors. Focused proof/API tests: 48 passed. Final focused ESLint, full TypeScript, Prettier and production build passed. Next.js reports `/` as static with a 1h revalidation. No Lighthouse or field Core Web Vitals claim is made. React Doctor did not return a report and was stopped. Independent implementation reviewer was unavailable; final source and rendered review was completed by the primary agent. Desktop and phone screenshots are in `docs/superpowers/screenshots/`. No deployment or commit.

Performance follow-up: the shared root providers and header still initiate profile, invoice and exchange-rate requests on the public homepage. They predate this redesign; measure their effect with field Core Web Vitals and scope any provider changes across the wider app before changing their behavior.
