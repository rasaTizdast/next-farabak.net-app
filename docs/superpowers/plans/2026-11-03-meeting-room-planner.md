# Meeting-Room Display Planner Implementation Plan

> **For agentic workers:** Implement this feature in its own route and feature module. Do not edit `/support/tools` index.

**Goal:** Create an interactive meeting-room display and projector preplanner at `/support/tools/meeting-room`.

**Architecture:** A server route supplies metadata and verified catalog links. A focused client component gathers room/viewing inputs, calls pure functions using a documented sizing method, and renders a responsive room-section diagram plus an AV readiness checklist.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript strict mode, Tailwind CSS v4, existing public support shell.

**Spec:** `docs/superpowers/specs/2026-11-03-meeting-room-planner-design.md`

## Global Constraints

- Read relevant Next.js 16 guidance from `node_modules/next/dist/docs/` before editing route/client code.
- Choose and cite one official display-sizing/throw-distance method before implementation; do not invent universal rules.
- Use verified current Farabak product facts only; avoid claiming guaranteed legibility or compatibility.
- Keep Persian RTL, semantic inputs, diagram text equivalent, visible focus, reduced motion, and the `DESIGN.md` visual direction.
- Do not edit the shared tools index or pre-existing deleted lockfile.
- Do not add/run automated tests; complete the manual checks in Task 4.

---

### Task 1: Establish the documented sizing method

**Files:** Create `src/features/support-tools/meeting-room/types.ts`, `sizing-method.ts`, and `calculate.ts`.

- [ ] Read official guidance relevant to viewing distance/content type and record source URL, exact scope, and assumptions in `sizing-method.ts` comments.
- [ ] Define `RoomInput` with room dimensions, nearest/furthest seat distance, seat count, use type, daylight control, display type, desired screen/image size, and optional verified projector throw ratio.
- [ ] Define `MeetingRoomResult` as a bounded size range, method/source label, assumptions, and reasons for `needs-review`; do not return unsupported precision.
- [ ] Implement pure unit conversion, validation, sizing, and projector throw calculation only when a verified ratio is present.
- [ ] Manually check at least two dimensions and one out-of-method input against the cited source; document the expected range.

### Task 2: Create route and room-section interaction

**Files:** Create `src/app/(main)/support/tools/meeting-room/page.tsx` and `MeetingRoomPlanner.tsx`.

- [ ] Add Persian metadata, a room-sizing headline, brief scope note, and navigation back to `/support/tools`.
- [ ] Build a progressive single-page form, grouping room/viewing inputs before use, lighting, and projector specifics; don't ask specialist AV details until relevant.
- [ ] Draw a responsive room section showing display size and nearest/furthest viewer positions, plus a text equivalent with all key distances.
- [ ] Show candidate range, calculation method, assumptions, out-of-range review state, and next-step checklist without displaying a fabricated catalog match.
- [ ] Use inline validation and update result calmly; no modal, sliders requiring precision, or motion that moves the diagram unexpectedly.

### Task 3: Catalog links and useful handoff

**Files:** Modify only the new feature files.

- [ ] Add links to verified display/projector/conference categories or products only where available facts fit. Use `/products` or consultation fallback if facts don't support a direct match.
- [ ] Add print styling for submitted room dimensions, sizing result/method, assumptions, checklist, and sources.
- [ ] Ensure controls and results remain usable at 320–1440 px, with keyboard access, clear focus, screen-reader names/status, non-color result labels, and reduced-motion support.

### Task 4: Manual acceptance

- [ ] Verify a small, medium, and larger room example using the cited sizing method and a room outside its scope.
- [ ] Check invalid/partial distances, content-use changes, projector mode without throw ratio, available/missing catalog facts, and source links.
- [ ] Inspect 320, 390, 768, 1024, and 1440 px, keyboard-only, print preview, RTL labels, and diagram text alternative.
- [ ] Report the chosen method, source, assumptions, and any scope gaps.
