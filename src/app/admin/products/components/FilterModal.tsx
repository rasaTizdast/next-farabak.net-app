import { useState } from "react";

import { useApiFetch } from "@/hooks/useApiFetch";

type Filters = {
  category: string;
  subCategory: string;
  available: boolean | null;
};

type Props = {
  filters: Filters;
  applyFilters: (newFilters: Filters) => void;
  setShowFilterModal: (visible: boolean) => void;
};

type FilterData = {
  categories: {
    CategoryID: string;
    Name: string;
    subCategories: { CategoryContentID: string; Name: string }[];
  }[];
};

const FilterModal = ({ filters, applyFilters, setShowFilterModal }: Props) => {
  const {
    data: filterData,
    loading: isLoading,
  } = useApiFetch<FilterData>("/api/admin/products/filterData");

  const categories = filterData?.categories ?? [];

  const [tempFilters, setTempFilters] = useState<Filters>(() => filters);

  const handleApplyFilters = () => {
    applyFilters(tempFilters);
    setShowFilterModal(false);
  };

  const handleResetFilters = () => {
    setTempFilters({
      category: "",
      subCategory: "",
      available: null,
    });
  };

  // Get subcategories based on the selected category
  const getSubCategories = (categoryId: string) => {
    const selectedCategory = categories.find((category) => +category.CategoryID === +categoryId);
    return selectedCategory ? selectedCategory.subCategories : [];
  };

  // Get the current subcategories for the selected category
  const subCategories = getSubCategories(tempFilters.category);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm transition-opacity">
      <div className="relative w-full max-w-lg animate-fade-in rounded-xl bg-gray-800 p-6 text-white shadow-lg">
        {/* Close Button */}
        <button
          onClick={() => setShowFilterModal(false)}
          className="absolute right-4 top-4 text-gray-400 transition hover:text-white"
        >
          ✕
        </button>

        {isLoading ? (
          <div className="animate-pulse space-y-6">
            <div className="mx-auto h-8 w-32 rounded-lg bg-gray-600"></div>
            <div className="space-y-4">
              <div className="h-10 w-full rounded-lg bg-gray-600"></div>
              <div className="h-12 w-full rounded-lg bg-gray-600"></div>
              <div className="h-10 w-full rounded-lg bg-gray-600"></div>
            </div>
            <div className="flex justify-end gap-4">
              <div className="mt-6 h-12 w-24 rounded-lg bg-gray-600"></div>
              <div className="mt-6 h-12 w-24 rounded-lg bg-gray-600"></div>
            </div>
          </div>
        ) : (
          <>
            <h2 className="mb-6 text-center text-lg font-semibold">اعمال فیلترها</h2>

            {/* Categories Dropdown */}
            <div className="mb-4">
              <label className="mb-2 block font-medium text-gray-300">دسته‌بندی</label>
              <select
                value={tempFilters.category}
                onChange={(e) => {
                  setTempFilters({
                    ...tempFilters,
                    category: e.target.value,
                    subCategory: "", // Reset subCategory when category changes
                  });
                }}
                className="w-full rounded-lg border border-gray-600 bg-gray-700 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">انتخاب کنید</option>
                {categories.map((category) => (
                  <option key={category.CategoryID} value={category.CategoryID}>
                    {category.Name}
                  </option>
                ))}
              </select>
            </div>

            {/* Subcategories Dropdown */}
            <div className="mb-4">
              <label className="mb-2 block font-medium text-gray-300">زیر دسته‌بندی</label>
              <select
                value={tempFilters.subCategory}
                onChange={(e) =>
                  setTempFilters({
                    ...tempFilters,
                    subCategory: e.target.value,
                  })
                }
                className="w-full rounded-lg border border-gray-600 bg-gray-700 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={!tempFilters.category} // Disable if no category is selected
              >
                <option value="">انتخاب کنید</option>
                {subCategories.map((subCategory) => (
                  <option key={subCategory.CategoryContentID} value={subCategory.CategoryContentID}>
                    {subCategory.Name}
                  </option>
                ))}
              </select>
            </div>

            {/* Availability Dropdown */}
            <div className="mb-4">
              <label className="mb-2 block font-medium text-gray-300">وضعیت موجودی</label>
              <select
                value={tempFilters.available === null ? "" : tempFilters.available.toString()}
                onChange={(e) =>
                  setTempFilters({
                    ...tempFilters,
                    available:
                      e.target.value === "" ? null : e.target.value === "true" ? true : false,
                  })
                }
                className="w-full rounded-lg border border-gray-600 bg-gray-700 px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">همه</option>
                <option value="true">موجود</option>
                <option value="false">ناموجود</option>
              </select>
            </div>

            {/* Buttons */}
            <div className="mt-6 flex justify-end gap-4">
              <button
                onClick={handleResetFilters}
                className="rounded-lg bg-gray-600 px-4 py-2 text-gray-300 transition hover:bg-gray-500"
              >
                تنظیم مجدد
              </button>
              <button
                onClick={handleApplyFilters}
                className="rounded-lg bg-blue-600 px-4 py-2 text-white transition hover:bg-blue-700"
              >
                اعمال
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default FilterModal;
