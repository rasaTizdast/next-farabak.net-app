"use client";

import axios from "axios";
import { useEffect, useState, useRef, useCallback } from "react";
import { toast, Toaster } from "react-hot-toast";

import FilterModal from "./components/FilterModal";
import NewProductModal from "./components/NewProductModal";
import Pagination from "./components/Pagination";
import ProductDeletionModal from "./components/ProductDeletionModal";
import ProductsTable from "./components/ProductsTable";
import fetchProducts from "./helper/fetchProducts";
import { hasFilters } from "./helper/hasFilters";
import { Product } from "./types";

type Category = {
  CategoryID: number;
  Name: string;
  Available: boolean;
  Subcategories: { CategoryContentId: number; Name: string }[];
};

const AdminProductsPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showNewProductModal, setShowNewProductModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [tempSearchQuery, setTempSearchQuery] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [notFound, setNotFound] = useState<boolean>(false);

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
    type: "delete" | "bulk-delete" | "";
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
      setNotFound,
      filters,
      searchQuery,
    };
    await fetchProducts(props);
  }, [pagination.currentPage, filters, searchQuery]);

  useEffect(() => {
    refetchProducts();
  }, [refetchProducts]);

  const handleSearch = async (query: string) => {
    // If the query is cleared
    if (!query) {
      setSearchQuery(""); // Clear the actual search query
      setTempSearchQuery(""); // Clear the temporary query
      // Reset to page 1 when clearing search
      setPagination((prev) => ({
        ...prev,
        currentPage: 1,
      }));
      return;
    }

    // If there is a query, update the tempSearchQuery immediately
    setTempSearchQuery(query);

    // Clear the previous debounce timeout if any
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    // Set a new debounce timeout to update searchQuery after the delay
    debounceTimeout.current = setTimeout(() => {
      const lowerCaseQuery = query.toLowerCase();

      // Reset to page 1 when search query changes
      setPagination((prev) => ({
        ...prev,
        currentPage: 1,
      }));

      setSearchQuery(lowerCaseQuery); // Set the debounced search query
    }, 300); // Adjust debounce time as needed
  };

  const deleteProduct = async (id: number, name: string) => {
    try {
      // Step 1: Delete the image from S3 using productId
      const s3Response = await axios.delete("/api/s3/delete", {
        data: {
          type: "productImages", // Indicates this is a product image
          productId: id, // The ID of the product
        },
      });

      if (s3Response.status === 200) {
        // Step 2: Delete the product from the database
        const response = await axios.delete(`/api/admin/products/${id}`);

        if (response.status === 200) {
          // If the product is deleted successfully, update the state
          refetchProducts();
          toast.success(`محصول "${name}" حذف شد.`);
        } else {
          toast.error("حذف محصول با خطا مواجه شد.");
        }
      } else {
        toast.error("حذف تصویر محصول با خطا مواجه شد.");
      }
    } catch (error) {
      console.error(error);
      toast.error("حذف محصول با خطا مواجه شد.");
    }
  };

  const handleModalConfirm = () => {
    const { id, type, name } = currentAction;

    switch (type) {
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
    // Reset to page 1 when filters change
    setPagination((prev) => ({
      ...prev,
      currentPage: 1,
    }));

    setFilters(newFilters);
    toast.success("فیلتر اعمال شد.");
    setShowFilterModal(false);
  };

  const clearFilters = () => {
    // Reset to page 1 when filters are cleared
    setPagination((prev) => ({
      ...prev,
      currentPage: 1,
    }));

    setFilters({
      category: "",
      subCategory: "",
      available: null,
    });
    setProducts(products);
    toast.success("فیلترها حذف شدند.");
  };

  const fetchCategories = async () => {
    const res = await axios.get("/api/categories/getAll");
    setCategories(res.data);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return (
    <>
      <Toaster position="bottom-center" />
      <div className="flex flex-col items-center p-4">
        {/* Top Bar */}
        <div className="flex w-full max-w-[1800px] flex-col items-center justify-between space-y-4 lg:flex-row lg:space-y-0">
          {/* Search and Filter */}
          <div className="flex w-full flex-col gap-5 lg:w-auto lg:flex-row">
            <div className="relative w-full lg:w-auto">
              <input
                ref={inputRef}
                type="text"
                placeholder="جستجو"
                value={tempSearchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full rounded-lg border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 lg:min-w-[200px] lg:max-w-[350px]"
              />
            </div>
            <button type="button"
              onClick={() => setShowFilterModal(true)}
              className={`w-full px-4 py-2 lg:w-auto ${
                hasFilters(filters)
                  ? "bg-orange-600 hover:bg-orange-700"
                  : "bg-blue-950 hover:bg-blue-600"
              } rounded-lg text-white transition-all`}
            >
              {hasFilters(filters) ? "فیلتر فعال" : "فیلتر"}
            </button>
            {hasFilters(filters) && (
              <button type="button"
                onClick={clearFilters}
                className="w-full rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700 lg:w-auto"
              >
                حذف فیلترها
              </button>
            )}
          </div>
          {/* New Product Button */}
          <button type="button"
            data-testid="new-product-button"
            className="mt-4 w-full rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700 lg:mt-0 lg:w-auto"
            onClick={() => setShowNewProductModal(true)}
          >
            محصول جدید
          </button>
        </div>

        <div className="my-8 h-[1px] w-full max-w-[1800px] bg-gray-200" />

        {/* Table */}
        <ProductsTable
          products={products}
          isLoading={isLoading}
          notFound={notFound}
          setCurrentAction={setCurrentAction}
          setIsModalOpen={setIsModalOpen}
          refetchProducts={refetchProducts}
        />

        {/* Modal */}
        {isModalOpen && (
          <ProductDeletionModal
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

        {/* NewProduct Modal */}
        {showNewProductModal && (
          <NewProductModal
            setShowNewProductModal={setShowNewProductModal}
            categories={categories}
            refetchProducts={refetchProducts}
          />
        )}
      </div>

      {/* Pagination */}
      {!isLoading && !notFound && (
        <Pagination pagination={pagination} setPagination={setPagination} />
      )}
    </>
  );
};

export default AdminProductsPage;
