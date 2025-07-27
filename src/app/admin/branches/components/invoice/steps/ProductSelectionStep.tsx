"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useUser } from "@/context/UserContext";

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
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<ExtendedProduct[]>([]);
  const [rawProducts, setRawProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [localSelectedProducts, setLocalSelectedProducts] = useState<any[]>([]);
  const [manualExchangeRate, setManualExchangeRate] = useState<number | null>(
    null
  );
  const [activeTab, setActiveTab] = useState<"products" | "selected">(
    "products"
  );
  const [searchTerm, setSearchTerm] = useState("");
  const { isAdmin, isBranch } = useUser();

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

  // This effect only fetches raw product data from the API
  useEffect(() => {
    if (!branchId) return;

    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `/api/admin/branches/${branchId}/products`
        );

        if (!response.ok) {
          throw new Error("خطا در دریافت محصولات");
        }

        const data = await response.json();
        setRawProducts(data);
        setError(null);
      } catch (err: any) {
        console.error("Error fetching products:", err);
        setError(err.message || "خطا در دریافت محصولات");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [branchId]); // Only depends on branchId, not on rate changes

  // This effect processes the raw products with the current exchange rate
  // without triggering API calls
  useEffect(() => {
    if (rawProducts.length === 0) return;

    const processedProducts = rawProducts.map((product: Product) => {
      const price = product.Price ? parseFloat(product.Price) : 0;
      const discount = product.Discount ? parseFloat(product.Discount) : 0;
      const finalPrice = Math.max(0, price - discount);

      const priceInRials = effectiveRate ? finalPrice * effectiveRate : 0;

      // Check if product is already selected
      const existingProduct = localSelectedProducts.find(
        (p) => p.ProductId === product.ProductId
      );

      return {
        ...product,
        priceInRials,
        currentQuantity: product.quantity || 0,
        selectedQuantity: existingProduct ? existingProduct.quantity : 0,
        isSelected: !!existingProduct,
        total_price: existingProduct
          ? existingProduct.quantity * priceInRials
          : 0,
      };
    });

    setProducts(processedProducts as ExtendedProduct[]);

    // Update selected products with new prices based on new rate
    if (effectiveRate && localSelectedProducts.length > 0) {
      const updatedSelectedProducts = localSelectedProducts.map((product) => {
        const originalProduct = rawProducts.find(
          (p) => p.ProductId === product.ProductId
        );
        if (!originalProduct) return product;

        const price = originalProduct.Price
          ? parseFloat(originalProduct.Price)
          : 0;
        const discount = originalProduct.Discount
          ? parseFloat(originalProduct.Discount)
          : 0;
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
        const existingIndex = prevSelected.findIndex(
          (p) => p.ProductId === productId
        );

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
        const totalAmount = updatedProducts.reduce(
          (sum, p) => sum + p.total_price,
          0
        );

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

  // Handle manual exchange rate change without full re-renders
  const handleManualRateChange = useCallback((value: string) => {
    const numValue = value ? parseFloat(value.replace(/,/g, "")) : null;
    if (numValue === null) return;
    setManualExchangeRate(numValue);
  }, []);

  // Format number with Persian digits
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat("fa-IR").format(num);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-800/30 text-red-100 p-4 rounded-md">
        {error}
      </div>
    );
  }

  const isValidAutoRate =
    usdToRialRate && !isNaN(usdToRialRate) && usdToRialRate > 0;
  const totalAmount = localSelectedProducts.reduce(
    (sum, p) => sum + p.total_price,
    0
  );

  return (
    <div className="bg-gray-900 border-0 rounded-md shadow-md p-6">
      <h3 className="text-lg font-medium text-white mb-4">
        محصولات مورد نظر را انتخاب کنید
      </h3>

      {isValidAutoRate ? (
        <div className="mb-4 p-3 bg-blue-900/20 border border-blue-800/30 rounded-md">
          <p className="text-blue-100 text-sm">
            نرخ تبدیل دلار به تومان:{" "}
            <span className="font-bold">
              {formatNumber(usdToRialRate)} تومان
            </span>
          </p>
        </div>
      ) : isBranch ? (
        <div className="mb-4 p-4 bg-red-900/20 border border-red-800/30 rounded-md">
          <p className="text-red-100 mb-2">
            <span className="font-bold">خطا در دریافت نرخ ارز</span>
          </p>
          <p className="text-red-100 text-sm">
            در حال حاضر امکان ایجاد فاکتور وجود ندارد. لطفا با مدیر سیستم تماس
            بگیرید تا برای شما فاکتور ایجاد کند.
          </p>
        </div>
      ) : (
        <div className="mb-4 p-3 bg-yellow-900/20 border border-yellow-800/30 rounded-md">
          <p className="text-yellow-100 text-sm mb-2">
            خطا در دریافت نرخ ارز. لطفا نرخ تبدیل دلار به تومان را وارد کنید:
          </p>
          <div className="flex items-center">
            <input
              type="text"
              min={1}
              value={manualExchangeRate ? formatNumber(manualExchangeRate) : ""}
              onChange={(e) => handleManualRateChange(e.target.value)}
              className="bg-gray-800 border border-gray-700 text-white rounded-md px-3 py-2 w-48 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="نرخ ارز را وارد کنید"
            />
            <span className="text-white mr-2">تومان</span>
          </div>
        </div>
      )}

      {!effectiveRate ? (
        isBranch ? (
          <div className="bg-red-900/20 border border-red-800/30 text-red-100 p-4 rounded-md mb-4 flex items-center">
            <svg
              className="h-5 w-5 mr-2"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-1 9a1 1 0 100-2 1 1 0 000 2z"
                clipRule="evenodd"
              />
            </svg>
            امکان ایجاد فاکتور تا زمان رفع مشکل نرخ ارز وجود ندارد.
          </div>
        ) : (
          <div className="bg-red-900/20 border border-red-800/30 text-red-100 p-4 rounded-md mb-4 flex items-center">
            <svg
              className="h-5 w-5 mr-2"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-1 9a1 1 0 100-2 1 1 0 000 2z"
                clipRule="evenodd"
              />
            </svg>
            لطفا برای مشاهده و انتخاب محصولات، نرخ تبدیل دلار به تومان را وارد
            کنید.
          </div>
        )
      ) : (
        <>
          {/* Custom Tabs */}
          <div className="mb-6 border-b border-gray-700">
            <ul className="flex flex-wrap -mb-px">
              <li className="mr-4">
                <button
                  className={`inline-block py-3 px-4 rounded-t-lg ${
                    activeTab === "products"
                      ? "text-white border-b-2 border-blue-500 font-medium"
                      : "text-gray-400 hover:text-gray-300 border-b-2 border-transparent hover:border-gray-700"
                  }`}
                  onClick={() => setActiveTab("products")}
                >
                  محصولات شعبه
                </button>
              </li>
              <li>
                <button
                  className={`inline-block py-3 px-4 rounded-t-lg ${
                    activeTab === "selected"
                      ? "text-white border-b-2 border-blue-500 font-medium"
                      : "text-gray-400 hover:text-gray-300 border-b-2 border-transparent hover:border-gray-700"
                  }`}
                  onClick={() => setActiveTab("selected")}
                >
                  محصولات انتخاب شده{" "}
                  {localSelectedProducts.length > 0 &&
                    `(${localSelectedProducts.length})`}
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
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <svg
                        className="w-4 h-4 text-gray-400"
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
                      className="block w-full p-2.5 pl-10 text-sm rounded-lg bg-gray-800 border border-gray-700 placeholder-gray-400 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="جستجوی محصول..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                {filteredProducts.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-right text-gray-200 rounded-lg overflow-hidden border border-gray-700">
                      <thead className="text-xs uppercase bg-gray-800 text-gray-200">
                        <tr>
                          <th scope="col" className="py-3 px-4">
                            نام محصول
                          </th>
                          <th scope="col" className="py-3 px-4">
                            موجودی
                          </th>
                          <th scope="col" className="py-3 px-4">
                            قیمت اصلی (تومان)
                          </th>
                          <th scope="col" className="py-3 px-4">
                            تخفیف (تومان)
                          </th>
                          <th scope="col" className="py-3 px-4">
                            قیمت نهایی (تومان)
                          </th>
                          <th scope="col" className="py-3 px-4">
                            تعداد
                          </th>
                          <th scope="col" className="py-3 px-4">
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
                            ? parseFloat(product.Discount) *
                              (effectiveRate || 1)
                            : 0;

                          return (
                            <tr
                              key={product.ProductId}
                              className="border-b border-gray-700 hover:bg-gray-950"
                            >
                              <td className="py-3 px-4">{product.Type}</td>
                              <td className="py-3 px-4">
                                {product.currentQuantity || 0}
                              </td>
                              <td className="py-3 px-4">
                                {originalPrice
                                  ? formatNumber(originalPrice)
                                  : "بدون قیمت"}
                              </td>
                              <td className="py-3 px-4">
                                {discount ? formatNumber(discount) : "0"}
                              </td>
                              <td className="py-3 px-4">
                                {product.priceInRials
                                  ? formatNumber(product.priceInRials)
                                  : "بدون قیمت"}
                              </td>
                              <td className="py-3 px-4">
                                <div className="flex items-center">
                                  <div className="flex h-8 items-stretch rounded-md overflow-hidden border border-gray-700 bg-gray-800">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const currentQuantity =
                                          selectedProduct?.quantity || 0;
                                        if (currentQuantity > 0) {
                                          handleQuantityChange(
                                            product.ProductId,
                                            currentQuantity - 1
                                          );
                                        }
                                      }}
                                      disabled={
                                        (selectedProduct?.quantity || 0) <= 0
                                      }
                                      className="flex items-center justify-center w-8 h-full bg-gray-900 hover:bg-gray-800 text-white disabled:opacity-20 disabled:hover:bg-gray-800 focus:outline-none"
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
                                        handleQuantityChange(
                                          product.ProductId,
                                          validQuantity
                                        );
                                      }}
                                      className="w-10 text-center h-full bg-gray-950 text-white focus:outline-none focus:ring-0 border-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const currentQuantity =
                                          selectedProduct?.quantity || 0;
                                        if (
                                          currentQuantity <
                                          product.currentQuantity
                                        ) {
                                          handleQuantityChange(
                                            product.ProductId,
                                            currentQuantity + 1
                                          );
                                        }
                                      }}
                                      disabled={
                                        (selectedProduct?.quantity || 0) >=
                                        product.currentQuantity
                                      }
                                      className="flex items-center justify-center w-8 h-full bg-gray-900 hover:bg-gray-800 text-white disabled:opacity-20 disabled:hover:bg-gray-800 focus:outline-none"
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
                              <td className="py-3 px-4">
                                {selectedProduct
                                  ? formatNumber(selectedProduct.total_price)
                                  : "-"}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center p-6 text-gray-400 bg-gray-800/50 border border-gray-700 rounded-md">
                    <svg
                      className="w-12 h-12 mb-3"
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
                    <p className="text-center text-sm mt-1">
                      لطفا عبارت دیگری را جستجو کنید
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Selected Products Tab */}
            {activeTab === "selected" && (
              <div>
                {localSelectedProducts.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-right text-gray-200 rounded-lg overflow-hidden border border-gray-700">
                      <thead className="text-xs uppercase bg-gray-800 text-gray-200">
                        <tr>
                          <th scope="col" className="py-3 px-6">
                            نام محصول
                          </th>
                          <th scope="col" className="py-3 px-6">
                            تعداد
                          </th>
                          <th scope="col" className="py-3 px-6">
                            قیمت واحد (تومان)
                          </th>
                          <th scope="col" className="py-3 px-6">
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
                            <td className="py-3 px-6">{product.Name}</td>
                            <td className="py-3 px-6">{product.quantity}</td>
                            <td className="py-3 px-6">
                              {formatNumber(product.price)}
                            </td>
                            <td className="py-3 px-6">
                              {formatNumber(product.total_price)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center p-6 text-gray-400 bg-gray-800/50 border border-gray-700 rounded-md">
                    <svg
                      className="w-12 h-12 mb-3"
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

          <div className="mt-6 text-white text-right">
            <p className="text-lg font-bold">
              مجموع: {formatNumber(totalAmount)} تومان
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default ProductSelectionStep;
