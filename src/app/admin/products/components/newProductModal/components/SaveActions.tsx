"use client";

import { useNewProductWizard } from "../NewProductWizardContext";
import { ValidationSummary } from "./ValidationSummary";

export function SaveActions() {
  const { errors, hasSubmitted, isModalVisible } = useNewProductWizard();

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
          isModalVisible ? "cursor-not-allowed bg-gray-500" : "bg-blue-500 hover:bg-blue-600"
        } text-white`}
        disabled={isModalVisible}
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
