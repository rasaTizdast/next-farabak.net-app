# Farabak Product Advisor Design

## Goal

Give anonymous buyers a fast, trustworthy path from an everyday need to a small, explainable product shortlist. The experience must help both visitors who know the category and visitors who do not, then let them compare choices and download a Persian PDF summary. It runs without an AI model, contact/lead mutation, or Telegram call.

## Product decision

Farabak ships four connected deterministic tools under one Product Advisor workspace.

| Tool           | Buyer job                                                           | Route                           |
| -------------- | ------------------------------------------------------------------- | ------------------------------- |
| نیازسنج        | Turn a plain-language goal into an appropriate category             | /product-finder                 |
| راه‌یاب انتخاب | Ask hard-coded category questions and show an explainable shortlist | /product-finder?category=<slug> |
| میز تصمیم      | Keep, compare, annotate, and quantity a small shortlist             | /product-finder/board           |
| گزارش انتخاب   | Render and download a Persian decision report                       | /product-finder/report          |

Each is useful on its own. A buyer may enter the board from a product dossier or finder; the report does not require login or contact information.

## Hard constraints

- No AI model, CopilotKit, database write, public share URL, contact form, Telegram message, or personal-data collection is in this release.
- A model-level recommendation may use only a verified product record, its category or subcategory, and declared specification fields. Missing data is unknown, never a pass or fail.
- The advisor never claims stock, compatibility, compliance, installation fitness, coverage, or quotation status without a proving catalogue field.
- Use the actual catalogue media. Generated product imagery is prohibited.
- Follow the public RTL shell, PublicShell gutters, keyboard/focus behavior, reduced-motion behavior, and 320/390/768/1024/1440px QA requirements.
- Answer changes never request data. The selected category is loaded once on the server, cached through the existing product/category tags, and evaluated in memory.
- The entry screen is static and does not preload all 310 products or their specifications.

## Tool 1: نیازسنج

The entry view presents plain-language goals before technical categories, plus direct category entry for knowledgeable buyers.

- protect or monitor a building → Reolink surveillance;
- monitor an industrial or hazardous location → industrial cameras;
- capture or finish a professional production → Blackmagic;
- inspect luggage or parcels → X-ray;
- choose compute for an AI workload → HPC;
- equip a meeting room → conference equipment.

A choice navigates to its category. It does not infer a SKU.

## Tool 2: راه‌یاب انتخاب

Question sets live in a typed, versioned configuration module. They are hard-coded editorial choices, never model-generated questions. Each question has a stable identifier, Persian label, optional helper copy, explicit answer options, and a declared effect on rules.

| Category             | Required question themes                                                                                                                |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| Reolink surveillance | indoor/outdoor, one-point/area/entrance coverage, night-detail priority, power/connectivity, deterrence/alerts, recording               |
| Industrial cameras   | operating environment, hazardous/industrial constraint, distance/scene, image detail, mounting/connection                               |
| Blackmagic           | workflow role, capture/live production, target resolution, form factor, I/O or recording                                                |
| X-ray                | inspected object type/size, traffic volume, installation space, inspection goal                                                         |
| HPC                  | workload type, scale, compute versus memory, deployment constraint                                                                      |
| Conference equipment | room scale, meeting format, participant/audience need, content sharing                                                                  |
| Imaging/other        | application, environment, required output, must-have constraint; transparent category shortlist where exact verified rules do not exist |

Every question exposes نمی‌دانم. It preserves candidates and becomes an explicit unknown; it must not masquerade as a matched requirement.

The result returns two to four candidates when verified rule coverage supports ranking. Each candidate states matching answers and their source labels, a trade-off, unknown requirements, and actions to view the dossier or add it to the board. If fewer than two products have enough verified facts, the UI shows a labelled narrowed catalogue set instead of an artificial ranking.

## Tool 3: میز تصمیم

The board holds up to four products for one category comparison. It has normalized category-specific rows, an only-differences default, an all-verified-facts mode, explicit missing values, quantities, a pinned preferred option, and a local note.

Cross-category products may coexist in the saved project but must not appear in a false technical side-by-side table. The board groups products by category and asks the buyer to choose a group before comparison.

The board API accepts an AdvisorProductSnapshot so a future product-dossier action can add an existing product without a fetch.

## Tool 4: گزارش انتخاب

The report renders the same data visibly before export: goal, answers, shortlist, quantities, preferred product, note, verified match reasons, trade-offs, and unknowns. It calls itself گزارش انتخاب, not a quotation.

Clicking دریافت PDF lazily imports the installed html2canvas and jspdf libraries, creates one or more A4 pages, and downloads a Persian filename. The visible report remains useful if generation fails, and the existing print helper is an alternative print-to-PDF path. Neither PDF package may join the initial route bundle.

## Domain and persistence

The domain layer exposes AdvisorAnswer, AdvisorProductSnapshot, AdvisorProject, AdvisorCategoryDefinition, and AdvisorRecommendation. Rules return structured evidence arrays: matched, tradeoffs, unknown, and source labels. A numeric score may determine order but must not be shown without the evidence.

The project is versioned and saved after hydration under farabak-product-advisor:v1 in localStorage. It contains no identity, credentials, contact information, or analytics identifier. Invalid or obsolete data is discarded safely.

A later createHandoffPayload(project) function may produce a non-personal selection context, but this release has no contact UI, network call, or persistence action. A future Telegram integration must confirm authenticated details or collect minimum anonymous details with consent, then send this same structured project context.

## Motion and resource budget

The interaction should feel like a calibrated instrument, not a chat simulator.

- Answer controls confirm with color/opacity and a 0.98 press transform.
- AnimatePresence changes questions in 180–240ms with opacity and an 8px directional transform.
- A semantic progress rail advances and resolved answer chips accumulate.
- Candidate count recalculates locally and settles without hiding meaningful content.
- Results use one short stagger for no more than four cards.
- Reduced-motion resolves immediately; save-data or hidden-tab conditions suppress list entrances.

No polling, timer, Lottie asset, background fetch, or model request is permitted. The first category view remains usable server HTML, with an isolated interactive client workspace.

## Errors and accessibility

- Unsupported categories return a clear not-found state.
- Data-adapter failures show a retryable error and a catalogue link; they never create a recommendation.
- Zero-match results explain the limit, preserve editable answers, and link to the narrowed category listing.
- Questions use labelled native or Radix radios/checkboxes, visible focus, linked help, and predictable RTL keyboard order.
- Step changes move focus to the new heading after it renders.
- Board/result changes use concise live announcements without repeating the page.
- The PDF path never replaces accessible report HTML.

## Verification

- Unit tests cover routing, rule evidence, unknown handling, specification normalizers, reducer persistence/migration, mixed-category grouping, and multi-page export calculations.
- Component tests cover keyboard flow, progress, reduced motion, clear zero/error states, board actions, report contents, and dynamic imports only on click.
- Browser QA covers all five required widths, real category data, unknown/no-match flows, board restore, PDF/print legibility, reduced motion, and no page-width overflow.
- Performance verification proves one selected-category server load and zero fetches while answers change.
