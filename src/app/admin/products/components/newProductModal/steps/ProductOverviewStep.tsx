"use client";

import React from "react";
import { FaTrashAlt } from "react-icons/fa";

import { CollapsibleSection } from "../components/CollapsibleSection";
import { useNewProductFeatures } from "../hooks/useNewProductFeatures";
import { useNewProductWizard } from "../NewProductWizardContext";

export function ProductOverviewStep() {
  const {
    features,
    errors,
    handleFeatureChange,
    handleFeatureAdd,
    handleFeatureRemove,
    shouldShowError,
    canAddMore,
  } = useNewProductFeatures();
  const { openSections, actions } = useNewProductWizard();

  return (
    <CollapsibleSection
      isOpen={openSections.productOverview}
      onToggle={() => actions.toggleSection("productOverview")}
      sectionId="productOverview"
      title="بررسی محصول"
    >
      <div className="mb-6 p-4">
        <div className={`${features.length ? "mb-10 flex flex-col gap-5" : ""}`}>
          {features.map((feature, index) => (
            <div key={`feature-${index}`} className="flex items-start gap-4">
              <div className="min-w-0 flex-1">
                <input
                  type="text"
                  data-testid={`product-feature-${index}`}
                  value={feature}
                  onChange={(e) => handleFeatureChange(index, e.target.value)}
                  className={`w-full rounded-lg border bg-gray-700 p-3 ${
                    shouldShowError(index) ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder={`ویژگی ${index + 1}`}
                />
                {shouldShowError(index) && (
                  <p className="mt-1 text-sm text-red-500">{errors[`feature-${index}`]}</p>
                )}
              </div>
              <button
                type="button"
                data-testid={`remove-feature-${index}`}
                onClick={() => handleFeatureRemove(index)}
                aria-label="حذف ویژگی"
                className="mt-3 text-red-500 transition-colors hover:text-red-600"
              >
                <FaTrashAlt size={20} />
              </button>
            </div>
          ))}
        </div>
        {features.length === 0 && (
          <div className="mb-4 text-center text-red-500">حداقل یک ویژگی الزامی است</div>
        )}
        <button
          type="button"
          data-testid="add-feature-button"
          onClick={handleFeatureAdd}
          className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-700"
          disabled={!canAddMore}
        >
          افزودن ویژگی جدید
        </button>
      </div>
    </CollapsibleSection>
  );
}
