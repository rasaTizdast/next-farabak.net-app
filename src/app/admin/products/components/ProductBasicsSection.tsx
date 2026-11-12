import React from "react";

import { Product } from "../types";
import { InputField } from "./ProductFormFields";
import { InputChangeHandler } from "./ProductInputChange";

type ProductBasicsSectionProps = {
  formState: Product;
  onChange: InputChangeHandler;
};

const ProductBasicsSection: React.FC<ProductBasicsSectionProps> = ({ formState, onChange }) => {
  return (
    <>
      <InputField label="نام محصول" name="Type" value={formState.Type} onChange={onChange} />
      <InputField label="توضیح محصول" name="Name" value={formState.Name} onChange={onChange} />
      <div className="col-span-1 block sm:col-span-2">
        <div className="flex items-center gap-2">
          <span>Slug</span>
          <div className="group relative">
            <span className="cursor-pointer text-gray-500 hover:text-blue-500">ℹ️</span>
            <div className="absolute top-full right-0 z-40 mt-1 hidden w-64 rounded bg-gray-700 p-3 text-justify text-sm text-white shadow-2xl group-hover:block">
              شناسه محصول (Slug) قابل ویرایش نیست.
            </div>
          </div>
        </div>
        <InputField
          label=""
          name="productSlug"
          value={formState.productSlug}
          onChange={onChange}
          disabled={true}
        />
      </div>
    </>
  );
};

export default ProductBasicsSection;
