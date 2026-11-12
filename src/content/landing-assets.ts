/**
 * Product-story media manifest for the landing page.
 */

export type LandingStoryKey = "xray" | "ceia" | "blackmagic" | "cctv" | "smd-led-wall";
type LandingAssetBase = {
  key: LandingStoryKey;
  subject: string;
  productModel: string | null;
  mediaStatus: "editorial-illustration";
  alt: string;
  caption: string;
  desktopAspectRatio: "3:2";
  mobileAspectRatio: "3:2";
  mobileCrop: "center" | "center-right" | "center-left";
  sourceNotes: readonly string[];
};

export type LandingAsset = LandingAssetBase & {
  desktopSrc: string;
  mobileSrc: string;
};

export const landingAssets = {
  xray: {
    key: "xray",
    subject: "Smiths Detection HI-SCAN 6040 DV",
    productModel: "Smiths Detection HI-SCAN 6040 DV",
    mediaStatus: "editorial-illustration",
    desktopSrc: "/landing/xray-product.webp",
    mobileSrc: "/landing/xray-product.webp",
    alt: "دستگاه بازرسی بار Smiths Detection HI-SCAN 6040 DV روی نقاله در محیط فرودگاه",
    caption: "تجهیزات بازرسی بار برای ورودی‌های پرتردد.",
    desktopAspectRatio: "3:2",
    mobileAspectRatio: "3:2",
    mobileCrop: "center",
    sourceNotes: [
      "One crop-safe WebP asset is used on desktop and mobile.",
      "Manufacturer reference for future technical fact checks: https://www.smithsdetection.com/products/hi-scan-6040/",
      "Image reference: https://www.smithsdetection.com/media/k2zlrpqc/6040-dv.png?format=webp&quality=90&rmode=max&width=1400",
    ],
  },
  ceia: {
    key: "ceia",
    subject: "CEIA OPENGATE",
    productModel: "CEIA OPENGATE",
    mediaStatus: "editorial-illustration",
    desktopSrc: "/landing/ceia-opengate-product.webp",
    mobileSrc: "/landing/ceia-opengate-product.webp",
    alt: "دو ستون گیت بازرسی CEIA OPENGATE در ورودی یک ساختمان عمومی",
    caption: "راهکارهای کنترل ورودی برای محیط‌های عمومی.",
    desktopAspectRatio: "3:2",
    mobileAspectRatio: "3:2",
    mobileCrop: "center-left",
    sourceNotes: ["Image reference: https://www.ceia.net/security/images/products/p75.jpg"],
  },
  blackmagic: {
    key: "blackmagic",
    subject: "Blackmagic PYXIS 12K",
    productModel: "Blackmagic PYXIS 12K",
    mediaStatus: "editorial-illustration",
    desktopSrc: "/landing/blackmagic-pyxis-product.webp",
    mobileSrc: "/landing/blackmagic-pyxis-product.webp",
    alt: "دوربین سینمایی Blackmagic PYXIS 12K با لنز و تجهیزات نصب روی میز استودیو",
    caption: "دوربین‌های حرفه‌ای برای زنجیره تولید تصویر.",
    desktopAspectRatio: "3:2",
    mobileAspectRatio: "3:2",
    mobileCrop: "center-left",
    sourceNotes: [
      "Manufacturer reference: https://www.blackmagicdesign.com/products/blackmagicpyxis",
      "Image reference: https://images.blackmagicdesign.com/images/products/blackmagicpyxis/landing/hero/hero-xl.jpg?_v=1743026412",
    ],
  },
  cctv: {
    key: "cctv",
    subject: "Reolink RLC-823A",
    productModel: "Reolink RLC-823A",
    mediaStatus: "editorial-illustration",
    desktopSrc: "/landing/reolink-rlc-823a-product.webp",
    mobileSrc: "/landing/reolink-rlc-823a-product.webp",
    alt: "دوربین چرخشی Reolink RLC-823A نصب‌شده زیر پیش‌آمدگی ورودی ساختمان",
    caption: "راهکارهای نظارت تصویری برای پوشش دقیق فضا.",
    desktopAspectRatio: "3:2",
    mobileAspectRatio: "3:2",
    mobileCrop: "center-right",
    sourceNotes: [
      "Image reference: https://home-cdn.reolink.us/wp-content/uploads/2025/07/230858561753261136.045.jpg",
    ],
  },
  "smd-led-wall": {
    key: "smd-led-wall",
    subject: "دیوار LED ماژولار",
    productModel: "دیوار LED ماژولار",
    mediaStatus: "editorial-illustration",
    desktopSrc: "/landing/smd-led-wall-desktop.webp",
    mobileSrc: "/landing/smd-led-wall-mobile.webp",
    alt: "دیوار نمایشگر LED ماژولار در سالن همایش داخلی",
    caption: "دیوار LED ماژولار برای تجربه‌های تصویری در مقیاس بزرگ.",
    desktopAspectRatio: "3:2",
    mobileAspectRatio: "3:2",
    mobileCrop: "center-left",
    sourceNotes: [
      "Responsive desktop and mobile WebP files preserve image clarity across the landing layouts.",
    ],
  },
} satisfies Record<LandingStoryKey, LandingAsset>;

export const landingAssetReview = {
  reviewedOn: "2026-10-22",
  landingMediaFormat: "webp",
  landingAssetCount: 5,
} as const;
