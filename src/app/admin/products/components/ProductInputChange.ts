import React from "react";
import toast from "react-hot-toast";

import { Product } from "../types";
import { validationRules } from "./ProductValidation";

export type InputChangeHandler = (
  e:
    | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    | { target: { name: string; value: string } }
) => void;

export function createInputChangeHandler(
  setFormState: React.Dispatch<React.SetStateAction<Product | null>>
): InputChangeHandler {
  return (e) => {
    const { name, value } = e.target;

    if (name === "Price" || name === "Discount") {
      if (value && !validationRules[name].regex?.test(value)) {
        toast.error(validationRules[name].errorMsg.regex || "فرمت عددی نامعتبر است.");
        return;
      }

      const parts = value.toString().split(".");
      if (parts.length > 1 && parts[1].length > 2) {
        const truncated = parseFloat(parseFloat(value).toFixed(2));
        setFormState((prevState) => (prevState ? { ...prevState, [name]: truncated } : null));
        return;
      }
    }

    if (name === "productSlug") {
      const sanitizedValue = value.replace(/\s+/g, "-");
      if (!validationRules.productSlug.regex?.test(sanitizedValue)) {
        toast.error(validationRules.productSlug.errorMsg.regex || "فرمت شناسه محصول نامعتبر است.");
      }

      setFormState((prevState) => (prevState ? { ...prevState, [name]: sanitizedValue } : null));
      return;
    }

    const rule = validationRules[name];
    if (rule?.maxLength && value.length > rule.maxLength * 0.9) {
      toast.error(`نزدیک به حد مجاز هستید (${value.length}/${rule.maxLength} کارکتر)`);
    }

    setFormState((prevState) =>
      prevState
        ? {
            ...prevState,
            [name]: value,
          }
        : null
    );
  };
}
