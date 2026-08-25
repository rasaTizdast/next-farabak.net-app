"use client";

export const dynamic = "force-dynamic";

import jalaali from "jalali-moment";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { Toaster } from "react-hot-toast";

import { getUserInvoices } from "@/helpers/invoiceHandlers";

import InvoiceDetails from "./components/ui/InvoiceDetails";
import SkeletonTable from "./components/ui/SkeletonTable";

type Product = {
  Invoiceid: string;
  price: number;
  discount?: number;
  ProductId: number;
  quantity: number;
  total_price: number;
  Invoice_Details: number;
};

type Invoice = {
  Fullname: string;
  Phonenumber: string;
  Checked: boolean;
  FactorGuid: string;
  Quantity: string;
  TotalAmount: number;
  Date: string;
  Invoiceid: number;
  Invoice_Details: Product[];
};

async function doFetchInvoices(
  setLoading: React.Dispatch<React.SetStateAction<boolean>>,
  setError: React.Dispatch<React.SetStateAction<string | null>>,
  setInvoices: React.Dispatch<React.SetStateAction<Invoice[]>>
) {
  setLoading(true);
  setError(null);
  try {
    const response = await getUserInvoices();
    setInvoices(response);
  } catch (error: unknown) {
    if (error instanceof Error) {
      setError(error.message);
    } else {
      setError("An unexpected error occurred.");
    }
  } finally {
    setLoading(false);
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
      throw new Error("Unsupported date format");
    }

    const now = jalaali();
    const expiryDate = creationDate.clone().add(48, "hours");

    if (now.isAfter(expiryDate)) {
      return { hours: 0, minutes: 0, isExpired: true };
    }

    const diffHours = expiryDate.diff(now, "hours");
    const diffMinutes = expiryDate.diff(now, "minutes") % 60;

    return {
      hours: diffHours,
      minutes: diffMinutes,
      isExpired: false,
    };
  } catch (error) {
    console.error("Error parsing date:", dateString, error);
    return { hours: 0, minutes: 0, isExpired: true };
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

function getTimeRemainingClass(dateString: string, checked?: boolean) {
  const { hours, isExpired } = calculateTimeRemaining(dateString);

  if (isExpired) {
    return checked ? "text-[#3d5afe] font-semibold" : "text-[#7d2f2f] font-bold line-through";
  } else if (hours < 6) {
    return "text-[#d32f2f] font-bold animate-pulse";
  } else if (hours < 12) {
    return "text-[#ff8f00] font-semibold";
  } else {
    return "text-[#2e7d32] font-semibold";
  }
}

const AllInvoices = () => {
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInvoices = useCallback(async () => {
    await doFetchInvoices(setLoading, setError, setInvoices);
  }, []);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const handleShowInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
  };

  const handleCloseModal = () => {
    setSelectedInvoice(null);
  };

  if (loading) {
    return <SkeletonTable />;
  }

  if (error) {
    return (
      <div className="flex w-full justify-center">
        <div className="flex flex-col items-center gap-4 rounded-lg bg-white p-6 shadow-[0_4px_10px_rgba(0,0,0,0.3)]">
          <span className="font-bold">
            مشکلی در دریافت اطلاعات به وجود آمده است، دوباره تلاش کنید.
          </span>
          <button
            type="button"
            onClick={fetchInvoices}
            className="cursor-pointer rounded-[6px] border-none bg-[#003262] px-6 py-2 text-white transition-colors duration-300 hover:bg-[#0e6aff]"
          >
            تلاش مجدد
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Toaster position="bottom-center" />

      <div className="mb-6 rounded-md border border-amber-300 bg-amber-50 p-4 text-amber-800 shadow-sm">
        <div className="flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="ml-2 h-6 w-6 flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <p className="text-right">
            <span className="font-bold">توجه:</span> فاکتورهایی که طی ۴۸ ساعت توسط فرابک تأیید
            نشوند، به دلیل اعتبار محدود قیمت‌ها از پنل شما حذف خواهند شد و نیاز به ثبت مجدد خواهند
            داشت. لطفاً در اسرع وقت جهت تأیید فاکتورهای خود با فرابک{" "}
            <Link
              href="/contact-us"
              className="font-bold text-amber-900 underline hover:text-amber-950"
            >
              تماس
            </Link>{" "}
            بگیرید.
          </p>
        </div>
      </div>
      <h3 className="font-bold">فاکتورها ثبت شده توسط شما</h3>
      <div className="mt-5 max-h-[620px] overflow-y-auto border border-[#ccc]">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="sticky top-0 z-10 w-[15%] border-b border-[#d3d3d3] bg-white p-[10px] text-center">
                شماره فاکتور
              </th>
              <th className="sticky top-0 z-10 w-[15%] border-b border-[#d3d3d3] bg-white p-[10px] text-center">
                مبلغ کل
              </th>
              <th className="sticky top-0 z-10 w-[15%] border-b border-[#d3d3d3] bg-white p-[10px] text-center">
                وضعیت
              </th>
              <th className="sticky top-0 z-10 w-[15%] border-b border-[#d3d3d3] bg-white p-[10px] text-center">
                زمان باقیمانده
              </th>
              <th className="sticky top-0 z-10 w-[15%] border-b border-[#d3d3d3] bg-white p-[10px] text-center">
                عملیات‌ها
              </th>
            </tr>
          </thead>
          <tbody>
            {invoices.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-[10px] text-center">
                  هیچ فاکتوری پیدا نشد
                </td>
              </tr>
            ) : (
              invoices.map((item) => (
                <tr key={item.FactorGuid} className="transition-colors duration-300 hover:bg-white">
                  <td className="w-[15%] border-b border-[#d3d3d3] p-[10px] text-center">
                    {item.FactorGuid}
                  </td>
                  <td className="w-[15%] border-b border-[#d3d3d3] p-[10px] text-center">
                    {item.TotalAmount}
                  </td>
                  <td className="w-[15%] border-b border-[#d3d3d3] p-[10px] text-center">
                    {item.Checked ? "بررسی شده" : "بررسی نشده"}
                  </td>
                  <td
                    className={`w-[15%] border-b border-[#d3d3d3] p-[10px] text-center ${getTimeRemainingClass(item.Date, item.Checked)}`}
                  >
                    <div className="group relative cursor-help">
                      <span>{getTimeRemainingText(item.Date, item.Checked)}</span>
                      <div
                        className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 -translate-x-1/2 rounded bg-gray-800 px-2 py-1 text-xs whitespace-nowrap text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                        dir="ltr"
                      >
                        {formatPersianDate(item.Date)}
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
                  <td className="w-[15%] border-b border-[#d3d3d3] p-[10px] text-center">
                    <div className="flex w-full flex-col items-center gap-4">
                      <button
                        type="button"
                        onClick={() => handleShowInvoice(item)}
                        className="w-full max-w-[180px] cursor-pointer rounded-[6px] border-none bg-[#003262] px-6 py-2 text-white transition-[background-color,box-shadow] duration-300 hover:bg-[#0e6aff] hover:shadow-[0_4px_10px_rgba(0,0,0,0.3)]"
                      >
                        مشاهده فاکتور
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {selectedInvoice && <InvoiceDetails invoice={selectedInvoice} onClose={handleCloseModal} />}
    </>
  );
};

export default AllInvoices;
