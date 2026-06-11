"use client";

import { Input } from "antd";
import { ChevronDown, ChevronUp, Search } from "lucide-react";
import Script from "next/script";
import { useState } from "react";

export interface BlogFaqItem {
  id: number;
  question: string;
  answer: string;
  order: number;
}

interface BlogFaqAccordionProps {
  faqs: BlogFaqItem[];
  blogTitle: string;
  blogSlug: string;
  description?: string;
  className?: string;
}

const BlogFaqAccordion = ({
  faqs,
  blogTitle,
  blogSlug,
  description,
  className = "",
}: BlogFaqAccordionProps) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  // Filter FAQs based on search query
  const filteredFaqs = faqs.filter(
    (faq) =>
      faq.question?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!faqs || faqs.length === 0) {
    return null; // Don't render anything if no FAQs
  }

  // Generate JSON-LD structured data for FAQ
  const generateFaqJsonLd = () => {
    const faqJsonLd = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: filteredFaqs.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: faq.answer,
        },
      })),
    };

    return faqJsonLd;
  };

  return (
    <>
      <div className={`mx-auto w-full ${className}`}>
        <div className="mb-8">
          <h2 className="mb-3 text-xl font-bold text-gray-900 md:mb-6 md:text-3xl">
            سوالات متداول
          </h2>
          <p className="text-sm text-gray-600 md:text-lg">
            {description || `پاسخ سوالات رایج درباره "${blogTitle}"`}
          </p>
        </div>

        <div className="relative mb-6 md:mb-8">
          <div className="faq-search-container relative">
            <Input
              placeholder="جستجو در سوالات متداول..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="faq-search-input rounded-lg border border-gray-200 px-2 py-1.5 text-right text-sm shadow-sm hover:border-gray-300 focus:border-blue-500 md:px-4 md:py-2.5 md:text-base"
              style={{ fontFamily: "inherit" }}
              prefix={<Search className="mr-1 h-3.5 w-3.5 text-blue-500 md:h-4 md:w-4" />}
              allowClear
            />
            <div className="absolute -bottom-2 left-1/2 h-0.5 w-12 -translate-x-1/2 transform rounded-full bg-blue-500 md:-bottom-4 md:w-16"></div>
          </div>
        </div>

        {filteredFaqs.length === 0 ? (
          <div className="rounded-lg bg-gray-50 py-6 text-center shadow-inner md:py-8">
            <Search className="mx-auto mb-2 h-6 w-6 text-gray-400 opacity-50 md:h-8 md:w-8" />
            <p className="text-sm text-gray-600 md:text-base">
              هیچ نتیجه‌ای برای جستجوی شما یافت نشد.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredFaqs.map((faq, index) => {
              const isOpen = openIndex === index;
              return (
                <div
                  key={faq.id}
                  className={`overflow-hidden rounded-lg border bg-white ${
                    isOpen
                      ? "border-blue-400 shadow-lg shadow-blue-50"
                      : "border-gray-400 shadow-sm hover:border-gray-500 hover:shadow-md"
                  } transition-all duration-300`}
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(index)}
                    className={`flex w-full items-center justify-between p-4 text-right focus:outline-none md:p-5 ${
                      isOpen ? "bg-blue-50" : "hover:bg-gray-50"
                    } transition-colors duration-300`}
                    aria-expanded={isOpen}
                    aria-controls={`faq-answer-${faq.id}`}
                  >
                    <h3
                      className={`text-sm font-semibold md:text-base ${
                        isOpen ? "text-blue-800" : "text-gray-900"
                      } pr-2 text-right transition-colors duration-300 md:pr-3`}
                    >
                      {faq.question}
                    </h3>
                    <span
                      className={`ml-2 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full md:ml-4 md:h-8 md:w-8 ${
                        isOpen ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-500"
                      } transition-all duration-300`}
                    >
                      {isOpen ? (
                        <ChevronUp className="h-4 w-4 md:h-5 md:w-5" />
                      ) : (
                        <ChevronDown className="h-4 w-4 md:h-5 md:w-5" />
                      )}
                    </span>
                  </button>

                  {isOpen && (
                    <div id={`faq-answer-${faq.id}`} className="px-4 pb-4 pt-0 md:px-5 md:pb-5">
                      <div className="border-t border-blue-50 pt-3">
                        <p className="text-sm leading-relaxed text-gray-700 md:text-base">
                          {faq.answer}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* JSON-LD Structured Data for SEO */}
      <Script
        id={`faq-jsonld-${blogSlug}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateFaqJsonLd()),
        }}
      />
    </>
  );
};

export default BlogFaqAccordion;
