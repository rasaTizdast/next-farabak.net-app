"use client";

import { ExpandedInvoiceItem } from "./types";

interface WarrantyPrintModeProps {
  warrantyData: {
    warrantycode: string;
    startdate: string;
    expirydate: string;
    hasWarranty: boolean;
  };
  item: ExpandedInvoiceItem;
  durationText: string | null;
  showPrintView: boolean;
  printRef: React.RefObject<HTMLDivElement | null>;
  persianDateFormatter: Intl.DateTimeFormat;
}

export default function WarrantyPrintMode({
  warrantyData,
  item,
  durationText,
  showPrintView,
  printRef,
  persianDateFormatter,
}: WarrantyPrintModeProps) {
  if (!warrantyData.hasWarranty) return null;

  return (
    <div ref={printRef} className={`m-0 p-0 ${!showPrintView ? "hidden" : ""}`}>
      <div className="warranty-certificate">
        <div className="mb-1 text-center">
          <img
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
            <span className="text-sm">{warrantyData.warrantycode}</span>
          </div>

          <div className="flex items-center justify-between border-b border-gray-200">
            <span className="text-sm font-semibold">محصول:</span>
            <span className="text-sm">{item.Name || `محصول #${item.ProductId}`}</span>
          </div>

          <div className="flex items-center justify-between border-b border-gray-200">
            <span className="text-sm font-semibold">تاریخ شروع:</span>
            <span className="text-sm" dir="ltr">
              {persianDateFormatter.format(new Date(warrantyData.startdate))}
            </span>
          </div>

          <div className="flex items-center justify-between border-b border-gray-200">
            <span className="text-sm font-semibold">تاریخ انقضا:</span>
            <span className="text-sm" dir="ltr">
              {persianDateFormatter.format(new Date(warrantyData.expirydate))}
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
  );
}
