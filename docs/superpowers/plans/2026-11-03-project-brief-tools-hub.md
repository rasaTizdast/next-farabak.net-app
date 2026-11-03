# Project Brief Builder and Tools Hub Implementation Plan

> **For agentic workers:** Own the shared `/support/tools` index and this feature route. Keep the four calculator implementations in their separately assigned routes; don't edit their code.

**Goal:** Create the discoverable `/support/tools` directory and a project brief builder at `/support/tools/project-brief`.

**Architecture:** The public hub is server-rendered content with five explicitly typed destinations. A client brief workspace holds form values in memory, builds a pure display summary, and prints it through the browser. A small link from `/support` makes the hub discoverable.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript strict mode, Tailwind CSS v4, existing support shell and form conventions.

**Spec:** `docs/superpowers/specs/2026-11-03-project-brief-tools-hub-design.md`

## Global Constraints

- Read relevant Next.js 16 docs under `node_modules/next/dist/docs/` before changing routes, metadata, or client boundaries.
- Keep project answers local to component state; do not call APIs, write localStorage, or auto-send.
- Use user-facing labels, conditional relevance, Persian RTL, keyboard access, visible focus, and reduced-motion behavior.
- Use exact tool paths: `/support/tools`, `/support/tools/cctv-storage`, `/support/tools/xray-fit`, `/support/tools/blackmagic-record-time`, `/support/tools/meeting-room`, `/support/tools/project-brief`.
- Follow `DESIGN.md`, and do not edit the other feature routes or pre-existing deleted lockfile.
- Do not add/run automated tests; complete the manual checks in Task 4.

---

### Task 1: Build the tools directory and support entry

**Files:** Create `src/app/(main)/support/tools/page.tsx`; modify `src/app/(main)/support/page.tsx`.

- [ ] Inspect the support page composition and shared header/footer, then add one clear link to the tool directory in the existing support navigation.
- [ ] Create a server-rendered `/support/tools` route with Persian metadata, breadcrumb/back link, one task-focused introduction, and five descriptive links with accurate one-sentence benefits.
- [ ] Use a varied editorial list arranged by visitor task (system sizing, screening fit, production media, meeting room, project brief). Avoid identical icon cards and do not claim measured savings or popularity.
- [ ] Ensure all named paths resolve in local app navigation; feature pages may still be under development in sibling worktrees, so the destination slugs are fixed in this spec.

### Task 2: Define brief data and summary construction

**Files:** Create `src/features/support-tools/project-brief/types.ts` and `build-brief.ts`.

- [ ] Define `ProjectBriefInput` for contact name/company (optional), project category/type, site and operating setting, requirements, dimensions, volume/retention/workflow, connectivity/power, timeline, and freeform open questions.
- [ ] Use conditional fields for CCTV retention, X-ray object/flow, Blackmagic format/recording workflow, and conference-room room/viewing data; leave all model choices optional.
- [ ] Implement `buildProjectBrief(input)` as a deterministic pure formatter that omits blank optional answers, preserves units, labels open questions, and adds the preliminary-not-specification statement.
- [ ] Define validation by field type and only require project category plus a short description of the need; do not force sensitive personal data.

### Task 3: Build the guided form and live printable preview

**Files:** Create `src/app/(main)/support/tools/project-brief/page.tsx` and `ProjectBriefBuilder.tsx`.

- [ ] Add metadata, back link to `/support/tools`, concise explanation of local-only data behavior, and initial project-type choice.
- [ ] Render only relevant question groups after category selection. Keep labels, examples, units, optional status, and validation beside fields.
- [ ] Render a live typeset brief preview with a “Jump to preview” action; on mobile place the preview after the questions rather than in a cramped side panel.
- [ ] Add “Print / save as PDF,” “Start over,” and a contact link. Print output includes the full brief and caveat; contact copy says the brief is not automatically attached or sent.
- [ ] Verify no storage, cookie, API, email, or analytics code receives field values. Make all controls keyboard-operable, progress understandable, contrast sufficient, and motion optional/reduced.

### Task 4: Manual acceptance

- [ ] Open `/support`, `/support/tools`, and each of the five expected paths; confirm support entry and directory labels are correct.
- [ ] Produce one completed brief for each project type, verify irrelevant fields are absent, blank optional values omitted, units retained, and wording stays preliminary.
- [ ] Check print preview, start over, contact handoff, no network/state persistence of answers, 320/390/768/1024/1440 px, keyboard-only, and reduced motion.
- [ ] Report actual route status and any missing sibling-route integrations for the coordinating chat to resolve after development.
