"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";

import { useUser } from "@/context/UserContext";
import { useApiFetch } from "@/hooks/useApiFetch";

// Extended Product interface with additional properties
interface ExtendedProduct extends Product {
  priceInRials: number;
  currentQuantity: number;
  selectedQuantity: number;
  isSelected: boolean;
  total_price: number;
}

interface ProductSelectionStepProps {
  branchId: number;
  selectedProducts: any[];
  setSelectedProducts: React.Dispatch<React.SetStateAction<any[]>>;
  usdToRialRate: number | null;
  onUpdate: (products: any[], totalAmount: number) => void;
}

interface Product {
  ProductId: number;
  Type: string;
  Price?: string;
  Discount?: string;
  quantity?: number;
}

const ProductSelectionStep: React.FC<ProductSelectionStepProps> = ({
  branchId,
  selectedProducts,
  setSelectedProducts,
  usdToRialRate,
  onUpdate,
}) => {
  const {
    data: rawProducts,
    loading,
    error,
  } = useApiFetch<Product[]>(branchId ? `/api/admin/branches/${branchId}/products` : null);
  const [products, setProducts] = useState<ExtendedProduct[]>([]);
  const [localSelectedProducts, setLocalSelectedProducts] = useState<any[]>([]);
  const [manualExchangeRate, setManualExchangeRate] = useState<number | null>(null);
  const [rawInput, setRawInput] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"products" | "selected">("products");
  const [searchTerm, setSearchTerm] = useState("");
  const { isBranch } = useUser();

  // Determine which exchange rate to use (automatic or manual)
  const effectiveRate = useMemo(() => {
    // If automatic rate is valid, use it
    if (usdToRialRate && !isNaN(usdToRialRate) && usdToRialRate > 0) {
      return usdToRialRate;
    }
    // Otherwise use manual rate if it's set
    return manualExchangeRate;
  }, [usdToRialRate, manualExchangeRate]);

  // Initialize local state from props on first render and when selectedProducts changes externally
  useEffect(() => {
    setLocalSelectedProducts(selectedProducts);
  }, [selectedProducts]);

  // This effect processes the raw products with the current exchange rate
  // without triggering API calls
  useEffect(() => {
    if (!rawProducts || rawProducts.length === 0) return;

    const processedProducts = rawProducts.map((product: Product) => {
      const price = product.Price ? parseFloat(product.Price) : 0;
      const discount = product.Discount ? parseFloat(product.Discount) : 0;
      const finalPrice = Math.max(0, price - discount);

      const priceInRials = effectiveRate ? finalPrice * effectiveRate : 0;

      // Check if product is already selected
      const existingProduct = localSelectedProducts.find((p) => p.ProductId === product.ProductId);

      return {
        ...product,
        priceInRials,
        currentQuantity: product.quantity || 0,
        selectedQuantity: existingProduct ? existingProduct.quantity : 0,
        isSelected: !!existingProduct,
        total_price: existingProduct ? existingProduct.quantity * priceInRials : 0,
      };
    });

    setProducts(processedProducts as ExtendedProduct[]);

    // Update selected products with new prices based on new rate
    if (effectiveRate && localSelectedProducts.length > 0) {
      const updatedSelectedProducts = localSelectedProducts.map((product) => {
        const originalProduct = rawProducts.find((p) => p.ProductId === product.ProductId);
        if (!originalProduct) return product;

        const price = originalProduct.Price ? parseFloat(originalProduct.Price) : 0;
        const discount = originalProduct.Discount ? parseFloat(originalProduct.Discount) : 0;
        const finalPrice = Math.max(0, price - discount);
        const priceInRials = finalPrice * effectiveRate;

        return {
          ...product,
          price: priceInRials,
          total_price: product.quantity * priceInRials,
        };
      });

      // Only update if prices have changed
      const pricesChanged = updatedSelectedProducts.some(
        (p, i) => p.price !== localSelectedProducts[i]?.price
      );

      if (pricesChanged) {
        setLocalSelectedProducts(updatedSelectedProducts);
        onUpdate(
          updatedSelectedProducts,
          updatedSelectedProducts.reduce((sum, p) => sum + p.total_price, 0)
        );
      }
    }
  }, [rawProducts, effectiveRate]);

  // Filter products based on search term
  const filteredProducts = useMemo(() => {
    if (!searchTerm.trim()) return products;

    return products.filter((product) =>
      product.Type.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [products, searchTerm]);

  // Use memoized callback to avoid re-renders
  const handleQuantityChange = useCallback(
    (productId: number, quantity: number | null) => {
      if (quantity === null || quantity < 0) return;

      // Find the product in our products list
      const product = products.find((p) => p.ProductId === productId);
      if (!product) return;

      setLocalSelectedProducts((prevSelected) => {
        // Find if product is already in the selected list
        const existingIndex = prevSelected.findIndex((p) => p.ProductId === productId);

        const updatedProducts = [...prevSelected];

        if (quantity === 0) {
          // Remove product if quantity is zero
          if (existingIndex >= 0) {
            updatedProducts.splice(existingIndex, 1);
          }
        } else {
          // Calculate total price for this product
          const totalPrice = product.priceInRials * quantity;

          if (existingIndex >= 0) {
            // Update existing product
            updatedProducts[existingIndex] = {
              ...updatedProducts[existingIndex],
              quantity,
              price: product.priceInRials,
              total_price: totalPrice,
            };
          } else {
            // Add new product
            updatedProducts.push({
              ProductId: product.ProductId,
              // Use Type instead of Name as requested
              Name: product.Type,
              quantity,
              price: product.priceInRials,
              total_price: totalPrice,
            });
          }
        }

        // Calculate total amount
        const totalAmount = updatedProducts.reduce((sum, p) => sum + p.total_price, 0);

        // Update parent component
        setSelectedProducts(updatedProducts);
        onUpdate(updatedProducts, totalAmount);

        return updatedProducts;
      });

      // Also update the product in the products list for UI consistency without re-fetching
      setProducts((prevProducts) => {
        return prevProducts.map((p) => {
          if (p.ProductId === productId) {
            return {
              ...p,
              selectedQuantity: quantity,
              isSelected: quantity > 0,
              total_price: quantity > 0 ? p.priceInRials * quantity : 0,
            };
          }
          return p;
        });
      });
    },
    [products, setSelectedProducts, onUpdate]
  );

  // Handle manual exchange rate change
  const handleManualRateChange = useCallback((value: string) => {
    // Keep what the user types
    setRawInput(value);

    // Convert Persian digits to English before parsing
    const englishValue = value.replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d)));

    const numValue = englishValue ? parseFloat(englishValue.replace(/,/g, "")) : null;
    if (numValue !== null && !isNaN(numValue)) {
      setManualExchangeRate(numValue);
    } else {
      setManualExchangeRate(null);
    }
  }, []);

  // Format number with Persian digits (for later display, not during typing)
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("fa-IR").format(num);
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-b-2 border-white"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md border border-red-800/30 bg-red-900/20 p-4 text-red-100">
        {error}
      </div>
    );
  }

  const isValidAutoRate = usdToRialRate && !isNaN(usdToRialRate) && usdToRialRate > 0;
  const totalAmount = localSelectedProducts.reduce((sum, p) => sum + p.total_price, 0);

  return (
    <div className="rounded-md border-0 bg-gray-900 p-6 shadow-md">
      <h3 className="mb-4 text-lg font-medium text-white">محصولات مورد نظر را انتخاب کنید</h3>

      {isValidAutoRate ? (
        <div className="mb-4 rounded-md border border-blue-800/30 bg-blue-900/20 p-3">
          <p className="text-sm text-blue-100">
            نرخ تبدیل دلار به تومان:{" "}
            <span className="font-bold">{formatNumber(usdToRialRate)} تومان</span>
          </p>
        </div>
      ) : isBranch ? (
        <div className="mb-4 rounded-md border border-red-800/30 bg-red-900/20 p-4">
          <p className="mb-2 text-red-100">
            <span className="font-bold">خطا در دریافت نرخ ارز</span>
          </p>
          <p className="text-sm text-red-100">
            در حال حاضر امکان ایجاد فاکتور وجود ندارد. لطفا با مدیر سیستم تماس بگیرید تا برای شما
            فاکتور ایجاد کند.
          </p>
        </div>
      ) : (
        <div className="mb-4 rounded-md border border-yellow-800/30 bg-yellow-900/20 p-3">
          <p className="mb-2 text-sm text-yellow-100">
            خطا در دریافت نرخ ارز. لطفا نرخ تبدیل دلار به تومان را وارد کنید:
          </p>
          <div className="flex items-center">
            <input
              type="text"
              min={1}
              value={rawInput}
              onChange={(e) => handleManualRateChange(e.target.value)}
              className="w-48 rounded-md border border-gray-700 bg-gray-800 px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="نرخ ارز را وارد کنید"
            />

            <span className="mr-2 text-white">تومان</span>
          </div>
        </div>
      )}

      {!effectiveRate ? (
        isBranch ? (
          <div className="mb-4 flex items-center rounded-md border border-red-800/30 bg-red-900/20 p-4 text-red-100">
            <svg className="mr-2 h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-1 9a1 1 0 100-2 1 1 0 000 2z"
                clipRule="evenodd"
              />
            </svg>
            امکان ایجاد فاکتور تا زمان رفع مشکل نرخ ارز وجود ندارد.
          </div>
        ) : (
          <div className="mb-4 flex items-center rounded-md border border-red-800/30 bg-red-900/20 p-4 text-red-100">
            <svg className="mr-2 h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-1 9a1 1 0 100-2 1 1 0 000 2z"
                clipRule="evenodd"
              />
            </svg>
            لطفا برای مشاهده و انتخاب محصولات، نرخ تبدیل دلار به تومان را وارد کنید.
          </div>
        )
      ) : (
        <>
          {/* Custom Tabs */}
          <div className="mb-6 border-b border-gray-700">
            <ul className="-mb-px flex flex-wrap">
              <li className="mr-4">
                <button
                  type="button"
                  className={`inline-block rounded-t-lg px-4 py-3 ${
                    activeTab === "products"
                      ? "border-b-2 border-blue-500 font-medium text-white"
                      : "border-b-2 border-transparent text-gray-400 hover:border-gray-700 hover:text-gray-300"
                  }`}
                  onClick={() => setActiveTab("products")}
                >
                  محصولات شعبه
                </button>
              </li>
              <li>
                <button
                  type="button"
                  className={`inline-block rounded-t-lg px-4 py-3 ${
                    activeTab === "selected"
                      ? "border-b-2 border-blue-500 font-medium text-white"
                      : "border-b-2 border-transparent text-gray-400 hover:border-gray-700 hover:text-gray-300"
                  }`}
                  onClick={() => setActiveTab("selected")}
                >
                  محصولات انتخاب شده{" "}
                  {localSelectedProducts.length > 0 && `(${localSelectedProducts.length})`}
                </button>
              </li>
            </ul>
          </div>

          {/* Tab Content */}
          <div className="tab-content">
            {/* Products Tab */}
            {activeTab === "products" && (
              <div>
                {/* Search Input */}
                <div className="mb-4">
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <svg
                        className="h-4 w-4 text-gray-400"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 20 20"
                      >
                        <path
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                        />
                      </svg>
                    </div>
                    <input
                      type="search"
                      className="block w-full rounded-lg border border-gray-700 bg-gray-800 p-2.5 pl-10 text-sm text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="جستجوی محصول..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                {filteredProducts.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full overflow-hidden rounded-lg border border-gray-700 text-right text-sm text-gray-200">
                      <thead className="bg-gray-800 text-xs uppercase text-gray-200">
                        <tr>
                          <th scope="col" className="px-4 py-3">
                            نام محصول
                          </th>
                          <th scope="col" className="px-4 py-3">
                            موجودی
                          </th>
                          <th scope="col" className="px-4 py-3">
                            قیمت اصلی (تومان)
                          </th>
                          <th scope="col" className="px-4 py-3">
                            تخفیف (تومان)
                          </th>
                          <th scope="col" className="px-4 py-3">
                            قیمت نهایی (تومان)
                          </th>
                          <th scope="col" className="px-4 py-3">
                            تعداد
                          </th>
                          <th scope="col" className="px-4 py-3">
                            قیمت کل (تومان)
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-gray-950/50">
                        {filteredProducts.map((product) => {
                          const selectedProduct = localSelectedProducts.find(
                            (p) => p.ProductId === product.ProductId
                          );

                          const originalPrice = product.Price
                            ? parseFloat(product.Price) * (effectiveRate || 1)
                            : 0;
                          const discount = product.Discount
                            ? parseFloat(product.Discount) * (effectiveRate || 1)
                            : 0;

                          return (
                            <tr
                              key={product.ProductId}
                              className="border-b border-gray-700 hover:bg-gray-950"
                            >
                              <td className="px-4 py-3">{product.Type}</td>
                              <td className="px-4 py-3">{product.currentQuantity || 0}</td>
                              <td className="px-4 py-3">
                                {originalPrice ? formatNumber(originalPrice) : "بدون قیمت"}
                              </td>
                              <td className="px-4 py-3">
                                {discount ? formatNumber(discount) : "0"}
                              </td>
                              <td className="px-4 py-3">
                                {product.priceInRials
                                  ? formatNumber(product.priceInRials)
                                  : "بدون قیمت"}
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center">
                                  <div className="flex h-8 items-stretch overflow-hidden rounded-md border border-gray-700 bg-gray-800">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const currentQuantity = selectedProduct?.quantity || 0;
                                        if (currentQuantity > 0) {
                                          handleQuantityChange(
                                            product.ProductId,
                                            currentQuantity - 1
                                          );
                                        }
                                      }}
                                      disabled={(selectedProduct?.quantity || 0) <= 0}
                                      className="flex h-full w-8 items-center justify-center bg-gray-900 text-white hover:bg-gray-800 focus:outline-none disabled:opacity-20 disabled:hover:bg-gray-800"
                                    >
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-3 w-3"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M20 12H4"
                                        />
                                      </svg>
                                    </button>
                                    <input
                                      type="number"
                                      min={0}
                                      max={product.currentQuantity}
                                      value={selectedProduct?.quantity || 0}
                                      onChange={(e) => {
                                        const inputValue = e.target.value
                                          ? parseInt(e.target.value)
                                          : 0;
                                        // Ensure the input value doesn't exceed the available quantity
                                        const validQuantity = Math.min(
                                          inputValue,
                                          product.currentQuantity
                                        );
                                        handleQuantityChange(product.ProductId, validQuantity);
                                      }}
                                      className="h-full w-10 border-0 bg-gray-950 text-center text-white [appearance:textfield] focus:outline-none focus:ring-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const currentQuantity = selectedProduct?.quantity || 0;
                                        if (currentQuantity < product.currentQuantity) {
                                          handleQuantityChange(
                                            product.ProductId,
                                            currentQuantity + 1
                                          );
                                        }
                                      }}
                                      disabled={
                                        (selectedProduct?.quantity || 0) >= product.currentQuantity
                                      }
                                      className="flex h-full w-8 items-center justify-center bg-gray-900 text-white hover:bg-gray-800 focus:outline-none disabled:opacity-20 disabled:hover:bg-gray-800"
                                    >
                                      <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-3 w-3"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M12 4v16m8-8H4"
                                        />
                                      </svg>
                                    </button>
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                {selectedProduct ? formatNumber(selectedProduct.total_price) : "-"}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center rounded-md border border-gray-700 bg-gray-800/50 p-6 text-gray-400">
                    <svg
                      className="mb-3 h-12 w-12"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <p className="text-center text-lg">محصولی یافت نشد</p>
                    <p className="mt-1 text-center text-sm">لطفا عبارت دیگری را جستجو کنید</p>
                  </div>
                )}
              </div>
            )}

            {/* Selected Products Tab */}
            {activeTab === "selected" && (
              <div>
                {localSelectedProducts.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full overflow-hidden rounded-lg border border-gray-700 text-right text-sm text-gray-200">
                      <thead className="bg-gray-800 text-xs uppercase text-gray-200">
                        <tr>
                          <th scope="col" className="px-6 py-3">
                            نام محصول
                          </th>
                          <th scope="col" className="px-6 py-3">
                            تعداد
                          </th>
                          <th scope="col" className="px-6 py-3">
                            قیمت واحد (تومان)
                          </th>
                          <th scope="col" className="px-6 py-3">
                            قیمت کل (تومان)
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-gray-950/50">
                        {localSelectedProducts.map((product) => (
                          <tr
                            key={product.ProductId}
                            className="border-b border-gray-700 hover:bg-gray-700"
                          >
                            <td className="px-6 py-3">{product.Name}</td>
                            <td className="px-6 py-3">{product.quantity}</td>
                            <td className="px-6 py-3">{formatNumber(product.price)}</td>
                            <td className="px-6 py-3">{formatNumber(product.total_price)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center rounded-md border border-gray-700 bg-gray-800/50 p-6 text-gray-400">
                    <svg
                      className="mb-3 h-12 w-12"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                      />
                    </svg>
                    <p className="text-lg">هیچ محصولی انتخاب نشده است</p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="mt-6 text-right text-white">
            <p className="text-lg font-bold">مجموع: {formatNumber(totalAmount)} تومان</p>
          </div>
        </>
      )}
    </div>
  );
};

export default ProductSelectionStep;
