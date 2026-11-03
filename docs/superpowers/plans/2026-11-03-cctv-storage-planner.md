# CCTV Storage Planner Implementation Plan

> **For agentic workers:** Implement this plan task-by-task. Keep changes confined to the feature route, its feature module, and any explicitly assigned integration point.

**Goal:** Build a Persian CCTV storage and bandwidth estimator at `/support/tools/cctv-storage`.

**Architecture:** A server-rendered route provides metadata and the public support shell. A focused client workspace owns editable camera groups and displays the result of pure calculation functions. Related product links are optional and may only use published catalog facts.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript strict mode, Tailwind CSS v4, existing public shell and IRANYekan font.

**Spec:** `docs/superpowers/specs/2026-11-03-cctv-storage-planner-design.md`

## Global Constraints

- Read the relevant Next.js 16 guide under `node_modules/next/dist/docs/` before editing route or client-component code.
- Keep all copy Persian, RTL, and in the user's vocabulary; isolate model codes as LTR.
- Use the Farabak palette and shell in `DESIGN.md`; avoid generic dashboard cards, gradients, decorative icons, and gratuitous motion.
- Keep every estimate visibly approximate and expose the assumptions behind it.
- Do not alter or stage the pre-existing deleted `pnpm-lock.yaml`.
- Do not add or run automated tests in this task; perform the manual checks in Task 4.

---

### Task 1: Define the estimator inputs and calculation boundary

**Files:** Create `src/features/support-tools/cctv-storage/calculation.ts` and `src/features/support-tools/cctv-storage/types.ts`.

- [ ] Define `CameraGroupInput` with stable `id`, `label`, `cameraCount`, `averageBitrateMbps`, `recordingHoursPerDay`, `retentionDays`, and optional `motionDutyCycle` (fraction 0–1).
- [ ] Define `CctvStorageResult` with per-group `storageGb`, `dailyGb`, and `bandwidthMbps`, plus totals and `assumptions` labels.
- [ ] Implement `calculateCctvStorage(groups, headroomPercent)` as a pure function. Use decimal SI units (1 GB = 1,000,000,000 bytes); record seconds per day as `hours × 3,600 × dutyCycle`; multiply by camera count and retention; add bandwidth per camera × camera count. Headroom affects planned capacity only, never the raw estimate.
- [ ] Reject non-finite, negative, zero camera count, invalid hours/days, duty cycles outside 0–1, and headroom outside 0–100 with field-specific errors returned from a separate validation function.
- [ ] Manually calculate one-camera and multi-group example values and compare exact raw totals to the formula before building the UI.

### Task 2: Build the route and usable calculator workspace

**Files:** Create `src/app/(main)/support/tools/cctv-storage/page.tsx` and `CctvStorageTool.tsx` beside it.

- [ ] Add Persian metadata, a direct headline naming storage planning, a concise estimate limitation, and a breadcrumb/link back to `/support/tools`.
- [ ] Create a first camera group with sensible blank/example placeholders (placeholders are not submitted values); provide labeled controls and explicit add/remove group actions.
- [ ] Render a capacity ledger: each group’s estimate, aggregate required storage, planned storage with headroom, daily data, and bandwidth. Use aligned numeric typography and unit labels; avoid generic summary cards.
- [ ] Add explicit controls for bitrate source: entered value or clearly marked rough preset. If a preset is used, record its label in the result; never derive a “manufacturer” bitrate from resolution alone.
- [ ] Implement empty, invalid, unknown, and large-number states with Persian field guidance; update results without a submit step and announce result changes accessibly without making the whole page live.

### Task 3: Add practical handoff and responsive design

**Files:** Modify only the created calculator files unless an existing product link helper is verified and necessary.

- [ ] Add a print action and print stylesheet that keeps inputs, assumptions, results, date, and disclaimer readable while removing navigation and action controls.
- [ ] Link to `/products` or a more specific category only when current catalog data can support the destination; otherwise show the existing consultation route.
- [ ] Use a distinctive surveillance-planning composition: grouped camera rows on the input side and one continuous capacity readout on the result side. At mobile widths, stack in task order and keep add/remove and print actions at comfortable touch size.
- [ ] Include visible focus, native form semantics, error text tied to fields, sufficient contrast, and reduced-motion-safe transitions (prefer no transition for changing values).

### Task 4: Manual acceptance

- [ ] Start the app using the repository's supported command if the runtime is available; inspect the route at 320, 390, 768, 1024, and 1440 px.
- [ ] Manually verify one camera at 8 Mbps, 24 hours/day, 30 days = 2,592 GB raw storage; two cameras under those settings = 5,184 GB. Verify half-day recording halves daily and total storage, and headroom changes planned but not raw storage.
- [ ] Verify keyboard-only edit/add/remove/print, invalid values, unknown bitrate guidance, empty state, print preview, RTL layout, no horizontal overflow, and direct navigation to `/support/tools`.
- [ ] Report changed files, manual checks performed, unverified product-data assumptions, and any worktree limitations in the chat.
