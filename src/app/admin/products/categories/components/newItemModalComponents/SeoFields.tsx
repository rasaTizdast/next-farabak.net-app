import { useState } from "react";

// Regex patterns for validation
const seoRegexPatterns = {
  SEO_Title: /^.{0,50}$/, // Any character, up to 50 characters
  SEO_Keywords: /^.{0,4000}$/, // Any character, up to 4000 characters (no commas restriction)‌
};

// Error messages
const seoErrorMessages = {
  SEO_Title: "عنوان سئو باید حداکثر ۵۰ کاراکتر باشد.",
  SEO_Keywords: "کلمه کلیدی نمی‌تواند شامل کاما باشد و حداکثر ۴۰۰۰ کاراکتر باشد.",
};

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

  const handleInputChange = (field: string, value: string) => {
    // Validate input using regex patterns
    const pattern = seoRegexPatterns[field as keyof typeof seoRegexPatterns];
    if (pattern && !pattern.test(value)) {
      setErrors((prev) => ({
        ...prev,
        [field]: seoErrorMessages[field as keyof typeof seoErrorMessages] || "خطای نامشخص",
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
        <label htmlFor="seo-title" className="block text-sm font-medium">
          عنوان سئو
        </label>
        <input
          id="seo-title"
          type="text"
          aria-label="عنوان سئو"
          value={seoTitle}
          onChange={(e) => handleInputChange("SEO_Title", e.target.value)}
          disabled={!editable}
          className="mt-2 w-full rounded-md border bg-gray-700 p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-gray-500"
          placeholder="عنوان سئو"
        />
        {errors.SEO_Title && <p className="text-sm text-red-500">{errors.SEO_Title}</p>}
      </div>

      {/* SEO Description */}
      <div className="mb-4">
        <label htmlFor="seo-description" className="block text-sm font-medium">
          توضیحات سئو
        </label>
        <textarea
          id="seo-description"
          aria-label="توضیحات سئو"
          value={seoDescription}
          onChange={(e) => handleInputChange("SEO_Description", e.target.value)}
          disabled={!editable}
          className="mt-2 w-full rounded-md border bg-gray-700 p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-gray-500"
          placeholder="توضیحات سئو | بهتر است برای سئو بهتر توضیحات سئو زیر ۱۶۰ کاراکتر باشد."
        />
        {errors.SEO_Description && <p className="text-sm text-red-500">{errors.SEO_Description}</p>}
      </div>

      {/* SEO Keywords */}
      <div className="mb-4">
        <label htmlFor="seo-keywords" className="block text-sm font-medium">
          کلمات کلیدی
        </label>
        <div className="flex items-center gap-2">
          <input
            id="seo-keywords"
            type="text"
            aria-label="کلمات کلیدی"
            value={keywordInput}
            onChange={(e) => {
              const newKeyword = e.target.value;
              // Apply regex validation to restrict input size and invalid characters (e.g., commas)
              if (seoRegexPatterns.SEO_Keywords.test(newKeyword)) {
                setKeywordInput(newKeyword); // Update the keyword input if valid
              }
            }}
            onKeyUp={addKeyword}
            disabled={!editable}
            className="mt-2 w-full rounded-md border bg-gray-700 p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-gray-500"
            placeholder="اضافه کردن کلمه کلیدی | بعد هر کلمه کلیدی دکمه Enter را بزنید"
          />
        </div>
        {errors.SEO_Keywords && <p className="text-sm text-red-500">{errors.SEO_Keywords}</p>}

        {/* Display keywords */}
        <div className="mt-4 flex flex-wrap gap-2">
          {seoKeywords.map((keyword) => (
            <button
              type="button"
              key={keyword}
              className="animate-fade-in flex items-center gap-2 rounded-lg bg-green-700 px-4 py-1 transition-colors hover:bg-red-700"
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
