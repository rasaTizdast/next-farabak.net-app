# Homepage hero showcase

Scope: redesign the existing homepage hero and its field selector, preserving the page's other sections and shared navigation.

Design: an immersive equipment image on the left, Persian copy on the right, and five field controls across the shared reading grid. Use the existing IRANYekan font, navy `#061A30`, blue `#1265E8`, ice `#8DDFF0`, muted ink `#B9CEDD`, and white. The equipment's field of view is the signature; omit decorative statistics, autoplay, and new claims. Existing editorial images receive a visible AI illustration disclosure.

- [x] Inspect route, current live hero, content, imagery, header, footer, and local Next.js guidance.
- [x] Compose the server-rendered headline/actions into the interactive `RangeInstrument` showcase.
- [x] Give each field a generous labeled control and an image-independent selection state with a failed-image fallback.
- [x] Check selection, failure handling, focus, mobile layout, reduced motion, and static rendering.
- [x] Run focused tests, lint, TypeScript, and React Doctor; review desktop/mobile screenshots.

The local homepage footer initially encountered an unrelated database connectivity failure. A temporary preview route with the actual header and landing components allowed review to continue. The full homepage subsequently loaded successfully and was visually checked; the temporary route was removed.

Validation: 3 focused tests passed; targeted ESLint and project TypeScript passed. Browser checks covered 320, 390, 768, 1024, and 1440px without document overflow, all five field selections via keyboard, loaded images, matching story destinations, reduced motion, and no-JavaScript heading/CTA/anchor rendering.

React Doctor scanned the branch against origin/main (1,012 files) and reported existing repository issues. In touched files, its state-copy warning is not a defect for the immutable field catalog and explicit user selection; the formatter and StoryChapter complexity warnings concern unchanged code. No diagnostics were suppressed.
