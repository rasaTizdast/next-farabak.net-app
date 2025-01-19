"use client";

import { useEffect, useState } from "react";
import AdminInvoiceDetailsModal from "./components/ui/AdminInvoiceDetailsModal";

type AdminInvoice = {
  InvoiceId: string;
  FactorGuid: string;
  Fullname: string;
  Phonenumber: string;
  TotalAmount: number;
  Date: string;
  Checked: boolean;
  Invoice_Details: {
    ProductId: string;
    quantity: number;
    price: number;
    total_price: number;
  }[];
};

const AdminInvoicesPage = () => {
  const [invoices, setInvoices] = useState<AdminInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<AdminInvoice | null>(
    null
  );

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
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

    fetchInvoices();
  }, []);

  return (
    <div className="flex flex-col items-center p-4">
      <div className="w-full max-w-[1800px] overflow-auto rounded-lg">
        {loading ? (
          <div className="text-gray-100">در حال بارگذاری...</div>
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
                    key={invoice.InvoiceId}
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
                      <button className="flex items-center justify-center w-fit gap-2 py-1 px-2 rounded-lg bg-green-200 hover:bg-green-300 transition-all text-gray-800">
                        تماس با مشتری فاکتور
                      </button>
                      <button className="flex items-center justify-center w-fit gap-2 py-1 px-2 rounded-lg bg-blue-200 hover:bg-blue-300 transition-all text-gray-800">
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
          </>
        )}
      </div>
    </div>
  );
};

export default AdminInvoicesPage;
