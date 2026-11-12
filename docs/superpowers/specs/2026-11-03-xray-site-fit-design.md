# X-ray Site-Fit Precheck Design

## Goal and audience

Give facility managers and integrators an early check of whether an X-ray scanner's tunnel and physical footprint suit the objects and site they have. The tool turns a vague inquiry into a useful, reviewable site brief; it does not specify certified equipment or guarantee throughput.

## User path

At `/support/tools/xray-fit`, visitors describe the largest object dimensions, peak flow as a range or known items/hour, entrance/installation path dimensions, installation footprint, and setting (parcel desk, checkpoint, industrial, other). The result separates hard dimensions supplied by the visitor from product facts and highlights “fits known opening,” “does not fit,” or “needs expert review.” It summarizes unanswered questions and gives a print-ready brief/consultation path.

## Design direction

Audience: facility and security project planners. Job: discover physical/site mismatches before requesting a quote. Signature: a dimensioned “object → tunnel → installation path” strip that makes the limiting width/height obvious. Use a compact intake at left/top and a large, legible fit drawing with a text equivalent. Apply shared Farabak shell, type, and colors; the drawing carries the visual identity. No fictional scanner render, risk meter, or generic questionnaire-card stack.

## Rules and trust

Compare only dimensions explicitly published for products and cite the product detail page beside each comparison. Object dimensions must be strictly less than the usable aperture after allowing visitor-entered clearance. Physical fit requires the full scanner dimensions plus user-entered handling clearance; product dimensions alone do not prove delivery-path fit. Throughput is a project variable: report the visitor's required rate and the model's documented belt speed/capacity only where verified; do not turn belt speed into people/items per hour. Every result is preliminary and calls out site survey, local standards, workload, and operator workflow as items for confirmation.

## Data and boundaries

Start with current Farabak-listed X-ray records and their published product specifications; do not introduce sample or unverified models. If a required dimension is absent, return “needs expert review” and collect the missing value. Keep rules and unit conversions in pure functions. No compliance decisions, exposure/radiation advice, or deployment-ready recommendation.

## Acceptance

- Inputs distinguish object, tunnel, route, and placement constraints.
- Results state fit/review reason and identify the exact dimension causing a mismatch.
- Missing product facts never become invented constraints; no throughput promise is calculated from belt speed alone.
- Print-ready site brief, expert handoff, keyboard/assistive access, and 320–1440 px RTL layouts work.
