/**
 * Product-story media and evidence manifest.
 * Generated product-context renders use manufacturer reference images for model
 * identity; they are not manufacturer photos or depictions of Farabak installs.
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
  caption: string;
  desktopAspectRatio: "3:2";
  mobileAspectRatio: "3:2";
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
        mediaStatus: "generated-product-render";
        publicationStatus: "generated-reference-render-not-official-product-photo-or-installation";
        desktopSrc: string;
        mobileSrc: string;
        rights: "generated-image-based-on-product-reference-no-product-photo-rights-claim";
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
      "AI-generated product-in-context illustration of Smiths Detection HI-SCAN 6040 DV, based on manufacturer product reference; not an official photo or Farabak installation",
    productModel: "Smiths Detection HI-SCAN 6040 DV",
    productUrl: "https://farabak.net/products/x-ray/airport-luggage/HI-SCAN-6040-DV",
    productLink: {
      status: "catalogue-entry-verified",
      checkedOn: "2026-10-20",
      evidence:
        "Farabak exact product page opened; HI-SCAN 6040 DV heading and image label visible.",
    },
    mediaStatus: "generated-product-render",
    publicationStatus: "generated-reference-render-not-official-product-photo-or-installation",
    desktopSrc: "/landing/xray-product.webp",
    mobileSrc: "/landing/xray-product.webp",
    alt: "دستگاه بازرسی بار Smiths Detection HI-SCAN 6040 DV روی نقاله در محیط فرودگاه",
    caption: "بازآفرینی هوش مصنوعی بر پایه مرجع محصول؛ عکس رسمی سازنده یا نصب فرابک نیست.",
    desktopAspectRatio: "3:2",
    mobileAspectRatio: "3:2",
    mobileCrop: "center",
    sourceNotes: [
      "AI-generated product-in-context render created 2026-10-22 using the official manufacturer product image as a visual reference; not a manufacturer photo or Farabak installation.",
      "One crop-safe WebP asset is used on desktop and mobile.",
      "Farabak product page: https://farabak.net/products/x-ray/airport-luggage/HI-SCAN-6040-DV",
      "Manufacturer reference for future technical fact checks: https://www.smithsdetection.com/products/hi-scan-6040/",
      "Image reference: https://www.smithsdetection.com/media/k2zlrpqc/6040-dv.png?format=webp&quality=90&rmode=max&width=1400",
    ],
    rights: "generated-image-based-on-product-reference-no-product-photo-rights-claim",
    requiredOwnerEvidence: ["Confirm generated product renders are acceptable for publication."],
    fallback:
      "If generated product renders are not appropriate, use an approved product photo or a neutral Tailwind field.",
  },
  ceia: {
    key: "ceia",
    subject:
      "AI-generated product-in-context illustration of CEIA OPENGATE, based on manufacturer product reference; visual example only, not a confirmed Farabak offering or installation",
    productModel: "CEIA OPENGATE (visual example only)",
    productUrl: "https://farabak.net/contact-us",
    productLink: {
      status: "contact-until-offering-verified",
      checkedOn: "2026-10-20",
      evidence:
        "The spec's live Farabak catalogue search recorded no CEIA result; owner confirmation remains required.",
    },
    mediaStatus: "generated-product-render",
    publicationStatus: "generated-reference-render-not-official-product-photo-or-installation",
    desktopSrc: "/landing/ceia-opengate-product.webp",
    mobileSrc: "/landing/ceia-opengate-product.webp",
    alt: "دو ستون گیت بازرسی CEIA OPENGATE در ورودی یک ساختمان عمومی",
    caption:
      "بازآفرینی هوش مصنوعی بر پایه مرجع CEIA؛ نمونه بصری است و عرضه این مدل توسط فرابک تأیید نشده.",
    desktopAspectRatio: "3:2",
    mobileAspectRatio: "3:2",
    mobileCrop: "center-left",
    sourceNotes: [
      "AI-generated product-in-context render created 2026-10-22 using the CEIA manufacturer product image as a visual reference; not a CEIA official photo or Farabak installation.",
      "The product model is a visual example only; current Farabak offering remains unverified and the chapter remains contact-led.",
      "Image reference: https://www.ceia.net/security/images/products/p75.jpg",
    ],
    rights: "generated-image-based-on-product-reference-no-product-photo-rights-claim",
    requiredOwnerEvidence: ["Confirm whether Farabak currently offers this CEIA solution."],
    fallback:
      "Keep the chapter contact-led; retain the visual-example disclosure until the offering is confirmed.",
  },
  blackmagic: {
    key: "blackmagic",
    subject:
      "AI-generated product-in-context illustration of Blackmagic PYXIS 12K, based on manufacturer product reference; not an official photo or Farabak installation",
    productModel: "Blackmagic PYXIS 12K",
    productUrl: "https://farabak.net/products/blackmagic/professional-camera/blackmagic-pyxis-12k",
    productLink: {
      status: "catalogue-entry-verified",
      checkedOn: "2026-10-20",
      evidence:
        "Independent live scout verified the exact Farabak PYXIS 12K listing and URL on 2026-10-20.",
    },
    mediaStatus: "generated-product-render",
    publicationStatus: "generated-reference-render-not-official-product-photo-or-installation",
    desktopSrc: "/landing/blackmagic-pyxis-product.webp",
    mobileSrc: "/landing/blackmagic-pyxis-product.webp",
    alt: "دوربین سینمایی Blackmagic PYXIS 12K با لنز و تجهیزات نصب روی میز استودیو",
    caption: "بازآفرینی هوش مصنوعی بر پایه مرجع محصول؛ عکس رسمی سازنده یا نصب فرابک نیست.",
    desktopAspectRatio: "3:2",
    mobileAspectRatio: "3:2",
    mobileCrop: "center-left",
    sourceNotes: [
      "AI-generated product-in-context render created 2026-10-22 using the official manufacturer product image as a visual reference; not a manufacturer photo or Farabak installation.",
      "Exact Farabak PYXIS 12K listing verified live by the independent scout on 2026-10-20.",
      "Manufacturer reference: https://www.blackmagicdesign.com/products/blackmagicpyxis",
      "Image reference: https://images.blackmagicdesign.com/images/products/blackmagicpyxis/landing/hero/hero-xl.jpg?_v=1743026412",
    ],
    rights: "generated-image-based-on-product-reference-no-product-photo-rights-claim",
    requiredOwnerEvidence: ["Confirm generated product renders are acceptable for publication."],
    fallback:
      "If generated product renders are not appropriate, use an approved product photo or neutral Tailwind field.",
  },
  cctv: {
    key: "cctv",
    subject:
      "AI-generated product-in-context illustration of Reolink RLC-823A, based on manufacturer product reference; provisional visual example, not an official photo or installation",
    productModel: "Reolink RLC-823A (provisional visual example)",
    productUrl: "https://farabak.net/products/reolink-cctv-camera/ip/RLC-823A",
    productLink: {
      status: "catalogue-entry-verified",
      checkedOn: "2026-10-20",
      evidence:
        "Farabak RLC-823A exact page opened; model heading and product image label visible.",
    },
    mediaStatus: "generated-product-render",
    publicationStatus: "generated-reference-render-not-official-product-photo-or-installation",
    desktopSrc: "/landing/reolink-rlc-823a-product.webp",
    mobileSrc: "/landing/reolink-rlc-823a-product.webp",
    alt: "دوربین چرخشی Reolink RLC-823A نصب‌شده زیر پیش‌آمدگی ورودی ساختمان",
    caption: "بازآفرینی هوش مصنوعی بر پایه مرجع محصول؛ عکس رسمی سازنده یا تصویر نصب واقعی نیست.",
    desktopAspectRatio: "3:2",
    mobileAspectRatio: "3:2",
    mobileCrop: "center-right",
    sourceNotes: [
      "AI-generated product-in-context render created 2026-10-22 using the official Reolink product image as a visual reference; not a manufacturer photo or Farabak installation.",
      "RLC-823A page opened 2026-10-20; keep the model provisional pending content-owner confirmation.",
      "Image reference: https://home-cdn.reolink.us/wp-content/uploads/2025/07/230858561753261136.045.jpg",
    ],
    rights: "generated-image-based-on-product-reference-no-product-photo-rights-claim",
    requiredOwnerEvidence: ["Confirm RLC-823A remains the intended current example."],
    fallback: "Use only with its generated-render disclosure; no fake video feed.",
  },
  "smd-led-wall": {
    key: "smd-led-wall",
    subject:
      "AI-generated indoor LED-wall illustration based on Unilumin Uslim III product reference; visual example only, not a confirmed Farabak offering or installation",
    productModel: "Unilumin Uslim III (visual example only)",
    productUrl: "https://farabak.net/contact-us",
    productLink: {
      status: "contact-until-offering-verified",
      checkedOn: "2026-10-20",
      evidence:
        "No specific SMD listing or project was verified in the spec; the contact page is the safe destination pending owner confirmation.",
    },
    mediaStatus: "generated-product-render",
    publicationStatus: "generated-reference-render-not-official-product-photo-or-installation",
    desktopSrc: "/landing/unilumin-uslim-iii-product.webp",
    mobileSrc: "/landing/unilumin-uslim-iii-product.webp",
    alt: "دیوار نمایشگر LED ماژولار در سالن همایش داخلی",
    caption:
      "بازآفرینی هوش مصنوعی بر پایه مرجع Unilumin؛ نمونه بصری است و عرضه این مدل توسط فرابک تأیید نشده.",
    desktopAspectRatio: "3:2",
    mobileAspectRatio: "3:2",
    mobileCrop: "center-left",
    sourceNotes: [
      "AI-generated indoor LED-wall render created 2026-10-22 using the Unilumin Uslim III manufacturer product image as a visual reference; not a manufacturer photo or Farabak installation.",
      "The model is a visual example only; no specific Farabak SMD product, installation, client, or project is represented or claimed.",
      "Image reference: https://unilumin.com/wp-content/uploads/tmp/webp/products/f31d3826defac7e5be2a6d62cc2a704c.webp",
    ],
    rights: "generated-image-based-on-product-reference-no-product-photo-rights-claim",
    requiredOwnerEvidence: ["Confirm the specific SMD LED wall solution Farabak offers."],
    fallback:
      "Keep the story contact-led and retain the visual-example disclosure until the offering is confirmed.",
  },
} satisfies Record<LandingStoryKey, LandingAsset>;

export const landingAssetReview = {
  reviewedOn: "2026-10-22",
  exact3dModel: "out-of-scope: no exact SKU-matched commercial-use model verified",
  conceptualAssetCount: 0,
  generatedProductRenderCount: 5,
  planningPreviews:
    "docs/superpowers/concepts/2026-10-20-product-stories/README.md; composition references only, not publication assets",
} as const;
