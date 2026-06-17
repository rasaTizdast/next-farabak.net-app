import { useState } from "react";

import { AdminInvoice } from "../../type";

type ChangeStatusModalProps = {
  invoice: AdminInvoice | null;
  onClose: () => void;
  onStatusChange: (invoiceId: string, status: boolean) => void; // Callback to handle status change
};

const ChangeStatusModal = ({ invoice, onClose, onStatusChange }: ChangeStatusModalProps) => {
  const [status, setStatus] = useState(invoice?.Checked || false);

  if (!invoice) return null;

  const handleSave = () => {
    onStatusChange(invoice.Invoiceid, status); // Call the parent handler
    onClose(); // Close the modal
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-lg bg-slate-900">
        {/* Modal Header */}
        <div className="p-6">
          <h2 className="text-center text-xl font-bold text-gray-100 sm:text-2xl">
            تغییر وضعیت فاکتور
          </h2>
          <p className="mt-2 text-center text-sm text-gray-400">
            لطفاً وضعیت فاکتور را انتخاب و ذخیره کنید.
          </p>
        </div>

        {/* Modal Body */}
        <div className="space-y-6 px-6 pb-6" dir="rtl">
          <div className="space-y-4">
            <label
              className="flex cursor-pointer items-center gap-3 rounded-lg bg-slate-800 p-3 transition hover:bg-slate-700"
              onClick={() => setStatus(true)}
            >
              <input
                type="radio"
                value="true"
                checked={status === true}
                onChange={() => setStatus(true)}
                className="hidden"
              />
              <div
                className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                  status === true ? "border-green-500" : "border-gray-500"
                }`}
              >
                {status === true && <div className="h-3 w-3 rounded-full bg-green-500"></div>}
              </div>
              <span className="font-medium text-gray-100">بررسی شده</span>
            </label>

            <label
              className="flex cursor-pointer items-center gap-3 rounded-lg bg-slate-800 p-3 transition hover:bg-slate-700"
              onClick={() => setStatus(false)}
            >
              <input
                type="radio"
                value="false"
                checked={status === false}
                onChange={() => setStatus(false)}
                className="hidden"
              />
              <div
                className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                  status === false ? "border-red-500" : "border-gray-500"
                }`}
              >
                {status === false && <div className="h-3 w-3 rounded-full bg-red-500"></div>}
              </div>
              <span className="font-medium text-gray-100">در انتظار بررسی</span>
            </label>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex justify-end gap-4 border-t border-slate-700 p-6">
          <button type="button"
            onClick={onClose}
            className="rounded-lg bg-slate-700 px-6 py-2 text-sm text-gray-100 transition hover:bg-slate-600 focus:ring focus:ring-slate-500 sm:text-base"
          >
            بستن
          </button>
          <button type="button"
            onClick={handleSave}
            className="rounded-lg bg-green-600 px-6 py-2 text-sm font-medium text-gray-100 transition hover:bg-green-500 focus:ring focus:ring-green-400 sm:text-base"
          >
            ذخیره
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChangeStatusModal;
