"use client";

import { toast } from "react-hot-toast";

import { useNewProductWizard } from "../NewProductWizardContext";
import { ValidationSummary } from "./ValidationSummary";

export function SaveActions() {
  const { errors, hasSubmitted } = useNewProductWizard();

  const hasErrors = () => {
    if (!errors) return false;
    return (
      Object.entries(errors).filter(([_, message]) => message && message.trim() !== "").length > 0
    );
  };

  return (
    <div className="mt-6 flex flex-col items-center">
      <ValidationSummary />

      <button
        type="submit"
        form="new-product-form"
        data-testid="create-product-button"
        className={`rounded-lg px-6 py-2 ${
          hasErrors() ? "cursor-not-allowed bg-gray-500" : "bg-blue-500 hover:bg-blue-600"
        } text-white`}
        disabled={hasErrors()}
        onClick={(e) => {
          if (hasErrors()) {
            e.preventDefault();
            e.stopPropagation();

            const hasFeatureErrors = Object.keys(errors).some(
              (key) => (key === "features" || key.startsWith("features-")) && errors[key]
            );

            if (hasFeatureErrors) {
              toast.error("لطفاً خطاهای ویژگی‌ها را برطرف کنید.");
            } else {
              toast.error("لطفاً تمام خطاها را برطرف کنید.");
            }
          }
        }}
      >
        ایجاد محصول
      </button>

      {hasSubmitted && hasErrors() && (
        <div className="mt-4 rounded-md bg-red-500 p-2 text-center text-sm text-white">
          فرم دارای خطا است. لطفا تمامی موارد خطا را اصلاح کنید.
        </div>
      )}
    </div>
  );
}
