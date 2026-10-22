# Farabak product storytelling landing specification

Date: 2026-10-20. Status: design approved for planning by the user's request; **no page implementation in this task**. This supersedes the visual and content sequence of the 2026-10-19 landing spec but retains its factual-proof and accessibility rules. Read `DESIGN.md` for system-level decisions.

## Brief and decision

Create an exceptional Persian RTL landing experience centered on five stories: Smiths Detection X-ray, CEIA metal detector gates, Blackmagic, CCTV, and SMD LED video wall. Add restrained but expressive background and scroll motion, rich useful copy, a published-blog section, and a product range hero that can later accept an accurate licensed 3D product asset. Existing page functionality, shared navigation, and honest proof remain intact. The user chose **explore the product range** as the fallback if suitable reusable 3D models are unavailable and clarified that SMD wall means an LED video wall.

Three considered directions:

1. **Single accurate flagship 3D model:** highest tactile impact, but requires a licensed downloadable asset, exact Farabak SKU, optimization, and poster. No such asset was verified in the bounded research below.
2. **Product range gallery (selected):** real photography and layered depth make all five areas discoverable. One enhanced focus transition gives a premium 3D-like feel without misrepresenting a model; a verified 3D asset can later be inserted without restructuring the page.
3. **Abstract security/data sculpture:** easy to build but does not explain Blackmagic and LED display work or help buyers navigate. Reject as the main hero.

The page's single visual idea is **precision across different fields of view**: baggage inspection, entrances, cinema frames, surveillance coverage, and LED pixels. Rectangular frames and controlled optical light recur with different scales; they are connected by actual product photography and content, not a repeated card template.

## Subagent execution contract

Implementation is intended for the repository's `subagent-driven-development` workflow. A coordinator owns the integrated result and decisions; fresh specialist agents own bounded task deliverables. Parallel work is useful for **read-only** product/rights research, visual art-direction critique, and motion-library/interaction research. Those scouts return evidence and recommendations without changing files. Implementation agents run one at a time in the shared checkout because the homepage composition, data interfaces, and CSS depend on earlier work. Each implementation task receives an independent spec-compliance and code-quality review before the next task consumes its output; the finished page receives a separate whole-page visual, accessibility, and code review.

The ownership boundaries are: asset provenance; typed story/blog data; static server composition; public visual system; focus/ambient motion; conditional GSAP/3D enhancement; final verification. The coordinator publishes the accepted interfaces and changed-file list after each review. Agents do not edit another task's owned files or silently change product facts to make a design fit. When a boundary needs to change, the coordinator records the decision and updates the downstream brief before dispatch.

All agents inherit the same factual gates: a live catalogue entry does not grant image rights or prove stock; CEIA and SMD keep contact-led fallbacks until their offerings are verified; generated concepts are not product photography; static content stays useful when optional effects fail. Reviewers check these gates independently. No agent may publish, deploy, mutate production records, or contact third parties without the user's authorization. The detailed role order, file ownership, handoff artifacts, and review criteria are in the implementation plan.

## Research snapshot and source limits

Research date: 2026-10-20. The live `farabak.net` site was opened in a browser. Its production homepage is the older carousel; this checkout already has a newer `TrustLanding`. Catalogue and article observations are a snapshot and must be rechecked at implementation. A live listing confirms presence in the catalogue, not stock, distribution authority, image rights, or model-download rights.

| Story        | Live Farabak evidence                                                                                                                                                                                                                                                                                        | Candidate hero object                  | Destination decision                                                                   |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------- | -------------------------------------------------------------------------------------- |
| X-ray        | [X-ray catalogue](https://farabak.net/products/x-ray) lists [HI-SCAN 6040 DV](https://farabak.net/products/x-ray/airport-luggage/HI-SCAN-6040-DV); [Smiths official page](https://www.smithsdetection.com/products/hi-scan-6040/) confirms model/function                                                    | HI-SCAN 6040 DV                        | Exact product link after implementation recheck                                        |
| CEIA gates   | Farabak's live catalogue search for “CEIA” returned no results during this review; [CEIA OPENGATE](https://www.ceia.net/security/product.aspx?a=opengate&lan=eng&us1%2Ces1=) and [SMD600 Plus](https://security.ceia-usa.com/products/metal-detectors/smd600-plus/) are official visual/technical references | OPENGATE as a _candidate only_         | `/contact-us` until Farabak offering and asset rights are confirmed                    |
| Blackmagic   | [Blackmagic camera category](https://farabak.net/products/blackmagic/professional-camera) lists [PYXIS 12K](https://farabak.net/products/blackmagic/professional-camera/blackmagic-pyxis-12k); [manufacturer page](https://www.blackmagicdesign.com/products/blackmagicpyxis) confirms model                 | PYXIS 12K                              | Exact product link after recheck                                                       |
| CCTV         | [Reolink catalogue](https://farabak.net/products/reolink-cctv-camera) lists [RLC-823A](https://farabak.net/products/reolink-cctv-camera/ip/RLC-823A)                                                                                                                                                         | RLC-823A, provisional visual choice    | Exact product link after recheck; content team may choose a more current stocked model |
| SMD LED wall | No matching SMD video-wall listing was confirmed in the inspected live catalogue; `/products/conference-hall` currently returned 404                                                                                                                                                                         | Real Farabak project photo if supplied | `/contact-us` until a real solution page/listing exists                                |

The [live blog](https://farabak.net/support/blog) has published articles across Reolink, X-ray, and Blackmagic. The repo's `getBlogs()` returns published, non-QR articles, but pulls full content and relations; the homepage needs a narrow card query.

Bounded searches of official Smiths, CEIA, Blackmagic and Reolink product pages and public model search did **not verify a downloadable, commercially reusable, exact product 3D model**. “3D Zoom” on Reolink and 3D X-ray/CT imagery on Smiths pages describe product features, not a reusable mesh. No model is approved for use in this plan. An implementation agent may reopen the asset branch only with a documented license and exact SKU match. Never extract a viewer's hidden network assets.

## Narrative and content contract

1. **Hero / range finder.** H1 candidate: “از تصویر تا بازرسی، دقیق ببینید.” Support line makes Farabak's role explicit: “تجهیزات نظارت، بازرسی، تولید تصویر و نمایش را برای نیاز واقعی پروژه‌تان کشف کنید.” Primary “کاوش محصولات” scrolls to the first chapter/category navigation; secondary “مشاوره پروژه” links to `/contact-us`. Keep “از ۱۳۸۱” linked to history. Static hero initially shows one real verified model photo, with a five-item range index and clear category labels. Selection changes art/caption only as enhancement; each item has a destination link.
2. **Proof.** The already confirmed history, published projects, and warranty tracking appear early. No invented statistic, client logo, quote, or authorization badge.
3. **Five chapters.** Each has a user problem, application scenario, named candidate only when verified, two or three fact-checked selection factors, a useful comparison/guide hook, media, and an action. A chapter may show a solution rather than an exact SKU when the catalogue lacks one.
4. **Projects.** Preserve a small actual gallery. Explain which capability the project demonstrates only if existing project data supports it; do not imply a particular listed product was installed.
5. **Knowledge / blogs.** Lead article plus two companions, selected from published articles with valid slugs and category; prioritize one each of X-ray, Blackmagic, and CCTV/Reolink when available, then fill by recency. Each card gives a topic and one-sentence reason to read. Link to `/support/blog` for the full library. Never invent article dates or read time.
6. **After-sales and CTA.** Warranty, downloads, FAQ and direct project contact. The closing question should help visitors choose between equipment browsing and talking to an expert.

Suggested chapter headlines and decision hooks (editorial drafts, not approved product claims):

| Chapter      | Headline                                         | Decision hook                      |
| ------------ | ------------------------------------------------ | ---------------------------------- |
| Smiths X-ray | «آنچه دیده نمی‌شود، در مسیر بازرسی روشن می‌شود.» | نوع بار، حجم عبور، فضای نصب        |
| CEIA gates   | «ورودی پرتردد، تصمیم دقیق.»                      | نوع تهدید، جریان تردد، شرایط محیط  |
| Blackmagic   | «تصویر حرفه‌ای از لحظهٔ ثبت آغاز می‌شود.»        | فرمت، مانت، مسیر ضبط و پخش         |
| CCTV         | «هر فضا، میدان دید خودش را دارد.»                | پوشش، نور شب، ذخیره‌سازی           |
| SMD LED wall | «تصویر بزرگ، با جزئیات نزدیک.»                   | فاصله دید، ابعاد، نور محیط و سرویس |

For each chapter: 35–60 word introduction; one 20–35 word grounded product/solution description; three concise factors (ideally <15 words each); one action. Expanded technical copy belongs on product/category detail pages. No hardcoded price or dynamic stock promise. Editors verify every model feature against the manufacturer and Farabak listing before publication.

## Hero and 3D interaction specification

First frame: deep navy gallery stage, large accurate product photography, Persian heading on a solid readable region, five numbered category selectors, two clear actions. Use product-image cutouts on separated planes with modest perspective and light/shadow; no five simultaneous orbiting objects. Static poster and accessible links are the baseline. Desktop enhancement: focus transitions between one chosen product and the next over about 0.6–0.9s; users can click or use keyboard, not wait for auto-rotation. Pointer parallax is tiny and confined to the art, with no drag requirement. Mobile uses a single focused image and a horizontally scrollable or stacked labelled category chooser; no auto WebGL.

Asset promotion gate for genuine 3D: identified exact stocked SKU, written commercial-use permission or a compatible license, accessible original asset, visually accurate geometry, suitable compressed download, poster, reduced-motion fallback, and mid-range mobile performance review. If any gate fails, the photography-based range hero is the final design. A generated render may be used only as a labelled conceptual background or a reviewed product representation with explicit business approval; it cannot silently replace product photography.

## Section art direction and image briefs

The separate concept references below support planning; publication imagery still requires a real product-photo and permissions inventory. Do not use AI to fabricate an exact branded SKU. Target each visual as a horizontal crop with a mobile-safe subject and empty text region; no text baked into images. Keep navy/paper/silver/optical cyan continuity while varying space and lighting.

Five planning-only concept images were generated under `docs/superpowers/concepts/2026-10-20-product-stories/`. Their [README](../concepts/2026-10-20-product-stories/README.md) records their status. They are art-direction previews, not approved website assets or real product/site photographs.

1. **X-ray:** architecture of a screening checkpoint; an approved actual HI-SCAN cutout is composited separately. Broad lateral perspective and one passing tray line; no invented X-ray output.
2. **CEIA:** high-ceiling entrance with human-scale gate context; approved actual offered model composited separately. Emphasize threshold and pedestrian flow, not threatening or theatrical security imagery.
3. **Blackmagic:** controlled cinema/studio workbench with warm practical light and dark negative space; actual PYXIS image separate. Avoid fictional recording UI.
4. **CCTV:** exterior architecture at blue hour with sightline diagram as SVG overlay; actual camera photo separate. Avoid fake surveillance footage.
5. **SMD LED wall:** real approved installed wall preferred; otherwise a conceptual unbranded modular LED surface in a venue. Label as concept, never “Farabak project”.

## Motion and component-source decision

Research inspirations: [21st.dev sticky-scroll collection](https://21st.dev/community/components/explore/sticky-scroll-reveal), its [scroll animation analysis](https://docs.21st.dev/blog/react-scroll-animation-components), [React Bits backgrounds](https://reactbits.dev/c/backgrounds), [GSAP ScrollTrigger](https://gsap.com/docs/v3/Plugins/ScrollTrigger/), [GSAP matchMedia](https://gsap.com/docs/v3/GSAP/gsap.matchMedia%28%29/), and [Motion useScroll](https://motion.dev/docs/react-use-scroll). These are reference patterns to inspect and adapt, not a mandate to paste an entire component or install a collection. Library components vary in quality and rights; inspect source, dependencies, license, accessibility, and reduced-motion behavior before adoption.

Chosen choreography:

- Motion for hero selector/CTA feedback and one-time reveals; existing Motion dependency can be reused.
- One localized GSAP ScrollTrigger sequence across the X-ray-to-CEIA transition (a fine line traverses an inspection plane and becomes an entrance frame). Keep it short, optional, and scoped. GSAP is a conditional new dependency; first prove this sequence cannot be expressed adequately with existing Motion/CSS. No GSAP for ordinary fades.
- Pure CSS/SVG ambient drift for 2–3 isolated empty regions: low-contrast contour/crop lines on paper and a soft light field on dark. React Bits “Scanner” and “Grid Motion” are mood/interaction references, not copied shaders; they would compete with real product media and run continuously.
- No long pinned section, global scroll hijack, continuously animated text, autoplay video/sound, or decorative cursors. Existing Lenis must be re-evaluated with ScrollTrigger; choose one scroll ownership model, and validate anchors and refresh if retained.

Reduced motion shows all final visual states and removes scroll linking. Save-data/hidden tab stop ambient rendering. Motion can never conceal critical HTML while waiting for hydration. Offer a pause button if any persistent animation survives. On touch/mobile, remove parallax and use short, direct transitions. Cleanup all timelines, observers, listeners, and renderer resources.

## Architecture and failure states

Keep `src/app/(main)/page.tsx` and content composition server-side. Split chapter rendering into focused components and data manifests. Use the existing `src/lib/data/homepage.ts` feed, extend it with a narrow server-side editorial blog query and verified category story mapping. Do not fetch the full `getBlogs()` payload for three cards. Use category/product URLs that are verified at render/build time; CEIA/SMD contact actions are explicit. A database failure must not erase the page: the static hero/range and contact/category links remain useful; omit unavailable item cards and counts honestly.

Separate content provenance from visual state. Product media and headline are data; optional focus transitions are client state. No database/secret in client components. Assets load through `next/image` with dimensions/sizes and a stable poster. If a model import/WebGL fails, preserve the static asset and real links. If no valid blog item exists, show the section heading plus a direct blog-library link; no fake article card. Existing testimonials remain gated by approval.

## Acceptance

- Five named chapter sections plus published-blog section, projects/proof, after-sales and closing CTA; each tells a distinct, useful story.
- Static, keyboard, touch, reduced-motion, save-data, image-failure, blog-empty, DB-failure and optional 3D-failure paths are specified and tested during implementation.
- Inspect 320, 360, 390, 768, 1024, 1440px and desktop/mobile full-page rhythm, focus, actual media crop, Persian line wrapping, contrast, no overflow, no overlay over header/support controls.
- Performance is measured on a representative build; target LCP ≤2.5s, INP ≤200ms, CLS ≤0.1 in field data, with no claim of achievement until measured. Record animation frame pacing on a mid-range device and reduce effects if interaction degrades.
- No unverified commercial claim or falsely exact imagery. A visible product link must resolve to the actual listing at release.
- Every implementation task has a scoped agent brief, an evidence handoff and an independent spec/code review before its output becomes the next task's input. A separate whole-page visual/accessibility review and whole-branch review close the work; unresolved findings are recorded rather than silently accepted.

No implementation, production data mutation, deployment, or publication is authorized by this document alone.
