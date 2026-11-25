"use client";

import React from "react";

import { ProductBlogEditor } from "@/app/admin/products/components/ProductBlogEditor";

import { CollapsibleSection } from "../components/CollapsibleSection";
import { useNewProductBlog } from "../hooks/useNewProductBlog";
import { useNewProductWizard } from "../NewProductWizardContext";

export function ProductBlogStep() {
  const { handleContentChange, slug, productBlog } = useNewProductBlog();
  const { openSections, actions } = useNewProductWizard();

  return (
    <CollapsibleSection
      isOpen={openSections.productBlog}
      onToggle={() => actions.toggleSection("productBlog")}
      sectionId="productBlog"
      title="توضیحات تکمیلی (مقاله محصول)"
    >
      <div className="p-4">
        {slug === "" ? (
          <p className="my-3 text-center font-extrabold text-red-300">
            ابتدا جزئیات پایه را وارد کنید، سپس مقاله را بنویسید.
          </p>
        ) : (
          <>
            <p className="my-3 text-center font-extrabold text-red-300">
              محتوای مقاله به صورت خودکار ذخیره خواهد شد
            </p>
            <ProductBlogEditor value={productBlog} onChange={handleContentChange} />
          </>
        )}
      </div>
    </CollapsibleSection>
  );
}
