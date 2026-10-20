"use client";

import { useEffect, useRef, useState } from "react";

import { AdminInvoice } from "../../type";

type DeleteInvoiceModalProps = {
  invoice: AdminInvoice | null;
  onClose: () => void;
  onDelete: (invoiceId: string) => Promise<boolean>;
};

const DeleteInvoiceModal = ({ invoice, onClose, onDelete }: DeleteInvoiceModalProps) => {
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closingAfterSuccessRef = useRef(false);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (invoice) {
      if (!dialog.open) {
        dialog.showModal();
      }
    } else {
      dialog.close();
    }
  }, [invoice]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleClose = () => {
      if (isDeleting && !closingAfterSuccessRef.current) {
        dialog.showModal();
        return;
      }
      closingAfterSuccessRef.current = false;
      setTermsAccepted(false);
      setError(null);
      onClose();
    };

    dialog.addEventListener("close", handleClose);
    return () => dialog.removeEventListener("close", handleClose);
  }, [isDeleting, onClose]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const preventPendingCancel = (event: Event) => {
      if (isDeleting) event.preventDefault();
    };
    dialog.addEventListener("cancel", preventPendingCancel);
    return () => dialog.removeEventListener("cancel", preventPendingCancel);
  }, [isDeleting]);

  const handleDelete = async () => {
    if (!invoice || !termsAccepted || isDeleting) return;
    setIsDeleting(true);
    setError(null);
    try {
      if (await onDelete(invoice.Invoiceid)) {
        closingAfterSuccessRef.current = true;
        dialogRef.current?.close();
      } else setError("حذف فاکتور انجام نشد. دوباره تلاش کنید.");
    } catch {
      setError("حذف فاکتور انجام نشد. دوباره تلاش کنید.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <dialog
      ref={dialogRef}
      className="w-full max-w-lg rounded-xl bg-slate-900 p-0 shadow-lg backdrop:bg-black/60 backdrop:backdrop-blur-md"
      aria-labelledby="delete-invoice-modal"
    >
      {/* Modal Header */}
      <div className="border-b border-slate-700 p-5">
        <h2
          id="delete-invoice-modal"
          className="bg-linear-to-r from-red-400 to-orange-500 bg-clip-text text-center text-2xl font-bold text-transparent"
        >
          حذف فاکتور
        </h2>
      </div>

      {/* Modal Content */}
      <div className="p-6 text-gray-300">
        {error && (
          <p role="alert" className="mb-4 text-sm text-red-300">
            {error}
          </p>
        )}
        <p className="text-lg leading-relaxed">
          آیا از حذف این فاکتور اطمینان دارید؟ این عملیات غیرقابل بازگشت است.
        </p>
        <div className="mt-6">
          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={termsAccepted}
              onChange={(e) => setTermsAccepted(e.target.checked)}
              className="form-checkbox size-5 border-gray-600 text-blue-500 focus:ring-2 focus:ring-blue-400"
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
          onClick={() => dialogRef.current?.close()}
          disabled={isDeleting}
          className="w-full rounded-lg bg-gray-700 px-6 py-3 text-gray-100 transition hover:bg-gray-600 focus:ring-2 focus:ring-blue-500 focus:outline-none sm:w-auto"
          aria-label="Close modal"
        >
          بستن
        </button>
        <button
          type="button"
          onClick={handleDelete}
          disabled={!termsAccepted || isDeleting}
          className={`w-full rounded-lg px-6 py-3 transition-colors sm:w-auto ${
            termsAccepted
              ? "bg-red-600 text-gray-100 hover:bg-red-500 focus:ring-2 focus:ring-red-500 focus:outline-none"
              : "cursor-not-allowed bg-red-400 text-gray-300"
          }`}
          aria-label="Delete invoice"
        >
          {isDeleting ? "در حال حذف…" : "حذف فاکتور"}
        </button>
      </div>
    </dialog>
  );
};

export default DeleteInvoiceModal;
