"use client";

import { EyeOutlined } from "@ant-design/icons";
import { ColumnType } from "antd/es/table";
import moment from "jalali-moment";
import { useMemo } from "react";

import { AdminInvoice } from "@/app/admin/invoices/type";

function formatDate(dateString: string | Date | number) {
  if (!dateString) return "-";
  try {
    if (typeof dateString === "object") {
      if (dateString instanceof Date) {
        return moment(dateString).format("YYYY/MM/DD | HH:mm:ss");
      }
    }
    if (typeof dateString === "number") {
      return moment(new Date(dateString)).format("YYYY/MM/DD | HH:mm:ss");
    }
    const dateStr = String(dateString);
    if (dateStr.includes("T") && dateStr.includes("Z")) {
      return moment(dateStr).format("YYYY/MM/DD | HH:mm:ss");
    }
    if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return moment(dateStr, "YYYY-MM-DD").format("YYYY/MM/DD");
    }
    if (dateStr.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
      return moment(dateStr, "DD/MM/YYYY").format("YYYY/MM/DD");
    }
    if (dateStr.match(/^\d{4}\/\d{2}\/\d{2} \| \d{2}:\d{2}:\d{2}$/)) {
      return dateStr;
    }
    const formattedDate = moment(dateStr).format("YYYY/MM/DD | HH:mm:ss");
    if (formattedDate === "Invalid date") {
      console.error("Failed to parse date:", dateStr);
      return dateStr;
    }
    return formattedDate;
  } catch (e) {
    console.error("Error formatting date:", e, typeof dateString, dateString);
    return String(dateString);
  }
}

function getWarrantyStatusSummary(invoice: AdminInvoice) {
  if (!invoice.Invoice_Details || !Array.isArray(invoice.Invoice_Details)) {
    return null;
  }

  const hasWarranties = invoice.Invoice_Details.some((detail) => detail.warranty);
  if (!hasWarranties) {
    return null;
  }

  const activeWarranties = invoice.Invoice_Details.filter(
    (detail) =>
      detail.warranty &&
      detail.warranty.status !== "Expired" &&
      detail.warranty.displayStatus !== "Expired"
  ).length;

  const expiredWarranties = invoice.Invoice_Details.filter(
    (detail) =>
      detail.warranty &&
      (detail.warranty.status === "Expired" || detail.warranty.displayStatus === "Expired")
  ).length;

  return { active: activeWarranties, expired: expiredWarranties };
}

export type InvoiceColumn = ColumnType<AdminInvoice>;

export function useInvoiceColumns({
  updateInvoiceStatus,
  setSelectedInvoice,
}: {
  updateInvoiceStatus: (invoice: AdminInvoice, checked: boolean) => Promise<void>;
  setSelectedInvoice: (invoice: AdminInvoice | null) => void;
}) {
  const memoizedInvoiceColumns = useMemo(
    () => [
      {
        title: "شماره فاکتور",
        dataIndex: "FactorGuid",
        key: "FactorGuid",
        className: "text-right font-medium",
        render: (text: string) => <span className="font-medium text-blue-400">{text}</span>,
      },
      {
        title: "نام مشتری",
        dataIndex: "Fullname",
        key: "Fullname",
        className: "text-right font-medium",
        render: (text: string) => <span className="text-gray-100">{text}</span>,
      },
      {
        title: "شماره تماس",
        dataIndex: "Phonenumber",
        key: "Phonenumber",
        className: "text-right font-medium",
        render: (phone: string) => (
          <a href={`tel:${phone}`} className="text-blue-400 transition-colors hover:text-blue-300">
            {phone}
          </a>
        ),
      },
      {
        title: "تاریخ",
        dataIndex: "Date",
        key: "Date",
        className: "text-right font-medium",
        render: (date: string) => <span className="text-gray-200">{formatDate(date)}</span>,
      },
      {
        title: "وضعیت",
        dataIndex: "Checked",
        key: "Checked",
        className: "text-right font-medium",
        render: (checked: boolean, invoice: AdminInvoice) => (
          <div className="flex items-center justify-center">
            {checked ? (
              <span
                className="flex min-w-[120px] items-center justify-center rounded bg-green-500/20 px-4 py-1.5 text-green-400"
                style={{ fontFamily: "inherit", fontWeight: 500 }}
              >
                بررسی شده
              </span>
            ) : (
              <span
                className="flex min-w-[120px] cursor-pointer items-center justify-center rounded bg-yellow-500/20 px-4 py-1.5 text-yellow-400"
                onClick={() => updateInvoiceStatus(invoice, true)}
                style={{ fontFamily: "inherit", fontWeight: 500 }}
              >
                در انتظار بررسی
              </span>
            )}
          </div>
        ),
      },
      {
        title: "وضعیت گارانتی",
        key: "warranty",
        className: "text-center font-medium",
        render: (_: unknown, invoice: AdminInvoice) => {
          const status = getWarrantyStatusSummary(invoice);
          if (!status) {
            return (
              <span className="flex min-w-[120px] items-center justify-center rounded bg-gray-500/20 px-4 py-1.5 text-gray-400">
                بدون گارانتی
              </span>
            );
          }

          return (
            <div className="flex flex-wrap justify-center gap-2">
              {status.active > 0 && (
                <span className="flex min-w-[120px] items-center justify-center rounded bg-green-500/20 px-4 py-1.5 text-green-400">
                  {status.active} گارانتی فعال
                </span>
              )}
              {status.expired > 0 && (
                <span className="flex min-w-[120px] items-center justify-center rounded bg-red-500/20 px-4 py-1.5 text-red-400">
                  {status.expired} گارانتی منقضی
                </span>
              )}
            </div>
          );
        },
      },
      {
        title: "عملیات",
        key: "actions",
        className: "text-center font-medium",
        render: (_: unknown, invoice: AdminInvoice) => (
          <button
            type="button"
            className="flex items-center rounded border-blue-700 bg-blue-600 px-3 py-1.5 hover:bg-blue-700"
            onClick={() => setSelectedInvoice(invoice)}
          >
            <span>مشاهده جزئیات</span>
            <EyeOutlined className="mr-2" />
          </button>
        ),
      },
    ],
    [updateInvoiceStatus, setSelectedInvoice]
  );

  return { memoizedInvoiceColumns };
}
