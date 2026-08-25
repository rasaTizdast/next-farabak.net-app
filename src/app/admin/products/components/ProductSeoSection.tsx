import React from "react";

import { Product } from "../types";
import { InputField, TextAreaField } from "./ProductFormFields";
import { InputChangeHandler } from "./ProductInputChange";

type ProductSeoSectionProps = {
  formState: Product;
  onChange: InputChangeHandler;
};

const ProductSeoSection: React.FC<ProductSeoSectionProps> = ({ formState, onChange }) => {
  return (
    <>
      <div className="col-span-1 block sm:col-span-2">
        <InputField
          label="عنوان SEO"
          name="SEO_Title"
          value={formState.SEO_Title}
          onChange={onChange}
        />
      </div>
      <TextAreaField
        label="توضیحات SEO"
        name="SEO_Description"
        value={formState.SEO_Description}
        onChange={onChange}
      />
    </>
  );
};

export default ProductSeoSection;
