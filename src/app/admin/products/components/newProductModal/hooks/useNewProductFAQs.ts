"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { useNewProductWizard, type WizardErrors } from "../NewProductWizardContext";

export function useNewProductFAQs() {
  const { state, actions, hasSubmitted } = useNewProductWizard();

  const faqInitGuard = useRef(false);
  const [localFAQs, setLocalFAQs] = useState<{ question: string; answer: string }[]>(
    () => state.faqs
  );
  const [localErrors, setLocalErrors] = useState<{ [key: string]: string }>({});
  const [localTouchedFields, setLocalTouchedFields] = useState<{ [key: string]: boolean }>({});

  const validateField = useCallback((field: "question" | "answer", value: string) => {
    let error = "";
    if (field === "question") {
      if (!value.trim()) error = "سوال نمی‌تواند خالی باشد.";
      else if (value.length > 1000) error = "سوال نمی‌تواند بیشتر از ۱۰۰۰ کاراکتر باشد.";
    } else if (field === "answer") {
      if (!value.trim()) error = "پاسخ نمی‌تواند خالی باشد.";
      else if (value.length > 3000) error = "پاسخ نمی‌تواند بیشتر از ۳۰۰۰ کاراکتر باشد.";
    }
    return error;
  }, []);

  useEffect(() => {
    if (!faqInitGuard.current) {
      faqInitGuard.current = true;
      const initialErrors: { [key: string]: string } = {};
      state.faqs.forEach((faq, index) => {
        initialErrors[`question-${index}`] = validateField("question", faq.question);
        initialErrors[`answer-${index}`] = validateField("answer", faq.answer);
      });
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Initialize local validation state from wizard FAQ data once, guarded by ref.
      setLocalErrors(initialErrors);
    }
  }, [state.faqs, validateField]);

  useEffect(() => {
    const formattedErrors: Record<string, string> = {};
    Object.entries(localErrors).forEach(([key, value]) => {
      if (value) {
        formattedErrors[`faq-${key}`] = value;
      }
    });

    actions.setErrors((prev: WizardErrors) => {
      const newErrors = { ...prev };
      Object.keys(newErrors).forEach((key) => {
        if (key.startsWith("faq-")) delete newErrors[key];
      });
      return { ...newErrors, ...formattedErrors };
    });
  }, [localErrors, actions]);

  const handleFAQChange = useCallback(
    (index: number, field: "question" | "answer", value: string) => {
      setLocalTouchedFields((prev) => ({
        ...prev,
        [`${field}-${index}`]: true,
      }));

      const error = validateField(field, value);
      setLocalErrors((prev) => ({ ...prev, [`${field}-${index}`]: error }));

      const updatedFAQs = [...localFAQs];
      updatedFAQs[index] = { ...updatedFAQs[index], [field]: value };
      setLocalFAQs(updatedFAQs);
      actions.setFaqs(updatedFAQs);
    },
    [localFAQs, actions, validateField]
  );

  const handleAddFAQ = useCallback(() => {
    if (localFAQs.length < 12) {
      const newIndex = localFAQs.length;
      const updatedFAQs = [...localFAQs, { question: "", answer: "" }];
      setLocalFAQs(updatedFAQs);
      actions.setFaqs(updatedFAQs);

      setLocalErrors((prev) => ({
        ...prev,
        [`question-${newIndex}`]: "سوال نمی‌تواند خالی باشد.",
        [`answer-${newIndex}`]: "پاسخ نمی‌تواند خالی باشد.",
      }));

      setLocalTouchedFields((prev) => ({
        ...prev,
        [`question-${newIndex}`]: false,
        [`answer-${newIndex}`]: false,
      }));
    }
  }, [localFAQs, actions]);

  const handleRemoveFAQ = useCallback(
    (index: number) => {
      const updatedFAQs = localFAQs.filter((_, i) => i !== index);
      setLocalFAQs(updatedFAQs);
      actions.setFaqs(updatedFAQs);

      const updatedErrors = { ...localErrors };
      delete updatedErrors[`question-${index}`];
      delete updatedErrors[`answer-${index}`];
      setLocalErrors(updatedErrors);

      const newErrors = { ...updatedErrors };
      for (let i = index + 1; i < localFAQs.length; i++) {
        if (updatedErrors[`question-${i}`]) {
          newErrors[`question-${i - 1}`] = updatedErrors[`question-${i}`];
          delete newErrors[`question-${i}`];
        }
        if (updatedErrors[`answer-${i}`]) {
          newErrors[`answer-${i - 1}`] = updatedErrors[`answer-${i}`];
          delete newErrors[`answer-${i}`];
        }
      }
      setLocalErrors(newErrors);

      const updatedTouched = { ...localTouchedFields };
      delete updatedTouched[`question-${index}`];
      delete updatedTouched[`answer-${index}`];

      const newTouched = { ...updatedTouched };
      for (let i = index + 1; i < localFAQs.length; i++) {
        if (updatedTouched[`question-${i}`] !== undefined) {
          newTouched[`question-${i - 1}`] = updatedTouched[`question-${i}`];
          delete newTouched[`question-${i}`];
        }
        if (updatedTouched[`answer-${i}`] !== undefined) {
          newTouched[`answer-${i - 1}`] = updatedTouched[`answer-${i}`];
          delete newTouched[`answer-${i}`];
        }
      }
      setLocalTouchedFields(newTouched);
    },
    [localFAQs, localErrors, localTouchedFields, actions]
  );

  const shouldShowError = useCallback(
    (field: "question" | "answer", index: number): boolean => {
      const fieldKey = `${field}-${index}`;
      return (hasSubmitted || localTouchedFields[fieldKey]) && !!localErrors[fieldKey];
    },
    [hasSubmitted, localTouchedFields, localErrors]
  );

  return {
    faqs: localFAQs,
    errors: localErrors,
    touchedFields: localTouchedFields,
    handleFAQChange,
    handleAddFAQ,
    handleRemoveFAQ,
    shouldShowError,
    canAddMore: localFAQs.length < 12,
  };
}
