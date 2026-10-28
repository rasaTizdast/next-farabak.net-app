# Buyer-assistance tools for Farabak

**Research date:** 2026-10-28  
**Question:** Which website tools would most credibly help Farabak buyers select products and help Farabak capture qualified demand?

## Executive conclusion

There is no trustworthy public ranking of the "most requested" tools across all B2B buyers. The strongest repeated pattern in current first-party research and mature industrial catalogues is more useful: buyers want to research independently, translate a real-world requirement into a technically defensible shortlist, compare the few viable options, and then hand a complete project context to a human when the purchase becomes complex.

Farabak should build that journey as three connected, deterministic tools before adding an AI agent:

1. **راه‌یاب انتخاب (Fit Finder):** a progressive, plain-language questionnaire that recommends a small ranked shortlist and explains every match, mismatch, and unknown.
2. **میز مقایسه (Decision Board):** a persistent comparison and project shortlist that normalizes meaningful specifications, lets users save/share a project, and preserves why each item was selected.
3. **پروژه‌ساز و درخواست بررسی (Project Brief + Engineer Handoff):** a lightweight project builder that collects quantities, site/use constraints, and optional notes, produces a useful summary, then asks whether the buyer wants a Farabak specialist to contact them.

The three tools should share one project state. A visitor can start anonymously, receive value before giving contact details, and submit the already-completed brief when human help is useful. This makes the contact request a continuation of the buyer's work rather than a generic lead form.

**CopilotKit verdict:** do not use CopilotKit in the first implementation. CopilotKit is an agentic application stack, not merely a chat widget: its official architecture has a frontend, a server runtime, and an AG-UI-compatible agent. Its in-process `BuiltInAgent` removes the need for a separate agent service, but still requires a model-backed agent loop and server runtime. Without a genuine agent, CopilotKit would add dependencies and operational surface without improving deterministic catalogue selection. Design the recommendation functions as callable tools now; a later conversational layer can invoke the same functions through CopilotKit once Farabak has a grounded model, evaluation set, privacy policy, budget, and operational owner.

## Why these three tools

### Demand is for self-service plus expert escalation

- HubSpot's survey-based 2024 Sales Trends Report says 64% of B2B sales professionals offer self-service tools to guide purchase decisions, 85% of those users regard the strategy as effective, and 52% say customers use self-service more than in the prior year. The report explicitly describes a hybrid model: simple purchases remain self-serve while complex contracts move to sales. [HubSpot Sales Trends Report](https://www.hubspot.com/hubfs/HubSpots%202024%20Sales%20Trends%20Report.pdf)
- HubSpot's 2025 survey summary reports that lack of product fit is the top cited deal-killer (37%), that 74% of sales professionals believe AI makes product research easier for buyers, and that nearly 38% of sales leaders say free tools are their highest-converting lead mechanism. This supports giving the buyer a useful result before requesting contact information. [HubSpot 2025 State of Sales summary](https://blog.hubspot.com/sales/hubspot-sales-strategy-report)
- Salesforce's current B2B commerce research states that self-service is already majority behavior in its dataset, while its quote-to-cash material reports that 75% of B2B buyers prefer to buy online. These are vendor-produced findings and should be treated as directional, but they align with the independent pattern above. [Salesforce B2B commerce trends](https://www.salesforce.com/commerce/b2b-ecommerce/trends/) and [Salesforce Quote-to-Cash Playbook](https://www.salesforce.com/en-us/wp-content/uploads/sites/4/documents/reports/sales/salesforce-quote-to-cash-playbook.pdf)

### Industrial leaders combine selection, comparison, project state, and quotation

- Siemens' TIA Selection Tool guides beginners and experts to device configurations, supports selection wizards, saves and shares projects, and can proceed to ordering. The important product lesson is not its scale; it is the continuity from requirements to a reusable project. [Siemens TIA Selection Tool](https://www.siemens.com/en-us/products/tia/selection-tool/)
- AXIS Site Designer is especially relevant to Farabak's surveillance categories. Its official documentation combines product selection, floor-plan placement, coverage visualization, camera comparison, bandwidth/storage estimation, recording/network recommendations, bill of materials, sales quotations, saved projects, and sharing. It also clearly labels its calculations as guidance and recommends distributor verification. [AXIS Site Designer documentation](https://help.axis.com/en-us/axis-site-designer) and [AXIS Site Designer product page](https://www.axis.com/support/tools/axis-site-designer)
- Bosch's official Video Product Selector exposes a compact version of the same funnel: select and compare, keep a list, forward the list, or contact the company with the current selection context included. [Bosch Video Product Selector](https://www.videoselector.boschsecurity.com/)
- Baymard's large-scale usability research treats filtering and comparison as distinct, evidence-backed product-listing topics. This supports a comparison surface that is deliberately designed rather than an incidental checkbox on product cards. [Baymard Product Lists and Filtering research](https://baymard.com/research/ecommerce-product-lists)

## Recommended feature designs

### 1. راه‌یاب انتخاب — Fit Finder

**Job:** turn a buyer's intended use into two to four defensible product candidates.

**Interaction**

1. Start with the buyer's job, not a product category: for example, secure an industrial area, inspect baggage, build a production chain, monitor a building, or display an image.
2. Ask only requirements that materially change the result. Reveal technical questions progressively and explain unfamiliar terms in Persian.
3. Show the remaining candidate count while answering and allow “نمی‌دانم” without blocking progress.
4. Rank results using explicit rules over verified product/category attributes. Each result must show:
   - why it fits;
   - any trade-off;
   - any requirement that cannot be verified from current product data;
   - the source fields used for the decision.
5. Offer “compare these”, “add to project”, and “ask a specialist” actions.

**Implementation principle:** start with curated decision trees for one or two well-described categories, not a universal quiz with invented attributes. Store category question definitions and scoring rules separately from UI. Products missing a required verified attribute are “unknown,” never silently treated as a match.

**Why it is credible:** Canon's official Zoovu case study describes the same plain-language approach for technically complex printers and lenses and reports improvements across recommendation reach, conversion, and revenue. The exact results are vendor-reported, but the design pattern is relevant. [Canon / Zoovu case study](https://zoovu.com/case-study/canon)

### 2. میز مقایسه — Decision Board

**Job:** help a buyer or buying committee reduce a shortlist without copying specifications into a spreadsheet.

**Interaction**

- Compare up to four products on normalized, category-relevant rows.
- Default to “only differences,” with controls for all facts and unresolved facts.
- Keep exact model codes left-to-right and make missing values explicit.
- Let the buyer pin a preferred item and record a short reason or project note.
- Persist the board locally for anonymous visitors. Generate a shareable server record only when the user explicitly asks to share or submit; never encode sensitive project details directly in a public URL.
- Export/print a concise project summary after the server-side path exists; avoid claiming a formal quotation before staff review.

**Critical data rule:** current `ProductSpecs` rows are flexible name/title/description records, so comparison needs a normalization map per supported category. Do not compare arbitrary rows by array position or similar-looking Persian labels.

### 3. پروژه‌ساز و درخواست بررسی — Project Brief + Engineer Handoff

**Job:** convert a useful self-service session into a qualified, context-rich enquiry.

**Interaction**

1. Carry the selected products and answers forward automatically.
2. Ask for project name, intended environment, quantities, target date, city/region, and free-form constraints only where relevant.
3. Show a readable summary before requesting personal information.
4. Then ask: **«می‌خواهید کارشناس فرابک برای بررسی دقیق‌تر با شما تماس بگیرد؟»**
5. If yes, request the minimum contact fields, state the purpose/consent clearly, and submit the complete brief. If no, preserve the local project and allow catalogue continuation.
6. Confirmation must provide a reference number and set an honest response expectation only if Farabak has an operational SLA to support it.

**Lead value:** the sales team receives the buyer's use case, decision path, shortlisted products, unknowns, and notes instead of a name and phone number with no context. Analytics should measure finder starts, completion, result views, compare/add-to-project actions, and handoff consent—without storing raw personal data in client analytics events.

## The appropriate role for AI

### Phase 1: deterministic and explainable

Build the three tools above with typed rules, verified catalogue data, and accessible form state. This is faster to validate, remains useful without a model call, is testable with fixed fixtures, and cannot hallucinate a product specification.

### Phase 2: natural-language input over the same tools

After the deterministic system produces reliable results, allow a visitor to describe a need in Persian. A constrained language layer may extract structured answers, ask for missing facts, and call the exact same finder/project functions. Every recommendation still comes from the rules and verified catalogue, not from model memory.

### Phase 3: agentic copilot only when there is an operational case

CopilotKit becomes reasonable if Farabak wants a persistent assistant that can:

- invoke product search, comparison, project editing, contact handoff, and authenticated account actions;
- render tool-specific generative UI;
- pause for human confirmation before any mutation;
- preserve and inspect threads with proper user ownership.

CopilotKit's official architecture confirms that the frontend connects through a server runtime to an agent over AG-UI. The runtime can host an in-process `BuiltInAgent`, so a separate Python/LangGraph service is optional, not the agent itself. Threads and operational persistence can add CopilotKit Intelligence or a separately owned solution. [CopilotKit architecture](https://docs.copilotkit.ai/) [CopilotKit runtime deployment](https://docs.copilotkit.ai/deepagents/runtime-server-adapter) [CopilotKit Intelligence architecture](https://docs.copilotkit.ai/intelligence/intelligence-platform)

Before Phase 3, require: a Persian evaluation set built from real sales questions; a product-data freshness owner; prompt-injection and tool-authorization controls; model-cost/rate limits; privacy/retention decisions; fallbacks for model failure; and evidence that free text materially improves completion over the guided flow.

## Scope and sequencing recommendation

1. **First release:** Fit Finder for one high-value category, Decision Board for that category, local project persistence, and an existing contact route prefilled with the project summary. This proves the end-to-end user value without a new database mutation.
2. **Second release:** server-side saved/shareable projects, explicit-consent lead submission, internal lead context, and supported-category expansion.
3. **Third release:** calculations such as coverage, storage, bandwidth, or compatibility only when formulas, product attributes, and disclaimers are verified by a qualified domain owner. AXIS's published tool is the benchmark for the eventual surveillance-project experience, but copying its calculations without authoritative inputs would create false confidence.
4. **Optional later release:** constrained Persian conversational layer; evaluate CopilotKit then.

## Guardrails

- Never state that a recommendation is safe, compliant, compatible, in stock, or sufficient unless the underlying source proves it.
- Distinguish recommendation, estimate, and formal quotation.
- Preserve the user's ability to inspect and change every answer that influenced a result.
- Do not gate results behind contact capture.
- Do not generate photorealistic product imagery for a tool surface when verified catalogue product media already exists. Generated scene imagery is appropriate only when a real product asset is supplied as a reference and the output is clearly treated as illustrative, not installation evidence.
- Add a visible specialist-review path at results and project-summary stages, not as an interrupting modal.

## Product success measures

- Finder completion rate and median time to first useful result.
- Percentage of completed finders with at least one explainable match.
- Compare/add-to-project rate after viewing recommendations.
- Share/save rate and return-to-project rate.
- Optional specialist-review consent rate.
- Percentage of submitted briefs that sales marks as sufficiently qualified.
- Zero-result and “unknown attribute” rates by category; these become the product-data improvement backlog.
