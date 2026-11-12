"use client";

import React from "react";

import { CollapsibleSection } from "../components/CollapsibleSection";
import { useNewProductWizard } from "../NewProductWizardContext";

function PreviewField({
  label,
  value,
}: {
  label: string;
  value: string | number | boolean | null | undefined;
}) {
  if (value === null || value === undefined || value === "") return null;
  return (
    <div className="mb-4">
      <span className="mb-1 block text-sm font-medium text-gray-400">{label}</span>
      <p className="text-white">{String(value)}</p>
    </div>
  );
}

function PreviewArray<T>({
  label,
  items,
  renderItem,
}: {
  label: string;
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
}) {
  if (!items.length) return null;
  return (
    <div className="mb-4">
      <span className="mb-2 block text-sm font-medium text-gray-400">{label}</span>
      <div className="space-y-2">{items.map((item, index) => renderItem(item, index))}</div>
    </div>
  );
}

export function PreviewStep() {
  const { state, openSections, actions, meta } = useNewProductWizard();

  const selectedCategory = meta.categories.find((c) => c.CategoryID === state.categoryID);
  const selectedSubCategoryIds = state.subCategoryID
    ? state.subCategoryID.split(",").map(Number)
    : [];
  const selectedSubCategoryNames = selectedCategory
    ? selectedCategory.Subcategories.filter((sub) =>
        selectedSubCategoryIds.includes(sub.CategoryContentId)
      ).map((sub) => sub.Name)
    : [];

  return (
    <CollapsibleSection
      isOpen={openSections.preview}
      onToggle={() => actions.toggleSection("preview")}
      sectionId="preview"
      title="پیش‌نمایش و تایید"
    >
      <div className="mb-6 p-4">
        <h2 className="mb-6 text-center text-xl font-bold">بازبینی اطلاعات محصول</h2>

        <div className="space-y-4 border-t border-gray-700 pt-4">
          <div className="grid gap-4 md:grid-cols-2">
            <PreviewField label="نام محصول" value={state.name} />
            <PreviewField label="شناسه محصول" value={state.slug} />
            <PreviewField label="دسته‌بندی" value={selectedCategory?.Name} />
            <PreviewField label="زیر دسته‌بندی" value={selectedSubCategoryNames.join("، ")} />
            <PreviewField label="قیمت" value={state.price} />
            <PreviewField label="تخفیف" value={state.discount} />
            <PreviewField label="وضعیت" value={state.available ? "فعال" : "غیرفعال"} />
          </div>

          <PreviewField label="توضیحات کوتاه" value={state.smallDesc} />
          <PreviewField label="تیتر سئو" value={state.SEO_Title} />
          <PreviewField label="توضیحات سئو" value={state.SEO_Description} />
          <PreviewField label="کلمات کلیدی" value={state.keywords} />

          <PreviewArray
            label="ویژگی‌ها"
            items={state.features}
            renderItem={(item, index) => (
              <div
                key={`preview-feature-${index}`}
                className="flex items-center gap-2 rounded bg-gray-800 p-2"
              >
                <span className="text-gray-400">{index + 1}.</span>
                <span>{item}</span>
              </div>
            )}
          />

          <PreviewArray
            label="توضیحات محصول (انتخاب شده)"
            items={state.overviewDetails.filter((d) => d.selected)}
            renderItem={(item) => (
              <div
                key={`preview-overview-${item.ProductOverviewDetailsId}`}
                className="rounded bg-gray-800 p-3"
              >
                <p className="font-semibold">{item.Title}</p>
                <p className="text-sm text-gray-400">{item.Description}</p>
              </div>
            )}
          />

          <PreviewField label="مقاله محصول" value={state.productBlog ? "دارد" : "ندارد"} />

          <PreviewArray
            label="مشخصات"
            items={state.specs}
            renderItem={(item, index) => (
              <div key={`preview-spec-${index}`} className="rounded bg-gray-800 p-3">
                <p className="font-semibold">{item.title}</p>
                <p className="text-sm text-gray-400">{item.description}</p>
              </div>
            )}
          />

          <PreviewArray
            label="سوالات متداول"
            items={state.faqs}
            renderItem={(item, index) => (
              <div key={`preview-faq-${index}`} className="rounded bg-gray-800 p-3">
                <p className="font-semibold">
                  سوال {index + 1}: {item.question}
                </p>
                <p className="text-sm text-gray-400">پاسخ: {item.answer}</p>
              </div>
            )}
          />
        </div>

        <div className="mt-6 flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => actions.setOpenSections({ preview: false })}
            className="rounded-lg bg-gray-600 px-6 py-2 text-white hover:bg-gray-700"
          >
            بازگشت به ویرایش
          </button>
        </div>
      </div>
    </CollapsibleSection>
  );
}
