"use client";

import React, { Suspense } from "react";
import { IoIosClose } from "react-icons/io";

import { SaveActions } from "./components/SaveActions";
import { StepNavigation } from "./components/StepNavigation";
import { NewProductWizardProvider, useNewProductWizard, Category } from "./NewProductWizardContext";
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
  categories: Category[];
  refetchProducts: () => void;
}) {
  const { isModalVisible } = useNewProductWizard();

  return (
    <>
      {isModalVisible && <ProgressModal progress={0} currentStep={1} />}
      <div className="bg-opacity-70 fixed inset-0 z-50 flex items-center justify-center bg-black backdrop-blur-sm transition-opacity">
        <div className="animate-fade-in relative max-h-[90dvh] w-full max-w-6xl overflow-y-scroll rounded-xl bg-gray-800 p-6 text-white shadow-lg">
          <h1 className="mb-6 text-center text-2xl font-bold">محصول جدید</h1>

          <form id="new-product-form" onSubmit={() => {}}>
            <StepNavigation />

            <Suspense fallback={<div className="py-8 text-center">در حال بارگذاری...</div>}>
              <BaseDetailsStep />
            </Suspense>
            <Suspense fallback={<div className="py-8 text-center">در حال بارگذاری...</div>}>
              <ProductOverviewStep />
            </Suspense>
            <Suspense fallback={<div className="py-8 text-center">در حال بارگذاری...</div>}>
              <OverviewDetailsStep />
            </Suspense>
            <Suspense fallback={<div className="py-8 text-center">در حال بارگذاری...</div>}>
              <ProductBlogStep />
            </Suspense>
            <Suspense fallback={<div className="py-8 text-center">در حال بارگذاری...</div>}>
              <SpecsStep />
            </Suspense>
            <Suspense fallback={<div className="py-8 text-center">در حال بارگذاری...</div>}>
              <FAQsStep />
            </Suspense>
            <Suspense fallback={<div className="py-8 text-center">در حال بارگذاری...</div>}>
              <PreviewStep />
            </Suspense>

            <SaveActions />
          </form>

          <button
            type="button"
            className="absolute top-4 right-4 cursor-pointer text-red-400 transition-colors hover:text-red-500"
            onClick={() => setShowNewProductModal(false)}
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
      <NewProductWizard.Form
        setShowNewProductModal={setShowNewProductModal}
        categories={categories}
        refetchProducts={refetchProducts}
      />
    </NewProductWizard.Provider>
  );
}
