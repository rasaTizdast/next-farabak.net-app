import axios from "axios";
import Link from "next/link";
import React, { useState, useMemo, useEffect } from "react";
import { FaExternalLinkAlt, FaSort, FaSortUp, FaSortDown, FaTimes } from "react-icons/fa";
import { IoQrCode } from "react-icons/io5";

import { fetchUsdToRialRate } from "@/helpers/Usd2RialRate";

import ProductEditModal from "./ProductEditModal";
import ProductQuantityDisplay from "./ProductQuantityDisplay";
import ProductTableSkeleton from "./ProductTableSkeleton";
import QrCodeModal from "./QrCodeModal";
import { Product } from "../types";

type Props = {
  isLoading: boolean;
  products: Product[];
  notFound: boolean;
  setIsModalOpen: (arg0: boolean) => void;
  setCurrentAction: (updatedAction: {
    id: number | number[];
    type: "delete" | "bulk-delete" | "";
    name: string | string[];
  }) => void;
  refetchProducts: () => void;
};

type SortKey = keyof Pick<Product, "Price" | "Available"> | null;

const ProductsTable = ({
  isLoading,
  products,
  notFound,
  setIsModalOpen,
  setCurrentAction,
  refetchProducts,
}: Props) => {
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
  const [productQuantities, setProductQuantities] = useState<
    Record<number, { branches: number; warehouses: number; timestamp: number }>
  >({});
  const [loadingQuantities, setLoadingQuantities] = useState<Record<number, boolean>>({});

  const [sortConfig, setSortConfig] = useState<{
    key: SortKey;
    direction: "ascending" | "descending";
  }>({ key: null, direction: "ascending" });

  const [activeSubCategories, setActiveSubCategories] = useState<{
    name: string;
    subCategories: string[];
  } | null>(null);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [isQrCodeModalOpen, setIsQrCodeModalOpen] = useState(false);
  const [qrCodeProduct, setQrCodeProduct] = useState<Product | null>(null);

  const [usdRate, setUsdRate] = useState<number | null>(null);
  // Fetch the rate when the component mounts
  useEffect(() => {
    const fetchExchangeRate = async () => {
      try {
        const rate = await fetchUsdToRialRate();
        setUsdRate(rate);
      } catch (error) {
        console.error("Failed to fetch USD rate:", error);
        setUsdRate(null); // Don't set a fallback value to properly handle invalid rates
      }
    };
    fetchExchangeRate();
  }, []);

  // Check if the USD rate is valid
  const isValidRate = usdRate && !isNaN(usdRate) && usdRate > 0;

  // Sorting function
  const sortedProducts = useMemo(() => {
    if (!products.length) return [];

    // If no sorting is selected, return products in their original order
    if (sortConfig.key === null) {
      return [...products];
    }

    // Otherwise, apply the selected sort
    return [...products].sort((a, b) => {
      const key = sortConfig.key as keyof Product;

      // Handle potential null values in the comparison
      const valueA = a[key];
      const valueB = b[key];

      // If either value is null or undefined, handle it appropriately
      if (valueA == null && valueB == null) return 0;
      if (valueA == null) return 1; // null values go last
      if (valueB == null) return -1;

      if (valueA < valueB) {
        return sortConfig.direction === "ascending" ? -1 : 1;
      }
      if (valueA > valueB) {
        return sortConfig.direction === "ascending" ? 1 : -1;
      }
      return 0;
    });
  }, [products, sortConfig]);

  // Handle sorting
  const handleSort = (key: SortKey) => {
    setSortConfig((prevConfig) => {
      // If clicking the same column that's already sorted
      if (prevConfig.key === key) {
        // If it's ascending, make it descending
        if (prevConfig.direction === "ascending") {
          return {
            key,
            direction: "descending",
          };
        }
        // If it's already descending, clear the sort (back to default)
        else {
          return {
            key: null,
            direction: "ascending",
          };
        }
      }
      // If clicking a different column, sort it ascending
      else {
        return {
          key,
          direction: "ascending",
        };
      }
    });
  };

  // Toggle select all checkbox
  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setSelectedProducts(sortedProducts.map((p) => p.ProductId));
    } else {
      setSelectedProducts([]);
    }
  };

  // Toggle individual product selection
  const handleSelectProduct = (productId: number) => {
    setSelectedProducts((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  const handleBulkAction = (actionType: "delete") => {
    if (selectedProducts.length > 0) {
      setIsModalOpen(true);
      setCurrentAction({
        id: selectedProducts,
        type: `bulk-${actionType}`,
        name: selectedProducts.map((id) => products.find((p) => p.ProductId === id)?.Type || ""),
      });
    }
  };

  // Reset sorting to default
  const resetSorting = () => {
    setSortConfig({
      key: null,
      direction: "ascending",
    });
  };

  // Sorting header component
  const SortableHeader = ({
    children,
    sortKey,
  }: {
    children: React.ReactNode;
    sortKey: SortKey;
  }) => (
    <th
      scope="col"
      className="cursor-pointer select-none px-6 py-3"
      onClick={() => handleSort(sortKey)}
    >
      <div className="flex items-center justify-center gap-2">
        {children}
        {sortConfig.key === sortKey ? (
          sortConfig.direction === "ascending" ? (
            <FaSortUp aria-label="Sort ascending" />
          ) : (
            <FaSortDown aria-label="Sort descending" />
          )
        ) : (
          <FaSort className="text-gray-400" aria-label="Sort" />
        )}
      </div>
    </th>
  );

  const handleEditProduct = (product: Product) => {
    setIsEditModalOpen(true);
    setCurrentProduct(product);
  };

  const qrCodeModalHandler = (product: Product) => {
    setIsQrCodeModalOpen(true);
    setQrCodeProduct(product);
  };

  // Fetch branch quantities for a product with 30-second cache
  const fetchProductBranchQuantity = async (productId: number) => {
    if (loadingQuantities[productId]) return;

    // Check if we have cached data less than 30 seconds old
    const cached = productQuantities[productId];
    const now = Date.now();
    if (cached && now - cached.timestamp < 30000) {
      // Use cached data if it's less than 30 seconds old
      return;
    }

    setLoadingQuantities((prev) => ({ ...prev, [productId]: true }));

    try {
      const [branchRes, warehouseRes] = await Promise.all([
        axios.get(`/api/admin/branches/product-quantity/${productId}`),
        axios.get(`/api/admin/warehouses/product-quantity/${productId}`),
      ]);

      setProductQuantities((prev) => ({
        ...prev,
        [productId]: {
          branches: branchRes.status === 200 ? branchRes.data.totalQuantity || 0 : 0,
          warehouses: warehouseRes.status === 200 ? warehouseRes.data.totalQuantity || 0 : 0,
          timestamp: now,
        },
      }));
    } catch (error) {
      console.error("Error fetching product quantity:", error);
    } finally {
      setLoadingQuantities((prev) => ({ ...prev, [productId]: false }));
    }
  };

  if (notFound) {
    return (
      <div className="w-full animate-fade-in rounded-lg bg-blue-600 p-5 text-center text-white shadow-lg transition-all">
        محصولی یافت نشد
      </div>
    );
  }

  return (
    <>
      <div className="w-full max-w-[1800px] overflow-x-auto rounded-xl">
        {/* Sort reset bar */}
        {sortConfig.key !== null && (
          <div className="flex justify-end rounded-t-xl bg-blue-600 p-2">
            <button
              onClick={resetSorting}
              className="flex items-center gap-1 rounded-lg bg-blue-800 px-3 py-1 text-xs text-white transition-all hover:bg-blue-900"
            >
              <FaTimes size={10} />
              <span>حذف مرتب‌سازی</span>
            </button>
          </div>
        )}

        {selectedProducts.length > 0 && (
          <div className="flex flex-wrap items-center justify-between rounded-t-xl bg-slate-600 p-4 text-xs lg:text-sm">
            <span className="text-white">{selectedProducts.length} محصول انتخاب شده</span>
            <div className="flex flex-wrap justify-end gap-2">
              <button
                onClick={() => handleBulkAction("delete")}
                className="rounded-lg bg-red-600 px-3 py-1 text-xs text-white transition-all hover:bg-red-700"
              >
                حذف محصولات
              </button>
            </div>
          </div>
        )}
        <table
          className="w-full table-auto border-separate border-spacing-0 whitespace-nowrap text-center text-xs text-gray-300 lg:text-sm"
          data-testid="products-table"
        >
          <thead className="bg-slate-800 uppercase text-gray-100">
            <tr>
              <th scope="col" className="w-12 px-6 py-3">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-indigo-600 transition-all duration-150 ease-in-out"
                  checked={selectedProducts.length === sortedProducts.length}
                  onChange={handleSelectAll}
                  disabled={isLoading}
                />
              </th>

              <th scope="col" className="px-6 py-3">
                نام محصول
              </th>
              <th scope="col" className="px-6 py-3">
                دسته‌بندی
              </th>
              <th scope="col" className="px-6 py-3">
                زیر دسته‌بندی
              </th>
              <th scope="col" className="px-6 py-3">
                شناسه محصول
              </th>
              <SortableHeader sortKey="Price">قیمت</SortableHeader>
              <SortableHeader sortKey="Available">موجودی</SortableHeader>
              <th scope="col" className="px-6 py-3 text-center">
                عملیات
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading
              ? [...Array(10)].map((_, index) => <ProductTableSkeleton key={index} />)
              : sortedProducts.map((product, index) => (
                  <tr
                    key={product.ProductId}
                    className={`${
                      index % 2 === 0 ? "bg-slate-700" : "bg-slate-600"
                    } transition-all hover:bg-slate-900`}
                  >
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        className="h-4 w-4 text-indigo-600 transition duration-150 ease-in-out"
                        checked={selectedProducts.includes(product.ProductId)}
                        onChange={() => handleSelectProduct(product.ProductId)}
                      />
                    </td>
                    <td className="px-6 py-4">{product.Type}</td>
                    <td className="px-6 py-4">{product.categoryName}</td>
                    <td className="px-6 py-4">
                      {product.CategoryContentIds?.length > 1 ? (
                        <button
                          onClick={() =>
                            setActiveSubCategories({
                              name: product.Type,
                              subCategories: product.CategoryContentIds.map((sub) => sub.Name),
                            })
                          }
                          className="rounded-lg bg-blue-600 px-4 py-2 text-white transition-all hover:bg-blue-700"
                        >
                          مشاهده
                        </button>
                      ) : (
                        <span>{product.CategoryContentIds?.[0]?.Name || "No Subcategories"}</span>
                      )}
                    </td>

                    <td className="px-6 py-4">{product.productSlug}</td>
                    <td className="group relative cursor-help px-6 py-4">
                      <span className="absolute bottom-full left-1/2 -mb-3 -translate-x-1/2 whitespace-nowrap rounded bg-blue-900 px-2 py-1 text-xs font-extralight text-white opacity-0 transition-opacity group-hover:opacity-100">
                        قیمت دلار:{" "}
                        {isValidRate ? (
                          <span className="font-normal">
                            {usdRate?.toLocaleString("fa-IR")} تومان
                          </span>
                        ) : (
                          <span className="font-normal text-yellow-300">خطا در دریافت نرخ ارز</span>
                        )}
                      </span>
                      {product.Price === null ||
                      product.Price === undefined ||
                      +product.Price === 0 ? (
                        <span className="italic text-gray-400">بدون قیمت</span>
                      ) : !isValidRate ? (
                        <span className="font-medium text-yellow-300">خطا در دریافت نرخ ارز</span>
                      ) : product.Discount && +product.Discount > 0 ? (
                        <div className="flex flex-col items-center">
                          <span className="text-red-400 line-through">
                            {(+product.Price * usdRate!).toLocaleString("fa-IR") + " تومان"}
                          </span>
                          <span className="font-semibold text-green-400">
                            {((+product.Price - +product.Discount) * usdRate!).toLocaleString(
                              "fa-IR"
                            ) + " تومان"}
                          </span>
                        </div>
                      ) : (
                        <span className="text-white">
                          {(+product.Price * usdRate!).toLocaleString("fa-IR") + " تومان"}
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <ProductQuantityDisplay
                        branchCount={productQuantities[product.ProductId]?.branches ?? 0}
                        warehouseCount={productQuantities[product.ProductId]?.warehouses ?? 0}
                        productId={product.ProductId}
                        Available={product.Available}
                        isLoading={loadingQuantities[product.ProductId]}
                        onHover={() => {
                          if (
                            !productQuantities[product.ProductId] &&
                            !loadingQuantities[product.ProductId]
                          ) {
                            fetchProductBranchQuantity(product.ProductId);
                          }
                        }}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => qrCodeModalHandler(product)}
                          className={`${product.QrCode_Key ? "bg-violet-800" : "bg-sky-600"} ${
                            product.QrCode_Key ? "hover:bg-violet-900" : "hover:bg-sky-700"
                          } rounded-lg p-2 transition-all`}
                        >
                          <IoQrCode size={20} color="#fff" />
                        </button>

                        <button
                          onClick={() => handleEditProduct(product)}
                          className="rounded-lg bg-yellow-600 px-2 py-1 text-white transition-all hover:bg-yellow-700"
                        >
                          ویرایش
                        </button>

                        <button
                          onClick={() => {
                            setIsModalOpen(true);
                            setCurrentAction({
                              id: product.ProductId,
                              type: "delete",
                              name: product.Type,
                            });
                          }}
                          className="rounded-lg bg-red-600 px-2 py-1 text-white transition-all hover:bg-red-700"
                          data-testid="delete-product-button"
                        >
                          حذف
                        </button>

                        <Link
                          href={`/products/${product.link}`}
                          target="_blank"
                          className="flex items-center gap-2 rounded-lg bg-emerald-600 px-2 py-1 text-white transition-all hover:bg-emerald-700"
                        >
                          مشاهده
                          <FaExternalLinkAlt size={12} />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
        {activeSubCategories && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
            <div className="w-11/12 max-w-lg rounded-lg bg-gray-700 p-6 text-white">
              <h3 className="mb-4 text-xl font-semibold">
                زیر دسته‌بندی‌های محصول: {activeSubCategories.name}
              </h3>
              <ul className="space-y-2">
                {activeSubCategories.subCategories.map((subCategory, idx) => (
                  <li key={idx} className="rounded-lg bg-gray-800 p-2 text-white">
                    {subCategory}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => setActiveSubCategories(null)}
                className="mt-8 rounded-lg bg-blue-600 px-4 py-2 text-white transition-all hover:bg-blue-800"
              >
                بستن
              </button>
            </div>
          </div>
        )}
      </div>

      {isEditModalOpen && (
        <ProductEditModal
          product={currentProduct}
          onClose={() => setIsEditModalOpen(false)}
          refetchProducts={refetchProducts}
          setIsEditModalOpen={setIsEditModalOpen}
        />
      )}

      {isQrCodeModalOpen && (
        <QrCodeModal
          onClose={setIsQrCodeModalOpen}
          product={qrCodeProduct}
          refetchProducts={refetchProducts}
        />
      )}
    </>
  );
};

export default ProductsTable;
