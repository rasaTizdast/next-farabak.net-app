# Farabak public website design direction

Status: working design direction, updated 2026-10-22. The current landing page is the first expression of this direction, not a finished design system for every route. Use this file for future public-page redesigns; the dated specs and plans under `docs/superpowers/` record earlier decisions and research, not current implementation instructions.

## Purpose and visual idea

Farabak helps people select, deploy, and support equipment for security inspection, surveillance, professional imaging, and display. The interface should feel like an expert equipment showroom: precise, readable, tactile, and specific to the equipment. Its recurring visual idea is **precision across fields of view**: a screening aperture, an entrance, a cinema frame, a surveillance view, and an LED pixel field. Each page should express the aspect of that idea that helps its visitor decide.

The buyer path starts with a real need, offers useful selection criteria and a verifiable product or solution, then gives an honest route to a product page or project consultation. The interface and content remain useful without JavaScript, animation, or 3D. A catalogue listing establishes that a product is listed; it does not establish stock, distribution authority, reuse rights, or a completed installation. “از ۱۳۸۱” is the confirmed history claim. Publish testimonials only with approved, attributed quotes.

## Current landing baseline

The homepage route `src/app/(main)/page.tsx` renders `src/app/_components/LandingPage/TrustLanding.tsx`. The live composition has a product-range hero, a small proof band, five distinct category stories, published projects, editorial articles, support routes, and a closing contact action. `src/content/landing-stories.ts` owns the story copy and destinations; `src/content/landing-assets.ts` owns the image provenance and disclosure. `docs/superpowers/landing-product-image-prompts.md` records the generated-image references and prompts.

This implementation is the visual reference for the next public pages, with two known refinements:

- The landing uses a `max-w-[1900px]` shell, while the shared header uses an inner `max-w-[1580px]` container. Unify public-page content on the header's inner width and its responsive side padding so the left and right reading lines align at wide viewports. A product image may bleed within a section, but its labels and actions return to the shared grid.
- The active landing is Tailwind styled. `landing.module.css` and components that import it belong to an older, alternate composition; do not treat them as the current styling pattern merely because the files remain in the repo.

These are documented follow-ups, not claims that every current viewport already passes the target. Inspect the rendered page before copying a pattern.

## Art direction and layout

- Let product geometry and real use cases create the visual interest. Use clear typographic hierarchy, deliberate image crops, restrained optical lines, and a small number of strong color fields. One dominant visual idea per viewport is enough.
- Give each subject a composition suited to its scale: X-ray as a wide screening threshold, entrance detection at human scale, camera production as a work surface, CCTV in architectural context, and LED as a modular display surface. Avoid repeating the same image/card split across every category or route.
- Keep Persian copy compact and useful. A heading names the benefit or decision; supporting copy explains fit, constraints, and next action. Prefer evidence and specific selection factors over slogans, decorative numbers, fictional telemetry, or invented performance claims.
- Use the local IRANYekan variable font. Persian is the default language and reading direction. Isolate Latin models and codes with `dir="ltr"` or `<bdi>`, maintain clear punctuation and line breaks, and check diacritics at real rendered sizes.
- Align public sections to the shared header: outer padding `px-6 md:px-12 min-[992px]:px-16 min-[1200px]:px-24 2xl:px-40`, then an inner `mx-auto w-full max-w-[1580px]`. These classes describe the current header contract; extract a shared Tailwind shell when the first cross-page implementation makes duplication costly. On mobile, retain a comfortable single-column reading width and avoid horizontal overflow at 320px.
- Use square to modestly rounded panels, rules, and shadows only where they express hierarchy or physical depth. Media can extend outside the text column if the composition calls for it; text and interactive controls maintain the common reading line.

## Color and implementation

The landing's working colors are deep navy `#061A30` for the hero/closing fields, action blue `#1265E8`, light paper/white reading areas, blue-gray body ink, and sparse cyan for optical highlights and focus. These are working roles, not proof that the existing global theme is fully migrated. Before wider rollout, consolidate approved roles into Tailwind v4 theme tokens and test actual text/action/focus contrast. Do not restyle admin or product pages by changing global tokens incidentally.

Use Tailwind utilities for new public-page layout, typography, states, and responsive behavior. Keep CSS for global font/theme definitions or features Tailwind cannot express cleanly; do not add page-level CSS modules for the redesign. Reuse a small number of layout and interaction patterns when they have the same job, while letting product storytelling vary by content.

## Product imagery and evidence

Prefer approved Farabak product and project photographs. Manufacturer imagery requires documented reuse permission. A generated image can help show a product in context when it is built from a named product reference, visually reviewed for the correct form and markings, and plainly identified as AI-generated at the point of use. It must not be presented as an official manufacturer photograph, proof of an installation, a real client site, certification, or a stock claim. Exact model links require a verified Farabak listing; an unverified offering stays contact-led. The current CEIA OPENGATE and Unilumin Uslim III images are visual examples, with Farabak availability unconfirmed.

For each public asset, keep the product/model, source reference, usage approval or open question, generated-versus-real status, alt text, crop, dimensions, and fallback in the asset manifest. Check generated brand/model lettering and distinctive product geometry at the displayed size, including the mobile crop. Treat the reference and prompt record as provenance, not as permission to reuse manufacturer photos.

A 3D product scene is optional. Add one only when the exact model and commercial web-use rights are verified, a static poster exists, the file is suitably optimized, and the page remains useful when it fails. No exact reusable model has been approved in the existing research.

## Motion and interaction

Motion has four jobs: reveal an available choice, focus the selected product, traverse a meaningful change of scene, and settle into a readable state. It should clarify equipment or navigation, not become ambient noise. Keep the first frame complete; no loader or effect may delay the headline, image meaning, or action. Selector changes respond to keyboard and touch as well as pointer.

Use short transform/opacity transitions and a limited number of section entrances. Reserve scroll-linked choreography for a specific narrative transition that works in normal document flow. Respect reduced motion, save-data, hidden tabs, and low capability. Persistent animation needs a visible pause control. Mobile favors static or short direct transitions. 3D and WebGL are progressive enhancements, never content dependencies. Validate scroll ownership and cleanup before combining any scrolling library with animation.

## Site-wide redesign workflow

For each future public route, first identify its audience, primary task, content/data source, proof available, and shared navigation/CTA. Inspect the existing desktop and mobile route and record the behavior worth preserving. Then design the page around one subject-specific visual idea, using the shared shell, type hierarchy, action style, and factual rules above. Build with Tailwind and semantic HTML; keep server-rendered content and meaningful fallbacks. Review the complete page at 320, 390, 768, 1024, and 1440px, including keyboard, touch, reduced motion, slow media, empty/error data, and the shared header/footer/support controls. Check real links, image crops, Persian line breaks, contrast, and measured performance before claiming release quality.

The landing is a reference, not a template to duplicate. Product detail, category, blog, support, and contact routes each need their own information hierarchy. Migrate public routes incrementally and review consistency across neighboring pages after each step. Keep admin workflows outside this public redesign unless separately scoped. The dated `2026-10-19` and `2026-10-20` landing specs/plans remain historical context; verify their product facts and implementation assumptions before reuse.
