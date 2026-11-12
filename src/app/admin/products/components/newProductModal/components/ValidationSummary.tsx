"use client";

import React from "react";

import { useNewProductWizard } from "../NewProductWizardContext";

const formatErrorKey = (key: string): string => {
  if (key.startsWith("specs-")) {
    const parts = key.split("-");
    if (parts.length >= 3) {
      const fieldType = parts[1];
      const itemIndex = parseInt(parts[2]) + 1;
      return `مشخصات ${itemIndex} (${fieldType === "title" ? "عنوان" : "توضیحات"})`;
    }
  }
  if (key.startsWith("features-")) {
    const parts = key.split("-");
    if (parts.length >= 3) {
      const itemIndex = parseInt(parts[2]) + 1;
      return `ویژگی ${itemIndex}`;
    }
  }
  if (key === "features") return "ویژگی‌ها";
  if (key.startsWith("faq-")) {
    const parts = key.split("-");
    if (parts.length >= 3) {
      const fieldType = parts[1];
      const itemIndex = parseInt(parts[2]) + 1;
      return `سوال ${itemIndex} (${fieldType === "question" ? "سوال" : "پاسخ"})`;
    }
  }
  if (key.includes("-question-") || key.includes("-answer-")) {
    const isQuestion = key.includes("-question-");
    const itemIndex = parseInt(key.split("-").pop() || "0") + 1;
    return `سوال ${itemIndex} (${isQuestion ? "سوال" : "پاسخ"})`;
  }
  const fieldNames: Record<string, string> = {
    name: "نام محصول",
    slug: "شناسه محصول",
    categoryID: "دسته‌بندی",
    subCategoryID: "زیر دسته‌بندی",
    smallDesc: "توضیح کوتاه",
    bannerImage: "تصویر بنر",
    transparentImage: "تصویر بدون پس‌زمینه",
    SEO_Title: "تیتر سئو",
    SEO_Description: "توضیحات سئو",
    keywords: "کلمات کلیدی",
    price: "قیمت",
    discount: "تخفیف",
    productBlog: "مقاله محصول",
  };
  return fieldNames[key] || key;
};

export function ValidationSummary() {
  const { errors, hasSubmitted } = useNewProductWizard();

  if (!hasSubmitted) return null;

  const errorEntries = Object.entries(errors).filter(
    ([_, message]) => message && message.trim() !== ""
  );

  if (errorEntries.length === 0) return null;

  return (
    <div className="my-4 flex flex-wrap justify-center gap-2" role="alert" aria-live="polite">
      {errorEntries.map(([key, message]) => (
        <div key={`error-${key}`} className="rounded-lg bg-red-500 p-2 text-center">
          <span className="font-bold">{formatErrorKey(key)}: </span>
          {message}
        </div>
      ))}
    </div>
  );
}
