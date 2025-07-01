"use client";

export const dynamic = "force-dynamic";

import { useCallback, useEffect, useState } from "react";
// import axios from "axios";

import { getUserInvoices } from "@/helpers/invoiceHandlers";

import InvoiceDetails from "./components/ui/InvoiceDetails";
import SkeletonTable from "./components/ui/SkeletonTable";
import Link from "next/link";
import jalaali from "jalali-moment";

import styles from "./AllInvoices.module.css";
import { Toaster } from "react-hot-toast";

type Product = {
  Invoiceid: string;
  price: number;
  discount?: number;
  ProductId: number;
  quantity: number;
  total_price: number;
  Invoice_Details: number; // ID field from API response
};

// Types
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

// interface EmailDetails {
//   to: string;
//   text: string;
//   subject: string;
// }

const AllInvoices = () => {
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(jalaali());

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(jalaali());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getUserInvoices();
      // Log the first few dates to see their format
      if (response && response.length > 0) {
        console.log("Sample date formats:");
        response.slice(0, 3).forEach((invoice, index) => {
          console.log(
            `Invoice ${index} date:`,
            invoice.Date,
            typeof invoice.Date
          );
        });
      }
      setInvoices(response);
    } catch (error: unknown) {
      // Check if the error is an instance of Error before accessing properties
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("An unexpected error occurred.");
      }
    } finally {
      setLoading(false);
    }
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

  // Format date to Persian
  const formatPersianDate = (dateString: string) => {
    try {
      let creationDate;

      // Handle ISO format Jalali date (e.g., "1404-04-09T18:13:49")
      if (dateString.includes("T")) {
        const [datePart, timePart] = dateString.split("T");
        const [year, month, day] = datePart.split("-").map(Number);
        const [hour, minute, second] = timePart.split(":").map(Number);

        creationDate = jalaali()
          .jYear(year)
          .jMonth(month - 1) // Convert to 0-based month
          .jDate(day)
          .hour(hour)
          .minute(minute)
          .second(second || 0);
      }
      // Handle other possible formats
      else if (dateString.includes("-")) {
        const parts = dateString.split(/[- :]/);
        // Check if year is first (YYYY-MM-DD)
        if (parts[0].length === 4) {
          const year = parseInt(parts[0]);
          const month = parseInt(parts[1]) - 1;
          const day = parseInt(parts[2]);

          creationDate = jalaali().jYear(year).jMonth(month).jDate(day);

          // Add time if available
          if (parts.length >= 6) {
            creationDate.hour(parseInt(parts[3] || "0"));
            creationDate.minute(parseInt(parts[4] || "0"));
            creationDate.second(parseInt(parts[5] || "0"));
          }
        }
        // Day first format (DD-MM-YYYY)
        else {
          const day = parseInt(parts[0]);
          const month = parseInt(parts[1]) - 1;
          const year = parseInt(parts[2]);

          creationDate = jalaali().jYear(year).jMonth(month).jDate(day);

          // Add time if available
          if (parts.length >= 6) {
            creationDate.hour(parseInt(parts[3] || "0"));
            creationDate.minute(parseInt(parts[4] || "0"));
            creationDate.second(parseInt(parts[5] || "0"));
          }
        }
      } else {
        return dateString; // Return original if format not recognized
      }

      // Return Persian formatted date
      return creationDate.locale("fa").format("YYYY/MM/DD HH:mm:ss");
    } catch (error) {
      console.error("Error formatting date:", dateString, error);
      return dateString;
    }
  };

  // Calculate time remaining before invoice expires (48 hours after creation)
  const calculateTimeRemaining = (dateString: string) => {
    if (!dateString) return { hours: 0, minutes: 0, isExpired: true };

    try {
      let creationDate;

      // Handle ISO format Jalali date (e.g., "1404-04-09T18:13:49")
      if (dateString.includes("T")) {
        const [datePart, timePart] = dateString.split("T");
        const [year, month, day] = datePart.split("-").map(Number);
        const [hour, minute, second] = timePart.split(":").map(Number);

        creationDate = jalaali()
          .jYear(year)
          .jMonth(month - 1) // Convert to 0-based month
          .jDate(day)
          .hour(hour)
          .minute(minute)
          .second(second || 0);
      }
      // Handle other possible formats
      else if (dateString.includes("-")) {
        const parts = dateString.split(/[- :]/);
        // Check if year is first (YYYY-MM-DD)
        if (parts[0].length === 4) {
          const year = parseInt(parts[0]);
          const month = parseInt(parts[1]) - 1;
          const day = parseInt(parts[2]);

          creationDate = jalaali().jYear(year).jMonth(month).jDate(day);

          // Add time if available
          if (parts.length >= 6) {
            creationDate.hour(parseInt(parts[3] || "0"));
            creationDate.minute(parseInt(parts[4] || "0"));
            creationDate.second(parseInt(parts[5] || "0"));
          }
        }
        // Day first format (DD-MM-YYYY)
        else {
          const day = parseInt(parts[0]);
          const month = parseInt(parts[1]) - 1;
          const year = parseInt(parts[2]);

          creationDate = jalaali().jYear(year).jMonth(month).jDate(day);

          // Add time if available
          if (parts.length >= 6) {
            creationDate.hour(parseInt(parts[3] || "0"));
            creationDate.minute(parseInt(parts[4] || "0"));
            creationDate.second(parseInt(parts[5] || "0"));
          }
        }
      } else {
        throw new Error("Unsupported date format");
      }

      // Set the current time for comparison
      const now = jalaali();

      // Calculate expiry (48 hours after creation)
      const expiryDate = creationDate.clone().add(48, "hours");

      // Check if expired
      if (now.isAfter(expiryDate)) {
        return { hours: 0, minutes: 0, isExpired: true };
      }

      // Calculate time difference
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
  };

  const getTimeRemainingText = (dateString: string, checked: boolean) => {
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
  };

  const getTimeRemainingClass = (dateString: string, checked?: boolean) => {
    const { hours, isExpired } = calculateTimeRemaining(dateString);

    if (isExpired) {
      return checked ? styles.checked : styles.expired;
    } else if (hours < 6) {
      return styles.urgent;
    } else if (hours < 12) {
      return styles.warning;
    } else {
      return styles.normal;
    }
  };

  if (loading) {
    return <SkeletonTable />;
  }

  if (error) {
    return (
      <div className={styles.error}>
        <div className={styles.errorContent}>
          <span>
            مشکلی در دریافت اطلاعات به وجود آمده است، دوباره تلاش کنید.
          </span>
          <button onClick={fetchInvoices}>تلاش مجدد</button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Toaster position="bottom-center" />

      <div className="bg-amber-50 border border-amber-300 text-amber-800 p-4 rounded-md mb-6 shadow-sm">
        <div className="flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 ml-2 flex-shrink-0"
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
            <span className="font-bold">توجه:</span> فاکتورهایی که طی ۴۸ ساعت
            توسط فرابک تأیید نشوند، به دلیل اعتبار محدود قیمت‌ها از پنل شما حذف
            خواهند شد و نیاز به ثبت مجدد خواهند داشت. لطفاً در اسرع وقت جهت
            تأیید فاکتورهای خود با فرابک{" "}
            <Link
              href="/contact-us"
              className="text-amber-900 underline font-bold hover:text-amber-950"
            >
              تماس
            </Link>{" "}
            بگیرید.
          </p>
        </div>
      </div>
      <h3 className="font-bold">فاکتورها ثبت شده توسط شما</h3>
      <div className={styles.tableContainer}>
        <table className={styles.invoicesTable}>
          <thead>
            <tr>
              <th>شماره فاکتور</th>
              <th>تعداد محصولات</th>
              <th>وضعیت</th>
              <th>زمان باقیمانده</th>
              <th>عملیات‌ها</th>
            </tr>
          </thead>
          <tbody>
            {invoices.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ textAlign: "center" }}>
                  هیچ فاکتوری پیدا نشد
                </td>
              </tr>
            ) : (
              invoices.map((item) => (
                <tr key={item.FactorGuid}>
                  <td>{item.FactorGuid}</td>
                  <td>{item.TotalAmount}</td>
                  <td>{item.Checked ? "بررسی شده" : "بررسی نشده"}</td>
                  <td
                    className={getTimeRemainingClass(item.Date, item.Checked)}
                  >
                    <div className="relative group cursor-help">
                      <span>
                        {getTimeRemainingText(item.Date, item.Checked)}
                      </span>
                      <div
                        className="absolute opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gray-800 text-white text-xs rounded py-1 px-2 bottom-full left-1/2 transform -translate-x-1/2 mb-1 whitespace-nowrap z-10 pointer-events-none"
                        dir="ltr"
                      >
                        {formatPersianDate(item.Date)}
                        <svg
                          className="absolute text-gray-800 h-2 w-full left-0 top-full"
                          x="0px"
                          y="0px"
                          viewBox="0 0 255 255"
                          xmlSpace="preserve"
                        >
                          <polygon
                            className="fill-current"
                            points="0,0 127.5,127.5 255,0"
                          />
                        </svg>
                      </div>
                    </div>
                  </td>
                  <td className={styles.actionsParent}>
                    <button
                      onClick={() => handleShowInvoice(item)}
                      className={styles.show}
                    >
                      مشاهده فاکتور
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {selectedInvoice && (
        <InvoiceDetails invoice={selectedInvoice} onClose={handleCloseModal} />
      )}
    </>
  );
};

export default AllInvoices;
