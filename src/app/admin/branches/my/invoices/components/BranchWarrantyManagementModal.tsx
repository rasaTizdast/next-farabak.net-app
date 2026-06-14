import { Spin } from "antd";
import { RotateCcw } from "lucide-react";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { DatePicker } from "zaman";

import { ExpandedInvoiceItem } from "./types";

// Format a Date object to YYYY-MM-DD string
const formatDateToISOString = (date: Date | null): string | null => {
  if (!date) return null;
  // Use a fixed timezone (Tehran) for consistency
  const tehranDate = new Date(date.toLocaleString("en-US", { timeZone: "Asia/Tehran" }));
  return tehranDate.toISOString().split("T")[0];
};

// Parse Persian digits to English digits
const persianToEnglishDigits = (str: string): string => {
  let result = "";
  for (let i = 0; i < str.length; i++) {
    const charCode = str.charCodeAt(i);
    if (charCode >= 1776 && charCode <= 1785) {
      // Persian digits range
      result += String.fromCharCode(charCode - 1728); // Convert to English digits
    } else {
      result += str.charAt(i);
    }
  }
  return result;
};

// Branch type definition
interface Branch {
  branchid: number;
  name: string;
  location?: string;
  hasProduct?: boolean;
}

type BranchWarrantyManagementModalProps = {
  item: ExpandedInvoiceItem;
  invoiceId: string;
  onClose: () => void;
  onSuccess: () => void;
};

const BranchWarrantyManagementModal = ({
  item,
  invoiceId,
  onClose,
  onSuccess,
}: BranchWarrantyManagementModalProps) => {
  const [loading, setLoading] = useState(true);
  const [loadingWarrantyCode, setLoadingWarrantyCode] = useState(false);
  const [currentBranch, setCurrentBranch] = useState<Branch | null>(null);
  const [branchHasProduct, setBranchHasProduct] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [warrantyData, setWarrantyData] = useState<{
    warrantycode: string;
    startdate: string;
    expirydate: string;
    status: string;
    branchId: number | null;
    hasWarranty: boolean;
  }>({
    warrantycode: "",
    startdate: new Date().toISOString().split("T")[0],
    expirydate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    status: "Active",
    branchId: null,
    hasWarranty: false,
  });
  const [durationText, setDurationText] = useState<string | null>(null);

  // Use the print hook with ref for the warranty card area
  const componentRef = useRef<HTMLDivElement>(null);

  // Add additional effect specifically for warranty code generation
  useEffect(() => {
    // If product is available but we don't have a warranty code yet, generate one
    if (
      branchHasProduct &&
      currentBranch &&
      (!warrantyData.warrantycode || warrantyData.warrantycode === "")
    ) {
      generateWarrantyCode(currentBranch.branchid);
    }
  }, [branchHasProduct, currentBranch, warrantyData.warrantycode]);

  // Fetch current branch info when component mounts
  useEffect(() => {
    const initializeComponent = async () => {
      try {
        setLoading(true);

        // Step 1: Fetch branch data
        const branchData = await fetchCurrentBranch();
        if (!branchData) return;

        // Step 2: Check product availability
        const hasProduct = await checkProductAvailability(branchData.branchid);

        // Step 3: Generate warranty code if product is available
        if (hasProduct) {
          await generateWarrantyCode(branchData.branchid);
        }

        // Mark initialization as complete
        setIsInitialized(true);
      } catch (error) {
        console.error("Error during initialization:", error);
        toast.error("خطا در راه‌اندازی فرم گارانتی");
        setIsInitialized(true); // Still mark as initialized to prevent infinite loading
      } finally {
        setLoading(false);
      }
    };

    initializeComponent();
  }, []);

  // Fetch information about the current logged-in branch
  const fetchCurrentBranch = async (): Promise<Branch | null> => {
    try {
      const response = await fetch(`/api/admin/branches/current`);

      if (!response.ok) {
        throw new Error("Failed to fetch current branch");
      }

      const branchData = await response.json();
      setCurrentBranch(branchData);

      // Set the branch ID in warranty data
      setWarrantyData((prev) => ({
        ...prev,
        branchId: branchData.branchid,
      }));

      return branchData;
    } catch (error) {
      console.error("Error fetching current branch:", error);
      toast.error("خطا در دریافت اطلاعات شعبه");
      return null;
    }
  };

  // Check if this branch has this product in inventory
  const checkProductAvailability = async (branchId: number): Promise<boolean> => {
    try {
      const response = await fetch(
        `/api/admin/branches/check-product?branchId=${branchId}&productId=${item.ProductId}&invoiceId=${invoiceId}`
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Product availability check failed:", errorData);
        throw new Error("Failed to check product availability");
      }

      const data = await response.json();

      setBranchHasProduct(data.hasProduct);
      return data.hasProduct;
    } catch (error) {
      console.error("Error checking product availability:", error);
      toast.error("خطا در بررسی موجودی محصول");
      setBranchHasProduct(false);
      return false;
    }
  };

  // Generate a unique warranty code for the current branch
  const generateWarrantyCode = async (branchId?: number): Promise<string | null> => {
    if (!branchId && !warrantyData.branchId) return null;

    try {
      setLoadingWarrantyCode(true);

      // Use provided branchId or get from state
      const selectedBranchId = branchId || warrantyData.branchId;

      // Find selected branch info
      const selectedBranch =
        currentBranch && currentBranch.branchid === selectedBranchId ? currentBranch : null;

      if (!selectedBranch) {
        throw new Error("اطلاعات شعبه یافت نشد");
      }

      // Use branch location code or name as branch code
      const branchCode =
        selectedBranch.location || selectedBranch.name.substring(0, 2).toUpperCase();

      // Get current date for year-month format
      const date = new Date();

      // Get Persian year in English digits
      const persianYear = new Intl.DateTimeFormat("fa-IR", {
        year: "numeric",
      }).format(date);

      // Convert Persian digits to English digits and get last 3 digits of year (404 from 1404)
      const yearStr = persianToEnglishDigits(persianYear);
      const yearNum = yearStr.slice(-3); // Get last 3 digits, e.g., 404 from 1404

      // Get Persian month with leading zero
      const persianMonth = new Intl.DateTimeFormat("fa-IR", {
        month: "2-digit",
      }).format(date);

      // Convert Persian digits to English digits
      const monthNum = persianToEnglishDigits(persianMonth);

      // Combine to get the format 404 (for year 1404) + 01 (for month 1) = 40401
      const yearMonth = yearNum + monthNum.padStart(2, "0");

      // Call API to generate unique warranty code
      const response = await fetch("/api/admin/warranty/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ branchCode, yearMonth }),
      });

      if (!response.ok) {
        throw new Error("خطا در تولید کد گارانتی");
      }

      const data = await response.json();

      // Update state with generated code and set hasWarranty to true
      setWarrantyData((prev) => ({
        ...prev,
        warrantycode: data.warrantyCode,
        hasWarranty: true,
      }));
      return data.warrantyCode;
    } catch (error) {
      console.error("Error generating warranty code:", error);

      // Fallback to local generation
      if (currentBranch) {
        const branchCode =
          currentBranch.location || currentBranch.name.substring(0, 2).toUpperCase() || "FA";

        const randomCode = Math.random().toString(36).substring(2, 8).toUpperCase();

        // Use Persian date for the fallback as well
        const date = new Date();
        const persianYear = new Intl.DateTimeFormat("fa-IR", {
          year: "numeric",
        }).format(date);
        const persianMonth = new Intl.DateTimeFormat("fa-IR", {
          month: "2-digit",
        }).format(date);

        const yearStr = persianToEnglishDigits(persianYear);
        const monthStr = persianToEnglishDigits(persianMonth);

        const yearNum = yearStr.slice(-3); // Get last 3 digits, e.g., 404 from 1404
        const yearMonth = yearNum + monthStr.padStart(2, "0");

        const fallbackCode = `${branchCode}-${yearMonth}-${randomCode}`;

        setWarrantyData((prev) => ({
          ...prev,
          warrantycode: fallbackCode,
          hasWarranty: true,
        }));
        return fallbackCode;
      }
      return null;
    } finally {
      setLoadingWarrantyCode(false);
    }
  };

  // Calculate warranty duration and update status based on expiry date
  useEffect(() => {
    calculateDuration(new Date(warrantyData.startdate), new Date(warrantyData.expirydate));

    // Auto-set status based on expiry date
    const currentDate = new Date();
    const expiryDate = new Date(warrantyData.expirydate);

    // If expiry date is in the past, set status to Expired
    if (expiryDate < currentDate) {
      setWarrantyData((prev) => ({
        ...prev,
        status: "Expired",
      }));
    } else {
      // Otherwise set to Active (only if current status is Expired)
      if (warrantyData.status === "Expired") {
        setWarrantyData((prev) => ({
          ...prev,
          status: "Active",
        }));
      }
    }
  }, [warrantyData.startdate, warrantyData.expirydate]);

  const calculateDuration = (startDate: Date | string | null, endDate: Date | string | null) => {
    if (!startDate || !endDate) {
      setDurationText(null);
      return;
    }

    try {
      const start = startDate instanceof Date ? startDate : new Date(startDate);
      const end = endDate instanceof Date ? endDate : new Date(endDate);

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        setDurationText("خطا در محاسبه تاریخ");
        return;
      }

      if (start >= end) {
        setDurationText("تاریخ پایان باید بعد از تاریخ شروع باشد");
        return;
      }

      // Use precise date math for duration calculation
      const startYear = start.getFullYear();
      const startMonth = start.getMonth();
      const startDay = start.getDate();

      const endYear = end.getFullYear();
      const endMonth = end.getMonth();
      const endDay = end.getDate();

      // Calculate exact years, months, days
      let years = endYear - startYear;
      let months = endMonth - startMonth;
      let days = endDay - startDay;

      // Adjust for negative months or days
      if (days < 0) {
        // Get last month's total days to calculate how many days to borrow
        const lastDayOfLastMonth = new Date(endYear, endMonth, 0).getDate();
        days += lastDayOfLastMonth;
        months--;
      }

      if (months < 0) {
        months += 12;
        years--;
      }

      // Format the duration string
      let durationStr = "";
      if (years > 0) {
        durationStr += `${years} سال `;
      }
      if (months > 0) {
        durationStr += `${months} ماه `;
      }
      if (days > 0 || (years === 0 && months === 0)) {
        durationStr += `${days} روز`;
      }

      setDurationText(durationStr.trim());
    } catch (error) {
      console.error("Error calculating duration:", error);
      setDurationText("خطا در محاسبه مدت");
    }
  };

  const handleStartDateChange = (date: any) => {
    // Convert the date object provided by zaman DatePicker
    const formattedDate = date && date.value ? formatDateToISOString(new Date(date.value)) : null;
    setWarrantyData({
      ...warrantyData,
      startdate: formattedDate || new Date().toISOString().split("T")[0],
    });
  };

  const handleEndDateChange = (date: any) => {
    // Convert the date object provided by zaman DatePicker
    const formattedDate = date && date.value ? formatDateToISOString(new Date(date.value)) : null;
    setWarrantyData({
      ...warrantyData,
      expirydate:
        formattedDate ||
        new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!warrantyData.branchId) {
      toast.error("اطلاعات شعبه یافت نشد");
      return;
    }

    // Log current state before submission

    setLoading(true);

    try {
      const endpoint = `/api/admin/warranty/create`;
      const payload = {
        invoiceId: invoiceId,
        invoiceDetailId: item.Invoice_Details,
        productId: item.ProductId,
        warrantyData: {
          ...warrantyData,
          branchId: warrantyData.branchId,
          dontReduceStock: true, // Flag to indicate not to reduce stock again
        },
      };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "خطا در مدیریت گارانتی");
      }

      toast.success("گارانتی جدید با موفقیت ایجاد شد");
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Error creating warranty:", error);
      toast.error("خطا در ایجاد گارانتی");
    } finally {
      setLoading(false);
    }
  };

  // Check if the submit button should be disabled
  const isSubmitDisabled = () => {
    const disabled =
      loading ||
      !warrantyData.warrantycode ||
      !branchHasProduct ||
      durationText?.includes("باید") ||
      durationText?.includes("خطا");

    return disabled;
  };

  // If still loading or not initialized, show loading state
  if (loading || !isInitialized || !currentBranch) {
    return (
      <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="flex w-full max-w-md flex-col items-center justify-center rounded-lg bg-slate-900 p-8"
          onClick={(e) => e.stopPropagation()}
        >
          <Spin size="large" />
          <span className="mr-2 mt-4 text-white">در حال بارگذاری فرم گارانتی...</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="w-full max-w-md rounded-lg bg-slate-900" onClick={(e) => e.stopPropagation()}>
        <div className="border-b border-slate-700 p-6">
          <h2 className="text-center text-xl font-bold text-white">افزودن گارانتی جدید</h2>
        </div>

        {/* Main form view with ref for printing */}
        <div ref={componentRef}>
          <form onSubmit={handleSubmit} className="warranty-form-elements space-y-4 p-6" dir="rtl">
            <div className="space-y-2 text-right">
              <label
                htmlFor="productName"
                className="no-print block text-sm font-medium text-gray-300"
              >
                محصول
              </label>
              <input
                type="text"
                id="productName"
                className="no-print w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-right text-white disabled:opacity-70"
                value={item.Name || `محصول #${item.ProductId}`}
                disabled
              />
              <div className="print-only">
                <span className="font-semibold">محصول:</span>{" "}
                {item.Name || `محصول #${item.ProductId}`}
              </div>
            </div>

            <div className="no-print space-y-2 text-right">
              <label className="block text-sm font-medium text-gray-300">شعبه مسئول گارانتی</label>
              <input
                type="text"
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-right text-white disabled:opacity-70"
                value={currentBranch?.name || ""}
                disabled
              />

              {!branchHasProduct && (
                <div className="mt-1 text-sm text-red-400">
                  این محصول در موجودی شعبه شما نیست. لطفاً با مدیریت تماس بگیرید.
                </div>
              )}

              {branchHasProduct && (
                <div className="mt-1 text-sm text-green-400">
                  این محصول در شعبه شما موجود است و قابل ثبت گارانتی می‌باشد.
                </div>
              )}
            </div>

            <div className="mt-4 space-y-2 text-right">
              <label
                htmlFor="warrantycode"
                className="no-print block text-sm font-medium text-gray-300"
              >
                کد گارانتی
              </label>
              {!branchHasProduct ? (
                <p className="no-print mb-1 text-sm text-amber-400">
                  شعبه شما این محصول را در موجودی ندارد
                </p>
              ) : loadingWarrantyCode ? (
                <div className="no-print flex justify-center p-2">
                  <Spin size="small" />
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    id="warrantycode"
                    name="warrantycode"
                    className="no-print w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-right text-white disabled:bg-slate-700"
                    value={warrantyData.warrantycode}
                    disabled
                    readOnly
                    required
                  />
                  <button
                    type="button"
                    onClick={() => generateWarrantyCode()}
                    className="no-print rounded-lg bg-blue-700 px-2 py-1 text-sm font-medium text-white transition-colors hover:bg-blue-600"
                    disabled={loadingWarrantyCode || !branchHasProduct}
                  >
                    {loadingWarrantyCode ? <Spin size="small" /> : <RotateCcw size={20} />}
                  </button>
                </div>
              )}
              <div className="print-only">
                <span className="font-semibold">کد گارانتی:</span> {warrantyData.warrantycode}
              </div>
              <div className="print-only">
                <span className="font-semibold">شعبه مسئول:</span> {currentBranch?.name}
              </div>
            </div>

            <div className="no-print mt-4 grid grid-cols-2 gap-4">
              <div className="space-y-2 text-right">
                <label htmlFor="startdate" className="block text-sm font-medium text-gray-300">
                  تاریخ شروع
                </label>
                <DatePicker
                  defaultValue={new Date(warrantyData.startdate)}
                  weekends={[5, 6]}
                  round="x2"
                  accentColor="#226bff"
                  inputClass="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-white text-right"
                  className="z-[1000]"
                  direction="rtl"
                  onChange={handleStartDateChange}
                />
              </div>

              <div className="space-y-2 text-right">
                <label htmlFor="expirydate" className="block text-sm font-medium text-gray-300">
                  تاریخ انقضا
                </label>
                <DatePicker
                  defaultValue={new Date(warrantyData.expirydate)}
                  weekends={[5, 6]}
                  round="x2"
                  accentColor="#226bff"
                  inputClass="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-white text-right"
                  className="z-[1000]"
                  direction="rtl"
                  onChange={handleEndDateChange}
                />
              </div>
            </div>

            <div className="print-only">
              <div className="flex items-center justify-between border-b border-gray-200 py-1">
                <span className="font-semibold">تاریخ شروع:</span>
                <span dir="ltr">
                  {new Date(warrantyData.startdate).toLocaleDateString("fa-IR")}
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-gray-200 py-1">
                <span className="font-semibold">تاریخ انقضا:</span>
                <span dir="ltr">
                  {new Date(warrantyData.expirydate).toLocaleDateString("fa-IR")}
                </span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="font-semibold">مدت گارانتی:</span>
                <span>{durationText}</span>
              </div>
            </div>

            {durationText && (
              <>
                <div className="no-print mt-4 text-center">
                  <span className="text-xs text-gray-300">وضعیت گارانتی: </span>
                  {new Date(warrantyData.expirydate) < new Date() ? (
                    <span className="text-xs text-red-400">منقضی شده</span>
                  ) : (
                    <span className="text-xs text-green-400">فعال</span>
                  )}
                  <span className="text-xs text-gray-500">
                    {" "}
                    (تعیین اتوماتیک براساس تاریخ انقضا)
                  </span>
                </div>
                <div
                  className={`no-print mt-2 rounded p-2 text-center ${
                    durationText.includes("باید") || durationText.includes("خطا")
                      ? "bg-red-900/40 text-red-300"
                      : "bg-blue-900/40 text-blue-300"
                  }`}
                >
                  <span>مدت گارانتی: {durationText}</span>
                </div>
              </>
            )}

            <div className="print-only mt-4 text-center">
              <Image
                src="/Farabak_Logo.webp"
                alt="Farabak Logo"
                width={60}
                height={60}
                className="mx-auto mb-1"
              />
              <p className="text-xs">www.farabak.net</p>
            </div>
          </form>

          <div className="no-print flex justify-between gap-4 p-6">
            <div className="ml-auto flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg bg-gray-700 px-4 py-2 text-white hover:bg-gray-600"
              >
                انصراف
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitDisabled()}
                className="rounded-lg bg-blue-700 px-4 py-2 text-white hover:bg-blue-600 disabled:bg-blue-900 disabled:text-gray-300"
              >
                {loading ? "در حال پردازش..." : "ثبت گارانتی"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        /* Print-only classes */
        @media screen {
          .print-only {
            display: none !important;
          }
        }

        @media print {
          .print-only {
            display: block !important;
          }

          .no-print {
            display: none !important;
          }

          body,
          .bg-slate-900 {
            background-color: white !important;
            color: black !important;
          }

          .border-slate-700,
          .border-gray-700 {
            border-color: #eee !important;
          }

          h1,
          h2,
          h3,
          h4,
          h5,
          h6 {
            color: black !important;
          }

          .text-red-600 {
            color: #dc2626 !important;
          }

          .text-green-600 {
            color: #16a34a !important;
          }
        }

        /* Fix RTL issues for the select component */
        .warranty-select .ant-select-selector {
          background-color: #1e293b !important;
          border-color: #334155 !important;
          color: white !important;
          height: 40px !important;
          border-radius: 0.5rem !important;
          display: flex;
          align-items: center;
          transition: all 0.3s ease;
          text-align: right !important;
          direction: rtl !important;
        }

        .warranty-select:hover .ant-select-selector {
          border-color: #4b5563 !important;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
        }

        .warranty-select.ant-select-focused .ant-select-selector {
          border-color: #3b82f6 !important;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2) !important;
        }

        .warranty-select .ant-select-selection-placeholder {
          color: #94a3b8 !important;
          text-align: right !important;
          direction: rtl !important;
          right: 12px !important;
          left: auto !important;
        }

        .warranty-select .ant-select-selection-item {
          color: white !important;
          text-align: right !important;
          padding-right: 12px !important;
          direction: rtl !important;
        }

        .warranty-select .ant-select-arrow {
          color: #94a3b8 !important;
          right: auto !important;
          left: 11px !important;
        }

        .warranty-select .ant-select-clear {
          background-color: #1e293b !important;
          color: #94a3b8 !important;
          right: auto !important;
          left: 11px !important;
        }

        .warranty-select-dropdown {
          background-color: #1e293b !important;
          border: 1px solid #334155 !important;
          border-radius: 0.5rem !important;
          direction: rtl !important;
          text-align: right !important;
        }

        .warranty-select-dropdown .ant-select-item {
          color: white !important;
          text-align: right !important;
          direction: rtl !important;
          padding-right: 12px !important;
        }

        .warranty-select-dropdown
          .ant-select-item-option-active:not(.ant-select-item-option-disabled) {
          background-color: #2d3748 !important;
        }

        .warranty-select-dropdown
          .ant-select-item-option-selected:not(.ant-select-item-option-disabled) {
          background-color: #3b82f6 !important;
        }

        /* Fix RTL for Zaman DatePicker component */
        .zaman-input {
          text-align: right !important;
          direction: rtl !important;
        }

        @media print {
          @page {
            size: 3.5in 2in !important;
            margin: 0 !important;
          }

          body {
            margin: 0 !important;
            padding: 0 !important;
          }
        }
      `}</style>
    </div>
  );
};

export default BranchWarrantyManagementModal;
