# Blackmagic Record-Time Planner Design

## Goal and audience

Help camera operators, producers, and rental/buying teams plan record duration and media needs for listed Blackmagic cameras. This converts capture settings into a shoot-day media plan rather than another model recommender.

## User path

At `/support/tools/blackmagic-record-time`, select a listed camera/model, resolution or format, frame rate, codec/compression, and number/capacity of media cards. Choose shoot duration and optional safety margin. Results show approximate minutes per card, total required media, estimated data rate, and whether the chosen capacity covers the shoot. Link the result to verified compatible product pages or catalog categories; present unknown compatibility as unknown.

## Design direction

Audience: video crew preparing a shoot. Job: answer “will this recording mode fit on my media, and how much should I bring?” Signature: a continuous shoot timeline divided by the selected media capacity, so record time is read spatially, with exact values beside it. Prefer settings and timeline in the first viewport, details below. Shared Farabak shell, IRANYekan, navy/blue and precise alignment; no fake camera dashboard, glossy gradients, or unnecessary images.

## Calculation and trust

Use official Blackmagic data rates for the exact model/format where available. Convert MB/s × seconds to decimal GB, then divide media capacity by data rate to get time. Distinguish constant-bitrate values from variable/scene-dependent values; show official source and “approximate” where needed. Capture model+format gaps as unavailable, not as a guessed rate. Required media speed must be a verified sustained-write threshold or be labeled as the minimum estimated data rate; never declare a card compatible solely from capacity.

## Data and boundaries

Maintain a typed, source-attributed local data table for product models present in Farabak’s live catalog. Every fact stores official source URL, checked date, and exact applicable format. No cloud data or persistence necessary. The tool does not evaluate lens/ATEM/DaVinci Resolve compatibility in the initial release.

## Acceptance

- Listed model and capture settings produce approximate record duration per card and total media for a shoot.
- Unknown combinations are explained and do not yield fabricated values.
- Capacity, write-rate, scene-variability, and compatibility limitations remain distinct.
- Settings/results work in Persian RTL, on keyboard/touch, with reduced motion and print support.
