import { useState } from "react";

const SeoFields = ({
  seoTitle,
  seoDescription,
  seoKeywords,
  setSeoTitle,
  setSeoDescription,
  keywordInput,
  setKeywordInput,
  addKeyword,
  removeKeyword,
  editable = true,
}: {
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string[];
  setSeoTitle: React.Dispatch<React.SetStateAction<string>>;
  setSeoDescription: React.Dispatch<React.SetStateAction<string>>;
  keywordInput: string;
  setKeywordInput: React.Dispatch<React.SetStateAction<string>>;
  addKeyword: (e: React.KeyboardEvent) => void;
  removeKeyword: (keyword: string) => void;
  editable?: boolean;
}) => {
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Regex patterns for validation
  const regexPatterns = {
    SEO_Title: /^.{0,50}$/, // Any character, up to 50 characters
    SEO_Keywords: /^.{0,4000}$/, // Any character, up to 4000 characters (no commas restriction)‌
  };

  // Error messages
  const errorMessages = {
    SEO_Title: "عنوان سئو باید حداکثر ۵۰ کاراکتر باشد.",
    SEO_Keywords:
      "کلمه کلیدی نمی‌تواند شامل کاما باشد و حداکثر ۴۰۰۰ کاراکتر باشد.",
  };

  const handleInputChange = (field: string, value: string) => {
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

    // Update the fields
    if (field === "SEO_Title") {
      setSeoTitle(value);
    } else if (field === "SEO_Description") {
      setSeoDescription(value);
    }
  };

  return (
    <div>
      {/* SEO Title */}
      <div className="mb-4">
        <label className="block text-sm font-medium">عنوان سئو</label>
        <input
          type="text"
          value={seoTitle}
          onChange={(e) => handleInputChange("SEO_Title", e.target.value)}
          disabled={!editable}
          className="w-full p-3 mt-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-700 disabled:bg-gray-500"
          placeholder="عنوان سئو"
        />
        {errors.SEO_Title && (
          <p className="text-red-500 text-sm">{errors.SEO_Title}</p>
        )}
      </div>

      {/* SEO Description */}
      <div className="mb-4">
        <label className="block text-sm font-medium">توضیحات سئو</label>
        <textarea
          value={seoDescription}
          onChange={(e) => handleInputChange("SEO_Description", e.target.value)}
          disabled={!editable}
          className="w-full p-3 mt-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-700 disabled:bg-gray-500"
          placeholder="توضیحات سئو | بهتر است برای سئو بهتر توضیحات سئو زیر ۱۶۰ کاراکتر باشد."
        />
        {errors.SEO_Description && (
          <p className="text-red-500 text-sm">{errors.SEO_Description}</p>
        )}
      </div>

      {/* SEO Keywords */}
      <div className="mb-4">
        <label className="block text-sm font-medium">کلمات کلیدی</label>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={keywordInput}
            onChange={(e) => {
              const newKeyword = e.target.value;
              // Apply regex validation to restrict input size and invalid characters (e.g., commas)
              if (regexPatterns.SEO_Keywords.test(newKeyword)) {
                setKeywordInput(newKeyword); // Update the keyword input if valid
              }
            }}
            onKeyUp={addKeyword}
            disabled={!editable}
            className="w-full p-3 mt-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-700 disabled:bg-gray-500"
            placeholder="اضافه کردن کلمه کلیدی | بعد هر کلمه کلیدی دکمه Enter را بزنید"
          />
        </div>
        {errors.SEO_Keywords && (
          <p className="text-red-500 text-sm">{errors.SEO_Keywords}</p>
        )}

        {/* Display keywords */}
        <div className="mt-4 flex flex-wrap gap-2">
          {seoKeywords.map((keyword, index) => (
            <button
              key={index}
              className="bg-green-700 px-4 py-1 rounded-lg flex items-center gap-2 hover:bg-red-700 animate-fade-in transition-all"
              onClick={() => removeKeyword(keyword)}
            >
              {keyword}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SeoFields;
