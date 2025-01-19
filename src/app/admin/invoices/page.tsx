"use client";

import { useEffect, useState } from "react";
import AdminInvoiceDetailsModal from "./components/ui/AdminInvoiceDetailsModal";
import AdminPhoneNumberModal from "./components/ui/AdminPhoneNumberModal";
import ChangeStatusModal from "./components/ui/ChangeStatusModal";
import DeleteInvoiceModal from "./components/ui/DeleteInvoiceModal";
import axios from "axios";
import { AdminInvoice } from "./type";
import toast, { Toaster } from "react-hot-toast";

const AdminInvoicesPage = () => {
  const [invoices, setInvoices] = useState<AdminInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<AdminInvoice | null>(
    null
  );
  const [showPhoneNumberModal, setShowPhoneNumberModal] =
    useState<AdminInvoice | null>(null);

  const [statusModalInvoice, setStatusModalInvoice] =
    useState<AdminInvoice | null>(null);
  const [deleteModalInvoice, setDeleteModalInvoice] =
    useState<AdminInvoice | null>(null);

  // Function to fetch invoices
  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/invoices");
      if (!response.ok) {
        throw new Error("Failed to fetch invoices.");
      }
      const data: AdminInvoice[] = await response.json();
      setInvoices(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchInvoices();
  }, []);

  // Handler to update invoice status
  const handleStatusChange = async (Invoiceid: string, status: boolean) => {
    const payload = { Invoiceid, checked: status };

    try {
      const response = await axios.patch(`/api/admin/invoices`, payload);

      if (!response) {
        throw new Error("Failed to update invoice status.");
      }
      await fetchInvoices(); // Refresh the invoice list
      toast.success("وضعیت با موفقیت آپدیت شد");
    } catch (error) {
      toast.error("آپدیت فاکتور با شکست مواجه شد");
    }
  };

  // Handler to delete an invoice
  const handleDelete = async (Invoiceid: string) => {
    try {
      const response = await axios.delete(
        `/api/admin/invoices?invoiceId=${Invoiceid}`
      );
      if (!response) {
        throw new Error("Failed to delete invoice.");
      }
      await fetchInvoices(); // Refresh the invoice list
      toast.success("فاکتور با موفقیت حذف شد");
    } catch (error) {
      toast.error("حذف فاکتور با شکست مواجه شد");
    }
  };

  const handlePhoneNumberClick = (invoice: AdminInvoice) => {
    setShowPhoneNumberModal(invoice);
  };

  return (
    <div className="flex flex-col items-center p-4">
      <div className="w-full max-w-[1800px] overflow-auto rounded-lg">
        {loading ? (
          <table className="w-full table-auto border-collapse text-gray-100 whitespace-nowrap">
            <thead className="uppercase bg-slate-900">
              <tr>
                <th scope="col" className="px-6 py-3">
                  شناسه فاکتور
                </th>
                <th scope="col" className="px-6 py-3">
                  مشتری فاکتور
                </th>
                <th scope="col" className="px-6 py-3">
                  وضعیت
                </th>
                <th scope="col" className="px-6 py-3">
                  عملیات‌ها
                </th>
              </tr>
            </thead>
            <tbody className="bg-slate-900 text-center">
              {Array.from({ length: 15 }).map((_, index) => (
                <tr
                  key={index}
                  className={`animate-pulse ${
                    index % 2 === 0 ? "bg-slate-700" : "bg-slate-800"
                  }`}
                >
                  <td className="w-full px-6 py-4">
                    <div className="w-full h-4 bg-slate-600 rounded"></div>
                  </td>
                  <td className="w-full px-6 py-4">
                    <div className="w-24 h-4 bg-slate-600 rounded"></div>
                  </td>
                  <td className="w-full px-6 py-4">
                    <div className="w-20 h-4 bg-slate-600 rounded"></div>
                  </td>
                  <td className="w-full px-6 py-4 flex justify-center gap-3">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div
                        key={i}
                        className="w-20 h-8 bg-slate-600 rounded"
                      ></div>
                    ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : error ? (
          <div className="text-red-500">خطا: {error}</div>
        ) : (
          <>
            <table className="w-full table-auto border-collapse text-gray-100 whitespace-nowrap">
              <thead className="uppercase bg-slate-900">
                <tr>
                  <th scope="col" className="px-6 py-3">
                    شناسه فاکتور
                  </th>
                  <th scope="col" className="px-6 py-3">
                    مشتری فاکتور
                  </th>
                  <th scope="col" className="px-6 py-3">
                    وضعیت
                  </th>
                  <th scope="col" className="px-6 py-3">
                    عملیات‌ها
                  </th>
                </tr>
              </thead>
              <tbody className="bg-slate-900 text-center">
                {invoices.map((invoice, index) => (
                  <tr
                    key={invoice.Invoiceid}
                    className={
                      index % 2 === 0 ? "bg-slate-700" : "bg-slate-800"
                    }
                  >
                    <td className="px-6 py-4">{invoice.FactorGuid}</td>
                    <td className="px-6 py-4">{invoice.Fullname}</td>
                    <td className="px-6 py-4">
                      {invoice.Checked ? "بررسی شده" : "در انتظار بررسی"}
                    </td>
                    <td className="px-6 py-4 flex justify-center gap-3">
                      <button
                        onClick={() => setSelectedInvoice(invoice)}
                        className="flex items-center justify-center w-fit gap-2 py-1 px-2 rounded-lg bg-yellow-200 hover:bg-yellow-300 transition-all text-gray-800"
                      >
                        مشاهده فاکتور
                      </button>
                      <button
                        className="flex items-center justify-center w-fit gap-2 py-1 px-2 rounded-lg bg-green-200 hover:bg-green-300 transition-all text-gray-800"
                        onClick={() => handlePhoneNumberClick(invoice)}
                      >
                        تماس با مشتری
                      </button>
                      <button
                        className="flex items-center justify-center w-fit gap-2 py-1 px-2 rounded-lg bg-orange-200 hover:bg-orange-300 transition-all text-gray-800"
                        onClick={() => setStatusModalInvoice(invoice)}
                      >
                        تغییر وضعیت
                      </button>
                      <button
                        className="flex items-center justify-center w-fit gap-2 py-1 px-2 rounded-lg bg-blue-200 hover:bg-blue-300 transition-all text-gray-800"
                        onClick={() => setDeleteModalInvoice(invoice)}
                      >
                        حذف فاکتور
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {selectedInvoice && (
              <AdminInvoiceDetailsModal
                invoice={selectedInvoice}
                onClose={() => setSelectedInvoice(null)}
              />
            )}
            {showPhoneNumberModal && (
              <AdminPhoneNumberModal
                invoice={showPhoneNumberModal}
                onClose={() => setShowPhoneNumberModal(null)}
              />
            )}
            {statusModalInvoice && (
              <ChangeStatusModal
                invoice={statusModalInvoice}
                onClose={() => setStatusModalInvoice(null)}
                onStatusChange={handleStatusChange}
              />
            )}
            {deleteModalInvoice && (
              <DeleteInvoiceModal
                invoice={deleteModalInvoice}
                onClose={() => setDeleteModalInvoice(null)}
                onDelete={handleDelete}
              />
            )}
            <Toaster position="bottom-center" />
          </>
        )}
      </div>
    </div>
  );
};

export default AdminInvoicesPage;
