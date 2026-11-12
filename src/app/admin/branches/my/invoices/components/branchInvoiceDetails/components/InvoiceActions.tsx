"use client";

import PrintButton from "@/app/components/ui/PrintButton";

import { useBranchInvoiceDetails } from "../BranchInvoiceDetailsContext";

export function InvoiceActions({ onPrint }: { onPrint: () => void }) {
  const { meta } = useBranchInvoiceDetails();

  return (
    <div className="flex justify-between gap-4 border-t border-slate-700 p-3 sm:p-6 print:hidden">
      <PrintButton onPrint={onPrint} />
      <button
        type="button"
        onClick={meta.onClose}
        className="w-full rounded-lg bg-slate-700 px-4 py-2 text-sm text-gray-100 transition-colors duration-200 hover:bg-slate-600 sm:w-auto sm:px-6 sm:text-base"
      >
        بستن
      </button>
    </div>
  );
}
