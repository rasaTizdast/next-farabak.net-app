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
  categoryName: string;
  subCategoryName: string;
  productSlug: string;
  Price: number;
  Available: boolean;
  link: string;
  CategoryContentIds: {
    CategoryContentId: number;
    Name: string;
  }[];
};

type Props = {
  isLoading: boolean;
  products: Product[];
  notFound: boolean;
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
  notFound,
  setIsModalOpen,
  setCurrentAction,
}: Props) => {
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
  const [sortConfig, setSortConfig] = useState<{
    key: SortKey;
    direction: "ascending" | "descending";
  }>({ key: "Type", direction: "ascending" });
  const [activeSubCategories, setActiveSubCategories] = useState<{
    name: string;
    subCategories: string[];
  } | null>(null);

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

  if (notFound) {
    return (
      <div className="w-full text-center text-white p-5 rounded-lg bg-blue-600 shadow-lg animate-fade-in transition-all">
        محصولی یافت نشد
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto rounded-xl max-w-[1800px]">
      {selectedProducts.length > 0 && (
        <div className="flex justify-between items-center bg-slate-600 p-4 rounded-t-xl text-xs lg:text-sm">
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
      <table className="w-full text-xs lg:text-sm text-center text-gray-300 table-auto border-spacing-0 border-separate">
        <thead className="text-gray-100 uppercase bg-slate-800">
          <tr>
            <th scope="col" className="px-6 py-3 w-12">
              <input
                type="checkbox"
                className="h-4 w-4 text-indigo-600 transition-all duration-150 ease-in-out"
                checked={selectedProducts.length === sortedProducts.length}
                onChange={handleSelectAll}
                disabled={isLoading}
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
            ? [...Array(10)].map((_, index) => (
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
                  <td className="px-6 py-4">{product.categoryName}</td>
                  <td className="px-6 py-4">
                    {product.CategoryContentIds?.length > 1 ? (
                      <button
                        onClick={() =>
                          setActiveSubCategories({
                            name: product.Type,
                            subCategories: product.CategoryContentIds.map(
                              (sub) => sub.Name
                            ),
                          })
                        }
                        className="text-white bg-blue-600 py-2 px-4 rounded-lg hover:bg-blue-700 transition-all"
                      >
                        مشاهده
                      </button>
                    ) : (
                      <span>
                        {product.CategoryContentIds?.[0]?.Name ||
                          "No Subcategories"}
                      </span>
                    )}
                  </td>

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
                        className="px-2 py-1 bg-amber-600 text-white rounded-lg hover:bg-amber-800 transition-all"
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
                        className="px-2 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all"
                      >
                        حذف
                      </button>
                      <Link
                        href={`/products/${product.link}`}
                        target="_blank"
                        className="flex gap-2 items-center px-2 py-1 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all"
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-lg p-6 w-11/12 max-w-lg">
            <h3 className="text-xl font-semibold mb-4">
              زیر دسته‌بندی‌های محصول: {activeSubCategories.name}
            </h3>
            <ul className="space-y-2">
              {activeSubCategories.subCategories.map((subCategory, idx) => (
                <li
                  key={idx}
                  className="text-gray-800 bg-gray-200 p-2 rounded-lg"
                >
                  {subCategory}
                </li>
              ))}
            </ul>
            <button
              onClick={() => setActiveSubCategories(null)}
              className="mt-8 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-800 transition-all"
            >
              بستن
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsTable;
