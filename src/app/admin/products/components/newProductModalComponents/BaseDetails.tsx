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
    price: "",
    discount: "",
  });

  useEffect(() => {
    setErrors((prev) => ({ ...prev, ...localErrors }));
  }, [localErrors, setErrors]);

  const validateName = (value: string) => {
    if (!value.trim()) return "نام محصول نمی‌تواند خالی باشد.";
    if (value.length > 100)
      return "نام محصول نمی‌تواند بیشتر از ۱۰۰ کاراکتر باشد.";
    if (!/^[a-zA-Z0-9\u0600-\u06FF\s_-]+$/.test(value))
      return "نام محصول فقط می‌تواند شامل حروف فارسی یا انگلیسی، اعداد، خط فاصله و زیرخط باشد.";
    return "";
  };

  const validateSlug = (value: string) => {
    if (!value.trim()) return "شناسه محصول نمی‌تواند خالی باشد.";
    if (value.length > 200)
      return "شناسه محصول نمی‌تواند بیشتر از ۲۰۰ کاراکتر باشد.";
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

  const handleValidation = (field: string, value: string) => {
    let error = "";
    if (field === "name") error = validateName(value);
    if (field === "slug") error = validateSlug(value);
    if (field === "smallDesc") error = validateSmallDesc(value);

    setLocalErrors((prev) => ({ ...prev, [field]: error }));
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, "");
    const numericValue = Number(value);

    if (!isNaN(numericValue)) {
      dispatch({
        type: "SET_FIELD",
        field: "price",
        value: numericValue,
      });
    }

    if (!numericValue) {
      setLocalErrors((prev) => ({
        ...prev,
        price: "قیمت باید یک عدد معتبر باشد.",
      }));
    } else {
      setLocalErrors((prev) => ({ ...prev, price: "" }));
    }
  };

  const handleDiscountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, "");
    const numericValue = Number(value);

    if (!isNaN(numericValue)) {
      dispatch({
        type: "SET_FIELD",
        field: "discount",
        value: numericValue,
      });
    }

    if (!numericValue) {
      setLocalErrors((prev) => ({
        ...prev,
        price: "تخفیف باید یک عدد معتبر باشد.",
      }));
    } else {
      setLocalErrors((prev) => ({ ...prev, discount: "" }));
    }
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
          className="w-full p-2 rounded bg-gray-700 text-white"
          placeholder="نام محصول را وارد کنید"
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
            const value = e.target.value;
            dispatch({ type: "SET_FIELD", field: "slug", value });
            handleValidation("slug", value);
          }}
          className="w-full p-2 rounded bg-gray-700 text-white"
          placeholder="شناسه محصول را وارد کنید"
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
          onChange={(e) =>
            dispatch({
              type: "SET_FIELD",
              field: "categoryID",
              value: Number(e.target.value),
            })
          }
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
        <label htmlFor="subCategory" className="block mb-2">
          زیر دسته بندی
        </label>
        <select
          id="subCategory"
          value={state.subCategoryID || ""}
          onChange={(e) =>
            dispatch({
              type: "SET_FIELD",
              field: "subCategoryID",
              value: Number(e.target.value),
            })
          }
          className="w-full p-2 rounded bg-gray-700 text-white"
          disabled={!state.categoryID}
        >
          <option value="">انتخاب زیر دسته بندی</option>
          {categories
            .find((category) => category.CategoryID === state.categoryID)
            ?.Subcategories.map(
              (subCategory: { CategoryContentId: number; Name: string }) => (
                <option
                  key={subCategory.CategoryContentId}
                  value={subCategory.CategoryContentId}
                >
                  {subCategory.Name}
                </option>
              )
            )}
        </select>
      </div>

      {/* Price */}
      <div className="mb-4">
        <label htmlFor="price" className="block mb-2">
          قیمت
        </label>
        <input
          id="price"
          type="text"
          value={state.price ? addCommas(state.price) : ""}
          onChange={handlePriceChange}
          className="w-full p-2 rounded bg-gray-700 text-white"
          placeholder="قیمت محصول را به ریال وارد کنید."
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
          type="text"
          value={state.discount ? addCommas(state.discount) : ""}
          onChange={handleDiscountChange}
          className="w-full p-2 rounded bg-gray-700 text-white"
          placeholder="تخفیف محصول را به ریال وارد کنید."
        />
        {localErrors.discount && (
          <p className="text-red-500 mt-1">{localErrors.price}</p>
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
          className="w-full p-2 rounded bg-gray-700 text-white"
          placeholder="توضیحات کوتاه برای محصول را وارد کنید"
        />
        {localErrors.smallDesc && (
          <p className="text-red-500 mt-1">{localErrors.smallDesc}</p>
        )}
      </div>

      {/* Banner and Transparent Image */}
      <div className="mb-4">
        <label htmlFor="bannerImage" className="block mb-2">
          تصویر بنر
        </label>
        <input
          id="bannerImage"
          type="file"
          onChange={(e) =>
            dispatch({
              type: "SET_FIELD",
              field: "bannerImage",
              value: e.target.files?.[0] || null,
            })
          }
          className="w-full p-2 rounded bg-gray-700 text-white"
        />
      </div>

      <div className="mb-4">
        <label htmlFor="transparentImage" className="block mb-2">
          تصویر شفاف
        </label>
        <input
          id="transparentImage"
          type="file"
          onChange={(e) =>
            dispatch({
              type: "SET_FIELD",
              field: "transparentImage",
              value: e.target.files?.[0] || null,
            })
          }
          className="w-full p-2 rounded bg-gray-700 text-white"
        />
      </div>
    </div>
  );
};

export default BaseDetails;
