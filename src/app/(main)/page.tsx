import type { Metadata } from "next";

import TrustLanding from "@/app/_components/LandingPage/TrustLanding";
import Schema from "@/components/Schema";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://farabak.net";

export const metadata: Metadata = {
  title: "فرابک | تجهیزات امنیتی، نظارت تصویری و پشتیبانی",
  description:
    "فرابک، ثبت‌شده در سال ۱۳۸۱؛ بررسی تجهیزات نظارت تصویری و بازرسی امنیتی، پروژه‌های اجراشده و پیگیری گارانتی. برای خانه، کسب‌وکار و سازمان.",
  alternates: { canonical: baseUrl },
  openGraph: {
    title: "امنیت، با پشتوانهٔ فرابک.",
    description:
      "تجهیزات، تخصص و پشتیبانی؛ از انتخاب دوربین تا پروژه‌های حفاظت الکترونیک. با سابقه و نمونه‌کارهای فرابک آشنا شوید.",
    url: baseUrl,
    type: "website",
    siteName: "فرابک",
    locale: "fa_IR",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${baseUrl}/#organization`,
      name: "فرابک",
      alternateName: "Farabak",
      url: baseUrl,
      logo: { "@type": "ImageObject", url: `${baseUrl}/Farabak_Logo.webp` },
      description:
        "فرابک، ثبت‌شده در سال ۱۳۸۱؛ تجهیزات نظارت تصویری و بازرسی امنیتی، مشاوره و پشتیبانی.",
      knowsAbout: [
        "Surveillance systems",
        "Security cameras",
        "Access control",
        "Security inspection equipment",
      ],
      ...(process.env.NEXT_PUBLIC_SUPPORT_EMAIL
        ? { email: process.env.NEXT_PUBLIC_SUPPORT_EMAIL }
        : {}),
    },
    {
      "@type": "WebSite",
      "@id": `${baseUrl}/#website`,
      url: baseUrl,
      name: "فرابک",
      inLanguage: "fa-IR",
      publisher: { "@id": `${baseUrl}/#organization` },
    },
    {
      "@type": "WebPage",
      "@id": `${baseUrl}/#webpage`,
      url: baseUrl,
      name: "امنیت، با پشتوانهٔ فرابک.",
      inLanguage: "fa-IR",
      isPartOf: { "@id": `${baseUrl}/#website` },
      about: { "@id": `${baseUrl}/#organization` },
    },
  ],
};

export default function HomePage() {
  return (
    <>
      <Schema id="homepage-json-ld" data={jsonLd} />
      <TrustLanding />
    </>
  );
}
