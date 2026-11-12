# Blackmagic Record-Time Planner Implementation Plan

> **For agentic workers:** Implement this feature in its route and feature module only. Do not edit `/support/tools` index.

**Goal:** Build a source-backed Blackmagic record-time and media-capacity tool at `/support/tools/blackmagic-record-time`.

**Architecture:** A small typed fact table covers only live Farabak-listed models and links every data point to official Blackmagic documentation. Pure conversion functions calculate time and storage. A client calculator presents settings and a visual recording timeline.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript strict mode, Tailwind CSS v4, existing public support shell.

**Spec:** `docs/superpowers/specs/2026-11-03-blackmagic-record-planner-design.md`

## Global Constraints

- Read the relevant Next.js 16 docs under `node_modules/next/dist/docs/` before code changes.
- Confirm model listings against Farabak’s current catalog and fact values against official Blackmagic sources.
- Never infer missing rates or card compatibility; distinguish estimated data rate from a manufacturer-guaranteed media speed.
- Preserve RTL, semantic labels, visible focus, reduced motion, and the visual language in `DESIGN.md`.
- Do not edit the shared tools index or pre-existing deleted lockfile.
- Do not add/run automated tests; complete the manual checks in Task 4.

---

### Task 1: Source and model the recording-rate facts

**Files:** Create `src/features/support-tools/blackmagic-record-time/types.ts`, `data.ts`, and `calculation.ts`.

- [ ] Inspect live Farabak Blackmagic product pages and note available model slugs; include only those exact models.
- [ ] For each supported model/settings tuple, record resolution, frame rate, codec, compression, data rate range/unit, source URL, and checked date. Keep source facts separate from display labels.
- [ ] Define `BlackmagicRateFact` and `RecordingPlanInput` types; model unsupported combinations as absent values rather than default estimates.
- [ ] Implement pure functions for `calculateRecordMinutes(capacityGb, rateMbPerSecond)`, `calculateShootCapacity(durationMinutes, rateMbPerSecond, safetyMarginPercent)`, and `calculateTotalDataRate` with decimal unit conversions and validation.
- [ ] Manually verify results against one official calculator example and one manual record-duration table; preserve any source-specific rounding and explain difference.

### Task 2: Build capture settings and timeline UX

**Files:** Create `src/app/(main)/support/tools/blackmagic-record-time/page.tsx` and `BlackmagicRecordTimeTool.tsx`.

- [ ] Add Persian route metadata, clear task heading, back link to `/support/tools`, and a short explanation that actual time may vary by scene and media.
- [ ] Populate model, format, frame rate, codec, compression, media capacity/card count, shoot length, and safety-margin controls from supported facts only.
- [ ] Build a continuous record timeline divided by the selected capacity and show exact minutes per card, total shoot time supported, total media required, and estimated data rate.
- [ ] Use native inputs/selects with associated labels, useful validation, a no-supported-combination state, and visible explanations for rate ranges and missing facts.
- [ ] Keep edits and results in the same reading flow; avoid app-like fake equipment dashboards and nonfunctional compatibility badges.

### Task 3: Verified product handoff and print layout

**Files:** Modify only the new feature files.

- [ ] Link a selected model to its verified Farabak product page if available; otherwise link to the Blackmagic category and keep compatibility unclaimed.
- [ ] Add a print-ready recording plan with settings, card count/capacity, estimated duration, safety margin, source citation, checked date, and caveat.
- [ ] Style the timeline for RTL and small screens; numbers/units remain readable and LTR-isolated where appropriate. Provide keyboard operation, visible focus, adequate contrast, and reduced-motion-safe updates.

### Task 4: Manual acceptance

- [ ] Verify one published model/rate row against the manufacturer source; calculate duration for 1 TB and 512 GB manually and compare displayed output.
- [ ] Check rate range, unsupported model/setting, zero/negative/invalid inputs, card count, safety margin, shoot longer than one card, and that no unsupported combination reports compatibility.
- [ ] Inspect 320, 390, 768, 1024, and 1440 px, keyboard-only, reduced motion, product link, and print preview.
- [ ] Report sources and dates for included model facts and any combinations left unsupported.
