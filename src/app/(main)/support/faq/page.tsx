export const dynamic = "force-dynamic"; // To ensure this page isn't statically generated

import { Metadata } from "next";
import FaqAccordion from "@/components/FaqAccordion";
import { fetchFaqs } from "@/lib/fetchFaqs";
import { HelpCircle, MessageCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "سوالات متداول | فرابک",
  description: "پاسخ به پرسش‌های متداول درباره خدمات و محصولات فرابک",
  robots: {
    index: true,
    follow: true,
  },
};

export const revalidate = 60; // Revalidate every 1 minute

const FaqPage = async () => {
  const faqs = await fetchFaqs();

  return (
    <>
      {/* Hero section */}
      <section className="w-full bg-gradient-to-br from-blue-600 via-blue-500 to-blue-400 py-6 md:py-10 lg:py-14 rounded-lg md:rounded-xl shadow-lg overflow-hidden relative">
        {/* Decorative elements - hidden on mobile for better performance */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-10 hidden md:block">
          <div className="absolute top-10 left-10 w-20 h-20 rounded-full bg-white"></div>
          <div className="absolute bottom-10 right-10 w-32 h-32 rounded-full bg-white"></div>
          <div className="absolute top-1/3 right-1/4 w-16 h-16 rounded-full bg-white"></div>
        </div>

        <div className="max-w-2xl mx-auto text-center relative px-4">
          <div className="flex justify-center mb-3 md:mb-4">
            <div className="p-2 md:p-3 bg-white/20 backdrop-blur-sm rounded-full shadow-md">
              <HelpCircle className="h-5 w-5 md:h-6 md:w-6 text-white" />
            </div>
          </div>
          <h1 className="text-xl md:text-3xl lg:text-4xl font-bold text-white mb-2 md:mb-3 drop-shadow-md">
            سوالات متداول
          </h1>
          <p className="text-sm md:text-base text-blue-50 max-w-xl mx-auto">
            پاسخ به سوالاتی که معمولاً از ما پرسیده می‌شود. اگر پاسخ سوال خود را
            پیدا نکردید، می‌توانید با ما تماس بگیرید.
          </p>
        </div>
      </section>

      {/* FAQ content section */}
      <section className="w-full">
        <div className="bg-white rounded-lg shadow-md p-3 md:p-5 border border-gray-100 my-6 md:my-8 lg:my-12">
          <FaqAccordion faqs={faqs} />
        </div>

        {faqs.length > 0 && (
          <div className="text-center px-4 md:px-0">
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 md:p-6 w-full md:max-w-2xl mx-auto shadow-md border border-gray-200 relative overflow-hidden">
              {/* Decorative element - hidden on mobile */}
              <div className="absolute top-0 right-0 w-20 h-20 bg-blue-100 rounded-full -mr-8 -mt-8 opacity-40 hidden md:block"></div>

              <div className="flex justify-center mb-2 md:mb-3">
                <div className="p-2 bg-blue-100 rounded-full">
                  <MessageCircle className="h-4 w-4 md:h-5 md:w-5 text-blue-600" />
                </div>
              </div>

              <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-1 md:mb-2 relative">
                سوالی که به آن پاسخ داده نشده است؟
              </h3>
              <p className="text-xs md:text-sm text-gray-700 mb-3 md:mb-4 max-w-sm mx-auto relative">
                تیم پشتیبانی ما آماده پاسخگویی به سوالات شما است.
              </p>
              <a
                href="/contact-us"
                className="inline-flex items-center px-4 md:px-5 py-2 md:py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg shadow-md hover:shadow-lg hover:-translate-y-0.5 transform transition-all duration-300"
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
