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
              aria-expanded={isOpen}
              aria-controls={`faq-answer-${faq.FAQsId}`}
              className="flex w-full items-start justify-between gap-3 bg-gray-50 px-4 py-3.5 text-right transition-colors hover:bg-gray-100 max-[576px]:px-3"
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
              aria-hidden={!isOpen}
              className={`overflow-hidden transition-[max-height,padding] duration-300 ease-in-out ${
                isOpen ? "p-4" : "max-h-0"
              }`}
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
