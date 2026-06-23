import { DeleteOutlined } from "@ant-design/icons";
import { Table, Button, Popconfirm, InputNumber, Empty, Spin } from "antd";
import React, { useState, useRef, useEffect } from "react";

import { Product } from "./types";

interface ProductTableProps {
  products: Product[];
  loading: boolean;
  onUpdateQuantity: (productId: number, quantity: number) => void;
  onRemove: (productId: number) => void;
  showRemoveButton?: boolean;
}

const ProductTable: React.FC<ProductTableProps> = ({
  products,
  loading,
  onUpdateQuantity,
  onRemove,
  showRemoveButton = true,
}) => {
  // Keep track of debounced values per product
  const [debouncedValues, setDebouncedValues] = useState<{ [key: number]: number }>({});
  const timersRef = useRef<{ [key: number]: NodeJS.Timeout }>({});

  // Handle quantity change with debounce
  const handleQuantityChange = (productId: number, value: number) => {
    // Clear existing timer for this product
    if (timersRef.current[productId]) {
      clearTimeout(timersRef.current[productId]);
    }

    // Update local state immediately for UI
    setDebouncedValues((prev) => ({
      ...prev,
      [productId]: value,
    }));

    // Set a new timer for this product
    timersRef.current[productId] = setTimeout(() => {
      onUpdateQuantity(productId, value);
    }, 2000); // 2 second delay
  };

  // Clean up timers on unmount
  useEffect(() => {
    const currentTimers = timersRef.current;
    return () => {
      Object.values(currentTimers).forEach((timer) => clearTimeout(timer));
    };
  }, []);

  // Define columns based on whether the remove button should be shown
  const baseColumns = [
    {
      title: "نام محصول",
      dataIndex: "Type",
      key: "Type",
      width: showRemoveButton ? "60%" : "70%",
    },
    {
      title: "تعداد",
      dataIndex: "quantity",
      key: "quantity",
      width: showRemoveButton ? "20%" : "30%",
      render: (_: number, record: Product) => (
        <InputNumber
          min={record.quantity}
          value={debouncedValues[record.ProductId] ?? record.quantity}
          onChange={(value) => {
            if (value !== null && value >= record.quantity) {
              handleQuantityChange(record.ProductId, value);
            }
          }}
          onBlur={() => {
            // Update immediately on blur
            if (timersRef.current[record.ProductId]) {
              clearTimeout(timersRef.current[record.ProductId]);
              onUpdateQuantity(record.ProductId, debouncedValues[record.ProductId]);
            }
          }}
          className="dark-input-number w-20"
          style={{
            backgroundColor: "#374151",
            borderColor: "#4b5563",
            color: "#e5e7eb",
          }}
        />
      ),
    },
  ];

  // Add actions column if remove button should be shown
  const columns = showRemoveButton
    ? [
        ...baseColumns,
        {
          title: "عملیات",
          key: "actions",
          width: "20%",
          render: (_: any, product: Product) => (
            <Popconfirm
              title="حذف محصول"
              description="آیا از حذف این محصول از شعبه اطمینان دارید؟"
              onConfirm={() => onRemove(product.ProductId)}
              okText="بله"
              cancelText="خیر"
              okButtonProps={{ className: "bg-red-600 hover:bg-red-700" }}
            >
              <Button
                icon={<DeleteOutlined />}
                danger
                size="small"
                className="!border-none !bg-red-500 !text-white hover:!bg-red-600"
              >
                حذف
              </Button>
            </Popconfirm>
          ),
        },
      ]
    : baseColumns;

  if (loading) {
    return (
      <div className="my-8 flex justify-center">
        <Spin />
      </div>
    );
  }

  return (
    <div className="rounded-lg bg-gray-800 p-4">
      <Table
        columns={columns}
        dataSource={products}
        rowKey="ProductId"
        pagination={false}
        className="dark-table"
        locale={{
          emptyText: (
            <Empty
              description="هیچ محصولی برای این شعبه یافت نشد"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              className="text-gray-400"
            />
          ),
        }}
      />
    </div>
  );
};

export default ProductTable;
