"use client";

import { useCallback } from "react";

import { useNewProductWizard } from "../NewProductWizardContext";

const baseFields = [
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
  "available",
] as const;

export function useNewProductForm() {
  const { state, actions, errors, touchedFields, hasSubmitted } = useNewProductWizard();

  const handleChange = useCallback(
    <K extends keyof typeof state>(field: K, value: (typeof state)[K]) => {
      actions.setField(field, value);
    },
    [actions]
  );

  const handleBlur = useCallback(
    (field: keyof typeof state) => {
      actions.setTouchedField(field, true);
    },
    [actions]
  );

  const getFieldError = useCallback(
    (field: keyof typeof state) => {
      const fieldErrors = errors[field];
      if (!fieldErrors) return "";
      if (!hasSubmitted && !touchedFields[field]) return "";
      return fieldErrors;
    },
    [errors, touchedFields, hasSubmitted]
  );

  const getFieldProps = useCallback(
    (field: keyof typeof state) => {
      const value = state[field];
      const inputValue =
        typeof value === "string"
          ? value
          : typeof value === "number"
            ? value
            : value === null || value === undefined
              ? ""
              : Array.isArray(value)
                ? value.join(",")
                : String(value);

      return {
        value: inputValue,
        onChange: (
          e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
        ) => {
          const target = e.target as HTMLInputElement;
          const newValue = target.type === "checkbox" ? target.checked : target.value;
          handleChange(field, newValue);
        },
        onBlur: () => handleBlur(field),
      };
    },
    [state, handleChange, handleBlur]
  );

  const validateAll = useCallback(() => {
    return actions.validateAllFields();
  }, [actions]);

  return {
    state,
    errors,
    touchedFields,
    hasSubmitted,
    baseFields,
    handleChange,
    handleBlur,
    getFieldError,
    getFieldProps,
    validateAll,
  };
}
