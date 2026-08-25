import { Spin } from "antd";
import Image from "next/image";
import { useState } from "react";

import PrintButton from "@/app/components/ui/PrintButton";
import { usePrint } from "@/app/utils/usePrint";
import { useApiFetch } from "@/hooks/useApiFetch";

import { ExpandedInvoiceItem } from "./types";

const dateFormatter = new Intl.DateTimeFormat("fa-IR", { timeZone: "Asia/Tehran" });

function formatDate(dateString: string | undefined) {
  if (!dateString) return "-";
  return dateFormatter.format(new Date(dateString));
}

type BranchWarrantyViewModalProps = {
  item: ExpandedInvoiceItem;
  onClose: () => void;
};

const BranchWarrantyViewModal: React.FC<BranchWarrantyViewModalProps> = ({ item, onClose }) => {
  const { componentRef, handlePrint } = usePrint();
  const [showPrintView, setShowPrintView] = useState<boolean>(false);
  const [nowTimestamp] = useState(() => Date.now());

  // Determine branch ID from warranty
  const branchId =
    item?.individualWarranty?.branchid || (item?.individualWarranty as any)?.branchId;

  // Fetch branch name if needed
  const { data: branchData, loading: branchLoading } = useApiFetch<{ name: string }>(
    branchId &&
      !(item?.individualWarranty as any)?.branchname &&
      !(item?.individualWarranty as any)?.branch?.name
      ? `/api/admin/branches/${branchId}`
      : null
  );

  const branchName = (() => {
    if (!item?.individualWarranty) return "";
    const w = item.individualWarranty;
    if ((w as any).branchname) return (w as any).branchname;
    if ((w as any).branch?.name) return (w as any).branch.name;
    if (branchData) return branchData.name || "تعیین نشده";
    if (!branchId) return "تعیین نشده";
    return "";
  })();

  if (!item || !item.individualWarranty) return null;

  const warranty = item.individualWarranty;
  const hasValidWarranty = Boolean(warranty?.warrantycode);

  // Calculate warranty duration
  const calculateDuration = () => {
    if (!warranty.startdate || !warranty.expirydate) return null;

    try {
      const start = new Date(warranty.startdate);
      const end = new Date(warranty.expirydate);

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return "خطا در محاسبه تاریخ";
      }

      if (start >= end) {
        return "تاریخ پایان باید بعد از تاریخ شروع باشد";
      }

      // Use precise date math for duration calculation
      const startYear = start.getFullYear();
      const startMonth = start.getMonth();
      const startDay = start.getDate();

      const endYear = end.getFullYear();
      const endMonth = end.getMonth();
      const endDay = end.getDate();

      // Calculate exact years, months, days
      let years = endYear - startYear;
      let months = endMonth - startMonth;
      let days = endDay - startDay;

      // Adjust for negative months or days
      if (days < 0) {
        // Get last month's total days to calculate how many days to borrow
        const lastDayOfLastMonth = new Date(endYear, endMonth, 0).getDate();
        days += lastDayOfLastMonth;
        months--;
      }

      if (months < 0) {
        months += 12;
        years--;
      }

      // Format the duration string
      let durationStr = "";
      if (years > 0) {
        durationStr += `${years} سال `;
      }
      if (months > 0) {
        durationStr += `${months} ماه `;
      }
      if (days > 0 || (years === 0 && months === 0)) {
        durationStr += `${days} روز`;
      }

      return durationStr.trim();
    } catch (error) {
      console.error("Error calculating duration:", error);
      return "خطا در محاسبه مدت";
    }
  };

  // Handle print of warranty card
  const handleWarrantyPrint = () => {
    // Only print if there's a valid warranty
    if (!hasValidWarranty) {
      return;
    }

    // Show print view and prepare for printing
    setShowPrintView(true);

    // Wait for the DOM to update before printing
    setTimeout(() => {
      if (componentRef.current) {
        handlePrint({
          printTitle: `گارانتی ${warranty.warrantycode}`,
          hideElements: [".no-print", "button"],
          stickerMode: true, // Enable sticker mode for compact printing
        });
      }

      // Hide print view after printing
      setTimeout(() => {
        setShowPrintView(false);
      }, 1000);
    }, 100);
  };

  const durationText = calculateDuration();
  const isExpired =
    warranty.status === "Expired" ||
    warranty.displayStatus === "Expired" ||
    (warranty.expirydate && nowTimestamp && new Date(warranty.expirydate).getTime() < nowTimestamp);

  // Use branch name from state or fallback
  const displayBranchName = branchName || "در حال بارگذاری...";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="w-full max-w-md rounded-lg bg-slate-900" onClick={(e) => e.stopPropagation()}>
        <div className="border-b border-slate-700 p-6">
          <h2 className="text-center text-xl font-bold text-white">مشاهده گارانتی</h2>
        </div>

        {/* Main form view - only visible when not printing */}
        <div className={showPrintView ? "hidden" : ""}>
          <div className="space-y-4 p-6">
            <div className="space-y-2 text-right">
              <label
                htmlFor="productName"
                className="block text-sm font-medium text-gray-300 print:hidden"
              >
                محصول
              </label>
              <input
                type="text"
                id="productName"
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-right text-white disabled:opacity-70 print:hidden"
                value={item.Name || `محصول #${item.ProductId}`}
                disabled
                readOnly
              />
              <div className="hidden print:block">
                <span className="font-semibold">محصول:</span>{" "}
                {item.Name || `محصول #${item.ProductId}`}
              </div>
            </div>

            <div className="space-y-2 text-right">
              <label
                htmlFor="warrantycode"
                className="block text-sm font-medium text-gray-300 print:hidden"
              >
                کد گارانتی
              </label>
              <input
                type="text"
                id="warrantycode"
                name="warrantycode"
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-right text-white disabled:bg-slate-700 print:hidden"
                value={warranty.warrantycode || "بدون گارانتی"}
                disabled
                readOnly
              />
              <div className="hidden print:block">
                <span className="font-semibold">کد گارانتی:</span> {warranty.warrantycode}
              </div>
            </div>

            <div className="space-y-2 text-right">
              <label
                htmlFor="branchname"
                className="block text-sm font-medium text-gray-300 print:hidden"
              >
                شعبه مسئول گارانتی
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="branchname"
                  name="branchname"
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-right text-white disabled:bg-slate-700 print:hidden"
                  value={branchLoading ? "در حال بارگذاری..." : displayBranchName}
                  disabled
                  readOnly
                />
                {branchLoading && (
                  <div className="absolute top-1/2 left-3 -translate-y-1/2 transform">
                    <Spin size="small" />
                  </div>
                )}
              </div>
              <div className="hidden print:block">
                <span className="font-semibold">شعبه مسئول:</span> {displayBranchName}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 print:hidden">
              <div className="space-y-2 text-right">
                <label htmlFor="startdate" className="block text-sm font-medium text-gray-300">
                  تاریخ شروع
                </label>
                <input
                  type="text"
                  id="startdate"
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-right text-white disabled:opacity-70"
                  value={formatDate(warranty.startdate)}
                  disabled
                  readOnly
                />
              </div>

              <div className="space-y-2 text-right">
                <label htmlFor="expirydate" className="block text-sm font-medium text-gray-300">
                  تاریخ انقضا
                </label>
                <input
                  type="text"
                  id="expirydate"
                  className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-right text-white disabled:opacity-70"
                  value={formatDate(warranty.expirydate)}
                  disabled
                  readOnly
                />
              </div>
            </div>

            <div className="hidden print:block">
              <div className="flex items-center justify-between border-b border-gray-200 py-1">
                <span className="font-semibold">تاریخ شروع:</span>
                <span dir="ltr">{formatDate(warranty.startdate)}</span>
              </div>
              <div className="flex items-center justify-between border-b border-gray-200 py-1">
                <span className="font-semibold">تاریخ انقضا:</span>
                <span dir="ltr">{formatDate(warranty.expirydate)}</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="font-semibold">مدت گارانتی:</span>
                <span>{durationText}</span>
              </div>
            </div>

            <div className="mt-4 text-center print:hidden">
              <span className="text-xs text-gray-300">وضعیت گارانتی: </span>
              {!hasValidWarranty ? (
                <span className="text-xs text-amber-400">بدون گارانتی</span>
              ) : isExpired ? (
                <span className="text-xs text-red-400">منقضی شده</span>
              ) : (
                <span className="text-xs text-green-400">فعال</span>
              )}
            </div>

            {durationText && hasValidWarranty && (
              <div
                className={`no-print mt-2 rounded p-2 text-center ${
                  durationText.includes("باید") || durationText.includes("خطا")
                    ? "bg-red-900/40 text-red-300"
                    : "bg-blue-900/40 text-blue-300"
                }`}
              >
                <span>مدت گارانتی: {durationText}</span>
              </div>
            )}
          </div>

          <div className="flex justify-between gap-4 p-6 print:hidden">
            {hasValidWarranty && (
              <PrintButton
                onPrint={handleWarrantyPrint}
                className="flex items-center gap-2 rounded-lg bg-green-700 px-3 py-2 text-sm text-white hover:bg-green-600"
              />
            )}

            <button
              type="button"
              onClick={onClose}
              className="ml-auto rounded-lg bg-gray-700 px-4 py-2 text-white hover:bg-gray-600"
            >
              بستن
            </button>
          </div>
        </div>

        {/* Print view with warranty card format - displayed only when printing */}
        <div ref={componentRef} className={`m-0 p-0 ${!showPrintView ? "hidden" : ""}`} dir="rtl">
          <div className="warranty-certificate">
            <div className="mb-1 text-center">
              <Image
                src="/Farabak_Logo.webp"
                alt="Farabak Logo"
                width={100}
                height={100}
                className="mx-auto"
              />
              <h1 className="text-lg font-bold">کارت گارانتی</h1>
            </div>

            <div className="mt-1">
              <div className="flex items-center justify-between border-b border-gray-200">
                <span className="text-sm font-semibold">کد گارانتی:</span>
                <span className="text-sm">{warranty.warrantycode}</span>
              </div>

              <div className="flex items-center justify-between border-b border-gray-200">
                <span className="text-sm font-semibold">محصول:</span>
                <span className="text-sm">{item.Name || `محصول #${item.ProductId}`}</span>
              </div>

              <div className="flex items-center justify-between border-b border-gray-200">
                <span className="text-sm font-semibold">تاریخ شروع:</span>
                <span className="text-sm" dir="ltr">
                  {formatDate(warranty.startdate)}
                </span>
              </div>

              <div className="flex items-center justify-between border-b border-gray-200">
                <span className="text-sm font-semibold">تاریخ انقضا:</span>
                <span className="text-sm" dir="ltr">
                  {formatDate(warranty.expirydate)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold">مدت گارانتی:</span>
                <span className="text-sm">{durationText}</span>
              </div>
            </div>

            <div className="mt-2 border-t border-gray-200 pt-1 text-center text-xs">
              <p>www.farabak.net</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BranchWarrantyViewModal;
