"use client";

import React from "react";
import { IoIosClose } from "react-icons/io";

import { useModalA11y } from "@/hooks/useModalA11y";

import { SaveActions } from "./components/SaveActions";
import { StepNavigation } from "./components/StepNavigation";
import {
  NewProductWizardProvider,
  useNewProductWizard,
  Category,
  OpenSections,
} from "./NewProductWizardContext";
import { BaseDetailsStep } from "./steps/BaseDetailsStep";
import { FAQsStep } from "./steps/FAQsStep";
import { OverviewDetailsStep } from "./steps/OverviewDetailsStep";
import { PreviewStep } from "./steps/PreviewStep";
import { ProductBlogStep } from "./steps/ProductBlogStep";
import { ProductOverviewStep } from "./steps/ProductOverviewStep";
import { SpecsStep } from "./steps/SpecsStep";
import ProgressModal from "../newProductModalComponents/ProgressModal";

function NewProductWizardInner({
  setShowNewProductModal,
}: {
  setShowNewProductModal: (visible: boolean) => void;
}) {
  const { state, isModalVisible, openSections, progress, currentStep, actions } =
    useNewProductWizard();

  const sectionOrder = Object.keys(openSections) as (keyof OpenSections)[];
  const firstOpenIndex = sectionOrder.findIndex((key) => openSections[key]);
  const currentStepNumber = firstOpenIndex >= 0 ? firstOpenIndex + 1 : 1;
  const totalSteps = sectionOrder.length || 7;

  const requestClose = () => {
    if (isModalVisible) return;
    const hasDraft = Object.entries(state).some(([field, value]) => {
      if (field === "available") return false;
      if (Array.isArray(value)) return value.length > 0;
      if (typeof value === "string") return value.trim().length > 0;
      return value !== null;
    });
    if (hasDraft && !window.confirm("اطلاعات واردشده ذخیره نشده است. فرم بسته شود؟")) return;
    setShowNewProductModal(false);
  };

  const panelRef = useModalA11y<HTMLDivElement>({
    onClose: requestClose,
    shouldCloseOnEscape: () => {
      // A nested progress modal owns Escape while it is visible.
      if (isModalVisible) return false;
      // Don't discard a draft mid-typing.
      const target = document.activeElement as HTMLElement | null;
      return !target?.closest("input, textarea, select, [contenteditable='true']");
    },
  });

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void actions.submitForm();
  };

  return (
    <>
      {isModalVisible && <ProgressModal progress={progress} currentStep={currentStep} />}
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-2 backdrop-blur-[2px] sm:p-5">
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="new-product-wizard-title"
          tabIndex={-1}
          className="admin-product-wizard relative max-h-[calc(100dvh-1rem)] w-full max-w-5xl overflow-y-auto overscroll-contain rounded-xl border border-slate-500 bg-slate-800 p-4 text-white shadow-2xl focus:outline-none sm:max-h-[calc(100dvh-2.5rem)] sm:p-6"
        >
          <h2 id="new-product-wizard-title" className="mb-6 pe-12 text-right text-2xl font-bold">
            محصول جدید
          </h2>

          <p role="status" aria-live="polite" className="sr-only">
            مرحله {currentStepNumber} از {totalSteps}
          </p>

          <form id="new-product-form" onSubmit={handleFormSubmit}>
            <StepNavigation />

            <BaseDetailsStep />
            <ProductOverviewStep />
            <OverviewDetailsStep />
            <ProductBlogStep />
            <SpecsStep />
            <FAQsStep />
            <PreviewStep />

            <SaveActions />
          </form>

          <button
            type="button"
            className="absolute top-3 left-3 flex size-10 cursor-pointer items-center justify-center rounded-lg border border-slate-500 text-slate-200 transition-colors hover:bg-slate-700 hover:text-white focus-visible:ring-2 focus-visible:ring-blue-300 focus-visible:outline-none sm:top-4 sm:left-4"
            onClick={requestClose}
            disabled={isModalVisible}
            aria-label="بستن"
          >
            <IoIosClose size={28} />
          </button>
        </div>
      </div>
    </>
  );
}

export const NewProductWizard = {
  Provider: NewProductWizardProvider,
  Form: NewProductWizardInner,
};

export default function NewProductModal({
  setShowNewProductModal,
  categories,
  refetchProducts,
}: {
  setShowNewProductModal: (visible: boolean) => void;
  categories: Category[];
  refetchProducts: () => void;
}) {
  return (
    <NewProductWizard.Provider
      categories={categories}
      refetchProducts={refetchProducts}
      setShowNewProductModal={setShowNewProductModal}
    >
      <NewProductWizard.Form setShowNewProductModal={setShowNewProductModal} />
    </NewProductWizard.Provider>
  );
}
