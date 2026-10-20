# Farabak landing design specification

Date: 2026-10-19

## Purpose and authorization

The user authorized starting the redesign after a complete Markdown plan is saved. Proceed from this spec without another approval checkpoint. The scope is Codex project guidance and the homepage, with no production deployment. Preserve unrelated working-tree changes.

The primary purpose is trust in Farabak as an established security company. Consumer and enterprise visitors have equal importance. The experience must be distinctive, professional, spatial, animated, responsive, and fast.

## Evidence and content

- User-confirmed registration: Solar Hijri 1381. Display “از ۱۳۸۱”. An exact Gregorian registration date is unknown; omit foundingDate rather than inventing it.
- Existing project records, company/team pages, warranty lookup, downloads, FAQ, products, and contact are usable evidence.
- Project count means published references, never lifetime installations. Render numbers only after a successful query.
- No testimonial content or verified customer/installation totals were supplied. Define a typed publication gate and omit missing testimonials. No sample reviews, ratings, fabricated metrics or customer logos.
- Manufacturer names mean equipment offered; do not claim authorization, membership, certification, opening hours or licenses without verified evidence.
- Existing hero artwork is a carousel with baked-in content and a hidden H1. The new hero has visible semantic text and actions.

## Creative direction

Precision optical equipment backed by visible evidence. A sculptural security camera and architectural field of view occupy a dark blue hero. Calm light sections below show actual project and product photography. A single custom 3D scene is the signature; illustrative hardware must not impersonate a named Reolink model.

The camera uses machined silver housing, dark optical glass, and a cyan coverage plane over restrained architectural linework. Build efficient geometry with no remote model, textures, HDRI, decoder, video or postprocessing. A matching static SVG composition is immediately available and remains when 3D is disabled.

Avoid fictional live feeds, blinking surveillance UI, fake network status, arbitrary floating shapes, continuous text motion, long pinned scrolling, and inflated statistics.

## Tokens and typography

| Token           | Value   | Role                     |
| --------------- | ------- | ------------------------ |
| Instrument navy | #071B32 | Hero / closing panel     |
| Farabak blue    | #0E6AFF | Actions                  |
| Optical cyan    | #73D6FF | Light on navy / coverage |
| Machined silver | #DCE5EE | Hardware / boundaries    |
| Paper white     | #F7FAFD | Evidence sections        |
| Readable slate  | #536577 | Supporting copy          |

Existing local IRANYekan: display 800–900, body 400–500, utility 500–600. Use system monospace sparingly for Latin optical captions, avoiding another font download. Generous Persian line height, controlled breaks, clamp-based hero scale. Scoped CSS module foregrounds must override the global black-anchor rule.

## Narrative

1. Hero H1 “امنیت، با پشتوانهٔ فرابک.” Specific camera/security inspection/advice copy; equal paths “مشاهده تجهیزات” and “مشاوره برای پروژه”; confirmed history marker.
2. Useful evidence: history, public projects, warranty tracking. Facts link to their sources/destinations.
3. Asymmetric selected projects: one leading photograph, two smaller references; title, city and valid detail links. Up to three active records.
4. Equal buyer paths for home/business surveillance and enterprise inspection/security, using existing product/contact routes.
5. Curated products: at most four genuine showcase records with readable names, descriptions and real images.
6. Company and after-sales: history, people/activity, warranty, downloads and FAQ; no universal warranty-duration promise.
7. Attributed testimonials only when actual approved content exists; omit an empty section.
8. Strong closing advice/catalog CTA, then the real shared contact/footer.

Desktop: RTL copy at reading side, scene opposite; narrow linked evidence band; asymmetric photography; two audience panels; products; company/support; optional quotes; closing panel. Mobile: copy/actions first, smaller scene, stacked evidence and projects, no fixed-height text clipping.

## Animation and lifecycle

- Motion: dynamically load the small animate API after content. Animate shallow opacity/translate once. HTML remains visible before hydration.
- Lenis: homepage-only, fine-pointer desktop, native anchors/touch, no root app provider; respect reduced motion and save-data; override global CSS smooth behavior only while active and restore on cleanup.
- Three.js: dynamically imported from a client loader after document load/eligibility/visibility. One canvas, DPR <=1.5, finite intro under five seconds; shallow pointer response.
- Pause/resume native button. Pause offscreen/hidden tab. Dispose observers/listeners/frame handles/materials/geometry/renderer.
- Reduced motion/save-data: static image. Mobile: static plus explicit 3D opt-in. WebGL/import failure retains poster. No information depends on canvas.

## Accessibility / responsive contract

Persian lang/RTL; logical spacing; LTR names isolated. One visible H1 and logical H2/H3. Meaningful links; 44px targets; visible focus; skip destination; decorative scene hidden from assistive technology. Copy 4.5:1 contrast and large text/UI 3:1. No hover/drag requirement; no traps or scroll hijacking. Test 360, 390, 768, 1024, 1440px and prevent overflow at 320px. Preserve shared search, account, mobile menu and support widgets; provide enough bottom clearance.

## Server data / SEO / performance

Server route and evidence sections, concurrent independent feeds, cached narrow showcase query, reuse cached getProjects(). Success status separate from results, so a failed query never becomes “0 projects”. Revalidation must match existing admin mutations (currently revalidatePath); when adding a cache tag, invalidate it on showcase writes.

Use next/image directly for evidence cards with sizes and reserved aspect ratios. Do not use SmartImage's initially hidden/timer behavior. Keep canonical/OpenGraph and coherent Organization/WebSite/WebPage IDs. Remove incorrect 2020 and unsupported credentials/member/hours; display confirmed 1381 as copy.

Engineering targets, not measured promises: LCP <=2.5s, INP <=200ms, CLS <=0.1 on representative field traffic. No 3D on critical content path, remote models or high-DPR canvas; pause offscreen. Record actual build/preview results before claiming performance improvement. No client database/API waterfall.

## Codex guidance and scope

Keep all 62 repo skills in .agents/skills. Add a concise AGENTS.md router for planning/design, Next/React, performance/a11y, and agent documentation, pointing to this spec/plan and bundled Next.js docs. Preserve generated nextjs-agent-rules and existing user edits. No machine-wide settings, skill duplication, migrations, or deployment.

## Content still needed

Real testimonial quotes and approval, any verified customer/installation statistics, approved client logos, and exact Gregorian registration date. Missing material must not block the functioning homepage or lead to fabricated proof.
