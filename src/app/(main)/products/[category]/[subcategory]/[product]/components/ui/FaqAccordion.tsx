"use client";

import React, { useState } from "react";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";

type FAQItem = {
  FAQsId: number;
  Title: string;
  Description: string;
};

type FaqAccordionProps = {
  faqs: FAQItem[];
};

const FaqAccordion: React.FC<FaqAccordionProps> = ({ faqs }) => {
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const toggleFaq = (faqId: number) => {
    setExpandedId(expandedId === faqId ? null : faqId);
  };

  return (
    <div className="space-y-2">
      {faqs.map((faq) => (
        <div key={faq.FAQsId} className="overflow-hidden rounded-lg border border-gray-200">
          <h3>
            <button
              type="button"
              onClick={() => toggleFaq(faq.FAQsId)}
              className="flex w-full items-start justify-between bg-gray-50 p-4 text-right transition-colors hover:bg-gray-100"
              aria-expanded={expandedId === faq.FAQsId}
              aria-controls={`faq-content-${faq.FAQsId}`}
            >
              <span className="w-[97%] text-right font-medium wrap-break-word break-all text-gray-800">
                {faq.Title}
              </span>
              <span className="ml-2 shrink-0">
                {expandedId === faq.FAQsId ? (
                  <FiChevronUp className="text-blue-500" aria-hidden="true" />
                ) : (
                  <FiChevronDown className="text-blue-500" aria-hidden="true" />
                )}
              </span>
            </button>
          </h3>
          <div
            id={`faq-content-${faq.FAQsId}`}
            className={`overflow-hidden transition-[max-height] duration-300 ease-in-out ${
              expandedId === faq.FAQsId ? "p-4" : "max-h-0"
            }`}
            aria-hidden={expandedId !== faq.FAQsId}
          >
            <p className="wrap-break-word whitespace-pre-wrap text-gray-700">{faq.Description}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FaqAccordion;
