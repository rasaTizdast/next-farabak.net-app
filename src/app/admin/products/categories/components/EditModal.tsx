import React, { useState, useEffect } from "react";
import { Category, Subcategory } from "../types/types";

interface EditModalProps {
  isOpen: boolean;
  item: Category | Subcategory | null;
  onClose: () => void;
  onSave: (updatedItem: Category | Subcategory) => void;
  onChange: (updatedFields: Partial<Category | Subcategory>) => void;
}

const EditModal: React.FC<EditModalProps> = ({
  isOpen,
  item,
  onClose,
  onSave,
  onChange,
}) => {
  const [keywordInput, setKeywordInput] = useState("");
  const [seoKeywords, setSeoKeywords] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({}); // Store errors for all fields

  useEffect(() => {
    if (item && item.SEO_Details) {
      const seoDetails = item.SEO_Details;
      let parsedKeywords = [];
      if (Array.isArray(seoDetails.SEO_Keywords)) {
        parsedKeywords = seoDetails.SEO_Keywords;
      } else if (typeof seoDetails.SEO_Keywords === "string") {
        try {
          parsedKeywords = JSON.parse(seoDetails.SEO_Keywords);
        } catch (e) {
          parsedKeywords = [];
        }
      }
      setSeoKeywords(parsedKeywords);
    }
  }, [item]);

  if (!isOpen || !item) return null;

  const seoDetails = item.SEO_Details || {
    SEO_Title: "",
    SEO_Description: "",
    SEO_Keywords: [],
  };

  // Regex patterns
  const regexPatterns = {
    Name: /^[a-zA-Z0-9-\u0600-\u06FF\s_-\u200C]{0,1000}$/, // Persian, English, numbers, up to 1000 characters
    Slug: /^[a-z0-9-]{0,200}$/, // Lowercase English, numbers, and dashes only, up to 200 characters
    SEO_Title: /^.{0,50}$/, // Any character, up to 50 characters
    SEO_Description: /^.{0,4000}$/, // Any character, up to 4000 characters
    SEO_Keywords: /^.{0,4000}$/, // Any character, up to 4000 characters (no commas restriction)
  };

  // Persian error messages
  const errorMessages = {
    Name: "نام باید حروف فارسی یا انگلیسی و حداکثر ۱۰۰۰ کاراکتر باشد.",
    Slug: "شناسه فقط باید حروف انگلیسی کوچک، اعداد و خط تیره باشد و حداکثر ۲۰۰ کاراکتر باشد.",
    SEO_Title: "عنوان سئو باید حداکثر ۵۰ کاراکتر باشد.",
    SEO_Description: "توضیحات سئو باید حداکثر ۴۰۰۰ کاراکتر باشد.",
    SEO_Keywords:
      "کلمه کلیدی نمی‌تواند شامل کاما باشد و حداکثر ۴۰۰۰ کاراکتر باشد.",
  };

  // Generic input change handler
  const handleInputChange = (field: string, value: any) => {
    // Clear input and errors if value is empty
    if (value === "") {
      setErrors((prev) => ({ ...prev, [field]: "" }));

      if (["SEO_Title", "SEO_Description"].includes(field)) {
        onChange({
          SEO_Details: { ...seoDetails, [field]: value },
        });
      } else {
        onChange({ [field]: value });
      }
      return;
    }

    // Slug auto-correction: replace spaces with dashes and lowercase
    if (field === "Slug") {
      value = value.replace(/\s+/g, "-").toLowerCase();
    }

    // Validate input using regex patterns
    const pattern = regexPatterns[field as keyof typeof regexPatterns];
    if (pattern && !pattern.test(value)) {
      setErrors((prev) => ({
        ...prev,
        [field]:
          errorMessages[field as keyof typeof errorMessages] || "خطای نامشخص",
      }));
    } else {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }

    // Update fields, handling SEO fields separately
    if (["SEO_Title", "SEO_Description"].includes(field)) {
      onChange({
        SEO_Details: { ...seoDetails, [field]: value },
      });
    } else {
      onChange({ [field]: value });
    }
  };
  // Handle adding a new keyword
  const addKeyword = (e: React.KeyboardEvent) => {
    if (
      e.key === "Enter" &&
      keywordInput.trim() &&
      regexPatterns.SEO_Keywords.test(keywordInput.trim()) &&
      !seoKeywords.includes(keywordInput.trim())
    ) {
      const updatedKeywords = [...seoKeywords, keywordInput.trim()];
      setSeoKeywords(updatedKeywords);
      onChange({
        SEO_Details: { ...seoDetails, SEO_Keywords: updatedKeywords },
      });
      setKeywordInput("");
    }
  };

  // Handle removing a keyword
  const removeKeyword = (keyword: string) => {
    const updatedKeywords = seoKeywords.filter((k) => k !== keyword);
    setSeoKeywords(updatedKeywords);
    onChange({
      SEO_Details: { ...seoDetails, SEO_Keywords: updatedKeywords },
    });
  };

  // Validate all fields before saving
  const validateAllFields = () => {
    const validationErrors: Record<string, string> = {};

    if (!regexPatterns.Slug.test(item.Slug || "")) {
      validationErrors.Slug = errorMessages.Slug;
    }

    setErrors(validationErrors);
    return Object.keys(validationErrors).length === 0;
  };

  // Handle save with validation
  const handleSave = () => {
    if (!validateAllFields()) return;

    onSave({
      ...item,
      SEO_Details: {
        ...seoDetails,
        SEO_Keywords: seoKeywords,
      },
    });
  };

  // Clear everything when modal is closed
  const handleClose = () => {
    setErrors({}); // Reset errors
    setKeywordInput(""); // Clear the keyword input
    onClose(); // Call the passed onClose handler
  };

  return (
    <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-gray-800 text-white p-6 pr-8 rounded-lg shadow-lg w-96 max-h-[95dvh] overflow-y-scroll">
        <h3 className="text-xl text-center mb-4">ویرایش</h3>
        {/* Name Field */}
        <div className="mb-4">
          <label className="block text-sm mb-2">نام</label>
          <input
            type="text"
            value={item.Name || ""}
            onChange={(e) => handleInputChange("Name", e.target.value)}
            className={`w-full p-2 border bg-gray-700 ${
              errors.Name ? "border-red-500" : "border-gray-900"
            } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
            placeholder="نام را وارد کنید"
          />
          {errors.Name && <p className="text-red-500 text-sm">{errors.Name}</p>}
        </div>

        {/* Slug Field */}
        <div className="mb-4">
          <label className="block text-sm mb-2">شناسه</label>
          <input
            type="text"
            value={item.Slug}
            onChange={(e) => handleInputChange("Slug", e.target.value)}
            className={`w-full p-2 border bg-gray-700 ${
              errors.Slug ? "border-red-500" : "border-gray-900"
            } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />
          {errors.Slug && <p className="text-red-500 text-sm">{errors.Slug}</p>}
        </div>
        {/* SEO Title Field */}
        <div className="mb-4">
          <label className="block text-sm mb-2">عنوان سئو</label>
          <input
            type="text"
            value={seoDetails.SEO_Title || ""} // Ensure fallback to an empty string
            onChange={(e) => handleInputChange("SEO_Title", e.target.value)}
            className={`w-full p-2 border bg-gray-700 ${
              errors.SEO_Title ? "border-red-500" : "border-gray-900"
            } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
            placeholder="عنوان سئو را وارد کنید"
          />
          {errors.SEO_Title && (
            <p className="text-red-500 text-sm">{errors.SEO_Title}</p>
          )}
        </div>

        {/* SEO Description Field */}
        <div className="mb-4">
          <label className="block text-sm mb-2">توضیحات سئو</label>
          <textarea
            value={seoDetails.SEO_Description || ""} // Ensure fallback to an empty string
            onChange={(e) =>
              handleInputChange("SEO_Description", e.target.value)
            }
            className={`w-full p-3 border bg-gray-700 ${
              errors.SEO_Description ? "border-red-500" : "border-gray-900"
            } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
            rows={3}
            placeholder="توضیحات سئو را وارد کنید"
          />
          {errors.SEO_Description && (
            <p className="text-red-500 text-sm">{errors.SEO_Description}</p>
          )}
        </div>

        {/* SEO Keywords Field */}
        <div className="mb-4">
          <label className="block text-sm mb-2">کلمات کلیدی سئو</label>
          <input
            type="text"
            value={keywordInput}
            onChange={(e) => setKeywordInput(e.target.value)}
            onKeyDown={addKeyword}
            placeholder="کلمه کلیدی را وارد کنید و Enter بزنید"
            className={`w-full p-2 border bg-gray-700 ${
              errors.SEO_Keywords ? "border-red-500" : "border-gray-900"
            } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />

          {errors.SEO_Keywords && (
            <p className="text-red-500 text-sm">{errors.SEO_Keywords}</p>
          )}

          <div className="flex gap-2 flex-wrap mt-3 mb-10">
            {seoKeywords.map((keyword: string) => (
              <button
                key={keyword}
                className="bg-green-700 px-4 py-1 rounded-lg flex items-center gap-2 hover:bg-red-700 hover:text-white animate-fade-in transition-all"
                onClick={() => removeKeyword(keyword)}
              >
                {keyword}
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={handleClose}
            className="px-4 py-2 bg-gray-50 text-black rounded hover:bg-gray-100"
          >
            بستن
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            ذخیره تغییرات
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditModal;
