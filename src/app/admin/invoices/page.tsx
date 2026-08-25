"use client";

export const dynamic = "force-dynamic";

import { SearchOutlined } from "@ant-design/icons";
import { Input, Button, Select } from "antd";
import jalaali from "jalali-moment";
import { useEffect, useRef, useState } from "react";
import toast, { Toaster } from "react-hot-toast";

import { adminColors } from "@/constants/adminColors";
import { useApiFetch } from "@/hooks/useApiFetch";
import { useApiMutation } from "@/hooks/useApiMutation";

import AdminInvoiceDetailsModal from "./components/ui/AdminInvoiceDetailsModal";
import AdminPhoneNumberModal from "./components/ui/AdminPhoneNumberModal";
import ChangeStatusModal from "./components/ui/ChangeStatusModal";
import DeleteInvoiceModal from "./components/ui/DeleteInvoiceModal";
import { AdminInvoice } from "./type";

const { Option } = Select;

// --- Pure helpers (module scope) ---

function calculateTimeRemaining(dateString: string) {
  if (!dateString) return { hours: 0, minutes: 0, isExpired: true };

  try {
    let creationDate;

    if (dateString.includes("T")) {
      const [datePart, timePart] = dateString.split("T");
      const [year, month, day] = datePart.split("-").map(Number);
      const [hour, minute, second] = timePart.split(":").map(Number);

      creationDate = jalaali()
        .jYear(year)
        .jMonth(month - 1)
        .jDate(day)
        .hour(hour)
        .minute(minute)
        .second(second || 0);
    } else if (dateString.includes("-")) {
      const parts = dateString.split(/[- :]/);
      if (parts[0].length === 4) {
        const year = parseInt(parts[0]);
        const month = parseInt(parts[1]) - 1;
        const day = parseInt(parts[2]);

        creationDate = jalaali().jYear(year).jMonth(month).jDate(day);

        if (parts.length >= 6) {
          creationDate.hour(parseInt(parts[3] || "0"));
          creationDate.minute(parseInt(parts[4] || "0"));
          creationDate.second(parseInt(parts[5] || "0"));
        }
      } else {
        const day = parseInt(parts[0]);
        const month = parseInt(parts[1]) - 1;
        const year = parseInt(parts[2]);

        creationDate = jalaali().jYear(year).jMonth(month).jDate(day);

        if (parts.length >= 6) {
          creationDate.hour(parseInt(parts[3] || "0"));
          creationDate.minute(parseInt(parts[4] || "0"));
          creationDate.second(parseInt(parts[5] || "0"));
        }
      }
    } else {
      return { hours: 0, minutes: 0, isExpired: true };
    }

    const now = jalaali();
    const expiryDate = creationDate.clone().add(48, "hours");

    if (now.isAfter(expiryDate)) {
      return { hours: 0, minutes: 0, isExpired: true };
    }

    const diffHours = expiryDate.diff(now, "hours");
    const diffMinutes = expiryDate.diff(now, "minutes") % 60;

    return { hours: diffHours, minutes: diffMinutes, isExpired: false };
  } catch (error) {
    console.error("Error parsing date:", dateString, error);
    return { hours: 0, minutes: 0, isExpired: true };
  }
}

function formatPersianDate(dateString: string) {
  try {
    let creationDate;

    if (dateString.includes("T")) {
      const [datePart, timePart] = dateString.split("T");
      const [year, month, day] = datePart.split("-").map(Number);
      const [hour, minute, second] = timePart.split(":").map(Number);

      creationDate = jalaali()
        .jYear(year)
        .jMonth(month - 1)
        .jDate(day)
        .hour(hour)
        .minute(minute)
        .second(second || 0);
    } else if (dateString.includes("-")) {
      const parts = dateString.split(/[- :]/);
      if (parts[0].length === 4) {
        const year = parseInt(parts[0]);
        const month = parseInt(parts[1]) - 1;
        const day = parseInt(parts[2]);

        creationDate = jalaali().jYear(year).jMonth(month).jDate(day);

        if (parts.length >= 6) {
          creationDate.hour(parseInt(parts[3] || "0"));
          creationDate.minute(parseInt(parts[4] || "0"));
          creationDate.second(parseInt(parts[5] || "0"));
        }
      } else {
        const day = parseInt(parts[0]);
        const month = parseInt(parts[1]) - 1;
        const year = parseInt(parts[2]);

        creationDate = jalaali().jYear(year).jMonth(month).jDate(day);

        if (parts.length >= 6) {
          creationDate.hour(parseInt(parts[3] || "0"));
          creationDate.minute(parseInt(parts[4] || "0"));
          creationDate.second(parseInt(parts[5] || "0"));
        }
      }
    } else {
      return dateString;
    }

    return creationDate.locale("fa").format("YYYY/MM/DD HH:mm:ss");
  } catch (error) {
    console.error("Error formatting date:", dateString, error);
    return dateString;
  }
}

function getTimeRemainingText(dateString: string, checked: boolean) {
  if (!dateString) return "تاریخ نامشخص";

  try {
    const { hours, minutes, isExpired } = calculateTimeRemaining(dateString);

    if (isExpired) {
      return checked ? "تائید شده قبل از انقضا" : "منقضی شده";
    } else if (hours >= 24) {
      const days = Math.floor(hours / 24);
      const remainingHours = hours % 24;
      return `${days} روز و ${remainingHours} ساعت مانده`;
    } else {
      return `${hours} ساعت و ${minutes} دقیقه مانده`;
    }
  } catch (error) {
    console.error("Error parsing date:", dateString, error);
    return `خطا در تاریخ: ${dateString}`;
  }
}

function getTimeRemainingClass(dateString: string, checked: boolean) {
  if (checked) return "";

  const { hours, isExpired } = calculateTimeRemaining(dateString);

  if (isExpired) {
    return "line-through text-gray-400";
  } else if (hours < 6) {
    return "text-red-500 font-bold";
  } else if (hours < 12) {
    return "text-yellow-500 font-bold";
  } else {
    return "text-green-500";
  }
}

async function refreshInvoiceAfterWarrantyUpdate(
  selectedInvoice: AdminInvoice,
  setSelectedInvoice: React.Dispatch<React.SetStateAction<AdminInvoice | null>>,
  setInvoices: React.Dispatch<React.SetStateAction<AdminInvoice[]>>
) {
  try {
    const response = await fetch(`/api/admin/invoices/${selectedInvoice.Invoiceid}`);
    if (response.ok) {
      const updatedInvoice = await response.json();
      setSelectedInvoice(updatedInvoice);
      setInvoices((prev) =>
        prev.map((inv) => (inv.Invoiceid === updatedInvoice.Invoiceid ? updatedInvoice : inv))
      );
    }
  } catch (error) {
    console.error("Failed to refresh invoice data:", error);
  }
}

const AdminInvoicesPage = () => {
  const [invoices, setInvoices] = useState<AdminInvoice[]>([]);
  const [selectedInvoice, setSelectedInvoice] = useState<AdminInvoice | null>(null);
  const [showPhoneNumberModal, setShowPhoneNumberModal] = useState<AdminInvoice | null>(null);

  const [statusModalInvoice, setStatusModalInvoice] = useState<AdminInvoice | null>(null);
  const [deleteModalInvoice, setDeleteModalInvoice] = useState<AdminInvoice | null>(null);
  const [searchText, setSearchText] = useState("");
  const [searchMode, setSearchMode] = useState<"basic" | "warranty">("basic");
  const [isCheckingWarranties, setIsCheckingWarranties] = useState(false);

  const { mutate: checkWarrantyMutate } = useApiMutation<undefined, { updatedCount: number }>(
    "post"
  );
  const { mutate: updateStatusMutate } = useApiMutation("patch");
  const { mutate: deleteInvoiceMutate } = useApiMutation("delete");

  const {
    data: invoicesData,
    loading,
    error,
    refetch,
  } = useApiFetch<AdminInvoice[]>("/api/admin/invoices");

  // Sync API data when invoices are fetched
  const prevInvoicesData = useRef(invoicesData);
  useEffect(() => {
    if (invoicesData && prevInvoicesData.current !== invoicesData) {
      prevInvoicesData.current = invoicesData;
      // eslint-disable-next-line react-hooks/set-state-in-effect -- Sync fetched invoices into editable local state once, guarded by ref.
      setInvoices(invoicesData);
    }
  }, [invoicesData]);

  // Check and update warranty status
  const checkWarrantyStatus = async () => {
    setIsCheckingWarranties(true);
    const data = await checkWarrantyMutate("/api/admin/warranty/check-status");
    if (data) {
      const updatedCount = data.updatedCount || 0;
      if (updatedCount > 0) {
        toast.success(`${updatedCount} گارانتی‌ بروزرسانی شدند`);
        refetch();
      } else {
        toast.success("تمام گارانتی‌ها به روز هستند");
      }
    } else {
      toast.error("خطا در بررسی وضعیت گارانتی‌ها");
    }
    setIsCheckingWarranties(false);
  };

  // Filter invoices based on search text
  const filteredInvoices = (() => {
    if (!searchText.trim()) return invoices;

    const lowerCaseSearch = searchText.toLowerCase();

    if (searchMode === "warranty") {
      return invoices.filter((invoice) => {
        if (!invoice.Invoice_Details || !Array.isArray(invoice.Invoice_Details)) {
          return false;
        }
        return invoice.Invoice_Details.some(
          (detail) =>
            detail.warranty &&
            detail.warranty.warrantycode &&
            detail.warranty.warrantycode.toLowerCase().includes(lowerCaseSearch)
        );
      });
    }

    return invoices.filter(
      (invoice) =>
        invoice.FactorGuid.toLowerCase().includes(lowerCaseSearch) ||
        invoice.Fullname.toLowerCase().includes(lowerCaseSearch) ||
        invoice.Phonenumber.includes(searchText)
    );
  })();

  // Handler to update invoice status
  const handleStatusChange = async (Invoiceid: string, status: boolean) => {
    const result = await updateStatusMutate(`/api/admin/invoices?id=${Invoiceid}`, {
      checked: status,
    });
    if (result) {
      refetch();
      toast.success("وضعیت با موفقیت آپدیت شد");
    } else {
      toast.error("آپدیت فاکتور با شکست مواجه شد");
    }
  };

  // Handler to delete an invoice
  const handleDelete = async (Invoiceid: string) => {
    const result = await deleteInvoiceMutate(`/api/admin/invoices?invoiceId=${Invoiceid}`);
    if (result) {
      refetch();
      toast.success("فاکتور با موفقیت حذف شد");
    } else {
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
    <div
      className="space-y-6 rounded-lg bg-gray-950 p-4 text-white sm:p-6"
      role="status"
      aria-label="در حال بارگذاری"
    >
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-xl font-bold sm:text-2xl">مدیریت فاکتورها</h1>
          <p className="text-sm text-gray-400">از اینجا می‌توانید فاکتورهای فروش را مدیریت کنید</p>
        </div>

        {/* Search and Warranty Check Controls */}
        {loading ? (
          // Search UI skeleton during loading
          <div className="flex w-full flex-col items-center gap-3 sm:w-auto sm:flex-row">
            <div className="flex w-full items-center sm:w-96">
              <div className="h-[32px] w-[105px] animate-pulse rounded-r-md bg-gray-800"></div>
              <div className="h-[32px] flex-1 animate-pulse bg-gray-800"></div>
              <div className="h-[32px] w-[32px] animate-pulse rounded-l-md bg-blue-700"></div>
            </div>
            <div className="h-[32px] w-full animate-pulse rounded-md bg-blue-700 sm:w-[120px]"></div>
          </div>
        ) : (
          <div className="flex w-full flex-col items-center gap-3 sm:w-auto sm:flex-row">
            <div className="flex w-full items-center sm:w-96">
              {/* Filter Options - Right side */}
              <Select
                value={searchMode}
                onChange={(value) => {
                  setSearchMode(value);
                }}
                className="search-select [&_.ant-select-selector]:!rounded-l-none [&_.ant-select-selector]:!rounded-r-md [&_.ant-select-selector]:!border-[#384152] [&_.ant-select-selector]:!bg-slate-800 [&_.ant-select-selector]:!text-white [&.ant-select-focused_.ant-select-selector]:!border-blue-500 [&.ant-select-focused_.ant-select-selector]:!shadow-none [&.ant-select:hover_.ant-select-selector]:!border-gray-600"
                popupClassName="!bg-gray-800 !text-white !border !border-gray-600 [&_.ant-select-item]:!text-white"
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
                }}
                className="search-input focus:z-[2] [&.ant-input]:!text-white [&.ant-input::placeholder]:!text-slate-300 [&.ant-input::placeholder]:!opacity-100 [&.ant-input:focus]:!border-blue-500 [&.ant-input:focus]:!bg-slate-800 [&.ant-input:focus]:!shadow-none [&.ant-input:hover]:!border-gray-600 [&.ant-input:hover]:!bg-slate-800"
                style={{
                  backgroundColor: adminColors.panelInner,
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
                  // Search is handled by the useMemo filter
                }}
                className="search-button flex h-8 w-8 items-center justify-center rounded-l-md rounded-r-none !border-blue-500 !bg-blue-500 p-0 hover:!border-blue-600 hover:!bg-blue-600"
              />
            </div>

            <Button
              htmlType="button"
              onClick={checkWarrantyStatus}
              loading={isCheckingWarranties}
              className="w-full border-blue-800 bg-blue-700 px-3 text-white hover:bg-blue-600 sm:w-auto"
              style={{ height: "32px" }}
            >
              بررسی گارانتی‌ها
            </Button>
          </div>
        )}
      </div>

      <div className="w-full overflow-auto rounded-lg bg-gray-800 shadow-md">
        {loading ? (
          <table className="w-full table-auto border-collapse whitespace-nowrap text-gray-100">
            <thead className="bg-slate-900 uppercase">
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
                  زمان باقیمانده
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
                  className={`animate-pulse ${index % 2 === 0 ? "bg-slate-700" : "bg-slate-800"}`}
                >
                  <td className="w-full px-6 py-4">
                    <div className="h-4 w-full rounded bg-slate-600"></div>
                  </td>
                  <td className="w-full px-6 py-4">
                    <div className="h-4 w-24 rounded bg-slate-600"></div>
                  </td>
                  <td className="w-full px-6 py-4">
                    <div className="h-4 w-20 rounded bg-slate-600"></div>
                  </td>
                  <td className="w-full px-6 py-4">
                    <div className="h-4 w-32 rounded bg-slate-600"></div>
                  </td>
                  <td className="flex w-full justify-center gap-3 px-6 py-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="h-8 w-20 rounded bg-slate-600"></div>
                    ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : error ? (
          <div className="p-4 text-red-500">خطا: {error}</div>
        ) : filteredInvoices.length === 0 ? (
          <div className="p-8 text-center text-gray-400">هیچ فاکتوری با این مشخصات یافت نشد</div>
        ) : (
          <>
            <table className="w-full table-auto border-collapse whitespace-nowrap text-gray-100">
              <thead className="bg-slate-900 uppercase">
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
                    زمان باقیمانده
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
                    className={index % 2 === 0 ? "bg-slate-700" : "bg-slate-800"}
                  >
                    <td className="px-6 py-4">{invoice.FactorGuid}</td>
                    <td className="px-6 py-4">{invoice.Fullname}</td>
                    <td className="px-6 py-4">
                      {invoice.Checked ? (
                        <span className="rounded-full bg-green-900 px-2 py-1 text-green-300">
                          بررسی شده
                        </span>
                      ) : (
                        <span className="rounded-full bg-yellow-900 px-2 py-1 text-yellow-300">
                          در انتظار بررسی
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <div className="group relative cursor-help">
                        <span className={getTimeRemainingClass(invoice.Date, invoice.Checked)}>
                          {getTimeRemainingText(invoice.Date, invoice.Checked)}
                        </span>
                        <div
                          className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 -translate-x-1/2 transform rounded bg-gray-800 px-2 py-1 text-xs whitespace-nowrap text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                          dir="ltr"
                        >
                          {formatPersianDate(invoice.Date)}
                          <svg
                            className="absolute top-full left-0 h-2 w-full text-gray-800"
                            x="0px"
                            y="0px"
                            viewBox="0 0 255 255"
                            xmlSpace="preserve"
                          >
                            <polygon className="fill-current" points="0,0 127.5,127.5 255,0" />
                          </svg>
                        </div>
                      </div>
                    </td>

                    <td className="flex flex-wrap justify-center gap-2 px-6 py-4">
                      <button
                        type="button"
                        onClick={() => handleViewInvoice(invoice)}
                        className="flex items-center justify-center rounded-lg bg-blue-700 px-2 py-1 text-white transition-colors hover:bg-blue-600"
                      >
                        مشاهده فاکتور
                      </button>
                      <button
                        type="button"
                        className="flex items-center justify-center rounded-lg bg-green-700 px-2 py-1 text-white transition-colors hover:bg-green-600"
                        onClick={() => handlePhoneNumberClick(invoice)}
                      >
                        تماس با مشتری
                      </button>
                      <button
                        type="button"
                        className="flex items-center justify-center rounded-lg bg-orange-700 px-2 py-1 text-white transition-colors hover:bg-orange-600"
                        onClick={() => setStatusModalInvoice(invoice)}
                      >
                        تغییر وضعیت
                      </button>
                      <button
                        type="button"
                        className="flex items-center justify-center rounded-lg bg-red-700 px-2 py-1 text-white transition-colors hover:bg-red-600"
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
                  await refreshInvoiceAfterWarrantyUpdate(
                    selectedInvoice,
                    setSelectedInvoice,
                    setInvoices
                  );
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
    </div>
  );
};

export default AdminInvoicesPage;
