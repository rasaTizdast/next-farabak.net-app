import { useRef } from "react";
import { AdminInvoice } from "../../type";

type Props = {
  invoice: AdminInvoice | null;
  onClose: () => void;
};

const AdminPhoneNumberModal = ({ invoice, onClose }: Props) => {
  const componentRef = useRef<HTMLDivElement>(null);

  if (!invoice) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-slate-900 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div ref={componentRef} className="p-3 sm:p-6">
          <div className="text-gray-100">
            {/* Header */}
            <div className="mb-4 sm:mb-8">
              <h2 className="text-xl sm:text-2xl font-bold text-center">
                شماره تماس مشتری {invoice.Fullname}
              </h2>
            </div>

            <div className="space-y-4 sm:space-y-6" dir="rtl">
              {/* Phone Number */}
              <div className="space-y-3 sm:space-y-4 bg-slate-800 p-3 sm:p-4 rounded-lg text-sm sm:text-base">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">شماره تماس:</span>
                  <span className="font-medium">{invoice.Phonenumber}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">تماس با مشتری:</span>
                  <a
                    href={`tel:${invoice.Phonenumber}`}
                    className="text-blue-400 hover:text-blue-600"
                  >
                    تماس مستقیم
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4 p-3 sm:p-6 border-t border-slate-700">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 sm:px-6 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors duration-200 text-gray-100 text-sm sm:text-base"
          >
            بستن
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminPhoneNumberModal;
