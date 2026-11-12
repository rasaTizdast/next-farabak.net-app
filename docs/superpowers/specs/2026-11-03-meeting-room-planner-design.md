# Meeting-Room Display Planner Design

## Goal and audience

Help office, school, and event planners size a display or projector setup for a specific room before contacting Farabak. The tool turns room dimensions and viewing needs into a preliminary display plan.

## User path

At `/support/tools/meeting-room`, enter room width/length, furthest and nearest seat distance, number of seats, room use (slides/data, video, hybrid meeting), daylight control, and display type if already known. For projector mode, include throw distance or desired image size. The output shows a practical screen-size range based on documented guidance, a simple dimension sketch, and a checklist of AV questions such as camera coverage, connectivity, and room lighting. Provide relevant listed products only if their actual specifications map to the result.

## Design direction

Audience: an office/facility planner who knows the room, not AV engineering jargon. Job: size the display and expose room constraints. Signature: a room section diagram with furthest viewer, screen width, and viewing line; the diagram answers the question before reading the result. Choose a distinctive single diagram-led composition, not a floorplan editor in the first release. Shared Farabak colors/type and RTL shell; measured room geometry carries the visual identity.

## Calculation and trust

Use a named, source-backed sizing method with its relevant content assumptions and show the formula/method in plain language. If viewer distances or content type are outside the guidance range, return a qualitative “needs AV review,” not extrapolated certainty. Projector throw ratio is used only when the actual projector's throw ratio is verified. Never claim every seat can read a display from room size alone; viewing angle, text size, resolution, ambient light, and seating layout matter.

## Data and boundaries

Use verified current catalog facts and source references for candidate displays/projectors. If catalog facts or category availability are missing, give sizing guidance and a consultation link, not made-up inventory. Keep MVP to display-size planning and an AV handoff checklist; no full system design or room-rendering tool.

## Acceptance

- Visitor can identify a candidate screen size or see why expert review is needed.
- Result shows the method, room/viewing assumptions, and limits.
- The diagram scales from mobile to desktop and has an equivalent text summary.
- Persian RTL, keyboard, error handling, focus, and reduced motion are supported.
