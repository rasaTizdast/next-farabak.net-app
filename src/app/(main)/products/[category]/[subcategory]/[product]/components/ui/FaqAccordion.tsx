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
        <div
          key={faq.FAQsId}
          className="border border-gray-200 rounded-lg overflow-hidden"
        >
          <h3>
            <button
              onClick={() => toggleFaq(faq.FAQsId)}
              className="w-full p-4 text-right flex justify-between items-start bg-gray-50 hover:bg-gray-100 transition-all"
              aria-expanded={expandedId === faq.FAQsId}
              aria-controls={`faq-content-${faq.FAQsId}`}
            >
              <span className="text-gray-800 font-medium break-all break-words w-[97%] text-right">
                {faq.Title}
              </span>
              <span className="flex-shrink-0 ml-2">
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
            className={`overflow-hidden transition-all duration-300 ease-in-out ${
              expandedId === faq.FAQsId ? "p-4" : "max-h-0"
            }`}
            aria-hidden={expandedId !== faq.FAQsId}
          >
            <p className="text-gray-700 whitespace-pre-wrap break-words">
              {faq.Description}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default FaqAccordion;
