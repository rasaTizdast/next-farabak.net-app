import axios from "axios";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";

import CategoryBlogEditor from "./CategoryBlogEditor";
import { Category, Subcategory } from "../types/types";

interface EditModalProps {
  isOpen: boolean;
  item: Category | Subcategory | null;
  onClose: () => void;
  // onSave: (updatedItem: Category | Subcategory) => void;
  onChange: (updatedFields: Partial<Category | Subcategory>) => void;
  refetchCategories: () => void;
  setIsEditModalOpen: (arg0: boolean) => void;
  setEditCategory: (arg0: Category | Subcategory | null) => void;
}

const EditModal: React.FC<EditModalProps> = ({
  isOpen,
  item,
  onClose,
  // onSave,
  onChange,
  refetchCategories,
  setEditCategory,
  setIsEditModalOpen,
}) => {
  const [keywordInput, setKeywordInput] = useState("");
  const [seoKeywords, setSeoKeywords] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({}); // Store errors for all fields
  const [topBlog, setTopBlog] = useState<string>("");
  const [bottomBlog, setBottomBlog] = useState<string>("");

  useEffect(() => {
    if (item && item.SEO_Details) {
      const seoDetails = item.SEO_Details;
      let parsedKeywords: string[] = [];
      if (Array.isArray(seoDetails.SEO_Keywords)) {
        parsedKeywords = seoDetails.SEO_Keywords;
      } else if (typeof seoDetails.SEO_Keywords === "string") {
        try {
          parsedKeywords = JSON.parse(seoDetails.SEO_Keywords);
        } catch (e) {
          parsedKeywords = [];
          console.error(e);
        }
      }
      setSeoKeywords(parsedKeywords);
    }
    if (item) {
      setTopBlog((item as any).TopBlog || "");
      setBottomBlog((item as any).BottomBlog || "");
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
    SEO_Title: /^.{0,60}$/, // Any character, up to 50 characters
    SEO_Description: /^.{0,160}$/, // Any character, up to 4000 characters
    SEO_Keywords: /^.{0,4000}$/, // Any character, up to 4000 characters (no commas restriction)
  };

  // Persian error messages
  const errorMessages = {
    Name: "نام باید حروف فارسی یا انگلیسی و حداکثر ۱۰۰۰ کاراکتر باشد.",
    Slug: "شناسه فقط باید حروف انگلیسی کوچک، اعداد و خط تیره باشد و حداکثر ۲۰۰ کاراکتر باشد.",
    SEO_Title: "عنوان سئو باید حداکثر ۵۰ کاراکتر باشد.",
    SEO_Description: "توضیحات سئو باید حداکثر ۴۰۰۰ کاراکتر باشد.",
    SEO_Keywords: "کلمه کلیدی نمی‌تواند شامل کاما باشد و حداکثر ۴۰۰۰ کاراکتر باشد.",
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

    // Handle Available field separately
    if (field === "Available") {
      value = value === "true"; // Convert the string to a boolean
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
        [field]: errorMessages[field as keyof typeof errorMessages] || "خطای نامشخص",
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

  const handleItemUpdate = async (updatedItem: Category | Subcategory) => {
    const isCategory = "CategoryID" in updatedItem && !("CategoryContentId" in updatedItem);
    const endpoint = `/api/categories/editCategory`;
    const payload = isCategory
      ? {
          Type: "category",
          CategoryID: updatedItem.CategoryID,
          Name: updatedItem.Name,
          Slug: updatedItem.Slug,
          Available: updatedItem.Available,
          TopBlog: topBlog || null,
          BottomBlog: bottomBlog || null,
          SEO_Details: {
            SEO_Title: updatedItem.SEO_Details.SEO_Title,
            SEO_Description: updatedItem.SEO_Details.SEO_Description,
            SEO_Keywords: updatedItem.SEO_Details.SEO_Keywords,
          },
        }
      : {
          Type: "subcategory",
          CategoryContentId: updatedItem.CategoryContentId,
          CategoryID: updatedItem.CategoryID,
          Name: updatedItem.Name,
          Slug: updatedItem.Slug,
          Available: updatedItem.Available,
          TopBlog: topBlog || null,
          BottomBlog: bottomBlog || null,
          SEO_Details: {
            SEO_Title: updatedItem.SEO_Details.SEO_Title,
            SEO_Description: updatedItem.SEO_Details.SEO_Description,
            SEO_Keywords: updatedItem.SEO_Details.SEO_Keywords,
          },
        };

    try {
      await axios.patch(endpoint, payload);
      toast.success("تغییرات با موفقیت اعمال شدند!");
      refetchCategories();
      setEditCategory(null);
      setIsEditModalOpen(false);
    } catch (error) {
      console.error(error);
      toast.error("خطا در بروزرسانی، لطفا مجددا تلاش کنید.");
    }
  };

  // Handle save with validation
  const handleSave = () => {
    if (!validateAllFields()) return;

    handleItemUpdate({
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
    setTopBlog("");
    setBottomBlog("");
    onClose(); // Call the passed onClose handler
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="max-h-[95dvh] w-[420px] overflow-y-scroll rounded-lg bg-gray-800 p-6 pr-8 text-white shadow-lg">
        <h3 className="mb-4 text-center text-xl">ویرایش</h3>
        {/* Name Field */}
        <div className="mb-4">
          <label className="mb-2 block text-sm">نام</label>
          <input
            type="text"
            value={item.Name || ""}
            onChange={(e) => handleInputChange("Name", e.target.value)}
            className={`w-full border bg-gray-700 p-2 ${
              errors.Name ? "border-red-500" : "border-gray-900"
            } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
            placeholder="نام را وارد کنید"
          />
          {errors.Name && <p className="text-sm text-red-500">{errors.Name}</p>}
        </div>

        {/* Slug Field */}
        <div className="mb-4">
          <label className="mb-2 block text-sm">شناسه</label>
          <input
            type="text"
            value={item.Slug}
            onChange={(e) => handleInputChange("Slug", e.target.value)}
            className={`w-full border bg-gray-700 p-2 ${
              errors.Slug ? "border-red-500" : "border-gray-900"
            } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />
          {errors.Slug && <p className="text-sm text-red-500">{errors.Slug}</p>}
        </div>

        {/* Available Field */}
        <div className="mb-4">
          <label className="mb-2 block text-sm">فعال</label>
          <select
            value={item.Available ? "true" : "false"} // Convert boolean to string for select value
            onChange={(e) => handleInputChange("Available", e.target.value)}
            className={`w-full border bg-gray-700 p-2 ${
              errors.Slug ? "border-red-500" : "border-gray-900"
            } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
          >
            <option value="true">بله</option>
            <option value="false">خیر</option>
          </select>
          {errors.Slug && <p className="text-sm text-red-500">{errors.Slug}</p>}
        </div>

        {/* SEO Title Field */}
        <div className="mb-4">
          <label className="mb-2 block text-sm">عنوان سئو</label>
          <input
            type="text"
            value={seoDetails.SEO_Title || ""} // Ensure fallback to an empty string
            onChange={(e) => handleInputChange("SEO_Title", e.target.value)}
            className={`w-full border bg-gray-700 p-2 ${
              errors.SEO_Title ? "border-red-500" : "border-gray-900"
            } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
            placeholder="عنوان سئو را وارد کنید"
          />
          {errors.SEO_Title && <p className="text-sm text-red-500">{errors.SEO_Title}</p>}
        </div>

        {/* SEO Description Field */}
        <div className="mb-4">
          <label className="mb-2 block text-sm">توضیحات سئو</label>
          <textarea
            value={seoDetails.SEO_Description || ""} // Ensure fallback to an empty string
            onChange={(e) => handleInputChange("SEO_Description", e.target.value)}
            className={`w-full border bg-gray-700 p-3 ${
              errors.SEO_Description ? "border-red-500" : "border-gray-900"
            } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
            rows={3}
            placeholder="توضیحات سئو را وارد کنید"
          />
          {errors.SEO_Description && (
            <p className="text-sm text-red-500">{errors.SEO_Description}</p>
          )}
        </div>

        {/* SEO Keywords Field */}
        <div className="mb-4">
          <label className="mb-2 block text-sm">کلمات کلیدی سئو</label>
          <input
            type="text"
            value={keywordInput}
            onChange={(e) => setKeywordInput(e.target.value)}
            onKeyDown={addKeyword}
            placeholder="کلمه کلیدی را وارد کنید و Enter بزنید"
            className={`w-full border bg-gray-700 p-2 ${
              errors.SEO_Keywords ? "border-red-500" : "border-gray-900"
            } rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />

          {errors.SEO_Keywords && <p className="text-sm text-red-500">{errors.SEO_Keywords}</p>}

          <div className="mb-10 mt-3 flex flex-wrap gap-2">
            {seoKeywords.map((keyword: string) => (
              <button
                key={keyword}
                className="flex animate-fade-in items-center gap-2 rounded-lg bg-green-700 px-4 py-1 transition-all hover:bg-red-700 hover:text-white"
                onClick={() => removeKeyword(keyword)}
              >
                {keyword}
              </button>
            ))}
          </div>
        </div>

        <CategoryBlogEditor
          label="بلاگ بالای صفحه (ویرایشگر)"
          value={topBlog}
          onChange={setTopBlog}
          placeholder="این بخش اختیاری است. از تیترها، لیست و لینک پشتیبانی می‌شود."
        />

        <CategoryBlogEditor
          label="بلاگ پایین صفحه (ویرایشگر)"
          value={bottomBlog}
          onChange={setBottomBlog}
          placeholder="این بخش اختیاری است. از تیترها، لیست و لینک پشتیبانی می‌شود."
        />

        <div className="flex justify-end gap-2">
          <button
            onClick={handleClose}
            className="rounded bg-gray-50 px-4 py-2 text-black hover:bg-gray-100"
          >
            بستن
          </button>
          <button
            onClick={handleSave}
            className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            ذخیره تغییرات
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditModal;
