import { Metadata } from "next";

import FaqAccordion, { type FaqItem } from "@/components/FaqAccordion";
import { ActionLink } from "@/components/public/ActionLink";
import { PageIntro } from "@/components/public/PageIntro";
import { PublicShell } from "@/components/public/PublicShell";
import { getGeneralFaqs } from "@/lib/data/faqs";

export const metadata: Metadata = {
  title: "سوالات متداول درباره فرابک | FAQ",
  description:
    "پاسخ به سوالات رایج درباره خرید و استفاده از دوربین مداربسته ریولینک، محصولات بلک مجیک و گیت‌های امنیتی. راهنمایی‌های مفید برای حل مشکلات سریع در فرابک.",
  robots: {
    index: true,
    follow: true,
  },
};

const FaqPage = async () => {
  let faqs: FaqItem[] = [];
  let hasFetchError = false;

  try {
    const result = await getGeneralFaqs();
    faqs = result.faqs;
  } catch (error) {
    hasFetchError = true;
    console.error("Failed to fetch FAQs:", error);
  }

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.Q,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.A,
      },
    })),
  };

  return (
    <PublicShell className="pb-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <PageIntro
        eyebrow="مرکز پاسخ‌گویی"
        title="سوالات متداول"
        description="پاسخ‌های کوتاه و کاربردی به سوالاتی که هنگام انتخاب، نصب و استفاده از محصولات امنیتی بیشتر مطرح می‌شوند."
        actions={
          <ActionLink href="/contact-us" variant="secondary">
            سوال دیگری دارید؟
          </ActionLink>
        }
      />

      <section
        aria-labelledby="faq-list-heading"
        className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_18px_50px_rgba(15,23,42,0.06)] md:p-8"
      >
        <div className="mb-6 border-b border-slate-100 pb-5">
          <p className="text-sm font-semibold text-(--farabak-action-blue)">راهنمای سریع</p>
          <h2 id="faq-list-heading" className="mt-2 text-2xl font-bold text-(--farabak-ink-deep)">
            پاسخ را جست‌وجو کنید
          </h2>
        </div>

        {hasFetchError ? (
          <div
            role="alert"
            className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-amber-950"
          >
            دریافت سوالات متداول با مشکل روبه‌رو شد. لطفاً صفحه را دوباره بارگذاری کنید یا با
            پشتیبانی تماس بگیرید.
          </div>
        ) : (
          <FaqAccordion faqs={faqs} />
        )}
      </section>

      {faqs.length > 0 && !hasFetchError ? (
        <section className="mt-8 grid gap-4 rounded-2xl bg-(--farabak-surface-blue) p-6 md:grid-cols-[1fr_auto] md:items-center md:p-8">
          <div>
            <p className="text-sm font-semibold text-(--farabak-action-blue)">
              پاسخ موردنظر را پیدا نکردید؟
            </p>
            <h2 className="mt-2 text-2xl font-bold text-(--farabak-ink-deep)">
              با تیم پشتیبانی صحبت کنید
            </h2>
            <p className="mt-2 leading-8 text-(--farabak-ink-muted)">
              سوالتان را با جزئیات بفرستید تا کارشناسان فرابک راهنمایی دقیق‌تری ارائه کنند.
            </p>
          </div>
          <ActionLink href="/contact-us">تماس با ما</ActionLink>
        </section>
      ) : null}
    </PublicShell>
  );
};

export default FaqPage;
