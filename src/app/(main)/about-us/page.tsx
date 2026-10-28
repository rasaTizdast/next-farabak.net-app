import type { Metadata } from "next";

import { ActionLink } from "@/components/public/ActionLink";
import { PageIntro } from "@/components/public/PageIntro";
import { PublicShell } from "@/components/public/PublicShell";
import aboutUsData from "@/constants/aboutUs.json";

export const metadata: Metadata = {
  title: "درباره ما | تاریخچه و فعالیت‌های فرابک",
  description:
    "با فرابک آشنا شوید: شرکتی متخصص در واردات و توزیع تجهیزات امنیتی مانند دوربین‌های ریولینک، دستگاه‌های ایکس‌ری و محصولات بلک مجیک با گارانتی معتبر. بیش از ربع قرن تجربه در پروژه‌های نظارتی. برای همکاری تماس بگیرید.",
  robots: {
    index: true,
    follow: true,
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "AboutPage",
  name: "درباره ما",
  url: `${process.env.NEXT_PUBLIC_BASE_URL}/about-us`,
  description: "اطلاعات درباره شرکت فرابک، پروژه‌ها، اعضای هیئت مدیره و فعالیت‌های شرکت",
  isPartOf: {
    "@type": "WebSite",
    url: process.env.NEXT_PUBLIC_BASE_URL,
  },
  mainEntity: {
    "@type": "Organization",
    name: "فرابک",
    url: process.env.NEXT_PUBLIC_BASE_URL,
    sameAs: [
      `${process.env.NEXT_PUBLIC_BASE_URL}/about-us/projects`,
      `${process.env.NEXT_PUBLIC_BASE_URL}/about-us/members`,
      `${process.env.NEXT_PUBLIC_BASE_URL}/about-us/activity`,
    ],
  },
};

const AboutUs = () => {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <PublicShell as="main" className="py-10 sm:py-14 lg:py-16">
        <PageIntro
          eyebrow="آرشیو شرکت"
          title="فرابک را از روی کارنامه‌اش بشناسید"
          description="تاریخچه، اعضای هیئت‌مدیره و پروژه‌های منتشرشده را در یک آرشیو روشن و قابل بررسی دنبال کنید. هر صفحه فقط همان چیزی را نشان می‌دهد که برای آن سند یا داده داریم."
        />

        <section aria-labelledby="about-archive-title" className="pb-8 sm:pb-12">
          <div className="mb-6 sm:mb-8">
            <p className="mb-2 text-sm font-semibold tracking-[0.12em] text-(--farabak-action-blue)">
              مسیرهای بررسی
            </p>
            <h2
              id="about-archive-title"
              className="text-2xl font-bold text-(--farabak-ink-deep) sm:text-3xl"
            >
              سه نمای مستند از شرکت
            </h2>
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            {aboutUsData.map((item, index) => (
              <article
                key={item.id}
                className="flex min-h-72 flex-col justify-between rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_16px_36px_rgba(6,26,48,0.06)] transition-[border-color,box-shadow] duration-300 hover:border-(--farabak-action-blue)/40 hover:shadow-[0_20px_46px_rgba(6,26,48,0.1)] sm:p-8"
              >
                <div>
                  <p className="mb-8 text-sm font-bold tracking-[0.16em] text-(--farabak-action-blue)">
                    {String(index + 1).padStart(2, "0")}
                  </p>
                  <h3 className="text-xl leading-9 font-bold text-(--farabak-ink-deep)">
                    {item.title}
                  </h3>
                  <p className="mt-3 leading-8 text-(--farabak-ink-muted)">{item.desc}</p>
                </div>
                <ActionLink
                  href={`/about-us/${item.link}`}
                  variant="secondary"
                  className="mt-8 w-full"
                >
                  مشاهده آرشیو
                </ActionLink>
              </article>
            ))}
          </div>
        </section>
      </PublicShell>
    </>
  );
};

export default AboutUs;
