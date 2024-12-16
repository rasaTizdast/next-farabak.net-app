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
  const [seoKeywords, setSeoKeywords] = useState<string[]>([]); // Local state for SEO Keywords

  useEffect(() => {
    if (item && item.SEO_Details) {
      const seoDetails = item.SEO_Details;
      // Ensure that SEO_Keywords is always an array
      let parsedKeywords = [];
      if (Array.isArray(seoDetails.SEO_Keywords)) {
        parsedKeywords = seoDetails.SEO_Keywords;
      } else if (typeof seoDetails.SEO_Keywords === "string") {
        try {
          parsedKeywords = JSON.parse(seoDetails.SEO_Keywords);
        } catch (e) {
          parsedKeywords = []; // Default to empty array if parsing fails
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

  // Handle adding a new keyword
  const addKeyword = (e: React.KeyboardEvent) => {
    if (
      e.key === "Enter" &&
      keywordInput.trim() &&
      !seoKeywords.includes(keywordInput.trim())
    ) {
      const updatedKeywords = [...seoKeywords, keywordInput.trim()];
      setSeoKeywords(updatedKeywords); // Update local state
      onChange({
        SEO_Details: { ...seoDetails, SEO_Keywords: updatedKeywords },
      });
      setKeywordInput("");
    }
  };

  // Handle removing a keyword
  const removeKeyword = (keyword: string) => {
    const updatedKeywords = seoKeywords.filter((k) => k !== keyword);
    setSeoKeywords(updatedKeywords); // Update local state
    onChange({
      SEO_Details: { ...seoDetails, SEO_Keywords: updatedKeywords },
    });
  };

  // Ensure the correct format when saving
  const handleSave = () => {
    // Ensure updatedSEOKeywords is always an array
    const updatedSEOKeywords: string[] = Array.isArray(seoKeywords)
      ? seoKeywords
      : JSON.parse(seoKeywords);

    onSave({
      ...item,
      SEO_Details: {
        ...seoDetails,
        SEO_Keywords: updatedSEOKeywords, // Now we are sure it is a string array
      },
    });
  };

  return (
    <div className="fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-slate-300 text-gray-700 p-6 pr-8 rounded-lg shadow-lg w-96 max-h-[95dvh] overflow-y-scroll">
        <h3 className="text-xl text-center mb-4">ویرایش</h3>

        {/* Name Field */}
        <div className="mb-4">
          <label className="block text-sm mb-2">نام</label>
          <input
            type="text"
            value={item.Name}
            onChange={(e) => onChange({ Name: e.target.value })}
            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Slug Field */}
        <div className="mb-4">
          <label className="block text-sm mb-2">شناسه</label>
          <input
            type="text"
            value={item.Slug}
            onChange={(e) => onChange({ Slug: e.target.value })}
            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Available Field */}
        <div className="mb-4">
          <label className="block text-sm mb-2">وضعیت</label>
          <select
            value={item.Available ? "available" : "unavailable"}
            onChange={(e) =>
              onChange({ Available: e.target.value === "available" })
            }
            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="available">موجود</option>
            <option value="unavailable">ناموجود</option>
          </select>
        </div>

        {/* SEO Title Field */}
        <div className="mb-4">
          <label className="block text-sm mb-2">عنوان سئو</label>
          <input
            type="text"
            value={seoDetails.SEO_Title}
            onChange={(e) =>
              onChange({
                SEO_Details: { ...seoDetails, SEO_Title: e.target.value },
              })
            }
            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* SEO Description Field */}
        <div className="mb-4">
          <label className="block text-sm mb-2">توضیحات سئو</label>
          <textarea
            value={seoDetails.SEO_Description}
            onChange={(e) =>
              onChange({
                SEO_Details: { ...seoDetails, SEO_Description: e.target.value },
              })
            }
            className="w-full p-3 mt-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
          />
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
            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <div className="flex gap-2 flex-wrap mt-3 mb-10">
            {seoKeywords.map((keyword: string) => (
              <button
                key={keyword}
                className="bg-emerald-100 text-gray-700 px-4 py-1 rounded-lg flex items-center gap-2 hover:bg-red-500 hover:text-white animate-fade-in transition-all"
                onClick={() => removeKeyword(keyword)}
              >
                {keyword}
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
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
