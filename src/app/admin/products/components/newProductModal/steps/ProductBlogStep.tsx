"use client";

import React from "react";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";

import { TipTapEditor } from "@/components/editor/TipTapEditor";

import { useNewProductBlog } from "../hooks/useNewProductBlog";
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

export function ProductBlogStep() {
  const { handleContentChange, slug } = useNewProductBlog();
  const { openSections, actions } = useNewProductWizard();

  return (
    <CollapsibleSection
      isOpen={openSections.productBlog}
      onToggle={() => actions.toggleSection("productBlog")}
      title="توضیحات تکمیلی (مقاله محصول)"
    >
      <div className="p-4">
        {slug === "" ? (
          <h1 className="my-3 text-center font-extrabold text-red-300">
            ابتدا جزئیات پایه را وارد کنید، سپس مقاله را بنویسید.
          </h1>
        ) : (
          <>
            <h1 className="my-3 text-center font-extrabold text-red-300">
              محتوای مقاله به صورت خودکار ذخیره خواهد شد
            </h1>
            <TipTapEditor content="" onChange={handleContentChange} />
          </>
        )}
      </div>
    </CollapsibleSection>
  );
}
