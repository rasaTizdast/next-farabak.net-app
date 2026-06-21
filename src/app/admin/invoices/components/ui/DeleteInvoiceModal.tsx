import { useState } from "react";

import { AdminInvoice } from "../../type";

type DeleteInvoiceModalProps = {
  invoice: AdminInvoice | null;
  onClose: () => void;
  onDelete: (invoiceId: string) => void; // Callback to handle invoice deletion
};

const DeleteInvoiceModal = ({ invoice, onClose, onDelete }: DeleteInvoiceModalProps) => {
  const [termsAccepted, setTermsAccepted] = useState(false);

  if (!invoice) return null;

  const handleDelete = () => {
    onDelete(invoice.Invoiceid); // Call the parent handler
    onClose(); // Close the modal
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md"
      aria-labelledby="delete-invoice-modal"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-lg rounded-xl bg-slate-900 shadow-lg">
        {/* Modal Header */}
        <div className="border-b border-slate-700 p-5">
          <h2
            id="delete-invoice-modal"
            className="bg-gradient-to-r from-red-400 to-orange-500 bg-clip-text text-center text-2xl font-bold text-transparent"
          >
            حذف فاکتور
          </h2>
        </div>

        {/* Modal Content */}
        <div className="p-6 text-gray-300">
          <p className="text-lg leading-relaxed">
            آیا از حذف این فاکتور اطمینان دارید؟ این عملیات غیرقابل بازگشت است.
          </p>
          <div className="mt-6">
            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="form-checkbox h-5 w-5 border-gray-600 text-blue-500 focus:ring-2 focus:ring-blue-400"
                aria-label="Accept terms and conditions"
              />
              <span className="text-sm text-gray-200 sm:text-base">
                من شرایط را خوانده‌ام و قبول دارم.
              </span>
            </label>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex flex-col justify-end gap-3 border-t border-slate-700 p-5 sm:flex-row">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-lg bg-gray-700 px-6 py-3 text-gray-100 transition hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:w-auto"
            aria-label="Close modal"
          >
            بستن
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={!termsAccepted}
            className={`w-full rounded-lg px-6 py-3 transition-colors sm:w-auto ${
              termsAccepted
                ? "bg-red-600 text-gray-100 hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-red-500"
                : "cursor-not-allowed bg-red-400 text-gray-300"
            }`}
            aria-label="Delete invoice"
          >
            حذف فاکتور
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteInvoiceModal;
