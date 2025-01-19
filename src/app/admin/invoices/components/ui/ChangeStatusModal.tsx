import { useState } from "react";
import { AdminInvoice } from "../../type";

type ChangeStatusModalProps = {
  invoice: AdminInvoice | null;
  onClose: () => void;
  onStatusChange: (invoiceId: string, status: boolean) => void; // Callback to handle status change
};

const ChangeStatusModal = ({
  invoice,
  onClose,
  onStatusChange,
}: ChangeStatusModalProps) => {
  const [status, setStatus] = useState(invoice?.Checked || false);

  if (!invoice) return null;

  const handleSave = () => {
    onStatusChange(invoice.Invoiceid, status); // Call the parent handler
    onClose(); // Close the modal
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="p-6">
          <h2 className="text-xl sm:text-2xl font-bold text-center text-gray-100">
            تغییر وضعیت فاکتور
          </h2>
          <p className="text-sm text-gray-400 text-center mt-2">
            لطفاً وضعیت فاکتور را انتخاب و ذخیره کنید.
          </p>
        </div>

        {/* Modal Body */}
        <div className="px-6 pb-6 space-y-6" dir="rtl">
          <div className="space-y-4">
            <label
              className="flex items-center gap-3 cursor-pointer bg-slate-800 hover:bg-slate-700 transition rounded-lg p-3"
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
                className={`w-5 h-5 border-2 rounded-full flex items-center justify-center ${
                  status === true ? "border-green-500" : "border-gray-500"
                }`}
              >
                {status === true && (
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                )}
              </div>
              <span className="text-gray-100 font-medium">بررسی شده</span>
            </label>

            <label
              className="flex items-center gap-3 cursor-pointer bg-slate-800 hover:bg-slate-700 transition rounded-lg p-3"
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
                className={`w-5 h-5 border-2 rounded-full flex items-center justify-center ${
                  status === false ? "border-red-500" : "border-gray-500"
                }`}
              >
                {status === false && (
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                )}
              </div>
              <span className="text-gray-100 font-medium">در انتظار بررسی</span>
            </label>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex justify-end gap-4 p-6 border-t border-slate-700">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-gray-100 text-sm sm:text-base transition focus:ring focus:ring-slate-500"
          >
            بستن
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-green-600 hover:bg-green-500 rounded-lg text-gray-100 text-sm sm:text-base font-medium transition focus:ring focus:ring-green-400"
          >
            ذخیره
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChangeStatusModal;
