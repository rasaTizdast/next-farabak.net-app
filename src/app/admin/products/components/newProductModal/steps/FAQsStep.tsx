"use client";

import React from "react";
import { FaTrashAlt } from "react-icons/fa";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";

import { useNewProductFAQs } from "../hooks/useNewProductFAQs";
import { useNewProductWizard } from "../NewProductWizardContext";

type SectionProps = {
  isOpen: boolean;
  onToggle: () => void;
  title: string;
};

function CollapsibleSection({
  isOpen,
  onToggle,
  title,
  children,
}: SectionProps & { children: React.ReactNode }) {
  return (
    <div className="mb-4 overflow-hidden rounded-md bg-gray-900">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full cursor-pointer items-center justify-between p-4 transition-colors hover:bg-gray-950"
      >
        <span className="text-lg font-semibold">{title}</span>
        {isOpen ? <FiChevronUp size={20} /> : <FiChevronDown size={20} />}
      </button>
      <div className={isOpen ? "block" : "hidden"}>{children}</div>
    </div>
  );
}

export function FAQsStep() {
  const {
    faqs,
    errors,
    handleFAQChange,
    handleAddFAQ,
    handleRemoveFAQ,
    shouldShowError,
    canAddMore,
  } = useNewProductFAQs();
  const { openSections, actions } = useNewProductWizard();

  return (
    <CollapsibleSection
      isOpen={openSections.faq}
      onToggle={() => actions.toggleSection("faq")}
      title="سوالات متداول"
    >
      <div className="mb-6 p-4">
        {faqs.map((faq, index) => (
          <div
            key={faq.question + faq.answer}
            className="mb-10 flex flex-col gap-5 rounded-md bg-gray-800 p-4 shadow-lg"
          >
            <div className="flex items-center gap-4">
              <input
                type="text"
                data-testid={`faq-question-${index}`}
                value={faq.question}
                onChange={(e) => handleFAQChange(index, "question", e.target.value)}
                className={`w-full rounded-lg border bg-gray-700 p-3 ${
                  shouldShowError("question", index) ? "border-red-500" : "border-gray-300"
                }`}
                placeholder={`سوال ${index + 1}`}
              />
              {shouldShowError("question", index) && (
                <p className="mt-1 text-red-500">{errors[`question-${index}`]}</p>
              )}
              <button
                type="button"
                data-testid={`remove-faq-${index}`}
                onClick={() => handleRemoveFAQ(index)}
                aria-label="حذف سوال"
                className="text-red-500 transition-colors hover:text-red-600"
              >
                <FaTrashAlt size={20} />
              </button>
            </div>
            <textarea
              data-testid={`faq-answer-${index}`}
              value={faq.answer}
              onChange={(e) => handleFAQChange(index, "answer", e.target.value)}
              className={`w-full rounded-lg border bg-gray-700 p-3 ${
                shouldShowError("answer", index) ? "border-red-500" : "border-gray-300"
              }`}
              placeholder={`پاسخ ${index + 1}`}
            />
            {shouldShowError("answer", index) && (
              <p className="mt-1 text-red-500">{errors[`answer-${index}`]}</p>
            )}
          </div>
        ))}
        <button
          type="button"
          data-testid="add-faq-button"
          onClick={handleAddFAQ}
          className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-700"
          disabled={!canAddMore}
        >
          افزودن سوال جدید
        </button>
      </div>
    </CollapsibleSection>
  );
}
