"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { toast, Toaster } from "react-hot-toast";
import axios from "axios";

import Modal from "./components/Modal";
import FilterModal from "./components/FilterModal";
import Pagination from "./components/Pagination";
import fetchProducts from "./helper/fetchProducts";
import ProductsTable from "./components/ProductsTable";
import { hasFilters } from "./helper/hasFilters";

type Product = {
  ProductId: number;
  Type: string;
  categorySlug: string;
  subCategorySlug: string;
  productSlug: string;
  Price: number;
  Available: boolean;
  link: string;
};

const AdminProductsPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [tempSearchQuery, setTempSearchQuery] = useState("");

  const [filters, setFilters] = useState<{
    category: string;
    subCategory: string;
    available: boolean | null;
  }>({
    category: "",
    subCategory: "",
    available: null,
  });

  const [currentAction, setCurrentAction] = useState<{
    id: number | number[];
    type: "availability" | "bulk-availability" | "delete" | "bulk-delete" | "";
    name: string | string[];
  }>({
    id: 0,
    type: "",
    name: "",
  });

  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
  });

  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  // Memoize refetchProducts to ensure a stable reference
  const refetchProducts = useCallback(async () => {
    const props = {
      page: pagination.currentPage,
      setIsLoading,
      setProducts,
      setPagination,
      filters,
      searchQuery,
    };
    await fetchProducts(props);
  }, [pagination.currentPage, filters, searchQuery]);

  useEffect(() => {
    refetchProducts();
  }, [refetchProducts]);

  const handleSearch = async (query: string) => {
    if (!query) {
      // Clear both search query states immediately
      setSearchQuery("");
      setTempSearchQuery(""); // Ensure both states are cleared

      // Refetch products with an empty query (or no filters)
      refetchProducts();
      return;
    }

    // Set the temporary query to reflect input changes immediately
    setTempSearchQuery(query);

    // Clear previous debounce timeout if any
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    // Set a new debounce timeout to update searchQuery after the delay
    debounceTimeout.current = setTimeout(() => {
      const lowerCaseQuery = query.toLowerCase();
      setSearchQuery(lowerCaseQuery); // Set the debounced search query
    }, 300); // Adjust debounce time as needed
  };

  const toggleAvailability = async (id: number, name: string) => {
    try {
      await axios.patch("/api/admin/products/toggleAvailable", {
        productId: id,
      });
      toast.success(`وضعیت محصول ${name} تغییر کرد.`);

      // Re-fetch products after updating availability
      await refetchProducts();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(
          error.response?.data.message || "خطا در فرآیند بروزرسانی"
        );
      }
    }
  };

  const deleteProduct = (id: number, name: string) => {
    const updatedProducts = products.filter(
      (product) => product.ProductId !== id
    );
    setProducts(updatedProducts);
    toast.success(`محصول "${name}" حذف شد.`);
  };

  const handleModalConfirm = () => {
    const { id, type, name } = currentAction;

    switch (type) {
      case "bulk-availability":
        // Check if id and name are arrays for bulk availability
        if (Array.isArray(id) && Array.isArray(name)) {
          id.forEach((productId, index) => {
            toggleAvailability(+productId, name[index].toString());
          });
        }
        break;

      case "availability":
        // Single availability toggle
        toggleAvailability(+id, name.toString());
        break;

      case "bulk-delete":
        // Check if id and name are arrays for bulk delete
        if (Array.isArray(id) && Array.isArray(name)) {
          id.forEach((productId, index) => {
            deleteProduct(+productId, name[index].toString());
          });
        }
        break;

      case "delete":
        // Single delete
        deleteProduct(+id, name.toString());
        break;

      default:
        break;
    }

    setIsModalOpen(false);
  };

  const applyFilters = async (newFilters: {
    category: string;
    subCategory: string;
    available: boolean | null;
  }) => {
    console.log(newFilters); // Debug: Check if new filters are being passed correctly
    setFilters(newFilters);
    toast.success("فیلتر اعمال شد.");
    setShowFilterModal(false);
  };

  const clearFilters = () => {
    setFilters({
      category: "",
      subCategory: "",
      available: null,
    });
    setProducts(products);
    toast.success("فیلترها حذف شدند.");
  };
  return (
    <>
      <Toaster position="bottom-center" />
      <div className="flex flex-col items-center p-4">
        {/* Top Bar */}
        <div className="w-full flex justify-between items-center max-w-[1800px]">
          {/* Search and Filter */}
          <div className="flex gap-5">
            <div className="relative">
              <input
                type="text"
                placeholder="جستجو"
                value={tempSearchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="p-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={() => setShowFilterModal(true)}
              className={`px-4 py-2 ${
                hasFilters(filters) ? "bg-orange-600" : "bg-blue-600"
              } text-white rounded-lg hover:bg-blue-700`}
            >
              {hasFilters(filters) ? "فیلتر فعال" : "فیلتر"}
            </button>
            {hasFilters(filters) && (
              <button
                onClick={clearFilters}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                حذف فیلترها
              </button>
            )}
          </div>
          {/* New Product Button */}
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
            محصول جدید
          </button>
        </div>

        <div className="w-full h-[1px] bg-gray-200 my-8 max-w-[1800px]" />

        {/* Table */}
        <ProductsTable
          products={products}
          isLoading={isLoading}
          setCurrentAction={setCurrentAction}
          setIsModalOpen={setIsModalOpen}
        />

        {/* Modal */}
        {isModalOpen && (
          <Modal
            currentAction={currentAction}
            handleModalConfirm={handleModalConfirm}
            setIsModalOpen={setIsModalOpen}
          />
        )}

        {/* Filter Modal */}
        {showFilterModal && (
          <FilterModal
            filters={filters}
            applyFilters={applyFilters}
            setShowFilterModal={setShowFilterModal}
          />
        )}
      </div>

      {/* Pagination */}
      {!isLoading && (
        <Pagination pagination={pagination} setPagination={setPagination} />
      )}
    </>
  );
};

export default AdminProductsPage;
