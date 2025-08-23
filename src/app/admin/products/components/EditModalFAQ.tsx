import axios from "axios";
import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { FaTrashAlt } from "react-icons/fa";

type FAQItem = {
  question: string;
  answer: string;
};

type Props = {
  productId: number;
  setFaqs: (faqs: FAQItem[]) => void;
};

const EditModalFAQ: React.FC<Props> = ({ productId, setFaqs }) => {
  const [localFaqs, setLocalFaqs] = useState<FAQItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [localErrors, setLocalErrors] = useState<{ [key: string]: string }>({});
  const [touchedFields, setTouchedFields] = useState<{
    [key: string]: boolean;
  }>({});

  // Fetch existing FAQs when the component mounts
  useEffect(() => {
    const fetchFAQs = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(`/api/faqs/product/${productId}`);
        // Map API response format to our internal format
        const mappedFaqs = response.data.map((faq: any) => ({
          question: faq.Title,
          answer: faq.Description,
        }));
        setLocalFaqs(mappedFaqs);
        setFaqs(mappedFaqs); // Update parent's state

        // Initialize validation for existing FAQs
        const initialErrors: { [key: string]: string } = {};
        mappedFaqs.forEach((faq, index) => {
          initialErrors[`question-${index}`] = validateField("question", faq.question);
          initialErrors[`answer-${index}`] = validateField("answer", faq.answer);
        });
        setLocalErrors(initialErrors);
      } catch (error) {
        console.error("Error fetching FAQs:", error);
        toast.error("در بارگذاری سوالات متداول مشکلی پیش آمد");
      } finally {
        setIsLoading(false);
      }
    };

    if (productId) {
      fetchFAQs();
    }
  }, [productId, setFaqs]);

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

  // Helper to determine if we should show an error for a field
  const shouldShowError = (field: string, index: number): boolean => {
    const fieldKey = `${field}-${index}`;
    return touchedFields[fieldKey] && !!localErrors[fieldKey];
  };

  const handleFAQChange = (index: number, field: string, value: string) => {
    // Mark field as touched
    setTouchedFields((prev) => ({
      ...prev,
      [`${field}-${index}`]: true,
    }));

    // Validate field
    const error = validateField(field, value);
    setLocalErrors((prev) => ({ ...prev, [`${field}-${index}`]: error }));

    const updatedFAQs = [...localFaqs];
    updatedFAQs[index] = { ...updatedFAQs[index], [field]: value };
    setLocalFaqs(updatedFAQs);

    // Always update parent to ensure validation is triggered
    setFaqs(updatedFAQs);
  };

  const handleAddFAQ = () => {
    if (localFaqs.length < 12) {
      const newIndex = localFaqs.length;
      const updatedFAQs = [...localFaqs, { question: "", answer: "" }];
      setLocalFaqs(updatedFAQs);
      setFaqs(updatedFAQs); // Update parent's state

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
    const updatedFAQs = localFaqs.filter((_, i) => i !== index);
    setLocalFaqs(updatedFAQs);
    setFaqs(updatedFAQs); // Update parent's state

    // Remove validation errors for the deleted fields
    const updatedErrors = { ...localErrors };
    delete updatedErrors[`question-${index}`];
    delete updatedErrors[`answer-${index}`];
    setLocalErrors(updatedErrors);

    // Update error keys for remaining items after the deleted index
    const newErrors = { ...updatedErrors };
    for (let i = index + 1; i < localFaqs.length; i++) {
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
    for (let i = index + 1; i < localFaqs.length; i++) {
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
    <div className="col-span-1 mb-5 border-b-4 border-b-gray-200 pb-5 sm:col-span-2">
      <div className="mb-4">
        <h3 className="text-lg font-semibold">سوالات متداول</h3>
      </div>

      {isLoading ? (
        <div className="py-8 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-e-transparent align-[-0.125em] text-blue-500 motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
          <p className="mt-2">در حال بارگذاری سوالات متداول...</p>
        </div>
      ) : (
        <>
          {localFaqs.length === 0 ? (
            <div className="mb-4 rounded-md bg-gray-800 py-8 text-center">
              <p className="mb-4 text-gray-400">
                هنوز هیچ سوال متداولی برای این محصول ثبت نشده است
              </p>
              <button
                type="button"
                onClick={handleAddFAQ}
                className="rounded-md bg-blue-600 px-4 py-2 text-white transition-all hover:bg-blue-700"
              >
                افزودن اولین سوال
              </button>
            </div>
          ) : (
            <div className="mb-4 space-y-4">
              {localFaqs.map((faq, index) => (
                <div key={index} className="rounded-md bg-gray-800 p-4 shadow-md">
                  <div className="mb-3 flex items-center gap-4">
                    <div className="flex flex-1 flex-col">
                      <input
                        type="text"
                        value={faq.question}
                        onChange={(e) => handleFAQChange(index, "question", e.target.value)}
                        className={`w-full rounded-md border bg-gray-700 p-2 ${
                          shouldShowError("question", index) ? "border-red-500" : "border-gray-600"
                        } text-white`}
                        placeholder={`سوال ${index + 1}`}
                      />
                      {shouldShowError("question", index) && (
                        <p className="mt-1 text-sm text-red-500">
                          {localErrors[`question-${index}`]}
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveFAQ(index)}
                      className="text-red-500 transition-all hover:text-red-600"
                    >
                      <FaTrashAlt size={18} />
                    </button>
                  </div>
                  <div className="flex flex-col">
                    <textarea
                      value={faq.answer}
                      onChange={(e) => handleFAQChange(index, "answer", e.target.value)}
                      className={`w-full rounded-md border bg-gray-700 p-2 ${
                        shouldShowError("answer", index) ? "border-red-500" : "border-gray-600"
                      } min-h-[100px] text-white`}
                      placeholder={`پاسخ ${index + 1}`}
                    />
                    {shouldShowError("answer", index) && (
                      <p className="mt-1 text-sm text-red-500">{localErrors[`answer-${index}`]}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {localFaqs.length > 0 && localFaqs.length < 12 && (
            <button
              type="button"
              onClick={handleAddFAQ}
              className="w-full rounded-md bg-blue-600 px-4 py-2 text-white transition-all hover:bg-blue-700"
            >
              افزودن سوال جدید
            </button>
          )}
        </>
      )}
    </div>
  );
};

export default EditModalFAQ;
