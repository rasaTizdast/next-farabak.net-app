"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { useNewProductWizard, type WizardErrors } from "../NewProductWizardContext";

function validateFeature(value: string): string {
  if (!value.trim()) return "ویژگی نمی‌تواند خالی باشد.";
  if (value.length > 300) return "ویژگی نمی‌تواند بیشتر از ۳۰۰ کاراکتر باشد.";
  return "";
}

export function useNewProductFeatures() {
  const { state, actions, touchedFields, hasSubmitted } = useNewProductWizard();

  const featuresInitGuard = useRef(false);
  const [localFeatures, setLocalFeatures] = useState<string[]>(() => state.features);
  const [localErrors, setLocalErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (!featuresInitGuard.current) {
      featuresInitGuard.current = true;
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Initialize local editable features state from wizard data once, guarded by ref.
      setLocalFeatures(state.features);

      const initialErrors: Record<string, string> = {};
      state.features.forEach((feature, index) => {
        const error = validateFeature(feature);
        if (error) {
          initialErrors[`feature-${index}`] = error;
        }
      });
      setLocalErrors(initialErrors);
    }
  }, [state.features]);

  const handleFeatureChange = useCallback(
    (index: number, value: string) => {
      const error = validateFeature(value);
      setLocalErrors((prev) => ({ ...prev, [`feature-${index}`]: error }));

      const updatedFeatures = [...localFeatures];
      updatedFeatures[index] = value;
      setLocalFeatures(updatedFeatures);
      actions.setFeatures(updatedFeatures);
    },
    [localFeatures, actions]
  );

  const handleFeatureAdd = useCallback(() => {
    if (localFeatures.length < 4) {
      const newIndex = localFeatures.length;
      const updatedFeatures = [...localFeatures, ""];
      setLocalFeatures(updatedFeatures);
      actions.setFeatures(updatedFeatures);

      setLocalErrors((prev) => ({
        ...prev,
        [`feature-${newIndex}`]: "ویژگی نمی‌تواند خالی باشد.",
      }));
    }
  }, [localFeatures, actions]);

  const handleFeatureRemove = useCallback(
    (index: number) => {
      const updatedFeatures = localFeatures.filter((_, i) => i !== index);
      setLocalFeatures(updatedFeatures);
      actions.setFeatures(updatedFeatures);

      const newErrors: Record<string, string> = {};
      Object.entries(localErrors).forEach(([key, value]) => {
        const match = key.match(/feature-(\d+)/);
        if (match) {
          const errorIndex = parseInt(match[1]);
          if (errorIndex < index) {
            newErrors[key] = value;
          } else if (errorIndex > index) {
            newErrors[`feature-${errorIndex - 1}`] = value;
          }
        }
      });
      setLocalErrors(newErrors);
    },
    [localFeatures, localErrors, actions]
  );

  useEffect(() => {
    const formattedErrors: Record<string, string> = {};
    Object.entries(localErrors).forEach(([key, value]) => {
      if (value) {
        formattedErrors[`features-${key}`] = value;
      }
    });

    if (localFeatures.length === 0) {
      formattedErrors["features"] = "حداقل یک ویژگی الزامی است";
    } else {
      const hasInvalidFeatures = localFeatures.some(
        (_, index) => !!localErrors[`feature-${index}`]
      );
      if (hasInvalidFeatures) {
        formattedErrors["features"] = "لطفاً خطاهای ویژگی‌ها را برطرف کنید";
      } else {
        formattedErrors["features"] = "";
      }
    }

    actions.setErrors((prev: WizardErrors) => {
      const newErrors = { ...prev };
      Object.keys(newErrors).forEach((key) => {
        if (key.startsWith("features-") || key === "features") {
          delete newErrors[key];
        }
      });
      return { ...newErrors, ...formattedErrors };
    });
  }, [localErrors, localFeatures, actions]);

  const shouldShowError = useCallback(
    (index: number) => {
      return (
        (hasSubmitted || touchedFields[`feature-${index}`]) && !!localErrors[`feature-${index}`]
      );
    },
    [hasSubmitted, touchedFields, localErrors]
  );

  return {
    features: localFeatures,
    errors: localErrors,
    handleFeatureChange,
    handleFeatureAdd,
    handleFeatureRemove,
    shouldShowError,
    canAddMore: localFeatures.length < 4,
  };
}
