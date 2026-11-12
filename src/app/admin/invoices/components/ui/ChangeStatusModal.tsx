"use client";

import { useId, useState } from "react";

import { useModalA11y } from "@/hooks/useModalA11y";

import { AdminInvoice } from "../../type";

type ChangeStatusModalProps = {
  invoice: AdminInvoice | null;
  onClose: () => void;
  onStatusChange: (invoiceId: string, status: boolean) => Promise<boolean>;
};

const ChangeStatusModal = ({ invoice, onClose, onStatusChange }: ChangeStatusModalProps) => {
  const [status, setStatus] = useState(invoice?.Checked || false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const panelRef = useModalA11y<HTMLDivElement>({ onClose, shouldCloseOnEscape: () => !isSaving });
  const titleId = useId();

  if (!invoice) return null;

  const handleSave = async () => {
    if (isSaving) return;
    setIsSaving(true);
    setError(null);
    try {
      if (await onStatusChange(invoice.Invoiceid, status)) onClose();
      else setError("ذخیره وضعیت فاکتور انجام نشد. دوباره تلاش کنید.");
    } catch {
      setError("ذخیره وضعیت فاکتور انجام نشد. دوباره تلاش کنید.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="max-h-[calc(100dvh-2rem)] w-full max-w-md overflow-y-auto overscroll-contain rounded-xl border border-slate-600 bg-slate-900 shadow-2xl focus:outline-none"
      >
        {/* Modal Header */}
        <div className="p-6">
          <h2 id={titleId} className="text-center text-xl font-bold text-gray-100 sm:text-2xl">
            تغییر وضعیت فاکتور
          </h2>
          <p className="mt-2 text-center text-sm text-gray-300">
            لطفاً وضعیت فاکتور را انتخاب و ذخیره کنید.
          </p>
        </div>

        {/* Modal Body */}
        <div className="space-y-6 px-6 pb-6" dir="rtl">
          {error && (
            <p role="alert" className="text-sm text-red-300">
              {error}
            </p>
          )}
          <div className="space-y-4" role="radiogroup" aria-label="وضعیت فاکتور">
            <label
              className="flex cursor-pointer items-center gap-3 rounded-lg bg-slate-800 p-3 transition hover:bg-slate-700"
              onClick={() => setStatus(true)}
            >
              <input
                type="radio"
                name="invoice-status"
                value="true"
                checked={status === true}
                onChange={() => setStatus(true)}
                className="peer sr-only"
              />
              <div
                className={`flex size-5 items-center justify-center rounded-full border-2 peer-focus-visible:ring-2 peer-focus-visible:ring-blue-400 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-slate-900 ${
                  status === true ? "border-green-500" : "border-gray-500"
                }`}
              >
                {status === true && <div className="size-3 rounded-full bg-green-500"></div>}
              </div>
              <span className="font-medium text-gray-100">بررسی شده</span>
            </label>

            <label
              className="flex cursor-pointer items-center gap-3 rounded-lg bg-slate-800 p-3 transition hover:bg-slate-700"
              onClick={() => setStatus(false)}
            >
              <input
                type="radio"
                name="invoice-status"
                value="false"
                checked={status === false}
                onChange={() => setStatus(false)}
                className="peer sr-only"
              />
              <div
                className={`flex size-5 items-center justify-center rounded-full border-2 peer-focus-visible:ring-2 peer-focus-visible:ring-blue-400 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-slate-900 ${
                  status === false ? "border-red-500" : "border-gray-500"
                }`}
              >
                {status === false && <div className="size-3 rounded-full bg-red-500"></div>}
              </div>
              <span className="font-medium text-gray-100">در انتظار بررسی</span>
            </label>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex justify-end gap-4 border-t border-slate-700 p-6">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="rounded-lg bg-slate-700 px-6 py-2 text-sm text-gray-100 transition hover:bg-slate-600 focus:ring focus:ring-slate-500 sm:text-base"
          >
            بستن
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="rounded-lg bg-green-600 px-6 py-2 text-sm font-medium text-gray-100 transition hover:bg-green-500 focus:ring focus:ring-green-400 sm:text-base"
          >
            {isSaving ? "در حال ذخیره…" : "ذخیره"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChangeStatusModal;
