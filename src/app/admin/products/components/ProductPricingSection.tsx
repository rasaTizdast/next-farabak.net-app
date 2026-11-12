import React from "react";

import { Product } from "../types";
import { InputField, SelectField } from "./ProductFormFields";
import { InputChangeHandler } from "./ProductInputChange";

type ProductPricingSectionProps = {
  formState: Product;
  setFormState: React.Dispatch<React.SetStateAction<Product | null>>;
  onChange: InputChangeHandler;
};

const ProductPricingSection: React.FC<ProductPricingSectionProps> = ({
  formState,
  setFormState,
  onChange,
}) => {
  const handleAvailableChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = e.target;
    setFormState((prevState) =>
      prevState
        ? {
            ...prevState,
            Available: value === "true",
          }
        : null
    );
  };

  return (
    <>
      <InputField
        label="قیمت (دلار)"
        name="Price"
        value={formState.Price}
        onChange={onChange}
        type="number"
        step="0.01"
      />
      <InputField
        label="تخفیف (دلار)"
        name="Discount"
        value={formState.Discount}
        onChange={onChange}
        type="number"
        step="0.01"
      />
      <div className="col-span-1 block sm:col-span-2">
        <SelectField
          label="وضعیت موجودی"
          name="Available"
          value={formState.Available ? "true" : "false"}
          onChange={handleAvailableChange}
          options={[
            { value: "true", label: "موجود" },
            { value: "false", label: "ناموجود" },
          ]}
        />
      </div>
    </>
  );
};

export default ProductPricingSection;
