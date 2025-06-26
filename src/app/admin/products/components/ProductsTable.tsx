import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ProductTableSkeleton from "./ProductTableSkeleton";
import {
  FaExternalLinkAlt,
  FaSort,
  FaSortUp,
  FaSortDown,
} from "react-icons/fa";
import ProductEditModal from "./ProductEditModal";
import { Product } from "../types";
import { IoQrCode } from "react-icons/io5";
import QrCodeModal from "./QrCodeModal";
import { fetchUsdToRialRate } from "@/helpers/Usd2RialRate";
import axios from "axios";

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

type SortKey = keyof Pick<Product, "Type" | "Price" | "Available">;

const ProductsTable = ({
  isLoading,
  products,
  notFound,
  setIsModalOpen,
  setCurrentAction,
  refetchProducts,
}: Props) => {
  const router = useRouter();
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
  const [productQuantities, setProductQuantities] = useState<
    Record<number, { value: number; timestamp: number }>
  >({});
  const [loadingQuantities, setLoadingQuantities] = useState<
    Record<number, boolean>
  >({});

  const [sortConfig, setSortConfig] = useState<{
    key: SortKey;
    direction: "ascending" | "descending";
  }>({ key: "Type", direction: "ascending" });

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

  const updatePrice = (price: number) => {
    if (!price) return "بدون قیمت";
    if (!isValidRate) return "برای دریافت قیمت تماس بگیرید";
    const updatedPrice = price * usdRate!;
    return updatedPrice.toLocaleString("fa-IR") + " تومان";
  };

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

  const handleBulkAction = (actionType: "delete") => {
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
      const response = await axios.get(
        `/api/admin/branches/product-quantity/${productId}`
      );
      if (response.status === 200) {
        setProductQuantities((prev) => ({
          ...prev,
          [productId]: {
            value: response.data.totalQuantity || 0,
            timestamp: now,
          },
        }));
      }
    } catch (error) {
      console.error("Error fetching product quantity:", error);
    } finally {
      setLoadingQuantities((prev) => ({ ...prev, [productId]: false }));
    }
  };

  // Navigate to branches page with product filter
  const navigateToBranches = (productId: number) => {
    router.push(`/admin/branches?productId=${productId}`);
  };

  if (notFound) {
    return (
      <div className="w-full text-center text-white p-5 rounded-lg bg-blue-600 shadow-lg animate-fade-in transition-all">
        محصولی یافت نشد
      </div>
    );
  }

  return (
    <>
      <div className="w-full overflow-x-auto rounded-xl max-w-[1800px]">
        {selectedProducts.length > 0 && (
          <div className="flex flex-wrap justify-between items-center bg-slate-600 p-4 rounded-t-xl text-xs lg:text-sm">
            <span className="text-white">
              {selectedProducts.length} محصول انتخاب شده
            </span>
            <div className="flex gap-2 flex-wrap justify-end">
              <button
                onClick={() => handleBulkAction("delete")}
                className="px-3 py-1 bg-red-600 text-white text-xs rounded-lg hover:bg-red-700 transition-all"
              >
                حذف محصولات
              </button>
            </div>
          </div>
        )}
        <table className="w-full text-xs lg:text-sm text-center text-gray-300 table-auto border-spacing-0 border-separate whitespace-nowrap">
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
                    <td className="px-6 py-4 relative group cursor-help">
                      <span className="absolute left-1/2 -translate-x-1/2 bottom-full -mb-3 opacity-0 group-hover:opacity-100 transition-opacity bg-blue-900 text-white font-extralight text-xs rounded px-2 py-1 whitespace-nowrap">
                        قیمت دلار:{" "}
                        {isValidRate ? (
                          <span className="font-normal">
                            {usdRate?.toLocaleString("fa-IR")} تومان
                          </span>
                        ) : (
                          <span className="font-normal text-yellow-300">
                            خطا در دریافت نرخ ارز
                          </span>
                        )}
                      </span>
                      {product.Price === null ||
                      product.Price === undefined ||
                      +product.Price === 0 ? (
                        <span className="text-gray-400 italic">بدون قیمت</span>
                      ) : !isValidRate ? (
                        <span className="text-yellow-300 font-medium">
                          خطا در دریافت نرخ ارز
                        </span>
                      ) : product.Discount && +product.Discount > 0 ? (
                        <div className="flex flex-col items-center">
                          <span className="text-red-400 line-through">
                            {(+product.Price * usdRate!).toLocaleString(
                              "fa-IR"
                            ) + " تومان"}
                          </span>
                          <span className="text-green-400 font-semibold">
                            {(
                              (+product.Price - +product.Discount) *
                              usdRate!
                            ).toLocaleString("fa-IR") + " تومان"}
                          </span>
                        </div>
                      ) : (
                        <span className="text-white">
                          {(+product.Price * usdRate!).toLocaleString("fa-IR") +
                            " تومان"}
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 text-xs rounded-lg cursor-pointer relative group ${
                          product.Available
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                        onMouseEnter={() =>
                          fetchProductBranchQuantity(product.ProductId)
                        }
                        onClick={() => navigateToBranches(product.ProductId)}
                      >
                        {product.Available ? "موجود" : "ناموجود"}

                        {/* Tooltip on hover */}
                        <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-3 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                          {loadingQuantities[product.ProductId]
                            ? "در حال بارگذاری..."
                            : productQuantities[product.ProductId] !== undefined
                            ? `تعداد کل در شعبه‌ها: ${
                                productQuantities[product.ProductId].value
                              } عدد`
                            : "کلیک برای مشاهده جزئیات در شعبه‌ها"}
                          <div className="absolute left-1/2 -translate-x-1/2 top-full -mt-1 w-2 h-2 bg-slate-800 rotate-45"></div>
                        </div>
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => qrCodeModalHandler(product)}
                          className={`${
                            product.QrCode_Key ? "bg-violet-800" : "bg-sky-600"
                          } ${
                            product.QrCode_Key
                              ? "hover:bg-violet-900"
                              : "hover:bg-sky-700"
                          } p-2 rounded-lg transition-all`}
                        >
                          <IoQrCode size={20} color="#fff" />
                        </button>

                        <button
                          onClick={() => handleEditProduct(product)}
                          className="px-2 py-1 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-all"
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
            <div className="bg-gray-700 text-white rounded-lg p-6 w-11/12 max-w-lg">
              <h3 className="text-xl font-semibold mb-4">
                زیر دسته‌بندی‌های محصول: {activeSubCategories.name}
              </h3>
              <ul className="space-y-2">
                {activeSubCategories.subCategories.map((subCategory, idx) => (
                  <li
                    key={idx}
                    className="text-white bg-gray-800 p-2 rounded-lg"
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
