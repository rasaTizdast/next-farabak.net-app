export const dynamic = "force-dynamic"; // To ensure this page isn't statically generated

import { HelpCircle, MessageCircle } from "lucide-react";
import { Metadata } from "next";

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

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      {/* Hero section */}
      <section className="relative w-full overflow-hidden rounded-lg bg-gradient-to-br from-blue-600 via-blue-500 to-blue-400 py-6 shadow-lg md:rounded-xl md:py-10 lg:py-14">
        {/* Decorative elements - hidden on mobile for better performance */}
        <div className="absolute left-0 top-0 hidden h-full w-full overflow-hidden opacity-10 md:block">
          <div className="absolute left-10 top-10 h-20 w-20 rounded-full bg-white"></div>
          <div className="absolute bottom-10 right-10 h-32 w-32 rounded-full bg-white"></div>
          <div className="absolute right-1/4 top-1/3 h-16 w-16 rounded-full bg-white"></div>
        </div>

        <div className="relative mx-auto max-w-2xl px-4 text-center">
          <div className="mb-3 flex justify-center md:mb-4">
            <div className="rounded-full bg-white/20 p-2 shadow-md backdrop-blur-sm md:p-3">
              <HelpCircle className="h-5 w-5 text-white md:h-6 md:w-6" />
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
        <div className="my-6 rounded-lg border border-gray-100 bg-white p-3 shadow-md md:my-8 md:p-5 lg:my-12">
          <FaqAccordion faqs={faqs} />
        </div>

        {faqs.length > 0 && (
          <div className="px-4 text-center md:px-0">
            <div className="relative mx-auto w-full overflow-hidden rounded-lg border border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100 p-4 shadow-md md:max-w-2xl md:p-6">
              {/* Decorative element - hidden on mobile */}
              <div className="absolute right-0 top-0 -mr-8 -mt-8 hidden h-20 w-20 rounded-full bg-blue-100 opacity-40 md:block"></div>

              <div className="mb-2 flex justify-center md:mb-3">
                <div className="rounded-full bg-blue-100 p-2">
                  <MessageCircle className="h-4 w-4 text-blue-600 md:h-5 md:w-5" />
                </div>
              </div>

              <h3 className="relative mb-1 text-lg font-bold text-gray-900 md:mb-2 md:text-xl">
                سوالی که به آن پاسخ داده نشده است؟
              </h3>
              <p className="relative mx-auto mb-3 max-w-sm text-xs text-gray-700 md:mb-4 md:text-sm">
                تیم پشتیبانی ما آماده پاسخگویی به سوالات شما است.
              </p>
              <a
                href="/contact-us"
                className="inline-flex transform items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-lg md:px-5 md:py-2.5"
              >
                تماس با ما
              </a>
            </div>
          </div>
        )}
      </section>
    </>
  );
};

export default FaqPage;
