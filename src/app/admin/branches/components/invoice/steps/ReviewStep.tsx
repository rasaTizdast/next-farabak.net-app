"use client";

import { Card, Descriptions, Table, Divider, Alert } from "antd";
import React from "react";

import { Invoice } from "../../types";

const faNumberFormatter = new Intl.NumberFormat("fa-IR");

interface ReviewStepProps {
  invoice: Invoice;
  productsWithWarranty: any[];
}

const ReviewStep: React.FC<ReviewStepProps> = ({ invoice, productsWithWarranty }) => {
  // Check if all products have valid warranty settings
  const hasInvalidWarranty = productsWithWarranty.some(
    (item) => item.warranty.hasWarranty && (!item.warranty.startdate || !item.warranty.expirydate)
  );

  const columns = [
    {
      title: "نام محصول",
      dataIndex: "Name",
      key: "name",
      render: (text: string, record: { ProductId: number; singleItemId: number }) => {
        // Find all items with the same product ID
        const sameProductItems = productsWithWarranty.filter(
          (item) => item.ProductId === record.ProductId
        );

        // Only show product name for the first occurrence
        const isFirstOccurrence =
          sameProductItems.findIndex((item) => item.singleItemId === record.singleItemId) === 0;

        if (isFirstOccurrence) {
          // Get color based on ProductId
          const colorClass = getProductColor(record.ProductId);

          return (
            <div className="flex items-start gap-2">
              <span>{text}</span>
              <span className={`${colorClass} rounded-full px-2 py-0.5 text-xs text-white`}>
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
      render: (text: unknown, record: any) => faNumberFormatter.format(record.price),
    },
    {
      title: "گارانتی",
      key: "warranty",
      render: (text: unknown, record: any) => {
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
            ? `محصول ${currentIndex + 1} از ${sameProductItems.length}: `
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
                {new Date(record.warranty.startdate).toLocaleDateString("fa-IR")} تا{" "}
                {new Date(record.warranty.expirydate).toLocaleDateString("fa-IR")}
              </span>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <Card className="border-0 bg-gray-900 shadow-md">
      <h3 className="mb-4 text-lg font-medium text-white">بررسی نهایی فاکتور</h3>

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
        className="custom-dark-descriptions mb-4 [&_.ant-descriptions-header]:!text-white [&_.ant-descriptions-title]:!text-white [&_.ant-descriptions-view]:!border-gray-700 [&_td.ant-descriptions-item-content]:!border-gray-700 [&_th.ant-descriptions-item-label]:!border-gray-700"
        labelStyle={{ color: "#d1d5db", backgroundColor: "#1f2937" }}
        contentStyle={{ color: "white", backgroundColor: "#111827" }}
      >
        <Descriptions.Item label="نام و نام خانوادگی">{invoice.Fullname}</Descriptions.Item>
        <Descriptions.Item label="شماره تماس">{invoice.Phonenumber}</Descriptions.Item>
      </Descriptions>

      <Divider className="bg-gray-700" />

      <h4 className="mb-4 text-white">محصولات</h4>
      <div className="max-h-[500px] overflow-auto">
        <Table
          dataSource={productsWithWarranty}
          columns={columns}
          rowKey="singleItemId"
          pagination={false}
          className="custom-dark-table [&_.ant-table-container]:overflow-hidden [&_.ant-table-container]:!rounded-t-lg [&_.ant-table-container]:!border [&_.ant-table-container]:!border-gray-700 [&_.ant-table-footer]:!bg-gray-800 [&_.ant-table-footer]:!text-white [&_.ant-table-tbody>tr:hover>td]:!bg-[#2d3748] [&_.ant-table-tbody>tr>td]:!border-b-gray-700 [&_.ant-table-tbody>tr>td]:!text-white [&_.ant-table-thead>tr>th]:sticky [&_.ant-table-thead>tr>th]:top-0 [&_.ant-table-thead>tr>th]:z-[2] [&_.ant-table-thead>tr>th]:!border-b-gray-700 [&_.ant-table-thead>tr>th]:!bg-gray-800 [&_.ant-table-thead>tr>th]:!text-white [&_.ant-table]:!bg-gray-900 [&_.ant-table]:!text-white"
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

            // Zebra backgrounds for group rows
            let className = "odd:!bg-gray-900 even:!bg-[#1a202c]";

            // First item of a group
            if (currentIndex === 0) {
              className += " [&>td]:!border-b-0 [&>td]:!pb-2 [&>td:first-child]:rounded-tl-[3px]";
            }
            // Last item of a group
            else if (currentIndex === sameProductItems.length - 1) {
              className += " [&>td]:!border-t-0 [&>td]:!pt-2 [&>td:first-child]:rounded-bl-[3px]";
            }
            // Middle items
            else {
              className += " [&>td]:!border-y-0 [&>td]:!py-2";
            }

            // Add product-specific color class
            const colorIndex = getProductColorIndex(record.ProductId);
            className += ` ${getProductRowBorderClass(getColorNameByIndex(colorIndex))}`;

            return className;
          }}
          footer={() => (
            <div className="text-right">
              <span className="text-lg font-bold text-white">
                مجموع کل: {faNumberFormatter.format(invoice.TotalAmount)} تومان
              </span>
            </div>
          )}
        />
      </div>

      <Divider className="bg-gray-700" />

      <div className="mt-4 text-right text-white">
        <p>با ثبت فاکتور، این اطلاعات ذخیره شده و قابل مشاهده در بخش فاکتورها خواهد بود.</p>
      </div>
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
    numValue = productIdStr.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  }

  // Return color index (0-7)
  return numValue % 8;
};

// Color utilities mapped from the color name
const colorClassMap: Record<string, { badge: string; rowBorder: string }> = {
  blue: {
    badge: "!bg-blue-500",
    rowBorder: "[&>td:first-child]:!border-l-[3px] [&>td:first-child]:!border-blue-500",
  },
  green: {
    badge: "!bg-emerald-500",
    rowBorder: "[&>td:first-child]:!border-l-[3px] [&>td:first-child]:!border-emerald-500",
  },
  purple: {
    badge: "!bg-violet-500",
    rowBorder: "[&>td:first-child]:!border-l-[3px] [&>td:first-child]:!border-violet-500",
  },
  orange: {
    badge: "!bg-amber-500",
    rowBorder: "[&>td:first-child]:!border-l-[3px] [&>td:first-child]:!border-amber-500",
  },
  pink: {
    badge: "!bg-pink-500",
    rowBorder: "[&>td:first-child]:!border-l-[3px] [&>td:first-child]:!border-pink-500",
  },
  cyan: {
    badge: "!bg-cyan-500",
    rowBorder: "[&>td:first-child]:!border-l-[3px] [&>td:first-child]:!border-cyan-500",
  },
  red: {
    badge: "!bg-red-500",
    rowBorder: "[&>td:first-child]:!border-l-[3px] [&>td:first-child]:!border-red-500",
  },
  lime: {
    badge: "!bg-lime-500",
    rowBorder: "[&>td:first-child]:!border-l-[3px] [&>td:first-child]:!border-lime-500",
  },
};

// Function to deterministically assign a color class based on product ID
const getProductColor = (productId: string | number): string => {
  const colorIndex = getProductColorIndex(productId);
  return colorClassMap[getColorNameByIndex(colorIndex)].badge;
};

// Function to get the row border class for a color name
const getProductRowBorderClass = (colorName: string): string => colorClassMap[colorName].rowBorder;

// Get color name by index
const getColorNameByIndex = (index: number): string => {
  const colorNames = ["blue", "green", "purple", "orange", "pink", "cyan", "red", "lime"];

  return colorNames[index];
};

export default ReviewStep;
