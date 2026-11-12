# Project Brief Builder and Tools Hub Design

## Goal and audience

Give organizations and contractors one simple way to prepare a useful project brief for Farabak, and give all five interactive tools a discoverable home at `/support/tools`. The other four tools each own their distinct calculator route; this feature owns the hub route and support-page link.

## User path

From `/support` or a direct visit to `/support/tools`, visitors scan a compact directory describing each task in user language and choose a tool. The project brief route `/support/tools/project-brief` then asks category and project type first, followed by relevant fields: site/environment, target area/assets, expected flow or object sizes, retention/workflow, dimensions, power/connectivity, timeline, and open questions. A preview becomes a shareable, print-to-PDF brief and offers a contact handoff. Do not auto-send entered information.

## Design direction

Audience: a project owner who needs to describe a requirement before knowing model numbers. Job: produce a concise consultant-ready brief. Signature: a live, typeset brief preview that fills as the visitor answers; on mobile it follows the form after each section and is available through a plain “Preview brief” jump link. The `/support/tools` directory uses a restrained editorial index organized by the task each tool solves, with varied descriptions and direct links rather than a grid of identical icon cards. Shared Farabak shell/IRANYekan/navy/blue; avoid decorative AI imagery, fake usage stats, or sales copy.

## Data, privacy, and boundary

All fields stay in local component state; no persistence, cookies, analytics payloads, or network submission. Export uses the browser print dialog with a clean summary. “Contact Farabak” links to the existing contact page and tells the visitor to attach or paste the brief; it must not imply automatic transfer. Project answers are discovery prompts, not compliance checks or approved specifications. Category links and the directory's four additional destinations must use the exact slugs: `cctv-storage`, `xray-fit`, `blackmagic-record-time`, `meeting-room`.

## Acceptance

- `/support/tools` loads directly and is linked from `/support`; all five feature destinations are visible and named by the customer task.
- The project brief uses conditional sections only where they simplify the user's task; no irrelevant fields are required.
- Preview and print preserve all entered details, unanswered items, and a preliminary-not-specification note.
- No form data is transmitted or persisted; support/contact handoff wording is accurate.
- Persian RTL, keyboard, mobile, visible focus, accessible progress/preview, and reduced motion are covered.
