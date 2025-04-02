"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Table, InputNumber, Card, Spin, Empty, Alert, Tabs } from "antd";
import { Product } from "../../types";

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
  const [error, setError] = useState<string | null>(null);
  const [localSelectedProducts, setLocalSelectedProducts] = useState<any[]>([]);

  // Initialize local state from props on first render and when selectedProducts changes externally
  useEffect(() => {
    setLocalSelectedProducts(selectedProducts);
  }, [selectedProducts]);

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

        // Add price in Rials and selected status
        const extendedProducts = data.map((product: Product) => {
          const price = product.Price ? parseFloat(product.Price) : 0;
          const discount = product.Discount ? parseFloat(product.Discount) : 0;
          const finalPrice = Math.max(0, price - discount); // Calculate price after discount
          const priceInRials = usdToRialRate
            ? finalPrice * usdToRialRate
            : finalPrice;

          // Check if product is already selected
          const existingProduct = localSelectedProducts.find(
            (p) => p.ProductId === product.ProductId
          );

          return {
            ...product,
            priceInRials,
            currentQuantity: product.quantity || 0, // Store the available quantity
            selectedQuantity: existingProduct ? existingProduct.quantity : 0, // How many are selected
            isSelected: !!existingProduct,
            total_price: existingProduct
              ? existingProduct.quantity * priceInRials
              : 0,
          };
        });

        setProducts(extendedProducts as ExtendedProduct[]);
        setError(null);
      } catch (err: any) {
        console.error("Error fetching products:", err);
        setError(err.message || "خطا در دریافت محصولات");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [branchId, usdToRialRate]);

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
          ? parseFloat(record.Price) * (usdToRialRate || 1)
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
          ? parseFloat(record.Discount) * (usdToRialRate || 1)
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

  return (
    <Card className="bg-gray-900 border-0 shadow-md">
      <h3 className="text-lg font-medium text-white mb-4">
        محصولات مورد نظر را انتخاب کنید
      </h3>

      {usdToRialRate && (
        <div className="mb-4 p-3 bg-blue-900/20 border border-blue-800/30 rounded-md">
          <p className="text-blue-100 text-sm">
            نرخ تبدیل دلار به تومان:{" "}
            <span className="font-bold">
              {new Intl.NumberFormat("fa-IR").format(usdToRialRate)} تومان
            </span>
          </p>
        </div>
      )}

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
