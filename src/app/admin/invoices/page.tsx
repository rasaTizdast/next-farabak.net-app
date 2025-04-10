"use client";

import { useEffect, useState } from "react";
import { Input, Button, message, Spin, Select } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import AdminInvoiceDetailsModal from "./components/ui/AdminInvoiceDetailsModal";
import AdminPhoneNumberModal from "./components/ui/AdminPhoneNumberModal";
import ChangeStatusModal from "./components/ui/ChangeStatusModal";
import DeleteInvoiceModal from "./components/ui/DeleteInvoiceModal";
import axios from "axios";
import { AdminInvoice } from "./type";
import toast, { Toaster } from "react-hot-toast";

const { Option } = Select;

const AdminInvoicesPage = () => {
  const [invoices, setInvoices] = useState<AdminInvoice[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<AdminInvoice[]>([]);
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
  const [searchText, setSearchText] = useState("");
  const [searchMode, setSearchMode] = useState<"basic" | "warranty">("basic");
  const [isCheckingWarranties, setIsCheckingWarranties] = useState(false);

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
      setFilteredInvoices(data);
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

  // Check and update warranty status
  const checkWarrantyStatus = async () => {
    try {
      setIsCheckingWarranties(true);
      const response = await fetch("/api/admin/warranty/check-status", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to check warranty status");
      }

      const data = await response.json();
      const updatedCount = data.updatedCount || 0;

      if (updatedCount > 0) {
        toast.success(`${updatedCount} گارانتی‌ بروزرسانی شدند`);
        // Refresh invoices to get updated warranty data
        fetchInvoices();
      } else {
        toast.success("تمام گارانتی‌ها به روز هستند");
      }
    } catch (error) {
      console.error("Error checking warranty status:", error);
      toast.error("خطا در بررسی وضعیت گارانتی‌ها");
    } finally {
      setIsCheckingWarranties(false);
    }
  };

  // Filter invoices based on search text
  useEffect(() => {
    if (!searchText.trim()) {
      setFilteredInvoices(invoices);
      return;
    }

    let filtered;
    const lowerCaseSearch = searchText.toLowerCase();

    if (searchMode === "warranty") {
      // Search by warranty code
      filtered = invoices.filter((invoice) => {
        // Check if the invoice has details with warranty
        if (
          !invoice.Invoice_Details ||
          !Array.isArray(invoice.Invoice_Details)
        ) {
          return false;
        }

        // Check if any product in the invoice has the searched warranty code
        return invoice.Invoice_Details.some(
          (detail) =>
            detail.warranty &&
            detail.warranty.warrantycode &&
            detail.warranty.warrantycode.toLowerCase().includes(lowerCaseSearch)
        );
      });
    } else {
      // Regular search by invoice ID, customer name, or phone
      filtered = invoices.filter(
        (invoice) =>
          invoice.FactorGuid.toLowerCase().includes(lowerCaseSearch) ||
          invoice.Fullname.toLowerCase().includes(lowerCaseSearch) ||
          invoice.Phonenumber.includes(searchText)
      );
    }

    setFilteredInvoices(filtered);
  }, [searchText, searchMode, invoices]);

  // Handler to update invoice status
  const handleStatusChange = async (Invoiceid: string, status: boolean) => {
    const payload = { checked: status };

    try {
      const response = await axios.patch(`/api/admin/invoices?id=${Invoiceid}`, payload);

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

  // Update invoice status to 'checked' when viewing details
  const handleViewInvoice = (invoice: AdminInvoice) => {
    setSelectedInvoice(invoice);
    // Do not automatically mark as checked anymore
  };

  return (
    <div className="bg-gray-950 rounded-lg text-white p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">مدیریت فاکتورها</h1>
          <p className="text-gray-400 text-sm">
            از اینجا می‌توانید فاکتورهای فروش را مدیریت کنید
          </p>
        </div>

        {/* Search and Warranty Check Controls */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <div className="flex w-full sm:w-96 items-center">
            {/* Filter Options - Right side */}
            <Select
              value={searchMode}
              onChange={(value) => {
                setSearchMode(value as "basic" | "warranty");
                if (!searchText.trim()) {
                  setFilteredInvoices(invoices);
                }
              }}
              className="search-select"
              popupClassName="bg-gray-800 text-white"
              style={{
                width: "105px",
                color: "white",
                height: "32px",
              }}
            >
              <Option value="basic" className="bg-gray-800 text-white">
                فیلتر عادی
              </Option>
              <Option value="warranty" className="bg-gray-800 text-white">
                کد گارانتی
              </Option>
            </Select>

            {/* Search Input - Middle */}
            <Input
              placeholder={
                searchMode === "warranty"
                  ? "جستجو در کدهای گارانتی..."
                  : "جستجوی فاکتور، نام یا شماره تلفن"
              }
              value={searchText}
              onChange={(e) => {
                setSearchText(e.target.value);
                // Clear search results when input is empty
                if (!e.target.value.trim()) {
                  setFilteredInvoices(invoices);
                }
              }}
              className="search-input"
              style={{
                backgroundColor: "#1e293b",
                color: "white",
                borderColor: "#384152",
                height: "32px",
                direction: "rtl",
                borderRadius: "0",
                flex: 1,
              }}
            />

            {/* Search Button - Left side */}
            <Button
              icon={<SearchOutlined style={{ fontSize: "14px" }} />}
              type="primary"
              onClick={() => {
                if (searchText.trim()) {
                  // Search is handled by the useEffect
                } else {
                  setFilteredInvoices(invoices);
                }
              }}
              className="search-button"
              style={{
                width: "32px",
                height: "32px",
                borderTopLeftRadius: "0.375rem",
                borderBottomLeftRadius: "0.375rem",
                borderTopRightRadius: "0",
                borderBottomRightRadius: "0",
                padding: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            />
          </div>

          <Button
            onClick={checkWarrantyStatus}
            loading={isCheckingWarranties}
            className="w-full sm:w-auto px-3 bg-blue-700 hover:bg-blue-600 text-white border-blue-800"
            style={{ height: "32px" }}
          >
            بررسی گارانتی‌ها
          </Button>
        </div>
      </div>

      <div className="w-full overflow-auto rounded-lg bg-gray-800 shadow-md">
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
          <div className="text-red-500 p-4">خطا: {error}</div>
        ) : filteredInvoices.length === 0 ? (
          <div className="text-center p-8 text-gray-400">
            هیچ فاکتوری با این مشخصات یافت نشد
          </div>
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
                {filteredInvoices.map((invoice, index) => (
                  <tr
                    key={invoice.Invoiceid}
                    className={
                      index % 2 === 0 ? "bg-slate-700" : "bg-slate-800"
                    }
                  >
                    <td className="px-6 py-4">{invoice.FactorGuid}</td>
                    <td className="px-6 py-4">{invoice.Fullname}</td>
                    <td className="px-6 py-4">
                      {invoice.Checked ? (
                        <span className="px-2 py-1 rounded-full bg-green-900 text-green-300">
                          بررسی شده
                        </span>
                      ) : (
                        <span className="px-2 py-1 rounded-full bg-yellow-900 text-yellow-300">
                          در انتظار بررسی
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 flex justify-center flex-wrap gap-2">
                      <button
                        onClick={() => handleViewInvoice(invoice)}
                        className="flex items-center justify-center py-1 px-2 rounded-lg bg-blue-700 hover:bg-blue-600 transition-all text-white"
                      >
                        مشاهده فاکتور
                      </button>
                      <button
                        className="flex items-center justify-center py-1 px-2 rounded-lg bg-green-700 hover:bg-green-600 transition-all text-white"
                        onClick={() => handlePhoneNumberClick(invoice)}
                      >
                        تماس با مشتری
                      </button>
                      <button
                        className="flex items-center justify-center py-1 px-2 rounded-lg bg-orange-700 hover:bg-orange-600 transition-all text-white"
                        onClick={() => setStatusModalInvoice(invoice)}
                      >
                        تغییر وضعیت
                      </button>
                      <button
                        className="flex items-center justify-center py-1 px-2 rounded-lg bg-red-700 hover:bg-red-600 transition-all text-white"
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
                onWarrantyUpdate={async () => {
                  // Fetch updated invoice data
                  try {
                    const response = await fetch(`/api/admin/invoices/${selectedInvoice.Invoiceid}`);
                    if (response.ok) {
                      const updatedInvoice = await response.json();
                      
                      // Update the selected invoice with fresh data
                      setSelectedInvoice(updatedInvoice);
                      
                      // Also update the invoice in the invoices list
                      setInvoices(prev => 
                        prev.map(inv => inv.Invoiceid === updatedInvoice.Invoiceid ? updatedInvoice : inv)
                      );
                      setFilteredInvoices(prev => 
                        prev.map(inv => inv.Invoiceid === updatedInvoice.Invoiceid ? updatedInvoice : inv)
                      );
                    }
                  } catch (error) {
                    console.error("Failed to refresh invoice data:", error);
                  }
                }}
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

      <style jsx global>{`
        /* Styles for search input */
        .search-input.ant-input {
          color: white !important;
        }

        .search-input.ant-input::placeholder {
          color: #cbd5e1 !important;
          opacity: 1 !important;
        }

        .search-input.ant-input:hover {
          background-color: #1e293b !important;
          border-color: #4b5563 !important;
        }

        .search-input.ant-input:focus,
        .search-input.ant-input-focused {
          background-color: #1e293b !important;
          border-color: #3b82f6 !important;
          box-shadow: none !important;
          z-index: 2;
        }

        .search-button {
          background-color: #3b82f6 !important;
          border-color: #3b82f6 !important;
        }

        .search-button:hover {
          background-color: #2563eb !important;
          border-color: #2563eb !important;
        }

        .search-select.ant-select .ant-select-selector {
          border-radius: 0 0.375rem 0.375rem 0 !important;
          background-color: #1e293b !important;
          border-color: #384152 !important;
          color: white !important;
        }

        .search-select.ant-select:hover .ant-select-selector {
          border-color: #4b5563 !important;
        }

        .search-select.ant-select-focused .ant-select-selector {
          border-color: #3b82f6 !important;
          box-shadow: none !important;
        }

        .ant-select-dropdown {
          background-color: #1f2937 !important;
          border: 1px solid #4b5563 !important;
        }

        .ant-select-item {
          color: white !important;
        }

        .ant-select-item-option-active:not(.ant-select-item-option-disabled) {
          background-color: #374151 !important;
        }

        .ant-select-item-option-selected:not(.ant-select-item-option-disabled) {
          background-color: #3b82f6 !important;
        }

        .ant-btn-icon {
          display: flex;
          align-items: center;
          justify-content: center;
        }
      `}</style>
    </div>
  );
};

export default AdminInvoicesPage;
