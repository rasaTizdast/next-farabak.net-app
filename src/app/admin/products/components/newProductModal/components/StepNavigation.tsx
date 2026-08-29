"use client";

import React from "react";

import { useNewProductWizard } from "../NewProductWizardContext";

const steps = [
  { id: "baseDetails", label: "جزئیات پایه" },
  { id: "productOverview", label: "بررسی محصول" },
  { id: "overviewDetails", label: "توضیحات محصول" },
  { id: "productBlog", label: "مقاله محصول" },
  { id: "specs", label: "مشخصات" },
  { id: "faq", label: "سوالات متداول" },
  { id: "preview", label: "پیش‌نمایش" },
] as const;

type StepId = (typeof steps)[number]["id"];

export function StepNavigation() {
  const { openSections, actions, errors } = useNewProductWizard();

  const getStepStatus = (stepId: StepId) => {
    const sectionErrors = getSectionErrors(stepId);
    if (sectionErrors.length > 0) return "error";
    if (openSections[stepId]) return "active";
    return "pending";
  };

  const getSectionErrors = (stepId: StepId): string[] => {
    switch (stepId) {
      case "baseDetails":
        return [
          "name",
          "slug",
          "categoryID",
          "subCategoryID",
          "price",
          "discount",
          "smallDesc",
          "bannerImage",
          "transparentImage",
          "SEO_Title",
          "SEO_Description",
          "keywords",
        ].filter((f) => errors[f]);
      case "productOverview":
        return Object.keys(errors).filter((k) => k === "features" || k.startsWith("features-"));
      case "overviewDetails":
        return Object.keys(errors).filter((k) => k.startsWith("overviewDetails-"));
      case "productBlog":
        return errors.productBlog ? ["productBlog"] : [];
      case "specs":
        return Object.keys(errors).filter((k) => k.startsWith("specs-"));
      case "faq":
        return Object.keys(errors).filter(
          (k) => k.startsWith("faq-") || k.includes("-question-") || k.includes("-answer-")
        );
      case "preview":
        return [];
      default:
        return [];
    }
  };

  return (
    <nav className="mb-6 flex flex-wrap gap-2" aria-label="مراحل ساخت محصول">
      {steps.map((step, index) => {
        const status = getStepStatus(step.id);
        const isActive = openSections[step.id];
        const hasError = status === "error";

        return (
          <button
            key={step.id}
            type="button"
            onClick={() => {
              actions.setOpenSections({ [step.id]: true });
              // Close other sections
              Object.keys(openSections).forEach((key) => {
                if (key !== step.id) {
                  actions.setOpenSections({ [key]: false });
                }
              });
            }}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              isActive
                ? "bg-blue-600 text-white"
                : hasError
                  ? "bg-red-500 text-white"
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700"
            }`}
            aria-current={isActive ? "step" : undefined}
          >
            <span
              className={`flex size-5 items-center justify-center rounded-full text-xs ${
                isActive
                  ? "bg-white text-blue-600"
                  : hasError
                    ? "bg-white text-red-500"
                    : "bg-gray-700 text-gray-400"
              }`}
            >
              {hasError ? (
                <svg className="size-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              ) : (
                index + 1
              )}
            </span>
            <span className="hidden sm:inline">{step.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
