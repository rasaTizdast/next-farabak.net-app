export const dynamic = "force-dynamic"; // To ensure this page isn't statically generated

import { cn } from "@/lib/utils";
import { HelpCircle, MessageCircle } from "lucide-react";
import { Metadata } from "next";
import Link from "next/link";

import FaqAccordion from "@/components/FaqAccordion";
import { fetchFaqs } from "@/lib/fetchFaqs";

export const metadata: Metadata = {
  title: "سوالات متداول درباره فرابک | FAQ",
  description:
    "پاسخ به سوالات رایج درباره خرید و استفاده از دوربین مداربسته ریولینک، محصولات بلک مجیک و گیت‌های امنیتی. راهنمایی‌های مفید برای حل مشکلات سریع در فرابک.",
  robots: {
    index: true,
    follow: true,
  },
};

export const revalidate = 60; // Revalidate every 1 minute

const FaqPage = async () => {
  const faqs = await fetchFaqs();

  // Prepare structured data for Schema.org
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

  const jsonLd = JSON.stringify(structuredData);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
      {/* Hero section */}
      <section
        className={cn(
          "from-primary via-secondary to-dark-blue relative w-full overflow-hidden rounded-lg bg-linear-to-br py-6 shadow-lg md:rounded-xl md:py-10 lg:py-14"
        )}
      >
        {/* Decorative elements - hidden on mobile for better performance */}
        <div className="absolute top-0 left-0 hidden size-full overflow-hidden opacity-10 md:block">
          <div className="absolute top-10 left-10 size-20 rounded-full bg-white"></div>
          <div className="absolute right-10 bottom-10 size-32 rounded-full bg-white"></div>
          <div className="absolute top-1/3 right-1/4 size-16 rounded-full bg-white"></div>
        </div>

        <div className={cn("relative mx-auto max-w-2xl px-4 text-center")}>
          <div className="mb-3 flex justify-center md:mb-4">
            <div className="rounded-full bg-white/20 p-2 shadow-md backdrop-blur-sm md:p-3">
              <HelpCircle className="size-5 text-white md:size-6" />
            </div>
          </div>
          <h1 className="mb-2 text-xl font-bold text-white drop-shadow-md md:mb-3 md:text-3xl lg:text-4xl">
            سوالات متداول
          </h1>
          <p className="mx-auto max-w-xl text-sm text-blue-50 md:text-base">
            پاسخ به سوالاتی که معمولاً از ما پرسیده می‌شود. اگر پاسخ سوال خود را پیدا نکردید،
            می‌توانید با ما تماس بگیرید.
          </p>
        </div>
      </section>

      {/* FAQ content section */}
      <section className="w-full">
        <div
          className={cn(
            "border-border bg-background my-6 rounded-lg border p-3 shadow-md md:my-8 md:p-5 lg:my-12"
          )}
        >
          <FaqAccordion faqs={faqs} />
        </div>

        {faqs.length > 0 && (
          <div className="px-4 text-center md:px-0">
            <div className="relative mx-auto w-full overflow-hidden rounded-lg border border-gray-200 bg-linear-to-br from-gray-50 to-gray-100 p-4 shadow-md md:max-w-2xl md:p-6">
              {/* Decorative element - hidden on mobile */}
              <div
                className={cn(
                  "absolute top-0 right-0 -mt-8 -mr-8 hidden size-20 rounded-full bg-gray-50 opacity-40 md:block"
                )}
              ></div>

              <div className="mb-2 flex justify-center md:mb-3">
                <div className="rounded-full bg-gray-100 p-2">
                  <HelpCircle className="size-5 text-white md:size-6" />
                </div>
              </div>

              <h3 className="relative mb-1 text-lg font-bold text-gray-900 md:mb-2 md:text-xl">
                سوالی که به آن پاسخ داده نشده است؟
              </h3>
              <p className="relative mx-auto mb-3 max-w-sm text-xs text-gray-700 md:mb-4 md:text-sm">
                تیم پشتیبانی ما آماده پاسخگویی به سوالات شما است.
              </p>
              <Link
                href="/contact-us"
                className={cn(
                  "bg-primary hover:bg-secondary inline-flex transform items-center rounded-lg px-4 py-2 text-sm font-medium text-white shadow-md transition-[transform,background-color,box-shadow] duration-300 hover:-translate-y-0.5 md:px-5 md:py-2.5"
                )}
              >
                تماس با ما
              </Link>
            </div>
          </div>
        )}
      </section>
    </>
  );
};

export default FaqPage;
