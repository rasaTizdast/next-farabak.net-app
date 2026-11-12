"use client";

import axios from "axios";
import { useEffect, useState, useRef, useCallback } from "react";
import { toast, Toaster } from "react-hot-toast";

import { cn } from "@/lib/utils";

import FilterModal from "./components/FilterModal";
import NewProductModal from "./components/newProductModal/NewProductWizard";
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

  const [fetchError, setFetchError] = useState<boolean>(false);

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

  useEffect(
    () => () => {
      if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    },
    []
  );

  // Memoize refetchProducts to ensure a stable reference
  const refetchProducts = useCallback(async () => {
    const props = {
      page: pagination.currentPage,
      setIsLoading,
      setProducts,
      setPagination,
      setNotFound,
      setFetchError,
      filters,
      searchQuery,
    };
    await fetchProducts(props);
  }, [pagination.currentPage, filters, searchQuery]);

  useEffect(() => {
    refetchProducts();
  }, [refetchProducts]);

  const handleSearch = async (query: string) => {
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
      debounceTimeout.current = null;
    }
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
      const s3Response = await axios
        .delete("/api/s3/delete", {
          data: {
            type: "productImages", // Indicates this is a product image
            productId: id, // The ID of the product
          },
        })
        .catch((error: unknown) => {
          // Products created without images have no storage folder to remove.
          if (axios.isAxiosError(error) && error.response?.status === 404) {
            return { status: 200 };
          }
          throw error;
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

  const activeFilterLabels = [
    searchQuery ? `جستجو: ${searchQuery}` : null,
    filters.category ? `دسته‌بندی: ${filters.category}` : null,
    filters.subCategory ? `زیردسته‌بندی: ${filters.subCategory}` : null,
    filters.available === true ? "فقط موجود" : null,
    filters.available === false ? "فقط ناموجود" : null,
  ].filter((label): label is string => Boolean(label));

  const catFetchGuard = useRef(false);
  useEffect(() => {
    if (!catFetchGuard.current) {
      catFetchGuard.current = true;
      (async () => {
        const res = await axios.get("/api/categories/getAll");
        setCategories(res.data);
      })();
    }
  }, []);

  return (
    <>
      <Toaster position="bottom-center" />
      <header className="mb-6 w-full">
        <h1 className="text-xl font-bold text-white sm:text-2xl">مدیریت محصولات</h1>
        <p className="text-sm text-gray-300">از اینجا می‌توانید محصولات را مدیریت کنید</p>
      </header>
      <div className={cn("flex w-full flex-col gap-6")}>
        {/* Top Bar */}
        <div
          className={cn(
            "flex w-full flex-col items-center justify-between space-y-4 lg:flex-row lg:space-y-0"
          )}
        >
          {/* Search and Filter */}
          <div className={cn("flex w-full flex-col gap-3 sm:flex-row lg:w-auto")}>
            <div className="relative w-full sm:min-w-64 lg:w-80">
              <input
                ref={inputRef}
                type="text"
                placeholder="جستجوی نام یا شناسه محصول…"
                value={tempSearchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                aria-label="جستجوی محصول"
                className="admin-products-search min-h-11 w-full rounded-lg border border-slate-500 bg-white px-4 py-2 text-base text-slate-950 shadow-sm transition-colors placeholder:text-slate-500 hover:border-slate-600 focus-visible:border-blue-300 focus-visible:ring-2 focus-visible:ring-blue-300 focus-visible:outline-none motion-reduce:transition-none"
              />
            </div>
            <button
              type="button"
              onClick={() => setShowFilterModal(true)}
              className={`w-full rounded-lg px-4 py-2 text-white transition-colors focus-visible:ring-2 focus-visible:ring-blue-300 focus-visible:outline-none motion-reduce:transition-none lg:w-auto ${
                hasFilters(filters)
                  ? "bg-orange-600 hover:bg-orange-700"
                  : "bg-blue-950 hover:bg-blue-600"
              }`}
            >
              {hasFilters(filters) ? "فیلتر فعال" : "فیلتر"}
            </button>
            {hasFilters(filters) && (
              <button
                type="button"
                onClick={clearFilters}
                className={cn(
                  "w-full rounded-lg bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-700 focus-visible:ring-2 focus-visible:ring-red-300 focus-visible:outline-none motion-reduce:transition-none lg:w-auto"
                )}
              >
                حذف فیلترها
              </button>
            )}
          </div>
          {/* New Product Button */}
          <button
            type="button"
            data-testid="new-product-button"
            className={cn(
              "mt-4 w-full rounded-lg bg-green-600 px-4 py-2 text-white transition-colors hover:bg-green-700 focus-visible:ring-2 focus-visible:ring-green-300 focus-visible:outline-none motion-reduce:transition-none lg:mt-0 lg:w-auto"
            )}
            onClick={() => setShowNewProductModal(true)}
          >
            محصول جدید
          </button>
        </div>

        <div
          role="status"
          aria-live="polite"
          aria-label="خلاصه فیلترهای محصولات"
          className="rounded-lg border border-slate-600 bg-slate-800/80 px-4 py-3 text-sm text-slate-200"
        >
          {activeFilterLabels.length > 0 ? (
            <>
              <span className="font-semibold text-white">فیلترهای فعال:</span>{" "}
              {activeFilterLabels.join(" · ")}
            </>
          ) : (
            "فیلتر فعالی اعمال نشده است."
          )}
        </div>

        {/* Table */}
        {fetchError && !isLoading ? (
          <div
            role="alert"
            className="flex w-full flex-col items-center gap-4 rounded-lg bg-red-600/20 p-5 text-center text-white shadow-lg"
          >
            <p>خطا در دریافت اطلاعات</p>
            <button
              type="button"
              onClick={() => refetchProducts()}
              className="rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 focus-visible:ring-2 focus-visible:ring-blue-300 focus-visible:outline-none motion-reduce:transition-none"
            >
              تلاش مجدد
            </button>
          </div>
        ) : (
          <ProductsTable
            products={products}
            isLoading={isLoading}
            notFound={notFound}
            setCurrentAction={setCurrentAction}
            setIsModalOpen={setIsModalOpen}
            refetchProducts={refetchProducts}
          />
        )}

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
      {!isLoading && !notFound && !fetchError && (
        <div className="w-full" role="status" aria-live="polite">
          <Pagination pagination={pagination} setPagination={setPagination} />
        </div>
      )}
    </>
  );
};

export default AdminProductsPage;
