"use client";

import { Table, Tag, Space, Button } from "antd";
import React from "react";

import type { WarrantyItem, WarrantyStepContextValue } from "../WarrantyStepContext";

type WarrantyConfigTableProps = {
  contextValue: WarrantyStepContextValue;
};

function getProductColor(productId: string | number): string {
  const productIdStr = String(productId);
  const numbers = productIdStr.match(/\d+/g);
  let numValue = 0;

  if (numbers && numbers.length > 0) {
    numValue = parseInt(numbers[0], 10);
  } else {
    numValue = productIdStr.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  }

  const colorNames = ["blue", "green", "purple", "orange", "pink", "cyan", "red", "lime"];
  const colorClassMap: Record<string, string> = {
    blue: "!bg-blue-500",
    green: "!bg-emerald-500",
    purple: "!bg-violet-500",
    orange: "!bg-amber-500",
    pink: "!bg-pink-500",
    cyan: "!bg-cyan-500",
    red: "!bg-red-500",
    lime: "!bg-lime-500",
  };

  return colorClassMap[colorNames[numValue % 8]];
}

function getProductRowBorderClass(productId: string | number): string {
  const productIdStr = String(productId);
  const numbers = productIdStr.match(/\d+/g);
  let numValue = 0;

  if (numbers && numbers.length > 0) {
    numValue = parseInt(numbers[0], 10);
  } else {
    numValue = productIdStr.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  }

  const colorNames = ["blue", "green", "purple", "orange", "pink", "cyan", "red", "lime"];
  const colorClassMap: Record<string, string> = {
    blue: "[&>td:first-child]:!border-l-[3px] [&>td:first-child]:!border-blue-500",
    green: "[&>td:first-child]:!border-l-[3px] [&>td:first-child]:!border-emerald-500",
    purple: "[&>td:first-child]:!border-l-[3px] [&>td:first-child]:!border-violet-500",
    orange: "[&>td:first-child]:!border-l-[3px] [&>td:first-child]:!border-amber-500",
    pink: "[&>td:first-child]:!border-l-[3px] [&>td:first-child]:!border-pink-500",
    cyan: "[&>td:first-child]:!border-l-[3px] [&>td:first-child]:!border-cyan-500",
    red: "[&>td:first-child]:!border-l-[3px] [&>td:first-child]:!border-red-500",
    lime: "[&>td:first-child]:!border-l-[3px] [&>td:first-child]:!border-lime-500",
  };

  return colorClassMap[colorNames[numValue % 8]];
}

function calculateDuration(startDate: string | null, endDate: string | null): string {
  if (!startDate || !endDate) return "-";

  try {
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return "تاریخ نامعتبر";
    }

    if (start >= end) return "تاریخ پایان باید پس از تاریخ شروع باشد";

    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const totalMonths = Math.floor(diffDays / 30);

    if (diffDays < 30) {
      return `${diffDays} روز`;
    } else if (totalMonths < 12) {
      return `${totalMonths} ماه`;
    } else {
      const years = Math.floor(totalMonths / 12);
      const remainingMonths = totalMonths % 12;

      if (remainingMonths === 0) {
        return `${years} سال`;
      } else {
        return `${years} سال و ${remainingMonths} ماه`;
      }
    }
  } catch (error) {
    console.error("Error calculating duration:", error);
    return "خطا در محاسبه مدت گارانتی";
  }
}

export function WarrantyConfigTable({ contextValue }: WarrantyConfigTableProps) {
  const { state, actions } = contextValue;

  const columns = [
    {
      title: "نام محصول",
      dataIndex: "Name",
      key: "name",
      render: (text: string, record: WarrantyItem) => {
        const sameProductItems = state.productsWithWarranty.filter(
          (item) => item.ProductId === record.ProductId
        );

        const isFirstOccurrence =
          sameProductItems.findIndex((item) => item.singleItemId === record.singleItemId) === 0;

        if (isFirstOccurrence) {
          const colorClass = getProductColor(record.ProductId);

          return (
            <div className="flex items-start gap-2">
              <span>{text}</span>
              <Tag className={`${colorClass} rounded-full px-2 py-0.5 text-xs text-white`}>
                {sameProductItems.length}×
              </Tag>
            </div>
          );
        }
        return null;
      },
    },
    {
      title: "کد گارانتی",
      key: "warrantyCode",
      render: (_: unknown, record: WarrantyItem) => {
        const sameProductItems = state.productsWithWarranty.filter(
          (item) => item.ProductId === record.ProductId
        );

        const currentIndex = sameProductItems.findIndex(
          (item) => item.singleItemId === record.singleItemId
        );

        const itemIndicator =
          sameProductItems.length > 1
            ? `محصول ${currentIndex + 1} از ${sameProductItems.length}: `
            : "";

        return record.warranty?.hasWarranty !== false ? (
          <div className="flex flex-col">
            <span>
              {itemIndicator}
              {record.warranty?.warrantycode || "بدون کد"}
            </span>
          </div>
        ) : (
          "بدون گارانتی"
        );
      },
    },
    {
      title: "مدت گارانتی",
      key: "warrantyDuration",
      render: (_: unknown, record: WarrantyItem) => {
        if (record.warranty?.hasWarranty === false) return "بدون گارانتی";
        if (!record.warranty?.startdate || !record.warranty?.expirydate) return "-";

        return calculateDuration(record.warranty.startdate, record.warranty.expirydate);
      },
    },
    {
      title: "عملیات",
      key: "action",
      render: (_: unknown, record: WarrantyItem) => (
        <Space size="middle">
          <Button
            htmlType="button"
            type="primary"
            size="small"
            onClick={() => actions.setEditingProduct(record)}
          >
            تنظیم گارانتی
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <Table
      dataSource={state.productsWithWarranty}
      columns={columns}
      rowKey="singleItemId"
      pagination={false}
      className="custom-dark-table [&_.ant-table]:!bg-gray-900 [&_.ant-table]:!text-white [&_.ant-table-tbody>tr:hover>td]:!bg-[#2d3748] [&_.ant-table-tbody>tr>td]:!border-b-gray-700 [&_.ant-table-tbody>tr>td]:!text-white [&_.ant-table-thead>tr>th]:sticky [&_.ant-table-thead>tr>th]:top-0 [&_.ant-table-thead>tr>th]:z-[2] [&_.ant-table-thead>tr>th]:!border-b-gray-700 [&_.ant-table-thead>tr>th]:!bg-gray-800 [&_.ant-table-thead>tr>th]:!text-white"
      rowClassName={(record) => {
        const sameProductItems = state.productsWithWarranty.filter(
          (item) => item.ProductId === record.ProductId
        );

        const currentIndex = sameProductItems.findIndex(
          (item) => item.singleItemId === record.singleItemId
        );

        let className = "odd:!bg-gray-900 even:!bg-[#1a202c]";

        if (currentIndex === 0) {
          className += " [&>td]:!border-b-0 [&>td]:!pb-2 [&>td:first-child]:rounded-tl-[3px]";
        } else if (currentIndex === sameProductItems.length - 1) {
          className += " [&>td]:!border-t-0 [&>td]:!pt-2 [&>td:first-child]:rounded-bl-[3px]";
        } else {
          className += " [&>td]:!border-y-0 [&>td]:!py-2";
        }

        className += ` ${getProductRowBorderClass(record.ProductId)}`;

        return className;
      }}
    />
  );
}
