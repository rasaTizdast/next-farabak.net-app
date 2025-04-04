import React, { useState, useEffect } from "react";
import { FaTrashAlt } from "react-icons/fa";
import axios from "axios";
import toast from "react-hot-toast";

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

  const handleFAQChange = (index: number, field: string, value: string) => {
    const updatedFAQs = [...localFaqs];
    updatedFAQs[index] = { ...updatedFAQs[index], [field]: value };
    setLocalFaqs(updatedFAQs);
    setFaqs(updatedFAQs); // Update parent's state
  };

  const handleAddFAQ = () => {
    if (localFaqs.length < 12) {
      const updatedFAQs = [...localFaqs, { question: "", answer: "" }];
      setLocalFaqs(updatedFAQs);
      setFaqs(updatedFAQs); // Update parent's state
    }
  };

  const handleRemoveFAQ = (index: number) => {
    const updatedFAQs = localFaqs.filter((_, i) => i !== index);
    setLocalFaqs(updatedFAQs);
    setFaqs(updatedFAQs); // Update parent's state
  };

  return (
    <div className="col-span-1 sm:col-span-2 border-b-4 border-b-gray-200 pb-5 mb-5">
      <div className="mb-4">
        <h3 className="text-lg font-semibold">سوالات متداول</h3>
      </div>

      {isLoading ? (
        <div className="text-center py-8">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-e-transparent align-[-0.125em] text-blue-500 motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
          <p className="mt-2">در حال بارگذاری سوالات متداول...</p>
        </div>
      ) : (
        <>
          {localFaqs.length === 0 ? (
            <div className="text-center py-8 bg-gray-800 rounded-md mb-4">
              <p className="text-gray-400 mb-4">
                هنوز هیچ سوال متداولی برای این محصول ثبت نشده است
              </p>
              <button
                type="button"
                onClick={handleAddFAQ}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-all"
              >
                افزودن اولین سوال
              </button>
            </div>
          ) : (
            <div className="space-y-4 mb-4">
              {localFaqs.map((faq, index) => (
                <div
                  key={index}
                  className="bg-gray-800 p-4 rounded-md shadow-md"
                >
                  <div className="flex items-center gap-4 mb-3">
                    <input
                      type="text"
                      value={faq.question}
                      onChange={(e) =>
                        handleFAQChange(index, "question", e.target.value)
                      }
                      className="flex-1 p-2 rounded-md bg-gray-700 border border-gray-600 text-white"
                      placeholder={`سوال ${index + 1}`}
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveFAQ(index)}
                      className="text-red-500 hover:text-red-600 transition-all"
                    >
                      <FaTrashAlt size={18} />
                    </button>
                  </div>
                  <textarea
                    value={faq.answer}
                    onChange={(e) =>
                      handleFAQChange(index, "answer", e.target.value)
                    }
                    className="w-full p-2 rounded-md bg-gray-700 border border-gray-600 text-white min-h-[100px]"
                    placeholder={`پاسخ ${index + 1}`}
                  />
                </div>
              ))}
            </div>
          )}

          {localFaqs.length > 0 && localFaqs.length < 12 && (
            <button
              type="button"
              onClick={handleAddFAQ}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md transition-all"
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
