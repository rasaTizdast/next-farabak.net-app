import React, { useState, useMemo } from "react";
import Link from "next/link";
import ProductTableSkeleton from "./ProductTableSkeleton";
import {
  FaExternalLinkAlt,
  FaSort,
  FaSortUp,
  FaSortDown,
} from "react-icons/fa";
import { formatPrice } from "../helper/formatPrice";

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

type Props = {
  isLoading: boolean;
  products: Product[];
  setIsModalOpen: (arg0: boolean) => void;
  setCurrentAction: (updatedAction: {
    id: number | number[];
    type: "availability" | "bulk-availability" | "delete" | "bulk-delete" | "";
    name: string | string[];
  }) => void;
};

type SortKey = keyof Pick<Product, "Type" | "Price" | "Available">;

const ProductsTable = ({
  isLoading,
  products,
  setIsModalOpen,
  setCurrentAction,
}: Props) => {
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
  const [sortConfig, setSortConfig] = useState<{
    key: SortKey;
    direction: "ascending" | "descending";
  }>({ key: "Type", direction: "ascending" });

  // Sorting function
  const sortedProducts = useMemo(() => {
    if (!products.length) return [];

    return [...products].sort((a, b) => {
      const key = sortConfig.key;

      if (a[key] < b[key]) {
        return sortConfig.direction === "ascending" ? -1 : 1;
      }
      if (a[key] > b[key]) {
        return sortConfig.direction === "ascending" ? 1 : -1;
      }
      return 0;
    });
  }, [products, sortConfig]);

  // Handle sorting
  const handleSort = (key: SortKey) => {
    setSortConfig((prevConfig) => ({
      key,
      direction:
        prevConfig.key === key && prevConfig.direction === "ascending"
          ? "descending"
          : "ascending",
    }));
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
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  const handleBulkAction = (actionType: "availability" | "delete") => {
    if (selectedProducts.length > 0) {
      setIsModalOpen(true);
      setCurrentAction({
        id: selectedProducts,
        type: `bulk-${actionType}`,
        name: selectedProducts.map(
          (id) => products.find((p) => p.ProductId === id)?.Type || ""
        ),
      });
    }
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
      className="px-6 py-3 cursor-pointer select-none"
      onClick={() => handleSort(sortKey)}
    >
      <div className="flex items-center justify-center gap-2">
        {children}
        {sortConfig.key === sortKey &&
          (sortConfig.direction === "ascending" ? (
            <FaSortUp aria-label="Sort ascending" />
          ) : (
            <FaSortDown aria-label="Sort descending" />
          ))}
        {sortConfig.key !== sortKey && (
          <FaSort className="text-gray-400" aria-label="Sort" />
        )}
      </div>
    </th>
  );

  return (
    <div className="w-full overflow-x-auto rounded-xl max-w-[1800px]">
      {selectedProducts.length > 0 && (
        <div className="flex justify-between items-center bg-slate-600 p-4 rounded-t-xl">
          <span className="text-white">
            {selectedProducts.length} محصول انتخاب شده
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => handleBulkAction("availability")}
              className="px-3 py-1 bg-amber-600 text-white text-xs rounded-lg hover:bg-amber-800 transition-all"
            >
              تغییر وضعیت موجودی
            </button>
            <button
              onClick={() => handleBulkAction("delete")}
              className="px-3 py-1 bg-red-600 text-white text-xs rounded-lg hover:bg-red-700 transition-all"
            >
              حذف محصولات
            </button>
          </div>
        </div>
      )}
      <table className="w-full text-sm text-center text-gray-300 table-auto border-spacing-0 border-separate">
        <thead className="text-sm text-gray-100 uppercase bg-slate-800">
          <tr>
            <th scope="col" className="px-6 py-3 w-12">
              <input
                type="checkbox"
                className="form-checkbox h-4 w-4 text-indigo-600 transition duration-150 ease-in-out"
                checked={selectedProducts.length === sortedProducts.length}
                onChange={handleSelectAll}
              />
            </th>
            <SortableHeader sortKey="Type">نام محصول</SortableHeader>
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
            ? [...Array(10)].map((_, index: number) => (
                <ProductTableSkeleton key={index} />
              ))
            : sortedProducts.map((product, index) => (
                <tr
                  key={product.ProductId}
                  className={`${
                    index % 2 === 0 ? "bg-slate-700" : "bg-slate-600"
                  } hover:bg-slate-900 transition-all`}
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
                  <td className="px-6 py-4">{product.categorySlug}</td>
                  <td className="px-6 py-4">{product.subCategorySlug}</td>
                  <td className="px-6 py-4">{product.productSlug}</td>
                  <td className="px-6 py-4">{formatPrice(product.Price)}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 text-xs rounded-lg ${
                        product.Available
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {product.Available ? "موجود" : "ناموجود"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2 justify-center">
                      <button
                        onClick={() => {
                          setIsModalOpen(true);
                          setCurrentAction({
                            id: product.ProductId,
                            type: "availability",
                            name: product.Type,
                          });
                        }}
                        className="px-2 py-1 bg-amber-600 text-white text-xs sm:text-sm rounded-lg hover:bg-amber-800 transition-all"
                      >
                        {product.Available ? "غیرفعال‌سازی" : "فعال‌سازی"}
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
                        className="px-2 py-1 bg-red-600 text-white text-xs sm:text-sm rounded-lg hover:bg-red-700 transition-all"
                      >
                        حذف
                      </button>
                      <Link
                        href={`/products/${product.link}`}
                        target="_blank"
                        className="flex gap-2 items-center px-2 py-1 bg-emerald-600 text-white text-xs sm:text-sm rounded-lg hover:bg-emerald-700 transition-all"
                      >
                        صفحه محصول‌
                        <FaExternalLinkAlt />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProductsTable;
