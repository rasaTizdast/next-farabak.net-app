# X-ray Site-Fit Precheck Implementation Plan

> **For agentic workers:** Implement this plan task-by-task. Keep this feature on its own route and do not edit the shared tools directory page.

**Goal:** Create a preliminary X-ray scanner physical-fit and site-readiness tool at `/support/tools/xray-fit`.

**Architecture:** A server route loads only existing Farabak-listed X-ray product facts. A client workspace collects object/site dimensions and presents a pure rule-based fit result with source links, missing-data notices, and a printable brief.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript strict mode, Tailwind CSS v4, current product data layer and public support shell.

**Spec:** `docs/superpowers/specs/2026-11-03-xray-site-fit-design.md`

## Global Constraints

- Read the relevant Next.js 16 docs under `node_modules/next/dist/docs/` before route/data work.
- Verify current Farabak X-ray catalog and source facts; no unverified sample SKUs.
- Do not claim throughput, regulatory compliance, safety, or installation readiness from incomplete inputs.
- Keep Persian RTL, accessible form feedback, mobile layouts, and public design direction from `DESIGN.md`.
- Do not edit the shared `/support/tools` index or the pre-existing deleted lockfile.
- Do not add/run automated tests; complete the manual acceptance below.

---

### Task 1: Map verified scanner facts and define fit rules

**Files:** Create `src/features/support-tools/xray-fit/types.ts`, `catalog.ts`, and `fit.ts`.

- [ ] Inspect the existing database/product-spec readers for the X-ray category and identify which published product detail routes expose tunnel width/height and outer dimensions. Record each source route in the data used by the result.
- [ ] Define `ScannerFitFacts` with product ID/name/href, tunnel dimensions in millimeters, outer dimensions, optional conveyor speed, and source labels; missing facts remain `null`.
- [ ] Define `SiteFitInput` with largest object width/height/depth, entrance width/height, approach/path dimensions, placement area, required items/hour, and notes. Keep units in labels and normalize to millimeters internally.
- [ ] Implement `assessScannerFit(input, facts)` returning `fits | does-not-fit | needs-review`, exact dimension reasons, and missing inputs. Require clearance supplied by the visitor; do not assume tunnel dimensions equal usable aperture.
- [ ] Implement a separate `describeFlowRequirement` that preserves the visitor's peak rate as a requirement and never derives an items/hour prediction from conveyor speed.

### Task 2: Build the tool route and measurement-first interface

**Files:** Create `src/app/(main)/support/tools/xray-fit/page.tsx` and `XraySiteFitTool.tsx`.

- [ ] Add Persian metadata, a task-specific heading, an explicit preliminary-result note, and a back link to `/support/tools`.
- [ ] Build labeled sections in user order: object dimensions, entrance/delivery path, machine placement area, and operating volume. Provide millimeter/centimeter input selection and normalize conversions.
- [ ] Render an object-to-tunnel-to-site dimension diagram in code with a text/table equivalent; all dimension labels include units and status words, not color alone.
- [ ] Present scanner candidates grouped by fit status, showing source links and exactly which known dimension passed/failed. If product data is unavailable, collect the site brief and offer consultation without showing fabricated candidates.
- [ ] Add edit/clear controls, useful inline errors, and an accessible result announcement.

### Task 3: Produce a consultant-ready handoff

**Files:** Modify only the new feature files.

- [ ] Add a printable site-precheck summary containing submitted dimensions, known/missing product facts, peak-rate requirement, and a statement that site survey and applicable standards remain to be verified.
- [ ] Provide print and contact actions. Keep all entered data local to the browser and do not transmit it automatically.
- [ ] Make the diagram adapt to narrow screens without forcing horizontal scrolling; provide all meaning in the text result. Keyboard use, focus, contrast, touch targets, and reduced motion must be handled.

### Task 4: Manual acceptance

- [ ] Check against at least one live Farabak-listed model with fully sourced tunnel and outside dimensions, then check a missing-data model; verify the latter returns “needs review.”
- [ ] Verify object smaller than opening, exact boundary, and larger object; entrance/path too small; unit conversion; invalid values; missing inputs; and required flow display without throughput prediction.
- [ ] Inspect at 320, 390, 768, 1024, and 1440 px, keyboard-only, and print preview. Confirm source links resolve and no compliance/throughput promise appears.
- [ ] Report which live product facts were available and all unverified data gaps.
