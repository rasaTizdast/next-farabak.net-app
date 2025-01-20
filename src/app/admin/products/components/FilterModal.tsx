import { useState, useEffect } from "react";
import axios from "axios";

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

const FilterModal = ({ filters, applyFilters, setShowFilterModal }: Props) => {
  const [categories, setCategories] = useState<
    {
      CategoryID: string;
      Name: string;
      subCategories: { CategoryContentID: string; Name: string }[];
    }[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);

  const [tempFilters, setTempFilters] = useState<Filters>(filters);

  useEffect(() => {
    const fetchCategoriesAndSubCategories = async () => {
      try {
        const { data } = await axios.get("/api/admin/products/filterData");
        setCategories(data.categories); // API sends categories with subcategories
      } catch (error) {
        throw new Error("Error fetching categories and subcategories:");
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategoriesAndSubCategories();
  }, []);

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
    const selectedCategory = categories.find(
      (category) => +category.CategoryID === +categoryId
    );
    return selectedCategory ? selectedCategory.subCategories : [];
  };

  // Get the current subcategories for the selected category
  const subCategories = getSubCategories(tempFilters.category);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm transition-opacity">
      <div className="bg-gray-800 text-white rounded-xl shadow-lg p-6 w-full max-w-lg relative animate-fade-in">
        {/* Close Button */}
        <button
          onClick={() => setShowFilterModal(false)}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition"
        >
          ✕
        </button>

        {isLoading ? (
          <div className="space-y-6 animate-pulse">
            <div className="h-8 bg-gray-600 rounded-lg w-32 mx-auto"></div>
            <div className="space-y-4">
              <div className="h-10 bg-gray-600 rounded-lg w-full"></div>
              <div className="h-12 bg-gray-600 rounded-lg w-full"></div>
              <div className="h-10 bg-gray-600 rounded-lg w-full"></div>
            </div>
            <div className="flex justify-end gap-4">
              <div className="h-12 bg-gray-600 rounded-lg w-24 mt-6"></div>
              <div className="h-12 bg-gray-600 rounded-lg w-24 mt-6"></div>
            </div>
          </div>
        ) : (
          <>
            <h2 className="text-lg font-semibold text-center mb-6">
              اعمال فیلترها
            </h2>

            {/* Categories Dropdown */}
            <div className="mb-4">
              <label className="block text-gray-300 font-medium mb-2">
                دسته‌بندی
              </label>
              <select
                value={tempFilters.category}
                onChange={(e) => {
                  setTempFilters({
                    ...tempFilters,
                    category: e.target.value,
                    subCategory: "", // Reset subCategory when category changes
                  });
                }}
                className="w-full border border-gray-600 bg-gray-700 text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
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
              <label className="block text-gray-300 font-medium mb-2">
                زیر دسته‌بندی
              </label>
              <select
                value={tempFilters.subCategory}
                onChange={(e) =>
                  setTempFilters({
                    ...tempFilters,
                    subCategory: e.target.value,
                  })
                }
                className="w-full border border-gray-600 bg-gray-700 text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                disabled={!tempFilters.category} // Disable if no category is selected
              >
                <option value="">انتخاب کنید</option>
                {subCategories.map((subCategory) => (
                  <option
                    key={subCategory.CategoryContentID}
                    value={subCategory.CategoryContentID}
                  >
                    {subCategory.Name}
                  </option>
                ))}
              </select>
            </div>

            {/* Availability Dropdown */}
            <div className="mb-4">
              <label className="block text-gray-300 font-medium mb-2">
                وضعیت موجودی
              </label>
              <select
                value={
                  tempFilters.available === null
                    ? ""
                    : tempFilters.available.toString()
                }
                onChange={(e) =>
                  setTempFilters({
                    ...tempFilters,
                    available:
                      e.target.value === ""
                        ? null
                        : e.target.value === "true"
                        ? true
                        : false,
                  })
                }
                className="w-full border border-gray-600 bg-gray-700 text-white rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="">همه</option>
                <option value="true">موجود</option>
                <option value="false">ناموجود</option>
              </select>
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-4 mt-6">
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 text-gray-300 bg-gray-600 rounded-lg hover:bg-gray-500 transition"
              >
                تنظیم مجدد
              </button>
              <button
                onClick={handleApplyFilters}
                className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition"
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
