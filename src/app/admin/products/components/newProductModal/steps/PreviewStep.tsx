"use client";

import React from "react";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";

import { useNewProductWizard } from "../NewProductWizardContext";

type SectionProps = {
  isOpen: boolean;
  onToggle: () => void;
  title: string;
};

function CollapsibleSection({
  isOpen,
  onToggle,
  title,
  children,
}: SectionProps & { children: React.ReactNode }) {
  return (
    <div className="mb-4 overflow-hidden rounded-md bg-gray-900">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full cursor-pointer items-center justify-between p-4 transition-colors hover:bg-gray-950"
      >
        <span className="text-lg font-semibold">{title}</span>
        {isOpen ? <FiChevronUp size={20} /> : <FiChevronDown size={20} />}
      </button>
      <div className={isOpen ? "block" : "hidden"}>{children}</div>
    </div>
  );
}

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
  const { state, openSections, actions } = useNewProductWizard();

  return (
    <CollapsibleSection
      isOpen={openSections.preview}
      onToggle={() => actions.toggleSection("preview")}
      title="پیش‌نمایش و تایید"
    >
      <div className="mb-6 p-4">
        <h2 className="mb-6 text-center text-xl font-bold">مراجعة اطلاعات محصول</h2>

        <div className="space-y-4 border-t border-gray-700 pt-4">
          <div className="grid gap-4 md:grid-cols-2">
            <PreviewField label="نام محصول" value={state.name} />
            <PreviewField label="شناسه محصول" value={state.slug} />
            <PreviewField label="دسته‌بندی" value={state.categoryID} />
            <PreviewField label="زیر دسته‌بندی" value={state.subCategoryID} />
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
              <div className="flex items-center gap-2 rounded bg-gray-800 p-2">
                <span className="text-gray-400">{index + 1}.</span>
                <span>{item}</span>
              </div>
            )}
          />

          <PreviewArray
            label="توضیحات محصول (انتخاب شده)"
            items={state.overviewDetails.filter((d) => d.selected)}
            renderItem={(item) => (
              <div className="rounded bg-gray-800 p-3">
                <p className="font-semibold">{item.Title}</p>
                <p className="text-sm text-gray-400">{item.Description}</p>
              </div>
            )}
          />

          <PreviewField label="مقاله محصول" value={state.productBlog ? "دارد" : "ندارد"} />

          <PreviewArray
            label="مشخصات"
            items={state.specs}
            renderItem={(item) => (
              <div className="rounded bg-gray-800 p-3">
                <p className="font-semibold">{item.title}</p>
                <p className="text-sm text-gray-400">{item.description}</p>
              </div>
            )}
          />

          <PreviewArray
            label="سوالات متداول"
            items={state.faqs}
            renderItem={(item, index) => (
              <div className="rounded bg-gray-800 p-3">
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
