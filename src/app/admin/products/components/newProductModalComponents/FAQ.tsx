import React, { useState, useEffect } from "react";
import { FaTrashAlt } from "react-icons/fa";

type FAQItem = {
  question: string;
  answer: string;
};

type State = {
  faqs: FAQItem[];
};

type Props = {
  state: State;
  dispatch: React.Dispatch<any>;
  setErrors: React.Dispatch<React.SetStateAction<{ [key: string]: string }>>;
  hasSubmitted?: boolean; // Add prop for form submission state
};

const FAQ = ({ state, dispatch, setErrors, hasSubmitted = false }: Props) => {
  const [localFAQs, setLocalFAQs] = useState<FAQItem[]>(state.faqs);
  const [localErrors, setLocalErrors] = useState<{ [key: string]: string }>({});
  const [touchedFields, setTouchedFields] = useState<{
    [key: string]: boolean;
  }>({});

  // Enhanced useEffect to properly send all errors to parent
  useEffect(() => {
    // Format errors with proper prefixes for parent component
    const formattedErrors = {};
    Object.entries(localErrors).forEach(([key, value]) => {
      if (value) {
        formattedErrors[`faq-${key}`] = value;
      }
    });

    // Send errors to parent component
    setErrors((prev) => {
      const newErrors = { ...prev };

      // First, remove all existing FAQ errors
      Object.keys(newErrors).forEach((key) => {
        if (key.startsWith("faq-")) {
          delete newErrors[key];
        }
      });

      // Then add the current FAQ errors
      return { ...newErrors, ...formattedErrors };
    });

    // Log errors if needed
    if (Object.keys(formattedErrors).length > 0) {
      console.log("FAQ validation errors:", formattedErrors);
    }
  }, [localErrors, setErrors]);

  // Initialize validation for existing FAQs
  useEffect(() => {
    const initialErrors: { [key: string]: string } = {};

    localFAQs.forEach((faq, index) => {
      initialErrors[`question-${index}`] = validateField("question", faq.question);
      initialErrors[`answer-${index}`] = validateField("answer", faq.answer);
    });

    setLocalErrors(initialErrors);
  }, [state.faqs]);

  const validateField = (field: string, value: string) => {
    let error = "";
    if (field === "question") {
      if (!value.trim()) error = "سوال نمی‌تواند خالی باشد.";
      else if (value.length > 1000) error = "سوال نمی‌تواند بیشتر از ۱۰۰۰ کاراکتر باشد.";
    } else if (field === "answer") {
      if (!value.trim()) error = "پاسخ نمی‌تواند خالی باشد.";
      else if (value.length > 3000) error = "پاسخ نمی‌تواند بیشتر از ۳۰۰۰ کاراکتر باشد.";
    }
    return error;
  };

  const handleFAQChange = (index: number, field: string, value: string) => {
    // Mark field as touched
    setTouchedFields((prev) => ({
      ...prev,
      [`${field}-${index}`]: true,
    }));

    const error = validateField(field, value);
    setLocalErrors((prev) => ({ ...prev, [`${field}-${index}`]: error }));

    const updatedFAQs = [...localFAQs];
    updatedFAQs[index] = { ...updatedFAQs[index], [field]: value };
    setLocalFAQs(updatedFAQs);
    dispatch({ type: "SET_FAQS", faqs: updatedFAQs });
  };

  // Helper to determine if we should show an error for a field
  const shouldShowError = (field: string, index: number): boolean => {
    const fieldKey = `${field}-${index}`;
    return (hasSubmitted || touchedFields[fieldKey]) && !!localErrors[fieldKey];
  };

  const handleAddFAQ = () => {
    if (localFAQs.length < 12) {
      const newIndex = localFAQs.length;
      const updatedFAQs = [...localFAQs, { question: "", answer: "" }];
      setLocalFAQs(updatedFAQs);
      dispatch({ type: "SET_FAQS", faqs: updatedFAQs });

      // Add validation errors for the new empty fields
      setLocalErrors((prev) => ({
        ...prev,
        [`question-${newIndex}`]: "سوال نمی‌تواند خالی باشد.",
        [`answer-${newIndex}`]: "پاسخ نمی‌تواند خالی باشد.",
      }));

      // Mark new fields as untouched initially
      setTouchedFields((prev) => ({
        ...prev,
        [`question-${newIndex}`]: false,
        [`answer-${newIndex}`]: false,
      }));
    }
  };

  const handleRemoveFAQ = (index: number) => {
    const updatedFAQs = localFAQs.filter((_, i) => i !== index);
    setLocalFAQs(updatedFAQs);
    dispatch({ type: "SET_FAQS", faqs: updatedFAQs });

    // Remove validation errors for the deleted fields
    const updatedErrors = { ...localErrors };
    delete updatedErrors[`question-${index}`];
    delete updatedErrors[`answer-${index}`];
    setLocalErrors(updatedErrors);

    // Update error keys for remaining items after the deleted index
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

    // Also update touched fields
    const updatedTouched = { ...touchedFields };
    delete updatedTouched[`question-${index}`];
    delete updatedTouched[`answer-${index}`];

    // Reindex touched fields
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
    setTouchedFields(newTouched);
  };

  return (
    <div className="mb-6 p-4">
      {localFAQs.map((faq, index) => (
        <div key={index} className="mb-10 flex flex-col gap-5 rounded-md bg-gray-800 p-4 shadow-lg">
          <div className="flex items-center gap-4">
            <input
              type="text"
              data-testid={`faq-question-${index}`}
              value={faq.question}
              onChange={(e) => handleFAQChange(index, "question", e.target.value)}
              className={`w-full rounded-lg border bg-gray-700 p-3 ${
                shouldShowError("question", index) ? "border-red-500" : "border-gray-300"
              }`}
              placeholder={`سوال ${index + 1}`}
            />
            {shouldShowError("question", index) && (
              <p className="mt-1 text-red-500">{localErrors[`question-${index}`]}</p>
            )}
            <button
              type="button"
              data-testid={`remove-faq-${index}`}
              onClick={() => handleRemoveFAQ(index)}
              className="text-red-500 transition-all hover:text-red-600"
            >
              <FaTrashAlt size={20} />
            </button>
          </div>
          <textarea
            data-testid={`faq-answer-${index}`}
            value={faq.answer}
            onChange={(e) => handleFAQChange(index, "answer", e.target.value)}
            className={`w-full rounded-lg border bg-gray-700 p-3 ${
              shouldShowError("answer", index) ? "border-red-500" : "border-gray-300"
            }`}
            placeholder={`پاسخ ${index + 1}`}
          />
          {shouldShowError("answer", index) && (
            <p className="mt-1 text-red-500">{localErrors[`answer-${index}`]}</p>
          )}
        </div>
      ))}
      <button
        type="button"
        data-testid="add-faq-button"
        onClick={handleAddFAQ}
        className="w-full rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-700"
        disabled={localFAQs.length >= 12}
      >
        افزودن سوال جدید
      </button>
    </div>
  );
};

export default FAQ;
