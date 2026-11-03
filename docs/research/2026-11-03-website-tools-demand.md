# Website tool opportunities for Farabak

**Date:** 2026-11-03  
**Purpose:** Identify five useful, task-solving web tools across Farabak's equipment categories. This is a market and capability scan for prioritization, not an implementation specification.

## Scope and evidence limits

Farabak's current `/product-finder` is already a multi-step category recommender that ranks listed products against answers and offers a report and decision board. The ideas below focus on calculations, planning, and compatibility questions that help a visitor complete a concrete task. The code currently exposes finder categories for Reolink CCTV, industrial CCTV, Blackmagic, X-ray, HPC, conference rooms, imaging cameras, and other products.

Public sources establish that these are real equipment-planning tasks and that manufacturers invest in tools for them. They do **not** establish which tools Farabak visitors request most often. That ranking would require Farabak's own search, contact, and customer-support data; no analytics or request corpus was available for this scan. Treat “best” below as a shortlist based on buyer usefulness, category fit, and feasibility—not measured search popularity.

## Recommended shortlist

### 1. CCTV storage and network planner

Let a visitor add camera groups and specify resolution, frame rate, recording hours, retention days, and recording mode. Estimate total storage and camera-group bandwidth, then show a clear assumptions/range note and a shortlist of matching NVR/NAS/HDD capacities. An optional simple floor-plan coverage sketch can capture camera count and critical zones; avoid claiming verified identification coverage without lens, distance, and scene analysis.

**Why it fits:** Surveillance storage changes with camera count, frame size/quality, compression, FPS, retention, hours, and motion recording. Seagate's official calculator exposes those inputs and reports storage and throughput. AXIS Site Designer goes further by estimating power, bandwidth, and storage and helping generate a bill of materials and project documentation. This is a direct utility beyond asking which category/model a visitor wants.

**Sources:** [Seagate Surveillance Storage Calculator](https://www.seagate.com/video-storage-calculator/); [AXIS Site Designer manual](https://help.axis.com/en-us/axis-site-designer); [Axis camera layout and angle-of-view design tools](https://www.axis.com/en-ae/support/canon-system-design-tools).

**Effort:** Medium. Storage math is straightforward; trustworthy bandwidth/coverage estimates need documented assumptions and reliable product facts.

### 2. X-ray checkpoint space and throughput precheck

A project visitor enters the largest bag/parcel dimensions, approximate peak items per hour, available doorway and installation footprint, queue/approach space, and use setting. Return a preliminary “likely fit / needs review” checklist against listed scanner aperture, physical dimensions, conveyor speed, and project constraints, then package missing details for a technical consultation. Do not promise throughput from belt speed alone; operator workflow and lane design affect real throughput.

**Why it fits:** Official scanner specifications make physical fit a real early decision: the Smiths Detection HI-SCAN 6040 DV lists a 620 × 420 mm tunnel, 0.2/0.24 m/s belt speed, and 2340 × 1314 mm footprint. Its checkpoint brochure explicitly says equipment selection should consider regulations, current and predicted passenger traffic, operational efficiency, and passenger experience. A precheck helps avoid comparing scanners that cannot handle the objects or site.

**Sources:** [Smiths Detection HI-SCAN 6040 DV specifications](https://www.smithsdetection.com/products/hi-scan-6040/); [Smiths Detection checkpoint solutions brochure](https://www.smithsdetection.com/media/iikgytxt/checkpoint_solutions_brochure-05_2024.pdf); [Rapiscan 620XR ve specifications and compact-installation use](https://www.rapiscansystems.com/en/products/620xr-ve).

**Effort:** Medium. Start with a rule-based fit checklist and consultation handoff; the output must be labeled preliminary.

### 3. Blackmagic recording-time and media-speed calculator

Select camera/model, codec, resolution, frame rate, record hours, and card/SSD capacity. Show approximate record time, required sustained write speed, and storage needed for a shoot day, with alternative codec choices. Extend later to an end-to-end workflow compatibility checklist for camera → media → ATEM/capture → DaVinci Resolve.

**Why it fits:** The value is answering “will this media hold the shoot and keep up with this recording mode?” Blackmagic's technical specifications publish storage rates for different codecs/resolutions/frame rates, and its manuals give record-duration guidance while cautioning that actual rates vary by scene complexity and media. That gives the tool a documented data basis and makes it more useful than another camera selector.

**Sources:** [Blackmagic camera technical specifications](https://www.blackmagicdesign.com/developer/products/camera/techspecs); [Blackmagic Studio Camera manual: recording duration and codec settings](https://documents.blackmagicdesign.com/UserManuals/BlackmagicStudioCameraManual4k.pdf?_v=1687158010000); [Blackmagic Design support and compatibility resources](https://www.blackmagicdesign.com/support).

**Effort:** Low to medium if limited to models with verified facts in Farabak's catalog; quality presets need clear uncertainty ranges.

### 4. Meeting-room screen and projection planner

Enter room dimensions, seating count, table/screen wall, viewing distance, ambient light, and desired use (presentation, hybrid meeting, training). Estimate a practical display size or projector image/throw range and flag room constraints; then show relevant display/conference products and an installation brief. Start with screen distance and room scale, not a broad auto-designed AV system.

**Why it fits:** Projector placement depends on room configuration and image size. Epson provides an official throw-distance calculator and installation guidance; Cisco's room-preparation guides discuss recommended room sizes, layouts, and display recommendations. The inputs map naturally to a visitor's actual room problem.

**Sources:** [Epson projector throw distance guide and calculator](https://epson.com/projector-guide-how-to-buy-a-projector-throw-distance-and-positioning); [Cisco Room Kit EQX room preparation guidelines](https://www.cisco.com/c/dam/en/us/td/docs/telepresence/endpoint/room-series/installation-guide/room-kit-eqx-room-preparation-guidelines.pdf).

**Effort:** Low for projector sizing; medium if adding camera, microphone, and seating layout rules.

### 5. Project brief and specification pack builder

A contractor or company selects a project type and fills out a guided brief: location/environment, areas or assets to protect, object/traffic volumes, required retention, site dimensions, connectivity/power constraints, timeline, and known standards. Generate a shareable PDF or structured inquiry containing needs, unresolved questions, and suggested product categories for Farabak's team to review. Do not auto-claim regulatory compliance or turn unknown details into firm specifications.

**Why it fits:** Complex equipment purchases need a usable handoff from initial requirements to a quote or technical review. AXIS Site Designer describes automatic design documentation, shareable project details, quotes, and bills of materials; the AXIS Integrator Suite similarly emphasizes floor-plan coverage, quotes, BOMs, and installation reports. Farabak's finder already saves a product report and decision board, so this should center on collecting site/project requirements and producing a consultant-ready brief rather than duplicating product ranking.

**Sources:** [AXIS Site Designer manual](https://help.axis.com/en-us/axis-site-designer); [AXIS Integrator Suite](https://www.americas-comms.axis.com/IntegratorSuite); [Axis overview of project-design tools](https://newsroom.axis.com/en-gb/article/partners-tools-success).

**Effort:** Medium. Useful as a cross-category tool, but its scope should stay to structured intake and export until the team can maintain verified rules for each equipment category.

## Suggested first validation

Before development, compare these five against Farabak's most common pre-sale questions: search terms on the site, contact-form messages, sales/support chats, and queries heard by the team. Ask 5–10 recent buyers or sales staff to rank the tasks they struggled with and bring one real example (e.g., camera count and retention target, checkpoint opening dimensions, or video recording format). The highest-usage tool should then be prototyped against known products and edge cases.

## Source note

The cited manufacturer and vendor materials support the described calculations, product constraints, and tool patterns. They are examples of category planning practices, not independent evidence of Farabak visitor demand or proof of conversion lift.
