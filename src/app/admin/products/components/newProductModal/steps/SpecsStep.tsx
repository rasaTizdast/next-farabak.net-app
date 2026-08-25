"use client";

import React from "react";
import { FiChevronDown, FiChevronUp, FiPlus } from "react-icons/fi";
import { IoIosClose } from "react-icons/io";

import SpecTemplateManager from "../../SpecTemplateManager";
import { useNewProductSpecs } from "../hooks/useNewProductSpecs";
import { useNewProductWizard } from "../NewProductWizardContext";

export function SpecsStep() {
  const {
    specs,
    errors,
    addSpec,
    removeSpec,
    handleSpecChange,
    shouldShowError,
    handleTemplateSelect,
  } = useNewProductSpecs();
  const { openSections, actions, hasSubmitted } = useNewProductWizard();
  const [showTemplateManager, setShowTemplateManager] = React.useState(false);

  const hasSpecsErrors = React.useMemo(() => {
    return Object.values(errors).some((error) => error !== "");
  }, [errors]);

  return (
    <>
      <div className="mb-4 overflow-hidden rounded-md bg-gray-900">
        <button
          type="button"
          onClick={() => actions.toggleSection("specs")}
          className="flex w-full cursor-pointer items-center justify-between p-4 transition-colors hover:bg-gray-950"
        >
          <span className="text-lg font-semibold">مشخصات محصول</span>
          {openSections.specs ? <FiChevronUp size={20} /> : <FiChevronDown size={20} />}
        </button>
        <div className={openSections.specs ? "block" : "hidden"}>
          {showTemplateManager && (
            <SpecTemplateManager
              onClose={() => setShowTemplateManager(false)}
              onTemplateSelect={handleTemplateSelect}
            />
          )}

          <div className="p-4" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">مشخصات محصول</h2>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="flex items-center gap-1 rounded-lg bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowTemplateManager(true);
                  }}
                >
                  مدیریت قالب‌ها
                </button>
                <button
                  type="button"
                  data-testid="add-spec-button"
                  className="flex items-center gap-1 rounded-lg bg-green-600 px-4 py-2 text-sm text-white hover:bg-green-700"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    addSpec();
                  }}
                >
                  <FiPlus size={18} />
                  افزودن مشخصات
                </button>
              </div>
            </div>

            {hasSubmitted && hasSpecsErrors && (
              <div className="mb-4 rounded-md bg-red-500 p-2 text-center text-sm text-white">
                لطفاً خطاهای مشخصات محصول را برطرف کنید.
              </div>
            )}

            <div className="space-y-4">
              {specs.map((spec, index) => (
                <div
                  key={spec.title + spec.description}
                  className="flex gap-4"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex-1">
                    <label htmlFor={`spec-title-${index}`} className="mb-1 block text-sm">
                      عنوان
                    </label>
                    <input
                      id={`spec-title-${index}`}
                      type="text"
                      data-testid={`spec-title-${index}`}
                      aria-label="عنوان مشخصات"
                      value={spec.title}
                      onChange={(e) => {
                        e.stopPropagation();
                        handleSpecChange(index, "title", e.target.value);
                      }}
                      className={`w-full rounded border bg-gray-700 p-2 ${
                        shouldShowError("title", index) ? "border-red-500" : "border-gray-600"
                      }`}
                      placeholder="مثال: وزن، ابعاد، مواد، و غیره"
                      onClick={(e) => e.stopPropagation()}
                    />
                    {shouldShowError("title", index) && (
                      <p className="mt-1 text-xs text-red-500">{errors[`title-${index}`]}</p>
                    )}
                  </div>
                  <div className="flex-1">
                    <label htmlFor={`spec-desc-${index}`} className="mb-1 block text-sm">
                      توضیحات
                    </label>
                    <input
                      id={`spec-desc-${index}`}
                      type="text"
                      data-testid={`spec-description-${index}`}
                      aria-label="توضیحات مشخصات"
                      value={spec.description}
                      onChange={(e) => {
                        e.stopPropagation();
                        handleSpecChange(index, "description", e.target.value);
                      }}
                      className={`w-full rounded border bg-gray-700 p-2 ${
                        shouldShowError("description", index) ? "border-red-500" : "border-gray-600"
                      }`}
                      placeholder="مثال: 100 گرم، 10×5 سانتی‌متر، فلزی، و غیره"
                      onClick={(e) => e.stopPropagation()}
                    />
                    {shouldShowError("description", index) && (
                      <p className="mt-1 text-xs text-red-500">{errors[`description-${index}`]}</p>
                    )}
                  </div>
                  <div className="mb-1 flex items-end">
                    <button
                      type="button"
                      data-testid={`remove-spec-${index}`}
                      aria-label="حذف مشخصات"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        removeSpec(index);
                      }}
                      className="p-2 text-red-400 hover:text-red-300"
                    >
                      <IoIosClose size={24} />
                    </button>
                  </div>
                </div>
              ))}

              {specs.length === 0 && (
                <div className="py-4 text-center text-gray-400">
                  هیچ مشخصاتی وجود ندارد. لطفاً با کلیک بر روی «افزودن مشخصات» یا انتخاب یک قالب،
                  مشخصات را اضافه کنید.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
