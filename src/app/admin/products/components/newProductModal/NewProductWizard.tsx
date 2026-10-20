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
  const { isModalVisible, openSections, progress, currentStep, actions } = useNewProductWizard();

  const sectionOrder = Object.keys(openSections) as (keyof OpenSections)[];
  const firstOpenIndex = sectionOrder.findIndex((key) => openSections[key]);
  const currentStepNumber = firstOpenIndex >= 0 ? firstOpenIndex + 1 : 1;
  const totalSteps = sectionOrder.length || 7;

  const requestClose = () => {
    if (!isModalVisible) setShowNewProductModal(false);
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
      <div
        className="bg-opacity-70 fixed inset-0 z-50 flex items-center justify-center bg-black backdrop-blur-sm transition-opacity"
        onClick={(e) => {
          if (e.target === e.currentTarget) requestClose();
        }}
      >
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="new-product-wizard-title"
          tabIndex={-1}
          className="animate-fade-in relative max-h-[90dvh] w-full max-w-6xl overflow-y-auto rounded-xl bg-gray-800 p-6 text-white shadow-lg focus:outline-none"
        >
          <h2 id="new-product-wizard-title" className="mb-6 text-center text-2xl font-bold">
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
            className="absolute top-4 right-4 cursor-pointer text-red-400 transition-colors hover:text-red-500"
            onClick={requestClose}
            disabled={isModalVisible}
            aria-label="بستن"
          >
            <IoIosClose size={50} />
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
