"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { useNewProductWizard, type WizardErrors } from "../NewProductWizardContext";

function validateField(field: "title" | "description", value: string): string {
  if (field === "title") {
    if (!value.trim()) return "عنوان نمی‌تواند خالی باشد.";
    if (value.length > 100) return "عنوان نمی‌تواند بیشتر از ۱۰۰ کاراکتر باشد.";
  } else if (field === "description") {
    if (!value.trim()) return "توضیحات نمی‌تواند خالی باشد.";
    if (value.length > 4000) return "توضیحات نمی‌تواند بیشتر از 4000 کاراکتر باشد.";
  }
  return "";
}

export function useNewProductSpecs() {
  const { state, actions, hasSubmitted } = useNewProductWizard();

  const specsInitGuard = useRef(false);
  const [localErrors, setLocalErrors] = useState<{ [key: string]: string }>({});
  const [localTouchedFields, setLocalTouchedFields] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    if (!specsInitGuard.current) {
      specsInitGuard.current = true;
      const initialErrors: { [key: string]: string } = {};

      state.specs.forEach((spec, index) => {
        const titleError = validateField("title", spec.title);
        const descError = validateField("description", spec.description);

        if (titleError) initialErrors[`title-${index}`] = titleError;
        if (descError) initialErrors[`description-${index}`] = descError;
      });

      setLocalErrors(initialErrors);
    }
  }, [state.specs]);

  const addSpec = useCallback(() => {
    const newSpecs = [...state.specs, { title: "", description: "" }];
    actions.setSpecs(newSpecs);

    const newIndex = state.specs.length;
    setLocalErrors((prev) => ({
      ...prev,
      [`title-${newIndex}`]: "عنوان نمی‌تواند خالی باشد.",
      [`description-${newIndex}`]: "توضیحات نمی‌تواند خالی باشد.",
    }));

    setLocalTouchedFields((prev) => ({
      ...prev,
      [`title-${newIndex}`]: false,
      [`description-${newIndex}`]: false,
    }));
  }, [state.specs, actions]);

  const removeSpec = useCallback(
    (index: number) => {
      const newSpecs = state.specs.filter((_, i) => i !== index);
      actions.setSpecs(newSpecs);

      setLocalErrors((prev) => {
        const updatedErrors = { ...prev };
        delete updatedErrors[`title-${index}`];
        delete updatedErrors[`description-${index}`];

        const finalErrors: { [key: string]: string } = {};
        newSpecs.forEach((_, newIndex) => {
          const oldIndex = newIndex >= index ? newIndex + 1 : newIndex;
          if (updatedErrors[`title-${oldIndex}`]) {
            finalErrors[`title-${newIndex}`] = updatedErrors[`title-${oldIndex}`];
          }
          if (updatedErrors[`description-${oldIndex}`]) {
            finalErrors[`description-${newIndex}`] = updatedErrors[`description-${oldIndex}`];
          }
        });
        return finalErrors;
      });

      setLocalTouchedFields((prev) => {
        const updated = { ...prev };
        delete updated[`title-${index}`];
        delete updated[`description-${index}`];

        const finalTouched: { [key: string]: boolean } = {};
        newSpecs.forEach((_, newIndex) => {
          const oldIndex = newIndex >= index ? newIndex + 1 : newIndex;
          if (updated[`title-${oldIndex}`] !== undefined) {
            finalTouched[`title-${newIndex}`] = updated[`title-${oldIndex}`];
          }
          if (updated[`description-${oldIndex}`] !== undefined) {
            finalTouched[`description-${newIndex}`] = updated[`description-${oldIndex}`];
          }
        });
        return finalTouched;
      });
    },
    [state.specs, actions]
  );

  const handleSpecChange = useCallback(
    (index: number, field: "title" | "description", value: string) => {
      setLocalTouchedFields((prev) => ({
        ...prev,
        [`${field}-${index}`]: true,
      }));

      const newSpecs = [...state.specs];
      newSpecs[index][field] = value;
      actions.setSpecs(newSpecs);

      const error = validateField(field, value);
      setLocalErrors((prev) => {
        const updated = { ...prev };
        if (error) {
          updated[`${field}-${index}`] = error;
        } else {
          delete updated[`${field}-${index}`];
        }
        return updated;
      });
    },
    [state.specs, actions]
  );

  useEffect(() => {
    const specsErrors: { [key: string]: string } = {};
    Object.entries(localErrors).forEach(([key, value]) => {
      if (value) {
        specsErrors[`specs-${key}`] = value;
      }
    });

    actions.setErrors((prevErrors: WizardErrors) => {
      const newErrors = { ...prevErrors };
      Object.keys(newErrors).forEach((key) => {
        if (key.startsWith("specs-")) {
          delete newErrors[key];
        }
      });
      Object.entries(specsErrors).forEach(([key, value]) => {
        newErrors[key] = value;
      });
      return newErrors;
    });
  }, [localErrors, actions]);

  const shouldShowError = useCallback(
    (field: "title" | "description", index: number) => {
      const fieldKey = `${field}-${index}`;
      return (hasSubmitted || localTouchedFields[fieldKey]) && !!localErrors[fieldKey];
    },
    [hasSubmitted, localTouchedFields, localErrors]
  );

  const handleTemplateSelect = useCallback(
    (templateSpecs: { title: string; description: string }[]) => {
      const newSpecs = [...state.specs, ...templateSpecs];
      actions.setSpecs(newSpecs);

      const startIndex = state.specs.length;
      setLocalErrors((prev) => {
        const newErrors = { ...prev };
        templateSpecs.forEach((spec, idx) => {
          const currentIndex = startIndex + idx;
          const titleError = validateField("title", spec.title);
          const descError = validateField("description", spec.description);
          if (titleError) newErrors[`title-${currentIndex}`] = titleError;
          if (descError) newErrors[`description-${currentIndex}`] = descError;
        });
        return newErrors;
      });

      setLocalTouchedFields((prev) => {
        const newTouched = { ...prev };
        templateSpecs.forEach((_, idx) => {
          const currentIndex = startIndex + idx;
          newTouched[`title-${currentIndex}`] = false;
          newTouched[`description-${currentIndex}`] = false;
        });
        return newTouched;
      });
    },
    [state.specs, actions]
  );

  return {
    specs: state.specs,
    errors: localErrors,
    touchedFields: localTouchedFields,
    addSpec,
    removeSpec,
    handleSpecChange,
    shouldShowError,
    handleTemplateSelect,
  };
}
