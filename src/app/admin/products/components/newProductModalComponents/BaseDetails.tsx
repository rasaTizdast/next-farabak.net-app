import React, { useState, useEffect } from "react";
import { addCommas } from "@persian-tools/persian-tools";

type Category = {
  CategoryID: number;
  Name: string;
  Subcategories: { CategoryContentId: number; Name: string }[];
};

type Props = {
  state: any;
  dispatch: React.Dispatch<any>;
  categories: Category[];
  setErrors: React.Dispatch<React.SetStateAction<{ [key: string]: string }>>;
};

const BaseDetails = ({ state, dispatch, categories, setErrors }: Props) => {
  const [localErrors, setLocalErrors] = useState({
    name: "",
    slug: "",
    smallDesc: "",
    SEO_Title: "",
    SEO_Description: "",
    keywords: "",
    price: "",
    discount: "",
  });

  useEffect(() => {
    setErrors((prev) => ({ ...prev, ...localErrors }));
  }, [localErrors, setErrors]);

  const validateName = (value: string) => {
    if (!value.trim()) return "نام محصول نمی‌تواند خالی باشد.";
    if (value.length > 1000)
      return "نام محصول نمی‌تواند بیشتر از ۱۰۰۰ کاراکتر باشد.";
    return "";
  };

  const validateSlug = (value: string) => {
    if (!value.trim()) return "شناسه محصول نمی‌تواند خالی باشد.";
    if (value.length > 1200)
      return "شناسه محصول نمی‌تواند بیشتر از ۱۲۰۰ کاراکتر باشد.";
    if (!/^[a-zA-Z0-9_-]+$/.test(value))
      return "شناسه محصول فقط می‌تواند شامل حروف انگلیسی، اعداد، خط فاصله و زیرخط باشد.";
    return "";
  };

  const validateSmallDesc = (value: string) => {
    if (!value.trim()) return "توضیحات کوتاه نمی‌تواند خالی باشد.";
    if (value.length > 1000)
      return "توضیحات کوتاه نمی‌تواند بیشتر از ۱۰۰۰ کاراکتر باشد.";
    return "";
  };

  const validateSeoTitle = (value: string) => {
    if (!value.trim()) return "تیتر سئو نمی‌تواند خالی باشد.";
    if (value.length > 60)
      return "تیتر سئو نمی‌تواند بیشتر از ۶۰ کاراکتر باشد.";
    return "";
  };

  const validateSeoDesc = (value: string) => {
    if (!value.trim()) return "توضیحات سئو نمی‌تواند خالی باشد.";
    if (value.length > 4000)
      return "توضیحات سئو نمی‌تواند بیشتر از ۴۰۰۰ کاراکتر باشد.";
    return "";
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Allow decimal numbers with up to 2 decimal places
    const value = e.target.value;

    // If there are more than 2 decimal places, truncate
    const parts = value.toString().split(".");
    if (parts.length > 1 && parts[1].length > 2) {
      // Don't process this change, as it would add more than 2 decimal places
      return;
    }

    // Check max length of 20 characters based on Prisma schema
    if (value.length > 20) {
      setLocalErrors((prev) => ({
        ...prev,
        price: "قیمت نمیتواند بیشتر از ۲۰ کارکتر باشد.",
      }));
      return;
    }

    const numericValue = parseFloat(value);

    if (!isNaN(numericValue)) {
      dispatch({
        type: "SET_FIELD",
        field: "price",
        value: numericValue,
      });
    }

    if (!value || isNaN(numericValue)) {
      setLocalErrors((prev) => ({
        ...prev,
        price: "قیمت باید یک عدد معتبر باشد.",
      }));
    } else {
      setLocalErrors((prev) => ({ ...prev, price: "" }));
    }
  };

  const handleDiscountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Allow decimal numbers with up to 2 decimal places
    const value = e.target.value;

    // If there are more than 2 decimal places, truncate
    const parts = value.toString().split(".");
    if (parts.length > 1 && parts[1].length > 2) {
      // Don't process this change, as it would add more than 2 decimal places
      return;
    }

    // Check max length of 20 characters based on Prisma schema
    if (value.length > 20) {
      setLocalErrors((prev) => ({
        ...prev,
        discount: "تخفیف نمیتواند بیشتر از ۲۰ کارکتر باشد.",
      }));
      return;
    }

    const numericValue = parseFloat(value);

    if (!isNaN(numericValue)) {
      // Additional validation for discount vs price
      if (numericValue > state.price) {
        setLocalErrors((prev) => ({
          ...prev,
          discount: "تخفیف نمیتواند بیشتر از قیمت باشد.",
        }));
      } else {
        dispatch({
          type: "SET_FIELD",
          field: "discount",
          value: numericValue,
        });
        setLocalErrors((prev) => ({ ...prev, discount: "" }));
      }
    } else if (value && isNaN(numericValue)) {
      setLocalErrors((prev) => ({
        ...prev,
        discount: "تخفیف باید یک عدد معتبر باشد.",
      }));
    } else {
      // Empty value is okay for discount
      dispatch({
        type: "SET_FIELD",
        field: "discount",
        value: 0,
      });
      setLocalErrors((prev) => ({ ...prev, discount: "" }));
    }
  };

  const handleValidation = (field: string, value: string) => {
    let error = "";
    if (field === "name") error = validateName(value);
    if (field === "slug") error = validateSlug(value);
    if (field === "smallDesc") error = validateSmallDesc(value);
    if (field === "SEO_Title") error = validateSeoTitle(value);
    if (field === "SEO_Description") error = validateSeoDesc(value);
    if (field === "keywords") error = validateKeywords(value); // Added for keywords

    setLocalErrors((prev) => ({ ...prev, [field]: error }));
  };

  const validateKeywords = (value: string) => {
    if (!value.trim()) return "کلمات کلیدی نمی‌تواند خالی باشد.";
    if (value.length > 2000)
      return "کلمات کلیدی نمی‌تواند بیشتر از ۲۰۰۰ کاراکتر باشد.";
    return "";
  };

  return (
    <div className="mb-6 p-4">
      {/* Name */}
      <div className="mb-4">
        <label htmlFor="name" className="block mb-2">
          نام محصول
        </label>
        <input
          id="name"
          type="text"
          value={state.name}
          onChange={(e) => {
            const value = e.target.value;
            dispatch({ type: "SET_FIELD", field: "name", value });
            handleValidation("name", value);
          }}
          className={`w-full p-2 rounded bg-gray-700 text-white ${
            localErrors.name ? "border border-red-500" : ""
          }`}
          placeholder="نام محصول را وارد کنید"
          maxLength={1000}
        />
        {localErrors.name && (
          <p className="text-red-500 mt-1">{localErrors.name}</p>
        )}
      </div>

      {/* Slug */}
      <div className="mb-4">
        <label htmlFor="slug" className="block mb-2">
          شناسه محصول
        </label>
        <input
          id="slug"
          type="text"
          value={state.slug}
          onChange={(e) => {
            const value = e.target.value
              .replace(/\s+/g, "-")
              .replace(/[^a-zA-Z0-9_-]/g, "");
            dispatch({ type: "SET_FIELD", field: "slug", value });
            handleValidation("slug", value);
          }}
          className={`w-full p-2 rounded bg-gray-700 text-white ${
            localErrors.slug ? "border border-red-500" : ""
          }`}
          placeholder="شناسه محصول را وارد کنید"
          maxLength={1200}
        />
        {localErrors.slug && (
          <p className="text-red-500 mt-1">{localErrors.slug}</p>
        )}
      </div>

      {/* Category */}
      <div className="mb-4">
        <label htmlFor="category" className="block mb-2">
          دسته بندی
        </label>
        <select
          id="category"
          value={state.categoryID || ""}
          onChange={(e) => {
            const newCategoryID = Number(e.target.value);
            dispatch({
              type: "SET_FIELD",
              field: "categoryID",
              value: newCategoryID,
            });
            // Clear subcategories when category changes
            dispatch({
              type: "SET_FIELD",
              field: "subCategoryID",
              value: "",
            });
          }}
          className="w-full p-2 rounded bg-gray-700 text-white"
        >
          <option value="">انتخاب دسته بندی</option>
          {categories.map((category) => (
            <option key={category.CategoryID} value={category.CategoryID}>
              {category.Name}
            </option>
          ))}
        </select>
      </div>

      {/* SubCategory */}
      <div className="mb-4">
        <label htmlFor="subCategory" className="mb-2 flex gap-3 items-center">
          زیر دسته بندی
          <div className="relative group">
            <span className="text-gray-500 hover:text-blue-500 cursor-pointer">
              ℹ️
            </span>
            <div className="absolute top-full right-0 w-64 mt-1 text-justify hidden group-hover:block bg-gray-700 text-white text-sm p-3 rounded shadow-2xl z-40">
              شما می‌توانید چندین زیر دسته‌بندی را انتخاب کنید. اولین زیر
              دسته‌بندی که انتخاب می‌شود به عنوان زیر دسته‌بندی اصلی محصول نشان
              داده می‌شود.
            </div>
          </div>
        </label>
        {state.categoryID ? (
          <div className="p-2 rounded bg-gray-700 text-white">
            {/* Use CSS Grid for layout */}
            <div
              className="grid gap-2"
              style={{
                gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
              }}
            >
              {categories
                .find((category) => category.CategoryID === state.categoryID)
                ?.Subcategories.map((subCategory) => {
                  const selectedIds = state.subCategoryID
                    ? state.subCategoryID.split(",").map(Number)
                    : [];
                  const isSelected = selectedIds.includes(
                    subCategory.CategoryContentId
                  );
                  const isFirstSelected =
                    isSelected &&
                    selectedIds[0] === subCategory.CategoryContentId;

                  return (
                    <SubCategoryButton
                      key={subCategory.CategoryContentId}
                      subCategory={subCategory}
                      isSelected={isSelected}
                      isFirstSelected={isFirstSelected}
                      onClick={() => {
                        let updatedIds: number[];
                        if (isSelected) {
                          updatedIds = selectedIds.filter(
                            (id: number) => id !== subCategory.CategoryContentId
                          );
                        } else {
                          updatedIds = [
                            ...selectedIds,
                            subCategory.CategoryContentId,
                          ];
                        }

                        dispatch({
                          type: "SET_FIELD",
                          field: "subCategoryID",
                          value: updatedIds.join(","),
                        });
                      }}
                    />
                  );
                })}
            </div>
          </div>
        ) : (
          <select
            id="subCategory"
            disabled
            className="w-full p-2 rounded bg-gray-700 text-white"
          >
            <option value="">انتخاب زیر دسته بندی</option>
          </select>
        )}
      </div>

      {/* Price */}
      <div className="mb-4">
        <label htmlFor="price" className="block mb-2">
          قیمت محصول به دلار
        </label>
        <input
          id="price"
          type="number"
          step="0.01"
          value={state.price}
          onChange={handlePriceChange}
          className={`w-full p-2 rounded bg-gray-700 text-white ${
            localErrors.price ? "border border-red-500" : ""
          }`}
          placeholder="قیمت محصول را به دلار وارد کنید."
          min="0"
          max="99999999"
        />
        {localErrors.price && (
          <p className="text-red-500 mt-1">{localErrors.price}</p>
        )}
      </div>

      {/* Discount */}
      <div className="mb-4">
        <label htmlFor="discount" className="block mb-2">
          تخفیف
        </label>
        <input
          id="discount"
          type="number"
          step="0.01"
          value={state.discount}
          onChange={handleDiscountChange}
          className={`w-full p-2 rounded bg-gray-700 text-white ${
            localErrors.discount ? "border border-red-500" : ""
          }`}
          placeholder="تخفیف محصول را به دلار وارد کنید."
          min="0"
          max={state.price}
        />
        {localErrors.discount && (
          <p className="text-red-500 mt-1">{localErrors.discount}</p>
        )}
      </div>

      {/* Small Description */}
      <div className="mb-4">
        <label htmlFor="smallDesc" className="block mb-2">
          توضیحات کوتاه
        </label>
        <input
          id="smallDesc"
          type="text"
          value={state.smallDesc}
          onChange={(e) => {
            const value = e.target.value;
            dispatch({ type: "SET_FIELD", field: "smallDesc", value });
            handleValidation("smallDesc", value);
          }}
          className={`w-full p-2 rounded bg-gray-700 text-white ${
            localErrors.smallDesc ? "border border-red-500" : ""
          }`}
          placeholder="توضیحات کوتاه برای محصول را وارد کنید"
          maxLength={1000}
        />
        {localErrors.smallDesc && (
          <p className="text-red-500 mt-1">{localErrors.smallDesc}</p>
        )}
      </div>

      {/* SEO Title */}
      <div className="mb-4">
        <label htmlFor="SEO_Title" className="block mb-2">
          تیتر سئو
        </label>
        <input
          id="SEO_Title"
          type="text"
          value={state.SEO_Title}
          onChange={(e) => {
            const value = e.target.value;
            dispatch({ type: "SET_FIELD", field: "SEO_Title", value });
            handleValidation("SEO_Title", value);
          }}
          className={`w-full p-2 rounded bg-gray-700 text-white ${
            localErrors.SEO_Title ? "border border-red-500" : ""
          }`}
          placeholder="تیتر سئو محصول را وارد کنید"
          maxLength={60}
        />
        {localErrors.SEO_Title && (
          <p className="text-red-500 mt-1">{localErrors.SEO_Title}</p>
        )}
        <div className="mt-1 text-gray-400 text-sm">
          {state.SEO_Title.length}/60
        </div>
      </div>

      {/* SEO Description */}
      <div className="mb-4">
        <label htmlFor="SEO_Description" className="block mb-2">
          توضیحات سئو
        </label>
        <textarea
          id="SEO_Description"
          value={state.SEO_Description}
          onChange={(e) => {
            const value = e.target.value;
            dispatch({ type: "SET_FIELD", field: "SEO_Description", value });
            handleValidation("SEO_Description", value);
          }}
          className={`w-full p-2 rounded bg-gray-700 text-white ${
            localErrors.SEO_Description ? "border border-red-500" : ""
          }`}
          placeholder="توضیحات سئو محصول را وارد کنید"
          maxLength={4000}
          rows={4}
        />
        {localErrors.SEO_Description && (
          <p className="text-red-500 mt-1">{localErrors.SEO_Description}</p>
        )}
        <div className="mt-1 text-gray-400 text-sm">
          {state.SEO_Description.length}/4000
        </div>
      </div>

      {/* Keywords */}
      <div className="mb-4">
        <label htmlFor="keywords" className="block mb-2">
          کلمات کلیدی
        </label>
        <input
          id="keywords"
          type="text"
          onKeyDown={(e) => {
            const input = e.target as HTMLInputElement; // Type assertion
            if (e.key === "Enter" && input.value.trim()) {
              e.preventDefault();

              const newKeyword = input.value.trim();
              const updatedKeywords = state.keywords
                ? `${state.keywords} ${newKeyword}`
                : newKeyword;

              // Check if adding this keyword would exceed the max length
              if (updatedKeywords.length > 2000) {
                setLocalErrors((prev) => ({
                  ...prev,
                  keywords:
                    "کلمات کلیدی نمی‌توانند بیشتر از ۲۰۰۰ کاراکتر باشند.",
                }));
                return;
              }

              dispatch({
                type: "SET_FIELD",
                field: "keywords",
                value: updatedKeywords,
              });
              handleValidation("keywords", updatedKeywords);

              input.value = ""; // Clear input field
            }
          }}
          className={`w-full p-2 rounded bg-gray-700 text-white ${
            localErrors.keywords ? "border border-red-500" : ""
          }`}
          placeholder="کلمات کلیدی را تایپ کنید و Enter را فشار دهید"
          maxLength={100} // Limit individual keyword length
        />

        {/* Display Keywords Below the Input */}
        <div className="mt-2 flex flex-wrap gap-2">
          {state.keywords &&
            state.keywords.split(" ").map((keyword: string, index: number) => (
              <button
                type="button"
                key={index}
                className="bg-green-700 px-4 py-1 rounded-lg flex items-center gap-2 hover:bg-red-700 hover:text-white animate-fade-in transition-all"
                onClick={() => {
                  const updatedKeywords = state.keywords
                    .split(" ")
                    .filter((_: string, i: number) => i !== index)
                    .join(" ");

                  dispatch({
                    type: "SET_FIELD",
                    field: "keywords",
                    value: updatedKeywords,
                  });
                  handleValidation("keywords", updatedKeywords);
                }}
              >
                {keyword}
              </button>
            ))}
        </div>

        {/* Display keywords count */}
        <div className="mt-1 text-gray-400 text-sm">
          {state.keywords?.length || 0}/2000
        </div>

        {/* Validation Error */}
        {localErrors.keywords && (
          <p className="text-red-500 mt-1">{localErrors.keywords}</p>
        )}
      </div>

      {/* Banner and Transparent Image */}
      <div className="mb-4">
        <label htmlFor="bannerImage" className="block mb-2">
          تصویر بنر
        </label>
        <input
          id="bannerImage"
          accept="image/*"
          type="file"
          onChange={(e) => {
            const file = e.target.files?.[0] || null;

            dispatch({
              type: "SET_FIELD",
              field: "bannerImage",
              value: file,
            });

            // Clear errors if a file is selected
            if (file) {
              setLocalErrors((prev) => ({ ...prev, bannerImage: "" }));
              setErrors((prev) => {
                const updated = { ...prev };
                delete updated.bannerImage;
                return updated;
              });
            }
          }}
          className="w-full p-2 rounded bg-gray-700 text-white"
        />
      </div>

      <div className="mb-4">
        <label htmlFor="transparentImage" className="block mb-2">
          تصویر بدون پس‌زمینه
        </label>
        <input
          id="transparentImage"
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0] || null;

            dispatch({
              type: "SET_FIELD",
              field: "transparentImage",
              value: file,
            });

            // Clear errors if a file is selected
            if (file) {
              setLocalErrors((prev) => ({ ...prev, transparentImage: "" }));
              setErrors((prev) => {
                const updated = { ...prev };
                delete updated.transparentImage;
                return updated;
              });
            }
          }}
          className="w-full p-2 rounded bg-gray-700 text-white"
        />
      </div>
    </div>
  );
};

export default BaseDetails;

// SubCategoryButton.tsx
interface SubCategoryButtonProps {
  subCategory: { CategoryContentId: number; Name: string };
  isSelected: boolean;
  isFirstSelected: boolean;
  onClick: () => void;
}

const SubCategoryButton: React.FC<SubCategoryButtonProps> = ({
  subCategory,
  isSelected,
  isFirstSelected,
  onClick,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1 rounded border text-center ${
        isSelected
          ? isFirstSelected
            ? "bg-green-600 text-white border-green-600" // Special style for the first selected
            : "bg-blue-600 text-white border-blue-600" // Style for other selected
          : "bg-gray-600 text-gray-200 border-gray-500 hover:bg-gray-500"
      }`}
    >
      {subCategory.Name}
    </button>
  );
};
