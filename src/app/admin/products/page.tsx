"use client";

import { useEffect, useState, useRef } from "react";
import { toast, Toaster } from "react-hot-toast";
import axios from "axios";

import Modal from "./components/Modal";
import FilterModal from "./components/FilterModal";
import Pagination from "./components/Pagination";
import fetchProducts from "./helper/fetchProducts";
import ProductsTable from "./components/ProductsTable";

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
  const [filteredProducts, setFilteredProducts] = useState(products);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<string[]>([]); // Placeholder for active filters
  const [isLoading, setIsLoading] = useState(true);
  const [currentAction, setCurrentAction] = useState({
    id: 0,
    type: "",
    name: "",
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
  });

  const debounceTimeout = useRef<NodeJS.Timeout | null>(null); // Ref for debounce timeout

  useEffect(() => {
    const props = {
      page: pagination.currentPage,
      setIsLoading,
      setProducts,
      setFilteredProducts,
      setPagination,
    };

    fetchProducts(props);
  }, [pagination.currentPage]);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);

    // If the query is empty, reset the filtered products and hide pagination
    if (!query) {
      setFilteredProducts(products);
      return;
    }

    // Set the search results with a debounce to avoid constant requests
    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    debounceTimeout.current = setTimeout(async () => {
      const lowerCaseQuery = query.toLowerCase();
      try {
        const result = await axios.get(
          `/api/products/search?q=${lowerCaseQuery}&limit=0`
        );
        const { data } = result;
        setFilteredProducts(data.data);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    }, 300); // Debounce for 300ms
  };

  const toggleAvailability = (id: number, name: string) => {
    const updatedProducts = products.map((product: Product) =>
      product.ProductId === id
        ? { ...product, Available: !product.Available }
        : product
    );
    setProducts(updatedProducts);
    setFilteredProducts(updatedProducts); // Reflect changes in the filtered list
    toast.success(`وضعیت محصول ${name} تغییر کرد.`);
  };

  const deleteProduct = (id: number, name: string) => {
    const updatedProducts = products.filter(
      (product) => product.ProductId !== id
    );
    setProducts(updatedProducts);
    setFilteredProducts(updatedProducts); // Reflect changes in the filtered list
    toast.success(`محصول "${name}" حذف شد.`);
  };

  const handleModalConfirm = () => {
    const { id, type, name } = currentAction;

    if (type === "availability") {
      toggleAvailability(id, name);
    } else if (type === "delete") {
      deleteProduct(id, name);
    }

    setIsModalOpen(false);
  };

  const applyFilters = () => {
    const newFilters = ["Example Filter"]; // Add a filter as a placeholder
    setFilters(newFilters);
    toast.success("فیلتر اعمال شد.");
    setShowFilterModal(false);
  };

  const clearFilters = () => {
    setFilters([]);
    setFilteredProducts(products); // Reset filtered products
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
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="p-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={() => setShowFilterModal(true)}
              className={`px-4 py-2 ${
                filters.length > 0 ? "bg-orange-600" : "bg-blue-600"
              } text-white rounded-lg hover:bg-blue-700`}
            >
              {filters.length > 0 ? "فیلتر فعال" : "فیلتر"}
            </button>
            {filters.length > 0 && (
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
          filteredProducts={filteredProducts}
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
            applyFilters={applyFilters}
            setShowFilterModal={setShowFilterModal}
          />
        )}
      </div>

      {/* Pagination */}
      {/* Show pagination only if search query is empty */}
      {!isLoading && !searchQuery && (
        <Pagination pagination={pagination} setPagination={setPagination} />
      )}
    </>
  );
};

export default AdminProductsPage;
