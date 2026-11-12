"use client";

import { useState } from "react";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";

type FAQItem = {
  FAQsId: number;
  Title: string;
  Description: string;
};

type FaqAccordionProps = {
  faqs: FAQItem[];
};

const FaqAccordion = ({ faqs }: FaqAccordionProps) => {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const toggleFaq = (faqId: number) => {
    setExpandedId((current) => (current === faqId ? null : faqId));
  };

  return (
    <div className="space-y-2.5">
      {faqs.map((faq) => {
        const isOpen = expandedId === faq.FAQsId;
        return (
          <div key={faq.FAQsId} className="overflow-hidden rounded-lg border border-gray-200">
            <button
              type="button"
              onClick={() => toggleFaq(faq.FAQsId)}
              id={`faq-question-${faq.FAQsId}`}
              aria-expanded={isOpen}
              aria-controls={`faq-answer-${faq.FAQsId}`}
              className="flex min-h-14 w-full items-start justify-between gap-3 bg-(--farabak-paper) px-4 py-3.5 text-right transition-colors hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-(--farabak-action-blue) focus-visible:outline-none focus-visible:ring-inset max-[576px]:px-3"
            >
              <span className="w-[97%] text-right text-[0.95rem] font-medium wrap-break-word break-all text-gray-800">
                {faq.Title}
              </span>
              <span className="mt-0.5 shrink-0 text-[#1e90ff]" aria-hidden="true">
                {isOpen ? <FiChevronUp /> : <FiChevronDown />}
              </span>
            </button>
            <div
              id={`faq-answer-${faq.FAQsId}`}
              role="region"
              aria-labelledby={`faq-question-${faq.FAQsId}`}
              hidden={!isOpen}
              className="overflow-hidden border-t border-(--farabak-ink-deep)/10 p-4"
            >
              <p className="text-[0.9rem] leading-7 wrap-break-word whitespace-pre-wrap text-gray-700">
                {faq.Description}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default FaqAccordion;
