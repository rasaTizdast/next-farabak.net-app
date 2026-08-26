"use client";

import { Search, X } from "lucide-react";
import Script from "next/script";
import { useState } from "react";

import { Accordion } from "@/components/ui/ItemsAccordion";

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
  const [searchQuery, setSearchQuery] = useState("");

  const filteredFaqs = faqs.filter(
    (faq) =>
      faq.question?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!faqs || faqs.length === 0) {
    return null;
  }

  const generateFaqJsonString = () => {
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

    return JSON.stringify(faqJsonLd);
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
            <div className="relative">
              <Search className="pointer-events-none absolute top-1/2 right-3 h-3.5 w-3.5 -translate-y-1/2 text-blue-500 md:h-4 md:w-4" />
              <input
                type="text"
                placeholder="جستجو در سوالات متداول..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="faq-search-input w-full rounded-lg border border-gray-200 py-1.5 pr-9 pl-8 text-right text-sm shadow-sm transition-colors hover:border-gray-300 focus:border-blue-500 focus:outline-none md:py-2.5 md:text-base"
              />
              {searchQuery && (
                <button
                  type="button"
                  aria-label="پاک کردن جستجو"
                  onClick={() => setSearchQuery("")}
                  className="absolute top-1/2 left-2 -translate-y-1/2 cursor-pointer rounded-full p-0.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
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
          <Accordion<BlogFaqItem>
            allowMultiple={false}
            items={filteredFaqs.map((faq) => ({
              id: String(faq.id),
              data: faq,
              renderHeader: (item) => (
                <h3 className="pr-2 text-right text-sm font-semibold text-gray-900 md:pr-3 md:text-base">
                  {item.question}
                </h3>
              ),
              renderContent: (item) => (
                <p className="text-sm leading-relaxed text-gray-700 md:text-base">{item.answer}</p>
              ),
            }))}
          />
        )}
      </div>

      <Script
        id={`faq-jsonld-${blogSlug}`}
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: generateFaqJsonString(),
        }}
      />
    </>
  );
};

export default BlogFaqAccordion;
