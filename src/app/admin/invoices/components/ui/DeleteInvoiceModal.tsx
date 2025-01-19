import { useState } from "react";
import { AdminInvoice } from "../../type";

type DeleteInvoiceModalProps = {
  invoice: AdminInvoice | null;
  onClose: () => void;
  onDelete: (invoiceId: string) => void; // Callback to handle invoice deletion
};

const DeleteInvoiceModal = ({
  invoice,
  onClose,
  onDelete,
}: DeleteInvoiceModalProps) => {
  const [termsAccepted, setTermsAccepted] = useState(false);

  if (!invoice) return null;

  const handleDelete = () => {
    onDelete(invoice.Invoiceid); // Call the parent handler
    onClose(); // Close the modal
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4"
      aria-labelledby="delete-invoice-modal"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-slate-900 rounded-xl shadow-lg w-full max-w-lg">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-700">
          <h2
            id="delete-invoice-modal"
            className="text-2xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-500"
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
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="form-checkbox text-blue-500 w-5 h-5 border-gray-600 focus:ring-2 focus:ring-blue-400"
                aria-label="Accept terms and conditions"
              />
              <span className="text-gray-200 text-sm sm:text-base">
                من شرایط را خوانده‌ام و قبول دارم.
              </span>
            </label>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex flex-col sm:flex-row justify-end gap-3 p-5 border-t border-slate-700">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-3 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            aria-label="Close modal"
          >
            بستن
          </button>
          <button
            onClick={handleDelete}
            disabled={!termsAccepted}
            className={`w-full sm:w-auto px-6 py-3 rounded-lg transition-colors ${
              termsAccepted
                ? "bg-red-600 hover:bg-red-500 text-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500"
                : "bg-red-400 text-gray-300 cursor-not-allowed"
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
