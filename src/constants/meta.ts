import type { Metadata } from "next";

export const SITE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://farabak.net";
export const SITE_NAME = "فرابک";
export const DEFAULT_TITLE = "خرید محصولات نظارتی و امنیتی با گارانتی معتبر | فرابک";
export const DEFAULT_DESCRIPTION =
  "فرابک ارائه‌دهنده انواع محصولات نظارتی و امنیتی شامل دوربین مداربسته ریولینک با گارانتی معتبر، تضمین اصالت کالا و خدمات پس از فروش حرفه‌ای.";
export const OG_IMAGE_PATH = "/opengraph-image.webp";

export const defaultMetadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: DEFAULT_TITLE,
  description: DEFAULT_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    "دوربین مداربسته",
    "دوربین مداربسته ریولینک",
    "محصولات نظارتی",
    "محصولات امنیتی",
    "سیستم نظارت تصویری",
    "فرابک",
    "Reolink",
    "CCTV Iran",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "fa_IR",
    siteName: SITE_NAME,
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    url: SITE_URL,
    images: [
      {
        url: OG_IMAGE_PATH,
        width: 1200,
        height: 630,
        alt: `${SITE_NAME} | فروشگاه محصولات نظارتی و امنیتی`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    images: [OG_IMAGE_PATH],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};
