import { describe, expect, it } from "vitest";

import { getLegacyImageRedirect } from "./legacy-image-redirects";

const legacyImagePaths = [
  "/productImages/blackmagic-2110-ip-mini-bidirect-12g-sfp/blackmagic-2110-ip-mini-bidirect-12g-sfp-banner.jpg",
  "/productImages/blackmagic-cloud-dock-4/blackmagic-cloud-dock-4-banner.jpg",
  "/productImages/blackmagic-ursa-viewfinder/blackmagic-ursa-viewfinder-banner.jpg",
  "/productImages/cintel-audio-and-keykode-reader/cintel-audio-and-keykode-reader-banner.jpg",
  "/productImages/ctx-5800/ctx-5800.png",
  "/productImages/D500/D500-banner.webp",
  "/productImages/decklink-ip-100g/decklink-ip-100g-banner.jpg",
  "/productImages/Duo-PoE/Duo-PoE-banner.webp",
  "/productImages/E1/E1-banner.webp",
  "/productImages/fairlight-desktop-audio-editor/fairlight-desktop-audio-editor-banner.jpg",
  "/productImages/fairlight-desktop-console/fairlight-desktop-console-banner.jpg",
  "/productImages/fxr-3d/fxr-3d.png",
  "/productImages/hcvp/hcvp.png",
  "/productImages/hi-scan-100100t-2is/hi-scan-100100t-2is.png",
  "/productImages/hi-scan-100100t/hi-scan-100100t.png",
  "/productImages/hi-scan-100100v-2is/hi-scan-100100v-2is.png",
  "/productImages/hi-scan-100100v/hi-scan-100100v.png",
  "/productImages/hi-scan-10080-edx-2is/hi-scan-10080-edx-2is.png",
  "/productImages/hi-scan-10080-xct/hi-scan-10080-xct.png",
  "/productImages/hi-scan-145180-2is/hi-scan-145180-2is.png",
  "/productImages/hi-scan-6040-2is-hr/hi-scan-6040-2is-hr.png",
  "/productImages/hi-scan-6040-ctix/hi-scan-6040-ctix.png",
  "/productImages/hi-scan-6040atix/hi-scan-6040atix.png",
  "/productImages/hi-scan-6040c/hi-scan-6040c.png",
  "/productImages/hi-scan-7555-dv/hi-scan-7555-dv.png",
  "/productImages/hi-scan-7555si/hi-scan-7555si.png",
  "/productImages/junction-box/junction-box-banner.webp",
  "/productImages/KEEN-Ranger-PT/KEEN-Ranger-PT-banner.webp",
  "/productImages/Reolink-Solar-Panel/Reolink-Solar-Panel-banner.webp",
  "/productImages/rlc-410/rlc-410-banner.jpeg",
  "/productImages/RLC-811WA/RLC-811WA-banner.webp",
  "/productImages/speedstile2-epw/speedstile2-epw-banner.gif",
  "/productImages/teranex-express/teranex-express-banner.jpg",
  "/productImages/teranex-mini-ip-video-12g/teranex-mini-ip-video-12g-banner.jpg",
  "/productImages/teranex-mini-optical-to-hdmi-12g/teranex-mini-optical-to-hdmi-12g-banner.jpg",
  "/productImages/teranex-mini-sdi-distribution-12g/teranex-mini-sdi-distribution-12g-banner.jpg",
  "/productImages/ultimatte-12-hd/ultimatte-12-hd-banner.jpg",
];

describe("verified legacy product image redirects", () => {
  it.each(legacyImagePaths)("maps the exact path %s to the approved S3 host", (path) => {
    expect(getLegacyImageRedirect(path)).toBe(`https://s3.farabak.net${path}`);
  });

  it.each([
    "/productimages/ctx-5800/ctx-5800.png",
    "/productImages/ctx-5800/",
    "/productImages/unlisted-model/unlisted-model.png",
  ])("does not redirect an unlisted or differently cased path: %s", (path) => {
    expect(getLegacyImageRedirect(path)).toBeNull();
  });
});
