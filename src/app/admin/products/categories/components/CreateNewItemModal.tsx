import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import axios from "axios";

import { Category } from "../types/types";

import CategoryFields from "./newItemModalComponents/CategoryFields";
import SeoFields from "./newItemModalComponents/SeoFields";

// Helper function to check if the name is unique within categories or subcategories
const checkIfUnique = (
  name: string,
  isCategory: boolean,
  categories: Category[],
  parentCategoryId?: number
) => {
  if (isCategory) {
    return !categories.some((category) => category.Name === name);
  }

  const parentCategory = categories.find(
    (category) => category.CategoryID === parentCategoryId
  );
  if (!parentCategory) return true;
  return !parentCategory.Subcategories.some(
    (subcategory) => subcategory.Name === name
  );
};

const CreateNewItemModal = ({
  isOpen,
  onClose,
  refetchCategories,
  categories,
}: {
  isOpen: boolean;
  onClose: () => void;
  refetchCategories: () => void;
  categories: Category[];
}) => {
  const [activeTab, setActiveTab] = useState("Category");
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [available, setAvailable] = useState(true);
  const [parentCategoryId, setParentCategoryId] = useState<number | undefined>(
    undefined
  );
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDescription, setSeoDescription] = useState("");
  const [seoKeywords, setSeoKeywords] = useState<string[]>([]);
  const [keywordInput, setKeywordInput] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setName("");
    setSlug("");
    setAvailable(true);
    setParentCategoryId(undefined);
    setSeoTitle("");
    setSeoDescription("");
    setSeoKeywords([]);
    setKeywordInput("");
  }, [activeTab]);

  const addKeyword = (e: React.KeyboardEvent) => {
    if (
      e.key === "Enter" &&
      keywordInput.trim() &&
      !seoKeywords.includes(keywordInput.trim())
    ) {
      setSeoKeywords([...seoKeywords, keywordInput.trim()]);
      setKeywordInput("");
    }
  };

  const removeKeyword = (keyword: string) => {
    setSeoKeywords(seoKeywords.filter((k) => k !== keyword));
  };

  const handleSubmit = async () => {
    if (name.trim() === "") {
      setError("نام نمی‌تواند خالی باشد.");
      return;
    }

    if (
      !checkIfUnique(
        name,
        activeTab === "Category",
        categories,
        activeTab === "Category" ? undefined : parentCategoryId
      )
    ) {
      setError("این نام قبلاً ثبت شده است.");
      return;
    }

    const result = {
      type: activeTab,
      data: {
        name,
        slug,
        available,
        parentCategoryId: activeTab === "Subcategory" ? parentCategoryId : null,
        seoTitle,
        seoDescription,
        seoKeywords,
      },
    };

    try {
      if (activeTab === "Category") {
        // Use the endpoint for "Category" type
        await axios.post("/api/categories/createCategory", result);

        toast.success("دسته‌بندی با موفقیت ایجاد شد!");
        onClose();
        refetchCategories();

        // Clear the form fields
        setName("");
        setSlug("");
        setAvailable(true);
        setParentCategoryId(undefined);
        setSeoTitle("");
        setSeoDescription("");
        setSeoKeywords([]);
        setKeywordInput("");
      } else if (activeTab === "Subcategory") {
        // Use the endpoint for "Category" type
        console.log(result);
        await axios.post("/api/categories/createSubcategory", result);

        toast.success("زیردسته‌بندی با موفقیت ایجاد شد!");
        onClose();
        refetchCategories();

        // Clear the form fields
        setName("");
        setSlug("");
        setAvailable(true);
        setParentCategoryId(undefined);
        setSeoTitle("");
        setSeoDescription("");
        setSeoKeywords([]);
        setKeywordInput("");
      }
    } catch (error) {
      console.error("Error creating category:", error);

      if (axios.isAxiosError(error)) {
        const errorMessage =
          error.response?.data?.message ||
          "خطا در ثبت آیتم. لطفاً دوباره تلاش کنید.";
        setError(errorMessage);
      } else {
        setError("خطای ناشناخته‌ای رخ داده است. لطفاً دوباره تلاش کنید.");
      }
    }
  };

  // Check if all required fields for the current tab are filled
  const isSubmitDisabled = () => {
    if (activeTab === "Category") {
      return (
        name.trim() === "" ||
        slug.trim() === "" ||
        seoTitle.trim() === "" ||
        seoDescription.trim() === "" ||
        seoKeywords.length === 0
      );
    } else if (activeTab === "Subcategory") {
      return (
        name.trim() === "" ||
        slug.trim() === "" ||
        seoTitle.trim() === "" ||
        seoDescription.trim() === "" ||
        seoKeywords.length === 0 ||
        !parentCategoryId
      );
    }
    return false;
  };

  return (
    <div
      className={`fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 backdrop-blur-lg z-50 ${
        !isOpen ? "hidden" : ""
      }`}
    >
      <div className="w-full max-w-3xl animate-fade-in">
        {/* Header Tabs */}
        <div className="flex justify-center gap-6 rtl">
          <button
            onClick={() => setActiveTab("Category")}
            className={`px-6 py-3 rounded-t-xl font-medium transition-all ${
              activeTab === "Category"
                ? "bg-slate-300 text-gray-800"
                : "bg-blue-800 text-white hover:animate-pulse"
            }`}
          >
            دسته‌بندی جدید
          </button>
          <button
            onClick={() => setActiveTab("Subcategory")}
            className={`px-6 py-3 rounded-t-xl font-medium transition-all ${
              activeTab === "Subcategory"
                ? "bg-slate-300 text-gray-800"
                : "bg-blue-800 text-white hover:animate-pulse"
            }`}
          >
            زیردسته‌بندی جدید
          </button>
        </div>

        {/* Form Content */}
        <div className="p-6 pr-9 bg-slate-300 shadow-xl rounded-2xl text-gray-700 max-h-[90dvh] overflow-y-scroll">
          {activeTab === "Category" ? (
            <div>
              {/* Category Fields */}
              <CategoryFields
                name={name}
                slug={slug}
                available={available}
                setName={setName}
                setSlug={setSlug}
                setAvailable={setAvailable}
                parentCategoryId={parentCategoryId}
                editable={true} // Editable for Category Tab
              />
            </div>
          ) : (
            <div>
              {/* Subcategory Fields */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  دسته‌بندی اصلی
                </label>
                <select
                  value={parentCategoryId ?? ""}
                  onChange={(e) => setParentCategoryId(Number(e.target.value))}
                  className="w-full p-3 mt-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="" disabled>
                    انتخاب دسته‌بندی
                  </option>
                  {categories.map((category) => (
                    <option
                      key={category.CategoryID}
                      value={category.CategoryID}
                    >
                      {category.Name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Subcategory Fields */}
              <CategoryFields
                name={name}
                slug={slug}
                available={available}
                setName={setName}
                setSlug={setSlug}
                setAvailable={setAvailable}
                parentCategoryId={parentCategoryId}
                editable={parentCategoryId !== undefined} // Editable once parent category is selected
              />
            </div>
          )}

          {/* SEO Fields */}
          <SeoFields
            seoTitle={seoTitle}
            seoDescription={seoDescription}
            seoKeywords={seoKeywords}
            setSeoTitle={setSeoTitle}
            setSeoDescription={setSeoDescription}
            keywordInput={keywordInput}
            setKeywordInput={setKeywordInput}
            addKeyword={addKeyword}
            removeKeyword={removeKeyword}
            editable={
              activeTab === "Category" || parentCategoryId !== undefined
            }
          />

          {/* Error and Submit Button */}
          {error && <div className="text-red-500 text-sm mt-4">{error}</div>}
          <div className="flex justify-between items-center mt-5">
            <button
              onClick={onClose}
              className="px-6 py-3 rounded-xl font-medium bg-white text-gray-700"
            >
              انصراف
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitDisabled()}
              className="px-6 py-3 rounded-xl font-medium bg-blue-500 text-white disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              ثبت
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateNewItemModal;
