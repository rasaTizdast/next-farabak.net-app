"use client";

import { useBranchInvoiceDetails } from "../BranchInvoiceDetailsContext";

function formatDate(dateString: string) {
  if (!dateString) return "-";
  try {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");

    return `${year}/${month}/${day} | ${hours}:${minutes}:${seconds}`;
  } catch (e) {
    console.error("Error formatting date:", e);
    return dateString;
  }
}

export function CustomerDetails() {
  const { state } = useBranchInvoiceDetails();
  const { invoice } = state;

  if (!invoice) return null;

  return (
    <div className="space-y-3 rounded-lg bg-slate-800 p-3 text-sm sm:space-y-4 sm:p-4 sm:text-base">
      <div className="flex items-center justify-between">
        <span className="text-gray-300">نام و نام خانوادگی:</span>
        <span className="font-medium text-white">{invoice.Fullname}</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-gray-300">شماره کاربر:</span>
        <span className="font-medium text-white">{invoice.Phonenumber}</span>
      </div>
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <span className="text-gray-300">تاریخ ثبت فاکتور:</span>
        <span className="font-medium text-white" dir="ltr">
          {formatDate(invoice.Date)}
        </span>
      </div>
      <div className="flex items-center justify-between print:hidden">
        <span className="text-gray-300">وضعیت فاکتور:</span>
        <span className="font-medium">
          {invoice.Checked ? (
            <span className="text-green-400">بررسی شده</span>
          ) : (
            <span className="text-yellow-400">در انتظار بررسی</span>
          )}
        </span>
      </div>
    </div>
  );
}
