const LEGACY_IMAGE_REDIRECTS: Readonly<Record<string, string>> = {
  "/productImages/blackmagic-2110-ip-mini-bidirect-12g-sfp/blackmagic-2110-ip-mini-bidirect-12g-sfp-banner.jpg":
    "https://s3.farabak.net/productImages/blackmagic-2110-ip-mini-bidirect-12g-sfp/blackmagic-2110-ip-mini-bidirect-12g-sfp-banner.jpg",
  "/productImages/blackmagic-cloud-dock-4/blackmagic-cloud-dock-4-banner.jpg":
    "https://s3.farabak.net/productImages/blackmagic-cloud-dock-4/blackmagic-cloud-dock-4-banner.jpg",
  "/productImages/blackmagic-ursa-viewfinder/blackmagic-ursa-viewfinder-banner.jpg":
    "https://s3.farabak.net/productImages/blackmagic-ursa-viewfinder/blackmagic-ursa-viewfinder-banner.jpg",
  "/productImages/cintel-audio-and-keykode-reader/cintel-audio-and-keykode-reader-banner.jpg":
    "https://s3.farabak.net/productImages/cintel-audio-and-keykode-reader/cintel-audio-and-keykode-reader-banner.jpg",
  "/productImages/ctx-5800/ctx-5800.png":
    "https://s3.farabak.net/productImages/ctx-5800/ctx-5800.png",
  "/productImages/D500/D500-banner.webp":
    "https://s3.farabak.net/productImages/D500/D500-banner.webp",
  "/productImages/decklink-ip-100g/decklink-ip-100g-banner.jpg":
    "https://s3.farabak.net/productImages/decklink-ip-100g/decklink-ip-100g-banner.jpg",
  "/productImages/Duo-PoE/Duo-PoE-banner.webp":
    "https://s3.farabak.net/productImages/Duo-PoE/Duo-PoE-banner.webp",
  "/productImages/E1/E1-banner.webp": "https://s3.farabak.net/productImages/E1/E1-banner.webp",
  "/productImages/fairlight-desktop-audio-editor/fairlight-desktop-audio-editor-banner.jpg":
    "https://s3.farabak.net/productImages/fairlight-desktop-audio-editor/fairlight-desktop-audio-editor-banner.jpg",
  "/productImages/fairlight-desktop-console/fairlight-desktop-console-banner.jpg":
    "https://s3.farabak.net/productImages/fairlight-desktop-console/fairlight-desktop-console-banner.jpg",
  "/productImages/fxr-3d/fxr-3d.png": "https://s3.farabak.net/productImages/fxr-3d/fxr-3d.png",
  "/productImages/hcvp/hcvp.png": "https://s3.farabak.net/productImages/hcvp/hcvp.png",
  "/productImages/hi-scan-100100t-2is/hi-scan-100100t-2is.png":
    "https://s3.farabak.net/productImages/hi-scan-100100t-2is/hi-scan-100100t-2is.png",
  "/productImages/hi-scan-100100t/hi-scan-100100t.png":
    "https://s3.farabak.net/productImages/hi-scan-100100t/hi-scan-100100t.png",
  "/productImages/hi-scan-100100v-2is/hi-scan-100100v-2is.png":
    "https://s3.farabak.net/productImages/hi-scan-100100v-2is/hi-scan-100100v-2is.png",
  "/productImages/hi-scan-100100v/hi-scan-100100v.png":
    "https://s3.farabak.net/productImages/hi-scan-100100v/hi-scan-100100v.png",
  "/productImages/hi-scan-10080-edx-2is/hi-scan-10080-edx-2is.png":
    "https://s3.farabak.net/productImages/hi-scan-10080-edx-2is/hi-scan-10080-edx-2is.png",
  "/productImages/hi-scan-10080-xct/hi-scan-10080-xct.png":
    "https://s3.farabak.net/productImages/hi-scan-10080-xct/hi-scan-10080-xct.png",
  "/productImages/hi-scan-145180-2is/hi-scan-145180-2is.png":
    "https://s3.farabak.net/productImages/hi-scan-145180-2is/hi-scan-145180-2is.png",
  "/productImages/hi-scan-6040-2is-hr/hi-scan-6040-2is-hr.png":
    "https://s3.farabak.net/productImages/hi-scan-6040-2is-hr/hi-scan-6040-2is-hr.png",
  "/productImages/hi-scan-6040-ctix/hi-scan-6040-ctix.png":
    "https://s3.farabak.net/productImages/hi-scan-6040-ctix/hi-scan-6040-ctix.png",
  "/productImages/hi-scan-6040atix/hi-scan-6040atix.png":
    "https://s3.farabak.net/productImages/hi-scan-6040atix/hi-scan-6040atix.png",
  "/productImages/hi-scan-6040c/hi-scan-6040c.png":
    "https://s3.farabak.net/productImages/hi-scan-6040c/hi-scan-6040c.png",
  "/productImages/hi-scan-7555-dv/hi-scan-7555-dv.png":
    "https://s3.farabak.net/productImages/hi-scan-7555-dv/hi-scan-7555-dv.png",
  "/productImages/hi-scan-7555si/hi-scan-7555si.png":
    "https://s3.farabak.net/productImages/hi-scan-7555si/hi-scan-7555si.png",
  "/productImages/junction-box/junction-box-banner.webp":
    "https://s3.farabak.net/productImages/junction-box/junction-box-banner.webp",
  "/productImages/KEEN-Ranger-PT/KEEN-Ranger-PT-banner.webp":
    "https://s3.farabak.net/productImages/KEEN-Ranger-PT/KEEN-Ranger-PT-banner.webp",
  "/productImages/Reolink-Solar-Panel/Reolink-Solar-Panel-banner.webp":
    "https://s3.farabak.net/productImages/Reolink-Solar-Panel/Reolink-Solar-Panel-banner.webp",
  "/productImages/rlc-410/rlc-410-banner.jpeg":
    "https://s3.farabak.net/productImages/rlc-410/rlc-410-banner.jpeg",
  "/productImages/RLC-811WA/RLC-811WA-banner.webp":
    "https://s3.farabak.net/productImages/RLC-811WA/RLC-811WA-banner.webp",
  "/productImages/speedstile2-epw/speedstile2-epw-banner.gif":
    "https://s3.farabak.net/productImages/speedstile2-epw/speedstile2-epw-banner.gif",
  "/productImages/teranex-express/teranex-express-banner.jpg":
    "https://s3.farabak.net/productImages/teranex-express/teranex-express-banner.jpg",
  "/productImages/teranex-mini-ip-video-12g/teranex-mini-ip-video-12g-banner.jpg":
    "https://s3.farabak.net/productImages/teranex-mini-ip-video-12g/teranex-mini-ip-video-12g-banner.jpg",
  "/productImages/teranex-mini-optical-to-hdmi-12g/teranex-mini-optical-to-hdmi-12g-banner.jpg":
    "https://s3.farabak.net/productImages/teranex-mini-optical-to-hdmi-12g/teranex-mini-optical-to-hdmi-12g-banner.jpg",
  "/productImages/teranex-mini-sdi-distribution-12g/teranex-mini-sdi-distribution-12g-banner.jpg":
    "https://s3.farabak.net/productImages/teranex-mini-sdi-distribution-12g/teranex-mini-sdi-distribution-12g-banner.jpg",
  "/productImages/ultimatte-12-hd/ultimatte-12-hd-banner.jpg":
    "https://s3.farabak.net/productImages/ultimatte-12-hd/ultimatte-12-hd-banner.jpg",
};

export function getLegacyImageRedirect(pathname: string): string | null {
  return LEGACY_IMAGE_REDIRECTS[pathname] ?? null;
}
