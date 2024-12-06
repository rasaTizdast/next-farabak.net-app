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
    { CategoryID: string; Name: string }[]
  >([]);
  const [subCategories, setSubCategories] = useState<
    { CategoryContentID: string; Name: string; CategoryID: string }[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);

  // State for holding the selected filters before applying them
  const [tempFilters, setTempFilters] = useState<Filters>(filters);

  useEffect(() => {
    const fetchCategoriesAndSubCategories = async () => {
      try {
        const { data } = await axios.get("/api/admin/products/filterData");
        setCategories(data.categories);
        setSubCategories(data.subCategories);
      } catch (error) {
        console.error("Error fetching categories and subcategories:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategoriesAndSubCategories();
  }, []);

  const handleApplyFilters = () => {
    // Applying the filters
    applyFilters({
      category: tempFilters.category,
      subCategory: tempFilters.subCategory,
      available: tempFilters.available,
    });
    setShowFilterModal(false); // Close the modal
  };

  const handleResetFilters = () => {
    setTempFilters({
      category: "",
      subCategory: "",
      available: null,
    });
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg p-8 w-[450px] shadow-xl relative">
        {isLoading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-300 rounded w-full"></div>
            <div className="h-8 bg-gray-300 rounded w-full"></div>
            <div className="h-8 bg-gray-300 rounded w-full"></div>
          </div>
        ) : (
          <>
            <p className="text-center text-xl font-semibold mb-4">
              اعمال فیلتر
            </p>

            {/* Categories Dropdown */}
            <div className="mb-6">
              <label className="block text-gray-700 mb-2">دسته‌بندی:</label>
              <select
                value={tempFilters.category}
                onChange={(e) =>
                  setTempFilters({ ...tempFilters, category: e.target.value })
                }
                className="w-full p-3 border rounded-lg"
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
            <div className="mb-6">
              <label className="block text-gray-700 mb-2">زیر دسته‌بندی:</label>
              <select
                value={tempFilters.subCategory}
                onChange={(e) =>
                  setTempFilters({
                    ...tempFilters,
                    subCategory: e.target.value,
                  })
                }
                className="w-full p-3 border rounded-lg"
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
            <div className="mb-6">
              <label className="block text-gray-700 mb-2">وضعیت موجودی:</label>
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
                className="w-full p-3 border rounded-lg"
              >
                <option value="">همه</option>
                <option value="true">موجود</option>
                <option value="false">ناموجود</option>
              </select>
            </div>

            {/* Apply and Reset Buttons */}
            <div className="flex justify-between">
              <button
                onClick={handleApplyFilters}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                اعمال
              </button>
              <button
                onClick={handleResetFilters}
                className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                تنظیم مجدد
              </button>
              <button
                onClick={() => setShowFilterModal(false)}
                className="px-6 py-3 bg-gray-400 text-white rounded-lg hover:bg-gray-500"
              >
                لغو
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default FilterModal;
