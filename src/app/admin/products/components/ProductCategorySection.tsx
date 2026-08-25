import React from "react";

import { Product } from "../types";
import { SelectField } from "./ProductFormFields";

export type Category = {
  CategoryID: number;
  Name: string;
  Subcategories: {
    CategoryContentId: number;
    Name: string;
  }[];
};

type ProductCategorySectionProps = {
  formState: Product;
  categories: Category[];
  selectedCategory: Category | undefined;
  setFormState: React.Dispatch<React.SetStateAction<Product | null>>;
};

const ProductCategorySection: React.FC<ProductCategorySectionProps> = ({
  formState,
  categories,
  selectedCategory,
  setFormState,
}) => {
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const categoryId = Number(e.target.value);
    const selectedCategory = categories.find((category) => category.CategoryID === categoryId);

    if (selectedCategory) {
      setFormState((prevState) =>
        prevState
          ? {
              ...prevState,
              categoryName: selectedCategory.Name,
              CategoryId: selectedCategory.CategoryID,
              subCategoryName: "",
              CategoryContentIds: [],
            }
          : null
      );
    }
  };

  const handleSubCategoryClick = (subCategory: { CategoryContentId: number; Name: string }) => {
    const selectedIds = formState.CategoryContentIds.map((item) => item.CategoryContentId);
    const isSelected = selectedIds.includes(subCategory.CategoryContentId);

    let updatedIds: number[];
    if (isSelected) {
      updatedIds = selectedIds.filter((id) => id !== subCategory.CategoryContentId);
    } else {
      updatedIds = [...selectedIds, subCategory.CategoryContentId];
    }

    setFormState((prevState) => {
      if (!prevState) {
        return null;
      }

      const updatedCategoryContentIds = updatedIds.map((id) => {
        const subCategory = selectedCategory?.Subcategories.find(
          (sub) => sub.CategoryContentId === id
        );

        return {
          CategoryContentId: id,
          Name: subCategory?.Name || "Unknown",
        };
      });

      return {
        ...prevState,
        CategoryContentIds: updatedCategoryContentIds,
      };
    });
  };

  return (
    <>
      <div className="col-span-1 mt-4 block border-t-4 pt-6 sm:col-span-2">
        <SelectField
          label="دسته‌بندی"
          name="categoryName"
          value={formState.CategoryId?.toString() || ""}
          onChange={handleCategoryChange}
          options={categories.map((category) => ({
            value: category.CategoryID.toString(),
            label: category.Name,
          }))}
        />
      </div>
      <div className="col-span-1 mb-4 block border-b-4 pb-6 sm:col-span-2">
        <div className="rounded border border-gray-700 p-4 shadow-lg">
          <h3 className="mb-2 flex gap-2 font-bold">
            زیر دسته‌بندی‌ها
            <div className="group relative">
              <span className="cursor-pointer text-gray-500 hover:text-blue-500">ℹ️</span>
              <div className="absolute top-full right-0 z-40 mt-1 hidden w-64 rounded bg-gray-700 p-3 text-justify text-sm text-white shadow-2xl group-hover:block">
                شما می‌توانید چندین زیر دسته‌بندی را انتخاب کنید. اولین زیر دسته‌بندی که انتخاب
                می‌شود به عنوان زیر دسته‌بندی اصلی محصول نشان داده می‌شود.
              </div>
            </div>
          </h3>

          {formState.CategoryId ? (
            <div className="rounded bg-gray-700 p-2 text-white">
              <div
                className="grid gap-2"
                style={{
                  gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
                }}
              >
                {selectedCategory?.Subcategories.map((subCategory) => {
                  const selectedIds = formState.CategoryContentIds.map(
                    (item) => item.CategoryContentId
                  );
                  const isSelected = selectedIds.includes(subCategory.CategoryContentId);
                  const isFirstSelected =
                    isSelected && selectedIds[0] === subCategory.CategoryContentId;

                  return (
                    <SubCategoryButton
                      key={subCategory.CategoryContentId}
                      subCategory={subCategory}
                      isSelected={isSelected}
                      isFirstSelected={isFirstSelected}
                      onClick={() => handleSubCategoryClick(subCategory)}
                    />
                  );
                })}
              </div>
            </div>
          ) : (
            <select
              id="subCategory"
              disabled
              aria-label="زیر دسته‌بندی"
              className="w-full rounded bg-gray-700 p-2 text-white"
            >
              <option value="">انتخاب زیر دسته‌بندی</option>
            </select>
          )}
        </div>
      </div>
    </>
  );
};

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
      className={`rounded border px-3 py-1 text-center ${
        isSelected
          ? isFirstSelected
            ? "border-green-600 bg-green-600 text-white"
            : "border-blue-600 bg-blue-600 text-white"
          : "border-gray-500 bg-gray-600 text-gray-200 hover:bg-gray-500"
      }`}
    >
      {subCategory.Name}
    </button>
  );
};

export default ProductCategorySection;
