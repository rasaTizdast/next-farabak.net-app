"use client";

import React from "react";
import { FaTrashAlt } from "react-icons/fa";

import { CollapsibleSection } from "../components/CollapsibleSection";
import { useNewProductFAQs } from "../hooks/useNewProductFAQs";
import { useNewProductWizard } from "../NewProductWizardContext";

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
      sectionId="faq"
      title="سوالات متداول"
    >
      <div className="mb-6 p-4">
        {faqs.map((faq, index) => (
          <div
            key={`faq-${index}`}
            className="mb-10 flex flex-col gap-5 rounded-md bg-gray-800 p-4 shadow-lg"
          >
            <div className="flex items-start gap-4">
              <div className="min-w-0 flex-1">
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
                  <p className="mt-1 text-sm text-red-500">{errors[`question-${index}`]}</p>
                )}
              </div>
              <button
                type="button"
                data-testid={`remove-faq-${index}`}
                onClick={() => handleRemoveFAQ(index)}
                aria-label="حذف سوال"
                className="mt-3 text-red-500 transition-colors hover:text-red-600"
              >
                <FaTrashAlt size={20} />
              </button>
            </div>
            <div>
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
                <p className="mt-1 text-sm text-red-500">{errors[`answer-${index}`]}</p>
              )}
            </div>
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
