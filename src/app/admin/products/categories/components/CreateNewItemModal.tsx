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
  const [loading, setLoading] = useState(false); // Loading state for submission

  // Reset the form fields when the modal is opened (when `isOpen` changes)
  useEffect(() => {
    setName("");
    setSlug("");
    setAvailable(true);
    setParentCategoryId(undefined);
    setSeoTitle("");
    setSeoDescription("");
    setSeoKeywords([]);
    setKeywordInput("");
    setError(null); // Clear any previous error messages
  }, [isOpen, activeTab]); // Trigger the effect when `isOpen` changes

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

    setLoading(true); // Set loading to true when submitting
    try {
      if (activeTab === "Category") {
        await axios.post("/api/categories/createCategory", result);
        toast.success("دسته‌بندی با موفقیت ایجاد شد!");
        onClose();
        refetchCategories();
      } else if (activeTab === "Subcategory") {
        await axios.post("/api/categories/createSubcategory", result);
        toast.success("زیردسته‌بندی با موفقیت ایجاد شد!");
        onClose();
        refetchCategories();
      }

      // Clear the form fields after success
      setName("");
      setSlug("");
      setAvailable(true);
      setParentCategoryId(undefined);
      setSeoTitle("");
      setSeoDescription("");
      setSeoKeywords([]);
      setKeywordInput("");
    } catch (error) {

      if (axios.isAxiosError(error)) {
        const errorMessage =
          error.response?.data?.message ||
          "خطا در ثبت آیتم. لطفاً دوباره تلاش کنید.";
        setError(errorMessage);
      } else {
        setError("خطای ناشناخته‌ای رخ داده است. لطفاً دوباره تلاش کنید.");
      }
    } finally {
      setLoading(false); // Set loading to false after request is complete
    }
  };

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
      return name.trim() === "" || slug.trim() === "" || !parentCategoryId;
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
        <div className="flex justify-center gap-6 rtl">
          <button
            onClick={() => setActiveTab("Category")}
            className={`px-6 py-3 rounded-t-xl font-medium transition-all ${
              activeTab === "Category"
                ? "bg-gray-800 text-gray-200"
                : "bg-blue-800 text-white hover:animate-pulse"
            }`}
          >
            دسته‌بندی جدید
          </button>
          <button
            onClick={() => setActiveTab("Subcategory")}
            className={`px-6 py-3 rounded-t-xl font-medium transition-all ${
              activeTab === "Subcategory"
                ? "bg-gray-800 text-gray-200"
                : "bg-blue-800 text-white hover:animate-pulse"
            }`}
          >
            زیردسته‌بندی جدید
          </button>
        </div>

        <div className="p-6 pr-9 bg-gray-800 shadow-xl rounded-2xl text-white max-h-[90dvh] overflow-y-scroll">
          {activeTab === "Category" ? (
            <CategoryFields
              name={name}
              slug={slug}
              available={available}
              setName={setName}
              setSlug={setSlug}
              setAvailable={setAvailable}
              editable={true}
            />
          ) : (
            <div>
              <div className="mb-4">
                <label className="block text-sm font-medium">
                  دسته‌بندی اصلی
                </label>
                <select
                  value={parentCategoryId ?? ""}
                  onChange={(e) => setParentCategoryId(Number(e.target.value))}
                  className="w-full bg-gray-700 p-3 mt-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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

              <CategoryFields
                name={name}
                slug={slug}
                available={available}
                setName={setName}
                setSlug={setSlug}
                setAvailable={setAvailable}
                editable={parentCategoryId !== undefined}
              />
            </div>
          )}

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
              disabled={isSubmitDisabled() || loading} // Disable the button if loading
              className={`px-6 py-3 rounded-xl font-medium bg-blue-500 text-white disabled:bg-gray-400 disabled:cursor-not-allowed ${
                loading ? "cursor-not-allowed" : ""
              }`}
            >
              {loading
                ? "در حال ثبت" // Add a loading spinner or any other indicator
                : "ثبت"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateNewItemModal;
