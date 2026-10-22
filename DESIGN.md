# Farabak web design system

Status: next redesign target, 2026-10-20. Current production and this checkout do not yet implement every rule below. The next-phase spec is `docs/superpowers/specs/2026-10-20-farabak-product-storytelling-design.md`; the execution plan is `docs/superpowers/plans/2026-10-20-farabak-product-storytelling.md`.

## Brand thesis and conversion

Farabak helps people select, deploy, and support equipment across surveillance, security inspection, professional imaging, and display systems. The public interface should feel like an expert equipment showroom: precise, tactile, easy to read, and dramatic when the product merits it. Show real equipment, applications, and verifiable support paths. “از ۱۳۸۱” is the confirmed history statement. A manufacturer name identifies an offered family, not a partnership or authorization claim.

The main path is useful exploration followed by a real product page or project consultation. The content must work with JavaScript, motion, and 3D disabled.

## Art direction: precision gallery

- The hero is a product range stage: an off-grid Persian headline and two clear actions sit beside or over a composition of five genuine product families. Selection brings one family into visual focus. The first static frame is complete and useful.
- Replace the current generic procedural camera only after the static hero, product navigation, and fallback work. If a licensed, accurate 3D model of a stocked product is later verified, it may replace one photographic layer. Until then, use approved photography with restrained 2.5D depth. Never label approximate geometry as an actual model.
- White space carries sparse optical rules, crop marks, soft cyan light grazing, and occasional diagrams. Keep it readable paper, not a full-page particle field.
- Each chapter has its own composition: X-ray as a wide screening threshold, CEIA as a human-scale entrance, Blackmagic as a dark cinematic workspace, CCTV as an architectural field of view, and SMD LED wall as a modular light surface. Do not repeat five identical copy/image splits.

| Surface          | Composition                                                           | Job                                   |
| ---------------- | --------------------------------------------------------------------- | ------------------------------------- |
| Hero             | Image-as-canvas, asymmetric text, integrated product range navigation | Establish range and route visitors    |
| Proof            | Narrow factual band linked to history, projects, warranty             | Show evidence                         |
| Category stories | Five alternating editorial spreads                                    | Explain fit and show a strong example |
| Projects         | Asymmetric real project photography                                   | Demonstrate delivered work            |
| Knowledge        | One lead article and two compact articles                             | Help visitors compare and learn       |
| Closing          | Concise dark project inquiry and catalogue paths                      | Convert intent                        |

Avoid repeated icon cards, fake dashboards, fictional telemetry, fabricated testimonials, ornamental numbers, and a default purple glow. One visually dominant idea per viewport is enough.

## Color and token architecture

The global palette in `src/app/globals.css` remains the current compatibility layer for the wider app. Introduce the target roles within the public landing surface first; do not silently restyle admin or product pages.

| Primitive    | Value     | Role                              |
| ------------ | --------- | --------------------------------- |
| `navy-950`   | `#071B32` | Hero, closing panel, deepest ink  |
| `navy-800`   | `#123653` | Dark secondary fields             |
| `blue-600`   | `#0E6AFF` | Primary action and focus accent   |
| `cyan-300`   | `#73D6FF` | Optical accent on dark            |
| `silver-200` | `#DCE5EE` | Hardware edge, dark-surface rules |
| `paper-50`   | `#F7FAFD` | Reading surface                   |
| `white`      | `#FFFFFF` | Raised light surface              |
| `slate-700`  | `#354B60` | Main body ink on light            |
| `slate-500`  | `#536577` | Secondary ink on light            |

Semantic variables should express role (`--surface-hero`, `--surface-paper`, `--ink-on-dark`, `--ink-primary`, `--ink-secondary`, `--action-primary`, `--accent-optical`, `--rule-subtle`), and components should derive their own values (`--hero-rule`, `--button-primary-bg`, `--focus-ring`). Aim for roughly 20% dark opening/closing fields, 70% light reading fields, 10% accent and imagery. Cyan is not body text on paper. Verify actual color pairings against WCAG AA.

## Typography and RTL

- Keep the local IRANYekan variable font: display 800–900, heading 700–800, body 400–500, interface 500–600. No extra font download by default.
- Persian H1 should read in one glance, ideally no more than two lines at 390px and 1440px. Preserve dots and diacritics with sufficient line-height. Useful detail belongs in the supporting line.
- Suggested responsive roles: display `clamp(2.25rem, 5.5vw, 5.75rem)`, section title `clamp(1.9rem, 3.6vw, 3.8rem)`, statement `clamp(1.35rem, 2.2vw, 2.1rem)`, body `1rem–1.125rem`, label `0.75rem–0.875rem`. Confirm in rendered Persian.
- Aim for 55–75 Persian characters per body line when width allows, with line-height near 1.8. Use Latin technical captions sparingly; isolate model names with `dir="ltr"` or `<bdi>`.
- Set Persian language and RTL direction. Use logical CSS properties and intentional arrow direction. Important words stay in DOM text, never inside 3D, video, or generated art.

## Grid, spacing, and surfaces

- Max content width 1400px. Desktop uses a 12-column conceptual grid with 24–40px page padding; tablet compresses; mobile uses one column and 16–20px padding.
- Spacing scale: 4, 8, 12, 16, 24, 32, 48, 64, 96, 128px. Large section gaps help the five stories remain distinct.
- Product media may bleed to an edge; text follows a stable reading line. Reserve aspect ratio before image load.
- Core panel radii stay around 0–12px. Use shadows for real elevation only. Dividers are hairline; card grids are not the default structure.
- At 320px, no horizontal overflow. At 360/390px, actions stack or wrap and chapter navigation is a compact accessible list. At 768/1024px, recompose rather than squeezing the desktop stage.

## Imagery, 3D, and rights

Asset priority: (1) approved Farabak product/project photos, (2) manufacturer photos with documented reuse permission, (3) commissioned accurate render from approved references, (4) generated conceptual environment clearly marked illustrative. A generated image must not invent branded equipment, a live feed, safety performance, certification, an installation, or a client site.

Every public asset gets a manifest entry: subject, SKU or concept, source URL/file, rights/approval, alt text, aspect ratio, mobile crop, optimized formats, fallback, and owner. Keep credits with the project; no hotlinked manufacturer assets or extracted private viewer files.

For any 3D candidate, verify an actual downloadable GLB/glTF/FBX/CAD asset, commercial web-use rights, exact current SKU, optimization feasibility, and a static poster. “3D zoom” or 3D X-ray imaging in product marketing does not mean a reusable product model exists. Use one WebGL scene at most, deferred and disposable. Product understanding must never depend on it.

| Story        | Preferred visual                                                  | Conceptual fallback                                        |
| ------------ | ----------------------------------------------------------------- | ---------------------------------------------------------- |
| Smiths X-ray | Farabak-listed HI-SCAN 6040 DV product photo and real application | Unbranded architectural screening space                    |
| CEIA gate    | Approved photo of an actual offered gate                          | Human-scale entrance study labelled conceptual             |
| Blackmagic   | Farabak-listed PYXIS 12K product photo                            | Film-production environment without a fake camera          |
| CCTV         | Farabak-listed RLC-823A or approved current flagship              | Surveillance use context without a fake live feed          |
| SMD LED wall | Real Farabak display/project photo after verification             | Abstract modular LED surface without a false project claim |

These image briefs are for future production, not verified product assets or permissions.

## Motion grammar

Expressive motion should clarify equipment and connect chapters. Reuse four verbs: reveal, focus, traverse, settle. A scan line may introduce X-ray; a framing movement may focus CCTV; color light may lead to Blackmagic; a modular field may resolve into the LED wall. These are design metaphors, not simulations of actual device output.

| Layer                  | Treatment                                                           | Boundary                                          |
| ---------------------- | ------------------------------------------------------------------- | ------------------------------------------------- |
| First viewport         | Short staged entrance and product-focus transition                  | H1 and actions readable before JS; no long loader |
| Section arrival        | One reveal per chapter; media/copy stagger 80–140ms                 | Transform/opacity only; server HTML visible       |
| Background/white space | Sparse SVG linework or light drift in 2–3 sections                  | No perpetual full-page shader                     |
| Scroll story           | One short desktop progress-linked sequence if it explains selection | No long pin or scroll hijack; normal mobile flow  |
| Microinteraction       | Button focus, crop, chapter index, pause feedback                   | Keyboard and touch equivalents                    |

Respect `prefers-reduced-motion`, save-data, visibility, and low capability. Persistent motion gets a visible pause control. Mobile defaults to static or short entrance motion; 3D requires explicit opt-in. Use Motion for small transitions. Use GSAP ScrollTrigger only for a unique scroll choreography; scope and clean up timelines. Do not combine particle fields, magnetic buttons, split text, cursor trails, and pinned carousels.

## Content, proof, and components

Each category chapter answers: what problem it solves, where it fits, one verifiable example, two or three grounded differentiators, what to consider before selection, and the next action. Do not claim “best”, “first”, “official”, “largest”, or “in stock” without current approved evidence. Do not hardcode prices or discounts in editorial copy.

Proof uses confirmed ۱۳۸۱ history, published projects, warranty tracking, downloads, FAQ, and genuine blog content. Project counts render only after successful data retrieval. Testimonials require approved attributed quotes. Blog cards show published, non-QR editorial articles with valid category links and media; missing data get a useful textual fallback. Dates must come from valid data.

- Product chapter: stable heading, LTR model name, selection criterion, real image alt, one explicit destination. Label illustrative diagrams.
- Product navigation: real links form the baseline; enhanced selection may update imagery but must not block navigation. Show current state and retain keyboard focus.
- Blog card: title, topic, image or textual fallback, reliable link. No invented reading time or date.
- Buttons: at least 44px target, distinct default/hover/focus/active/disabled states. Meaning does not depend on color.
- Decorative art is `aria-hidden` and does not capture pointer events. Pause and 3D opt-in are native labelled buttons.
- Shared header, search, account, support widget, and footer remain usable above decorative layers.

Use catalogue or exact product links where a verified listing exists. Use `/contact-us` for integration solutions and unlisted equipment. Never route to a speculative or broken SKU URL. Do not make manufacturer affiliation claims from a catalogue listing alone.

## Acceptance and migration

Inspect static first frame, enhanced motion, keyboard path, and reduced-motion path at 320, 360, 390, 768, 1024, and 1440px. Check Persian breaks, crops, contrast, links, focus, full-page rhythm, slow network, missing media, empty feeds, and WebGL failure. Measure on a representative build before claiming speed. Aspirational field targets: LCP ≤2.5s, INP ≤200ms, CLS ≤0.1; these are not current measured results.

This checkout currently has `TrustLanding.tsx`, a procedural camera scene, `landing.module.css`, and a basic Motion/Lenis lifecycle. The 2026-10-19 spec/plan document that completed phase. This file supersedes its visual target while retaining verified content restrictions. Existing global shadcn/Tailwind tokens and admin styles remain current implementation until a separate redesign addresses them. This document does not authorize publication, new commercial claims, or production data mutations.
