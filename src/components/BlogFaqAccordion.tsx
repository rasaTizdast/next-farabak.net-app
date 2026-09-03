"use client";

import { Search, X } from "lucide-react";
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
  description,
  className = "",
}: BlogFaqAccordionProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [openFaqId, setOpenFaqId] = useState<string | null>(null);

  if (!faqs || faqs.length === 0) {
    return null;
  }

  const filteredFaqs = faqs.filter(
    (faq) =>
      faq.question?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleFaq = (faqId: string) => {
    setOpenFaqId((current) => (current === faqId ? null : faqId));
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
              <Search className="pointer-events-none absolute top-1/2 right-3 size-3.5 -translate-y-1/2 text-blue-500 md:size-4" />
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
                  <X className="size-3.5" />
                </button>
              )}
            </div>
            <div className="absolute -bottom-2 left-1/2 h-0.5 w-12 -translate-x-1/2 transform rounded-full bg-blue-500 md:-bottom-4 md:w-16"></div>
          </div>
        </div>

        {filteredFaqs.length === 0 ? (
          <div className="rounded-lg bg-gray-50 py-6 text-center shadow-inner md:py-8">
            <Search className="mx-auto mb-2 size-6 text-gray-400 opacity-50 md:size-8" />
            <p className="text-sm text-gray-600 md:text-base">
              هیچ نتیجه‌ای برای جستجوی شما یافت نشد.
            </p>
          </div>
        ) : (
          <dl className="divide-y divide-gray-200 rounded-lg border border-gray-200">
            {filteredFaqs.map((faq) => {
              const faqId = String(faq.id);
              const isOpen = openFaqId === faqId;
              return (
                <div key={faqId}>
                  <dt>
                    <button
                      type="button"
                      onClick={() => toggleFaq(faqId)}
                      aria-expanded={isOpen}
                      aria-controls={`faq-answer-${faq.id}`}
                      className="flex w-full items-center justify-between gap-2 px-4 py-3 text-right hover:bg-gray-50"
                    >
                      <span className="pr-2 text-right text-sm font-semibold text-gray-900 md:pr-3 md:text-base">
                        {faq.question}
                      </span>
                      <span
                        aria-hidden="true"
                        className={`flex shrink-0 transform transition-transform ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      >
                        ▼
                      </span>
                    </button>
                  </dt>
                  <dd
                    id={`faq-answer-${faq.id}`}
                    hidden={!isOpen}
                    className="border-t border-gray-100 px-4 py-3"
                  >
                    <p className="text-sm leading-relaxed text-gray-700 md:text-base">
                      {faq.answer}
                    </p>
                  </dd>
                </div>
              );
            })}
          </dl>
        )}
      </div>
    </>
  );
};

export default BlogFaqAccordion;
