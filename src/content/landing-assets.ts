/**
 * Product-story media and evidence manifest.
 * Generated context images are conceptual only; none depicts actual Farabak,
 * manufacturer, or customer equipment or an installation.
 */

export type LandingStoryKey = "xray" | "ceia" | "blackmagic" | "cctv" | "smd-led-wall";
export type ProductLinkStatus = "catalogue-entry-verified" | "contact-until-offering-verified";

type LandingAssetBase = {
  key: LandingStoryKey;
  subject: string;
  productModel: string | null;
  productUrl: string;
  productLink: {
    status: ProductLinkStatus;
    checkedOn: "2026-10-20";
    evidence: string;
  };
  alt: string;
  desktopAspectRatio: "16:9";
  mobileAspectRatio: "4:5";
  mobileCrop: "center" | "center-right" | "center-left";
  sourceNotes: string[];
  requiredOwnerEvidence: string[];
  fallback: string;
};

export type LandingAsset = LandingAssetBase &
  (
    | {
        mediaStatus: "generated-conceptual";
        publicationStatus: "conceptual-only-not-real-product-or-installation-media";
        desktopSrc: string;
        mobileSrc: string;
        rights: "original-project-concept-no-real-product-rights-implication";
      }
    | {
        mediaStatus: "approved-real-media";
        publicationStatus: "approved-real-product-or-installation-media";
        desktopSrc: string;
        mobileSrc: string;
        rights: "owner-approved-real-media";
        approvalEvidence: string;
      }
    | {
        mediaStatus: "pending-media";
        publicationStatus: "not-publishable-pending-media";
        desktopSrc: null;
        mobileSrc: null;
        rights: "no-publication-rights-evidence";
      }
  );

export const landingAssets = {
  xray: {
    key: "xray",
    subject:
      "Generated conceptual baggage-screening corridor with conveyor surfaces and trays; not a scanner product depiction",
    productModel: "Smiths Detection HI-SCAN 6040 DV",
    productUrl: "https://farabak.net/products/x-ray/airport-luggage/HI-SCAN-6040-DV",
    productLink: {
      status: "catalogue-entry-verified",
      checkedOn: "2026-10-20",
      evidence:
        "Farabak exact product page opened; HI-SCAN 6040 DV heading and image label visible.",
    },
    mediaStatus: "generated-conceptual",
    publicationStatus: "conceptual-only-not-real-product-or-installation-media",
    desktopSrc: "/landing/xray-desktop.webp",
    mobileSrc: "/landing/xray-mobile.webp",
    alt: "تصویر مفهومی از فضای بازرسی بار با سطوح نقاله و سینی؛ تصویر دستگاه واقعی نیست",
    desktopAspectRatio: "16:9",
    mobileAspectRatio: "4:5",
    mobileCrop: "center",
    sourceNotes: [
      "Original project-generated conceptual environment, created 2026-10-20; no scanner, logo, or branded product is depicted.",
      "Desktop and mobile files are optimized WebP crops generated for this project; planning previews remain excluded.",
      "Farabak product page: https://farabak.net/products/x-ray/airport-luggage/HI-SCAN-6040-DV",
      "Manufacturer reference for future technical fact checks: https://www.smithsdetection.com/products/hi-scan-6040/",
    ],
    rights: "original-project-concept-no-real-product-rights-implication",
    requiredOwnerEvidence: [
      "Written reuse approval for any exact HI-SCAN product photo used in addition to this conceptual environment.",
    ],
    fallback:
      "If conceptual media is not appropriate for the final page, use an approved product photo or a neutral CSS field.",
  },
  ceia: {
    key: "ceia",
    subject:
      "Generated conceptual public entrance threshold with a metallic architectural frame; not a CEIA detector or Farabak installation",
    productModel: null,
    productUrl: "https://farabak.net/contact-us",
    productLink: {
      status: "contact-until-offering-verified",
      checkedOn: "2026-10-20",
      evidence:
        "The spec's live Farabak catalogue search recorded no CEIA result; owner confirmation remains required.",
    },
    mediaStatus: "generated-conceptual",
    publicationStatus: "conceptual-only-not-real-product-or-installation-media",
    desktopSrc: "/landing/ceia-desktop.webp",
    mobileSrc: "/landing/ceia-mobile.webp",
    alt: "تصویر مفهومی از آستانه ورودی عمومی با قاب معماری فلزی؛ گیت واقعی یا محصول CEIA نیست",
    desktopAspectRatio: "16:9",
    mobileAspectRatio: "4:5",
    mobileCrop: "center-left",
    sourceNotes: [
      "Original project-generated conceptual environment, created 2026-10-20; the architectural frame is not a detector or product.",
      "The planning preview containing generic equipment-like forms is excluded and must not be published.",
      "CEIA OPENGATE and SMD600 Plus manufacturer references are not evidence of a Farabak offering.",
    ],
    rights: "original-project-concept-no-real-product-rights-implication",
    requiredOwnerEvidence: [
      "Written confirmation that Farabak currently offers the named CEIA solution.",
      "Reuse approval for an exact offered gate photo, if used.",
    ],
    fallback:
      "Keep the chapter contact-led; do not name or depict a CEIA model until offering and image are approved.",
  },
  blackmagic: {
    key: "blackmagic",
    subject:
      "Generated conceptual film-production studio and worktable; no camera or fictional screen interface depicted",
    productModel: "Blackmagic PYXIS 12K",
    productUrl: "https://farabak.net/products/blackmagic/professional-camera/blackmagic-pyxis-12k",
    productLink: {
      status: "catalogue-entry-verified",
      checkedOn: "2026-10-20",
      evidence:
        "Independent live scout verified the exact Farabak PYXIS 12K listing and URL on 2026-10-20.",
    },
    mediaStatus: "generated-conceptual",
    publicationStatus: "conceptual-only-not-real-product-or-installation-media",
    desktopSrc: "/landing/blackmagic-desktop.webp",
    mobileSrc: "/landing/blackmagic-mobile.webp",
    alt: "تصویر مفهومی از فضای استودیوی تولید فیلم و میز کار با نور گرم؛ دوربین واقعی نمایش داده نمی‌شود",
    desktopAspectRatio: "16:9",
    mobileAspectRatio: "4:5",
    mobileCrop: "center-left",
    sourceNotes: [
      "Original project-generated conceptual environment, created 2026-10-20; no camera, brand, or screen UI is depicted.",
      "Exact Farabak PYXIS 12K listing verified live by the independent scout on 2026-10-20; no further product facts inferred here.",
      "Manufacturer reference: https://www.blackmagicdesign.com/products/blackmagicpyxis",
    ],
    rights: "original-project-concept-no-real-product-rights-implication",
    requiredOwnerEvidence: [
      "Written reuse approval for an exact PYXIS 12K product photo, if one is used.",
    ],
    fallback:
      "Use only as clearly conceptual studio context; otherwise use an approved product photo or neutral CSS field.",
  },
  cctv: {
    key: "cctv",
    subject:
      "Generated conceptual contemporary exterior at blue hour; no camera or simulated surveillance feed depicted",
    productModel: "Reolink RLC-823A (provisional visual example)",
    productUrl: "https://farabak.net/products/reolink-cctv-camera/ip/RLC-823A",
    productLink: {
      status: "catalogue-entry-verified",
      checkedOn: "2026-10-20",
      evidence:
        "Farabak RLC-823A exact page opened; model heading and product image label visible.",
    },
    mediaStatus: "generated-conceptual",
    publicationStatus: "conceptual-only-not-real-product-or-installation-media",
    desktopSrc: "/landing/cctv-desktop.webp",
    mobileSrc: "/landing/cctv-mobile.webp",
    alt: "تصویر مفهومی از نمای بیرونی ساختمان در گرگ‌ومیش؛ دوربین و تصویر نظارتی نمایش داده نمی‌شود",
    desktopAspectRatio: "16:9",
    mobileAspectRatio: "4:5",
    mobileCrop: "center-right",
    sourceNotes: [
      "Original project-generated conceptual environment, created 2026-10-20; no camera, logo, or simulated feed is depicted.",
      "RLC-823A page opened 2026-10-20; keep the model provisional pending content-owner confirmation.",
      "Farabak listing and manufacturer product images were not copied; reuse permission is not documented.",
    ],
    rights: "original-project-concept-no-real-product-rights-implication",
    requiredOwnerEvidence: [
      "Confirm RLC-823A remains the intended current example and approve any exact product photo used.",
    ],
    fallback: "Use as conceptual architecture only; no fake video feed or camera depiction.",
  },
  "smd-led-wall": {
    key: "smd-led-wall",
    subject:
      "Generated conceptual unbranded modular LED display in a generic venue; not a Farabak project",
    productModel: null,
    productUrl: "https://farabak.net/contact-us",
    productLink: {
      status: "contact-until-offering-verified",
      checkedOn: "2026-10-20",
      evidence:
        "No specific SMD listing or project was verified in the spec; the contact page is the safe destination pending owner confirmation.",
    },
    mediaStatus: "generated-conceptual",
    publicationStatus: "conceptual-only-not-real-product-or-installation-media",
    desktopSrc: "/landing/smd-led-wall-desktop.webp",
    mobileSrc: "/landing/smd-led-wall-mobile.webp",
    alt: "تصویر مفهومی از نمایشگر LED ماژولار در سالن عمومی؛ محصول یا پروژه فرابک نیست",
    desktopAspectRatio: "16:9",
    mobileAspectRatio: "4:5",
    mobileCrop: "center-left",
    sourceNotes: [
      "Original project-generated conceptual environment, created 2026-10-20; generic unbranded display and venue only.",
      "No specific Farabak SMD product, installation, client, or project is represented or claimed.",
      "The planning preview is also conceptual and must never be described as a Farabak installation.",
    ],
    rights: "original-project-concept-no-real-product-rights-implication",
    requiredOwnerEvidence: [
      "Confirm the specific SMD LED wall solution Farabak offers.",
      "Approve rights and client/site attribution for any real project photo used.",
    ],
    fallback:
      "Keep the story contact-led; never identify this concept image as a Farabak installation.",
  },
} satisfies Record<LandingStoryKey, LandingAsset>;

export const landingAssetReview = {
  reviewedOn: "2026-10-20",
  exact3dModel: "out-of-scope: no exact SKU-matched commercial-use model verified",
  conceptualAssetCount: 10,
  planningPreviews:
    "docs/superpowers/concepts/2026-10-20-product-stories/README.md; composition references only, not publication assets",
} as const;
