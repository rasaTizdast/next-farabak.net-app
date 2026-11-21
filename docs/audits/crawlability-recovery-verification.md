# Crawlability recovery verification — 20 November 2026

## Result

The code and deployment changes addressed the reproducible catalog crawlability defects. The representative Reolink category and B400 product now return indexable HTML with a visible initial heading, content, and canonical URL to normal, Googlebot, OAI-SearchBot, and ChatGPT-User clients. Supported Markdown requests return the same public resource rather than a false 404. The contact page's stable introduction was also moved into initial HTML after its previous response exposed only a loading shell to simple extractors.

The code is on branch `codex/crawlability-recovery-2026-11-20`, with the contact fix at commit `5bc41835`. These are live HTTP and parsing checks, not proof that Google has already recrawled or reranked the site.

## Changes

- Fixed Accept negotiation and dynamic Markdown coverage for public catalog pages, with matching canonical and indexability behavior. Private and missing resources stay protected.
- Put essential product/category identity and specifications in visible initial HTML. Added brand to product structured data from the authoritative category. Improved shared currency retrieval deadline so listing content does not wait indefinitely on providers.
- Tightened sitemap eligibility to exclude QR/private and unavailable products, and prevented a silent reduced sitemap from looking healthy. QR changes now invalidate listing and sitemap caches immediately.
- Made the contact introduction visible outside its asynchronous data boundary.
- Kept the Liara **app in Germany**. Set `build.location` to `iran` because the Germany builder could not connect to the existing Liara database at build time. Build and app hosting locations are independent Liara settings.

## Verification

- Before code deployment, the corrected baseline passed **6/19** HTTP checks: [baseline](evidence/2026-11-20/recovery-before-corrected.json).
- The first final release passed **19/19** checks: [production results](evidence/2026-11-20/recovery-after-final-release.json). The additional contact check and final release result are recorded below.
- The final commit's local production build passed **20/20** checks, including initial contact HTML: [local results](evidence/2026-11-20/recovery-local-contact.json).
- International HTTPS probes covered homepage, robots, category, and B400 from Germany, Netherlands, United Kingdom, United States, Canada, Turkey, and Iran. **27/28** first attempts returned HTTP 200; the one Netherlands category TCP timeout returned HTTP 200 on immediate retry: [first round](evidence/2026-11-20/recovery-globalping.json), [retry](evidence/2026-11-20/recovery-globalping-retry.json). This does not indicate a country-wide block, but one intermittent connection failure occurred.
- Scoped tests, lint, formatting, and production build passed. The complete repository test command has separate existing file-upload failures under the local Node 24/Undici FormData environment; global formatting also reports pre-existing skill-file differences. Neither was used as a false green gate for this release.
- Final HTML from Next.js still omits `Accept` from `Vary`; it sends `Cache-Control: private, no-store`, which prevents an intermediary from caching the HTML representation. Markdown sends `Vary: Accept, Accept-Encoding`. The regression checker requires either correct Accept variation or the private/no-store policy.

## Search Console follow-up

Search Console's stored inspection is from **before** these releases: homepage and Reolink category were indexed, B400 was unknown to Google, and contact was discovered but not indexed. These states do not update immediately after a deployment. Use URL Inspection in the connected `https://farabak.net/` property to run a live test and request indexing for B400 and contact, then revisit their stored state and last-crawled date after Google recrawls. A request does not guarantee indexing or rankings.

ICMP `ping` timeouts are separate from the observed HTTPS availability. The site answers HTTP 200 from multiple countries, so a ping timeout alone is not evidence of a DNS or web-serving failure.

## Follow-up — 21 November 2026

### Repeated production and local verification

The production regression script passed **20/20** checks against https://farabak.net/ at 08:58 UTC, including visible initial HTML, canonical/indexability, Markdown, sitemap, redirects, missing URLs, and private-route protection. Full response evidence is in [the repeat run](evidence/2026-11-21/recovery-production-repeat.json).

A fresh frozen install first exposed a malformed tracked lockfile: commit a32f9d03 had added a second YAML document above the existing lock data. Restoring the prior single-document lockfile required no dependency changes. The frozen install then succeeded. Prisma client generation passed; the focused recovery suite passed **123 tests across 15 files**; changed-file ESLint and Prettier checks passed; and the production build completed, generating all 587 static pages.

The installed pnpm command reported version 10.26.2. Corepack could not interpret the package's devEngines package-manager array and attempted to invoke an unavailable 12.21.0 shim. The successful install, tests, lint, formatting and build used the repository's pnpm command. The lockfile repair is a task-owned follow-up change; it does not alter resolved application dependencies.

### Germany deployment target and current Liara access

Germany remains the requested application deployment target. The checked-in release config at commit 5bc41835 uses build.location iran; the current working copy has an uncommitted build.location germany value, which I preserved. Liara's documentation defines this setting as the location where the image build runs; it does not select the running app's region. The [official build-location guide](https://github.com/liara-cloud/docs/blob/master/src/pages/paas/details/build-location.mdx) describes the builder setting separately. The 20 November release record says the existing app runs in Germany and the Iran builder was chosen because the Germany builder could not connect to the database.

The installed Liara CLI could not identify an account containing farabak-next from the available account contexts. No deployment was started and no app was created. The runtime region and release ID have not been independently re-confirmed in Liara during this follow-up. Before another deploy, authenticate/select the account that owns the existing Germany app and verify whether the Germany builder can reach the database; keep the app's runtime target in Germany.

### Search Console follow-up

Stored URL Inspection data for the connected https://farabak.net/ property was checked at 09:26 UTC. Google reports both the canonical B400 URL and canonical /contact-us URL as **Discovered — currently not indexed**. B400 is in the submitted sitemap and has a product-page referrer; contact is in the sitemap and has homepage and industrial-category referrers. These are stored results, not live URL tests. The captured data is in [the Search Console snapshot](evidence/2026-11-21/gsc-index-status.json).

The connected OpenSEO interface reads stored index status but cannot run Google's live test or submit a recrawl request. The available Search Console browser session is signed out, so no live test or indexing request was submitted. The remaining UI action is to sign into the verified https://farabak.net/ property, run live URL tests for B400 and /contact-us, request indexing for both if the live tests pass, and later recheck their stored status and last-crawled dates. No indexing or ranking improvement is claimed.
