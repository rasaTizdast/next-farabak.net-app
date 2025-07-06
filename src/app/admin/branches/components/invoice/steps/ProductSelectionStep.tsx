"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Table, InputNumber, Card, Spin, Empty, Alert, Tabs } from "antd";
import { Product } from "../../types";
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
  const handleManualRateChange = useCallback((value: number | null) => {
    if (value === null) return;
    setManualExchangeRate(value);
  }, []);

  const branchProductsColumns = [
    {
      title: "نام محصول",
      dataIndex: "Type", // Use Type as name
      key: "name",
    },
    {
      title: "موجودی",
      dataIndex: "currentQuantity",
      key: "stock",
      render: (stock: number) => stock || 0,
    },
    {
      title: "قیمت اصلی (تومان)",
      key: "originalPrice",
      render: (_: any, record: any) => {
        const originalPrice = record.Price
          ? parseFloat(record.Price) * (effectiveRate || 1)
          : 0;
        return originalPrice
          ? new Intl.NumberFormat("fa-IR").format(originalPrice)
          : "بدون قیمت";
      },
    },
    {
      title: "تخفیف (تومان)",
      key: "discount",
      render: (_: any, record: any) => {
        const discount = record.Discount
          ? parseFloat(record.Discount) * (effectiveRate || 1)
          : 0;
        return discount ? new Intl.NumberFormat("fa-IR").format(discount) : "0";
      },
    },
    {
      title: "قیمت نهایی (تومان)",
      dataIndex: "priceInRials",
      key: "price",
      render: (price: number) =>
        price ? new Intl.NumberFormat("fa-IR").format(price) : "بدون قیمت",
    },
    {
      title: "تعداد",
      key: "quantity",
      render: (_: any, record: any) => (
        <InputNumber
          min={0}
          max={record.currentQuantity}
          defaultValue={0}
          value={
            localSelectedProducts.find((p) => p.ProductId === record.ProductId)
              ?.quantity || 0
          }
          onChange={(value) => handleQuantityChange(record.ProductId, value)}
          className="dark-input-number"
          style={{
            backgroundColor: "#1f2937",
            borderColor: "#374151",
            color: "#e5e7eb",
          }}
        />
      ),
    },
    {
      title: "قیمت کل (تومان)",
      key: "totalPrice",
      render: (_: any, record: any) => {
        const selectedProduct = localSelectedProducts.find(
          (p) => p.ProductId === record.ProductId
        );

        if (!selectedProduct) return "-";

        return new Intl.NumberFormat("fa-IR").format(
          selectedProduct.total_price
        );
      },
    },
  ];

  const selectedProductsColumns = [
    {
      title: "نام محصول",
      dataIndex: "Name",
      key: "name",
    },
    {
      title: "تعداد",
      dataIndex: "quantity",
      key: "quantity",
    },
    {
      title: "قیمت واحد (تومان)",
      key: "price",
      render: (_: any, record: any) =>
        new Intl.NumberFormat("fa-IR").format(record.price),
    },
    {
      title: "قیمت کل (تومان)",
      key: "totalPrice",
      render: (_: any, record: any) =>
        new Intl.NumberFormat("fa-IR").format(record.total_price),
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return <Alert message={error} type="error" />;
  }

  const isValidAutoRate =
    usdToRialRate && !isNaN(usdToRialRate) && usdToRialRate > 0;

  return (
    <Card className="bg-gray-900 border-0 shadow-md">
      <h3 className="text-lg font-medium text-white mb-4">
        محصولات مورد نظر را انتخاب کنید
      </h3>

      {isValidAutoRate ? (
        <div className="mb-4 p-3 bg-blue-900/20 border border-blue-800/30 rounded-md">
          <p className="text-blue-100 text-sm">
            نرخ تبدیل دلار به تومان:{" "}
            <span className="font-bold">
              {new Intl.NumberFormat("fa-IR").format(usdToRialRate)} تومان
            </span>
          </p>
        </div>
      ) : isBranch ? (
        <div className="mb-4 p-4 bg-red-900/20 border border-red-800/30 rounded-md">
          <p className="text-red-100 mb-2">
            <span className="font-bold">خطا در دریافت نرخ ارز</span>
          </p>
          <p className="text-red-100 text-sm">
            در حال حاضر امکان ایجاد فاکتور وجود ندارد. لطفا با مدیر سیستم تماس بگیرید تا برای شما فاکتور ایجاد کند.
          </p>
        </div>
      ) : (
        <div className="mb-4 p-3 bg-yellow-900/20 border border-yellow-800/30 rounded-md">
          <p className="text-yellow-100 text-sm mb-2">
            خطا در دریافت نرخ ارز. لطفا نرخ تبدیل دلار به تومان را وارد کنید:
          </p>
          <div className="flex items-center">
            <InputNumber
              min={1}
              value={manualExchangeRate || undefined}
              onChange={handleManualRateChange}
              className="dark-input-number"
              formatter={(value) =>
                value ? `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",") : ""
              }
              parser={(value) =>
                value ? parseFloat(value.replace(/,/g, "")) : 0
              }
              style={{
                backgroundColor: "#1f2937",
                borderColor: "#374151",
                color: "#e5e7eb",
                width: "180px",
              }}
            />
            <span className="text-white mr-2">تومان</span>
          </div>
        </div>
      )}

      {!effectiveRate ? (
        isBranch ? (
          <Alert
            message="امکان ایجاد فاکتور تا زمان رفع مشکل نرخ ارز وجود ندارد."
            type="error"
            className="mb-4"
            showIcon
          />
        ) : (
          <Alert
            message="لطفا برای مشاهده و انتخاب محصولات، نرخ تبدیل دلار به تومان را وارد کنید."
            type="error"
            className="mb-4"
            showIcon
          />
        )
      ) : (
        <>
          <Tabs
            defaultActiveKey="1"
            className="custom-dark-tabs"
            type="card"
            items={[
              {
                key: "1",
                label: "محصولات شعبه",
                children:
                  products.length > 0 ? (
                    <Table
                      dataSource={products}
                      columns={branchProductsColumns}
                      rowKey="ProductId"
                      pagination={false}
                      className="custom-dark-table"
                      scroll={{ x: "max-content" }}
                      rowClassName="dark-table-row"
                    />
                  ) : (
                    <Empty description="محصولی برای این شعبه یافت نشد" />
                  ),
              },
              {
                key: "2",
                label: "محصولات انتخاب شده",
                children:
                  localSelectedProducts.length > 0 ? (
                    <Table
                      dataSource={localSelectedProducts}
                      columns={selectedProductsColumns}
                      rowKey="ProductId"
                      pagination={false}
                      className="custom-dark-table"
                      scroll={{ x: "max-content" }}
                      rowClassName="dark-table-row"
                    />
                  ) : (
                    <Empty description="هیچ محصولی انتخاب نشده است" />
                  ),
              },
            ]}
          />

          <div className="mt-4 text-white text-right">
            <p className="text-lg font-bold">
              مجموع:{" "}
              {new Intl.NumberFormat("fa-IR").format(
                localSelectedProducts.reduce((sum, p) => sum + p.total_price, 0)
              )}{" "}
              تومان
            </p>
          </div>
        </>
      )}

      <style jsx global>{`
        .custom-dark-table .ant-table {
          background-color: #111827;
          color: white;
        }

        .custom-dark-table .ant-table-thead > tr > th {
          background-color: #1f2937;
          color: white;
          border-bottom: 1px solid #374151;
        }

        .custom-dark-table .ant-table-tbody > tr > td {
          border-bottom: 1px solid #374151;
          color: white;
        }

        .custom-dark-table .ant-table-tbody > tr.dark-table-row:hover > td {
          background-color: #2d3748;
        }

        .dark-table-row {
          background-color: #111827;
        }

        .custom-dark-tabs .ant-empty-description {
          color: white !important;
        }

        .custom-dark-table .ant-table-container {
          border: 1px solid #374151;
          border-radius: 8px;
          overflow: hidden;
        }

        .custom-dark-table .ant-table-footer {
          background-color: #1f2937;
          color: white;
          border-top: 1px solid #374151;
        }

        /* Fix the tabs styling to match the overall UI */
        .custom-dark-tabs .ant-tabs-nav {
          margin-bottom: 16px;
        }

        .custom-dark-tabs .ant-tabs-tab {
          background-color: #1e293b !important;
          border-color: #334155 !important;
          border-radius: 8px 8px 0 0 !important;
          padding: 8px 16px !important;
          margin-right: 8px !important;
          transition: all 0.2s ease;
          color: #b5bdca;
          opacity: 0.8;
        }

        .custom-dark-tabs .ant-tabs-tab:hover {
          background-color: #263244 !important;
          opacity: 1;
        }

        .custom-dark-tabs .ant-tabs-tab-active {
          background-color: #19202b !important;
          opacity: 1;
        }

        .custom-dark-tabs .ant-tabs-tab-active .ant-tabs-tab-btn {
          color: white !important;
          font-weight: 500;
        }

        .custom-dark-tabs .ant-tabs-content {
          background-color: none;
          padding: 10px;
          border-radius: 8px;
        }

        .custom-dark-tabs .ant-tabs-ink-bar {
          display: none;
        }

        .custom-dark-tabs .ant-tabs-nav:before {
          border-bottom: 1px solid #334155;
        }

        .custom-dark-tabs .ant-tabs-nav-list {
          display: flex;
          gap: 4px;
        }
      `}</style>
    </Card>
  );
};

export default ProductSelectionStep;
