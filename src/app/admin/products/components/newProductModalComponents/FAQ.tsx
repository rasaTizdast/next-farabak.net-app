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
};

const FAQ = ({ state, dispatch, setErrors }: Props) => {
  const [localFAQs, setLocalFAQs] = useState<FAQItem[]>(state.faqs);
  const [localErrors, setLocalErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    setErrors((prev) => ({ ...prev, ...localErrors }));
  }, [localErrors, setErrors]);

  const validateField = (field: string, value: string) => {
    let error = "";
    if (field === "question") {
      if (!value.trim()) error = "سوال نمی‌تواند خالی باشد.";
      else if (value.length > 200) error = "سوال نمی‌تواند بیشتر از ۲۰۰ کاراکتر باشد.";
    } else if (field === "answer") {
      if (!value.trim()) error = "پاسخ نمی‌تواند خالی باشد.";
      else if (value.length > 1000) error = "پاسخ نمی‌تواند بیشتر از ۱۰۰۰ کاراکتر باشد.";
    }
    return error;
  };

  const handleFAQChange = (index: number, field: string, value: string) => {
    const error = validateField(field, value);
    setLocalErrors((prev) => ({ ...prev, [`${field}-${index}`]: error }));

    const updatedFAQs = [...localFAQs];
    updatedFAQs[index] = { ...updatedFAQs[index], [field]: value };
    setLocalFAQs(updatedFAQs);
    dispatch({ type: "SET_FAQS", faqs: updatedFAQs });
  };

  const handleAddFAQ = () => {
    if (localFAQs.length < 12) {
      setLocalFAQs([...localFAQs, { question: "", answer: "" }]);
    }
  };

  const handleRemoveFAQ = (index: number) => {
    const updatedFAQs = localFAQs.filter((_, i) => i !== index);
    setLocalFAQs(updatedFAQs);
    dispatch({ type: "SET_FAQS", faqs: updatedFAQs });
  };

  return (
    <div className="mb-6 p-4">
      {localFAQs.map((faq, index) => (
        <div
          key={index}
          className="mb-10 flex flex-col gap-5 bg-gray-800 p-4 rounded-md shadow-lg"
        >
          <div className="flex items-center gap-4">
            <input
              type="text"
              value={faq.question}
              onChange={(e) =>
                handleFAQChange(index, "question", e.target.value)
              }
              className="w-full p-3 rounded-lg bg-gray-700 border border-gray-300"
              placeholder={`سوال ${index + 1}`}
            />
            {localErrors[`question-${index}`] && <p className="text-red-500 mt-1">{localErrors[`question-${index}`]}</p>}
            <button
              type="button"
              onClick={() => handleRemoveFAQ(index)}
              className="text-red-500 hover:text-red-600 transition-all"
            >
              <FaTrashAlt size={20} />
            </button>
          </div>
          <textarea
            value={faq.answer}
            onChange={(e) => handleFAQChange(index, "answer", e.target.value)}
            className="w-full p-3 rounded-lg bg-gray-700 border border-gray-300"
            placeholder={`پاسخ ${index + 1}`}
          />
          {localErrors[`answer-${index}`] && <p className="text-red-500 mt-1">{localErrors[`answer-${index}`]}</p>}
        </div>
      ))}
      <button
        type="button"
        onClick={handleAddFAQ}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-700"
        disabled={localFAQs.length >= 12}
      >
        افزودن سوال جدید
      </button>
    </div>
  );
};

export default FAQ;
