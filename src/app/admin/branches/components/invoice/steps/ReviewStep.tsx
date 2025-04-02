"use client";

import React from "react";
import { Card, Descriptions, Table, Divider, Alert } from "antd";
import { Invoice } from "../../types";

interface ReviewStepProps {
  invoice: Invoice;
  selectedProducts: any[];
  productsWithWarranty: any[];
}

const ReviewStep: React.FC<ReviewStepProps> = ({
  invoice,
  selectedProducts,
  productsWithWarranty,
}) => {
  // Check if all products have valid warranty settings
  const hasInvalidWarranty = productsWithWarranty.some(
    (item) =>
      item.warranty.hasWarranty &&
      (!item.warranty.startdate || !item.warranty.expirydate)
  );

  const columns = [
    {
      title: "نام محصول",
      dataIndex: "Name",
      key: "name",
      render: (text, record) => {
        // Find all items with the same product ID
        const sameProductItems = productsWithWarranty.filter(
          (item) => item.ProductId === record.ProductId
        );

        // Only show product name for the first occurrence
        const isFirstOccurrence =
          sameProductItems.findIndex(
            (item) => item.singleItemId === record.singleItemId
          ) === 0;

        if (isFirstOccurrence) {
          // Get color based on ProductId
          const colorClass = getProductColor(record.ProductId);

          return (
            <div className="flex items-start gap-2">
              <span>{text}</span>
              <span
                className={`${colorClass} text-xs text-white px-2 py-0.5 rounded-full`}
              >
                {sameProductItems.length}×
              </span>
            </div>
          );
        }
        return null;
      },
    },
    {
      title: "قیمت واحد (تومان)",
      key: "price",
      render: (text, record) =>
        new Intl.NumberFormat("fa-IR").format(record.price),
    },
    {
      title: "گارانتی",
      key: "warranty",
      render: (text, record) => {
        if (!record.warranty || record.warranty.hasWarranty === false) {
          return "بدون گارانتی";
        }

        // Find all items with same product ID
        const sameProductItems = productsWithWarranty.filter(
          (item) => item.ProductId === record.ProductId
        );

        // Find index of current item
        const currentIndex = sameProductItems.findIndex(
          (item) => item.singleItemId === record.singleItemId
        );

        // Generate item indicator
        const itemIndicator =
          sameProductItems.length > 1
            ? `عدد ${currentIndex + 1} از ${sameProductItems.length}: `
            : "";

        // Display individual warranty code
        return (
          <div className="flex flex-col">
            <span>
              {itemIndicator}
              {record.warranty.warrantycode}
            </span>
            {record.warranty.startdate && record.warranty.expirydate && (
              <span className="text-xs text-gray-400">
                {new Date(record.warranty.startdate).toLocaleDateString(
                  "fa-IR"
                )}{" "}
                تا{" "}
                {new Date(record.warranty.expirydate).toLocaleDateString(
                  "fa-IR"
                )}
              </span>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <Card className="bg-gray-900 border-0 shadow-md">
      <h3 className="text-lg font-medium text-white mb-4">
        بررسی نهایی فاکتور
      </h3>

      {hasInvalidWarranty && (
        <Alert
          message="خطا در تنظیمات گارانتی"
          description="برخی از محصولات دارای تنظیمات گارانتی ناقص هستند. لطفا به مرحله قبل بازگردید و تنظیمات را کامل کنید."
          type="error"
          showIcon
          className="mb-4"
        />
      )}

      <Descriptions
        title={<span className="text-white">اطلاعات خریدار</span>}
        bordered
        column={1}
        className="mb-4 custom-dark-descriptions"
        labelStyle={{ color: "#d1d5db", backgroundColor: "#1f2937" }}
        contentStyle={{ color: "white", backgroundColor: "#111827" }}
      >
        <Descriptions.Item label="نام و نام خانوادگی">
          {invoice.Fullname}
        </Descriptions.Item>
        <Descriptions.Item label="شماره تماس">
          {invoice.Phonenumber}
        </Descriptions.Item>
      </Descriptions>

      <Divider className="bg-gray-700" />

      <h4 className="text-white mb-4">محصولات</h4>
      <div className="overflow-auto max-h-[500px]">
        <Table
          dataSource={productsWithWarranty}
          columns={columns}
          rowKey="singleItemId"
          pagination={false}
          className="custom-dark-table"
          scroll={{ x: "max-content" }}
          rowClassName={(record) => {
            // Find all items with same product ID
            const sameProductItems = productsWithWarranty.filter(
              (item) => item.ProductId === record.ProductId
            );

            // Find index of current item
            const currentIndex = sameProductItems.findIndex(
              (item) => item.singleItemId === record.singleItemId
            );

            // Add a class based on position
            let className = "dark-table-row";

            // First item of a group
            if (currentIndex === 0) {
              className += " first-group-item";
            }
            // Last item of a group
            else if (currentIndex === sameProductItems.length - 1) {
              className += " last-group-item";
            }
            // Middle items
            else {
              className += " middle-group-item";
            }

            // Add product-specific color class
            const colorIndex = getProductColorIndex(record.ProductId);
            className += ` product-color-${getColorNameByIndex(colorIndex)}`;

            return className;
          }}
          footer={() => (
            <div className="text-right">
              <span className="text-lg font-bold text-white">
                مجموع کل:{" "}
                {new Intl.NumberFormat("fa-IR").format(invoice.TotalAmount)}{" "}
                تومان
              </span>
            </div>
          )}
        />
      </div>

      <Divider className="bg-gray-700" />

      <div className="text-white text-right mt-4">
        <p>
          با ثبت فاکتور، این اطلاعات ذخیره شده و قابل مشاهده در بخش فاکتورها
          خواهد بود.
        </p>
      </div>

      <style jsx global>{`
        .custom-dark-descriptions .ant-descriptions-header {
          color: white;
        }

        .custom-dark-descriptions .ant-descriptions-title {
          color: white;
        }

        .custom-dark-descriptions .ant-descriptions-view {
          border-color: #374151;
        }

        .custom-dark-descriptions th.ant-descriptions-item-label,
        .custom-dark-descriptions td.ant-descriptions-item-content {
          border-color: #374151;
        }

        .custom-dark-table .ant-table {
          background-color: #111827;
          color: white;
        }

        .custom-dark-table .ant-table-thead > tr > th {
          background-color: #1f2937;
          color: white;
          border-bottom: 1px solid #374151;
          position: sticky;
          top: 0;
          z-index: 2;
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

        .custom-dark-table .ant-table-container {
          border: 1px solid #374151;
          border-radius: 8px 8px 0 0;
          overflow: hidden;
        }

        .custom-dark-table .ant-table-footer {
          background-color: #1f2937;
          color: white;
        }

        /* Clean group styling */
        .first-group-item td {
          border-bottom-width: 0 !important;
          padding-bottom: 8px !important;
        }

        .middle-group-item td {
          border-top-width: 0 !important;
          border-bottom-width: 0 !important;
          padding-top: 8px !important;
          padding-bottom: 8px !important;
        }

        .last-group-item td {
          border-top-width: 0 !important;
          padding-top: 8px !important;
        }

        /* Group row backgrounds */
        .dark-table-row:nth-child(odd) {
          background-color: #111827 !important;
        }

        .dark-table-row:nth-child(even) {
          background-color: #1a202c !important;
        }

        /* Product color indicators */
        .product-color-blue td:first-child {
          border-left: 3px solid #3b82f6 !important;
        }

        .product-color-green td:first-child {
          border-left: 3px solid #10b981 !important;
        }

        .product-color-purple td:first-child {
          border-left: 3px solid #8b5cf6 !important;
        }

        .product-color-orange td:first-child {
          border-left: 3px solid #f59e0b !important;
        }

        .product-color-pink td:first-child {
          border-left: 3px solid #ec4899 !important;
        }

        .product-color-cyan td:first-child {
          border-left: 3px solid #06b6d4 !important;
        }

        .product-color-red td:first-child {
          border-left: 3px solid #ef4444 !important;
        }

        .product-color-lime td:first-child {
          border-left: 3px solid #84cc16 !important;
        }

        /* Badge colors for quantity */
        .bg-color-blue {
          background-color: #3b82f6 !important;
        }

        .bg-color-green {
          background-color: #10b981 !important;
        }

        .bg-color-purple {
          background-color: #8b5cf6 !important;
        }

        .bg-color-orange {
          background-color: #f59e0b !important;
        }

        .bg-color-pink {
          background-color: #ec4899 !important;
        }

        .bg-color-cyan {
          background-color: #06b6d4 !important;
        }

        .bg-color-red {
          background-color: #ef4444 !important;
        }

        .bg-color-lime {
          background-color: #84cc16 !important;
        }

        /* Round corners for first and last items */
        .first-group-item td:first-child {
          border-top-left-radius: 3px;
        }

        .last-group-item td:first-child {
          border-bottom-left-radius: 3px;
        }
      `}</style>
    </Card>
  );
};

// Function to get color index for product ID
const getProductColorIndex = (productId: string | number): number => {
  // Ensure productId is a string
  const productIdStr = String(productId);

  // Extract numbers from the productId if possible
  const numbers = productIdStr.match(/\d+/g);
  let numValue = 0;

  if (numbers && numbers.length > 0) {
    // Use the first number found in the ID
    numValue = parseInt(numbers[0], 10);
  } else {
    // If no numbers, use the sum of char codes
    numValue = productIdStr
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  }

  // Return color index (0-7)
  return numValue % 8;
};

// Function to deterministically assign a color class based on product ID
const getProductColor = (productId: string | number): string => {
  const colorIndex = getProductColorIndex(productId);
  return `bg-color-${getColorNameByIndex(colorIndex)}`;
};

// Get color name by index
const getColorNameByIndex = (index: number): string => {
  const colorNames = [
    "blue",
    "green",
    "purple",
    "orange",
    "pink",
    "cyan",
    "red",
    "lime",
  ];

  return colorNames[index];
};

export default ReviewStep;
