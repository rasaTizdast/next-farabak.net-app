"use client";

import { useModalA11y } from "@/hooks/useModalA11y";

import { AdminInvoice } from "../../type";

type Props = {
  invoice: AdminInvoice | null;
  onClose: () => void;
};

const AdminPhoneNumberModal = ({ invoice, onClose }: Props) => {
  const panelRef = useModalA11y<HTMLDivElement>({ onClose });

  if (!invoice) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-2 backdrop-blur-sm sm:p-4">
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-phone-modal-title"
        tabIndex={-1}
        className="max-h-[calc(100dvh-1rem)] w-full max-w-md overflow-y-auto overscroll-contain rounded-xl border border-slate-600 bg-slate-900 shadow-2xl focus:outline-none"
      >
        <div className="p-3 sm:p-6">
          <div className="text-gray-100">
            {/* Header */}
            <div className="mb-4 sm:mb-8">
              <h2
                id="admin-phone-modal-title"
                className="text-center text-xl font-bold sm:text-2xl"
              >
                شماره تماس مشتری {invoice.Fullname}
              </h2>
            </div>

            <div className="space-y-4 sm:space-y-6" dir="rtl">
              {/* Phone Number */}
              <div className="space-y-3 rounded-lg bg-slate-800 p-3 text-sm sm:space-y-4 sm:p-4 sm:text-base">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">شماره تماس:</span>
                  <span className="font-medium">{invoice.Phonenumber}</span>
                </div>
                <div className="flex items-center justify-between">
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
        <div className="flex justify-end gap-4 border-t border-slate-700 p-3 sm:p-6">
          <button
            type="button"
            onClick={onClose}
            className="min-h-11 w-full rounded-lg bg-slate-700 px-4 py-2 text-sm text-gray-100 transition-colors duration-200 hover:bg-slate-600 sm:w-auto sm:px-6 sm:text-base"
          >
            بستن
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminPhoneNumberModal;
