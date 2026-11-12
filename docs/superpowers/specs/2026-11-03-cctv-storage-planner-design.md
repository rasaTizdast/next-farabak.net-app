# CCTV Storage Planner Design

## Goal and audience

Help a home, business, or security integrator estimate video storage and aggregate recording bandwidth before choosing cameras, recorders, or storage. This solves a sizing task that the current `/product-finder` does not cover.

## User path

At `/support/tools/cctv-storage`, the visitor adds one or more camera groups, entering camera count, resolution or average bitrate, frame rate, codec when known, recording hours per day, retention days, and continuous or motion-triggered recording. The result updates immediately and explains the assumptions. It shows total estimated storage, daily data volume, and aggregate stream bandwidth, then links to relevant catalog categories only when published specifications support the link. A print-friendly summary and a consultation CTA finish the flow.

## Design direction

Audience: building owners and security installers planning a surveillance system. Job: answer “how much storage and network capacity should I plan for?” Signature: a capacity ledger whose camera groups accumulate into one clear storage bar and a separate bandwidth readout. Keep the entry form and result visible together on desktop, stacking results directly after inputs on mobile. Reuse the Farabak public shell, IRANYekan, RTL conventions, navy `#061A30`, action blue `#1265E8`, white/paper surfaces, and restrained cyan only for focus or one measurement accent. No generic card dashboard, gradients, fabricated product images, or animated count-up. Inputs are the visual structure.

## Calculation and trust

Use explicit formulas from entered bitrate and schedule: `GB = Mbps × 1,000,000 ÷ 8 × seconds_recorded ÷ 1,000,000,000`; aggregate stream bandwidth is the sum of entered average bitrates. If bitrate is inferred from resolution/codec, present it as a selectable assumption, not a manufacturer fact. Apply a visible capacity headroom setting with a documented default and show raw estimate and planned capacity separately. Motion recording must require an explicit duty-cycle assumption. Clearly say actual size varies with scene motion, codec settings, audio, and device behavior; estimates are not guarantees.

## Data, states, and boundaries

Keep calculations pure and independent of React. Use existing product/catalog APIs only for optional, verified related links. Never invent a drive, recorder, or SKU recommendation. Support no groups, invalid/zero values, unknown bitrate, very large totals, and browser print. No account or server persistence is required.

## Acceptance

- A visitor can add/remove multiple groups and understand which values are assumed versus supplied.
- Results recalculate correctly and show storage per group, total storage, daily data, and bandwidth.
- A visitor can print the estimate and reach a relevant category or consultation.
- Persian RTL layout works at 320, 390, 768, 1024, and 1440 px; keyboard-only use, labels/errors, visible focus, and reduced motion are handled.
- No calculated estimate is presented as guaranteed capacity or verified product compatibility.
