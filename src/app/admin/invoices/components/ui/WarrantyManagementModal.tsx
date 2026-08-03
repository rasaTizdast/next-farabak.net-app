"use client";

import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";

import { usePrint } from "@/app/utils/usePrint";
import { useApiFetch } from "@/hooks/useApiFetch";
import { useApiMutation } from "@/hooks/useApiMutation";
import { formatDateToISOString, persianToEnglishDigits } from "@/lib/validators";

import { ExpandedInvoiceItem } from "./types";

import WarrantyCreateMode from "./WarrantyCreateMode";
import WarrantyUpdateMode from "./WarrantyUpdateMode";
import WarrantyPrintMode from "./WarrantyPrintMode";

const persianYearFormatter = new Intl.DateTimeFormat("fa-IR", {
  year: "numeric",
  timeZone: "Asia/Tehran",
});
const persianMonthFormatter = new Intl.DateTimeFormat("fa-IR", {
  month: "2-digit",
  timeZone: "Asia/Tehran",
});
const persianDateFormatter = new Intl.DateTimeFormat("fa-IR", { timeZone: "Asia/Tehran" });

// Branch type definition
interface Branch {
  branchid: number;
  name: string;
  location?: string;
  quantity?: number; // Add quantity field
}

type WarrantyManagementModalProps = {
  item: ExpandedInvoiceItem;
  invoiceId: string;
  onClose: () => void;
  onSuccess: () => void;
};

async function generateWarrantyCodeForInvoice(
  branches: Branch[],
  item: ExpandedInvoiceItem,
  warrantyData: {
    warrantycode: string;
    startdate: string;
    expirydate: string;
    status: string;
    branchId: number | null;
    hasWarranty: boolean;
  },
  setWarrantyData: React.Dispatch<
    React.SetStateAction<{
      warrantycode: string;
      startdate: string;
      expirydate: string;
      status: string;
      branchId: number | null;
      hasWarranty: boolean;
    }>
  >,
  generateWarrantyMutate: any
) {
  try {
    const selectedBranch = branches.find(
      (b) => b.branchid === Number(item.individualWarranty?.branchid)
    );
    if (!selectedBranch) {
      toast.error("شعبه انتخاب شده یافت نشد");
      setWarrantyData((prev) => ({ ...prev, warrantycode: "" }));
      return;
    }

    const branchCode = selectedBranch.location || selectedBranch.name.substring(0, 2).toUpperCase();

    const date = new Date();
    const persianYear = persianYearFormatter.format(date);
    const yearStr = persianToEnglishDigits(persianYear);
    const yearNum = yearStr.slice(-3);
    const persianMonth = persianMonthFormatter.format(date);
    const monthNum = persianToEnglishDigits(persianMonth);
    const yearMonth = yearNum + monthNum.padStart(2, "0");

    const data = await generateWarrantyMutate("/api/admin/warranty/generate", {
      branchCode,
      yearMonth,
    });

    if (data && data.warrantyCode) {
      setWarrantyData((prev) => ({ ...prev, warrantycode: data.warrantyCode }));
    } else {
      toast.error("خطا در تولید کد گارانتی");
    }
  } catch (error) {
    console.error("Error generating warranty code:", error);

    const selectedBranch = branches.find((b) => b.branchid === warrantyData.branchId);
    const branchCode =
      selectedBranch?.location || selectedBranch?.name.substring(0, 2).toUpperCase() || "FA";

    const randomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const date = new Date();
    const persianYear = persianYearFormatter.format(date);
    const persianMonth = persianMonthFormatter.format(date);
    const yearStr = persianToEnglishDigits(persianYear);
    const monthStr = persianToEnglishDigits(persianMonth);
    const yearNum = yearStr.slice(-3);
    const yearMonth = yearNum + monthStr.padStart(2, "0");

    setWarrantyData((prev) => ({
      ...prev,
      warrantycode: `${branchCode}-${yearMonth}-${randomCode}`,
    }));
  }
}

const WarrantyManagementModal = ({
  item,
  invoiceId,
  onClose,
  onSuccess,
}: WarrantyManagementModalProps) => {
  const {
    data: branchesData,
    loading: loadingBranches,
    error: branchesError,
  } = useApiFetch<Branch[]>(`/api/admin/branches/product-stock?productId=${item.ProductId}`);

  const branches = branchesData ?? [];
  const [warrantyData, setWarrantyData] = useState<{
    warrantycode: string;
    startdate: string;
    expirydate: string;
    status: string;
    branchId: number | null;
    hasWarranty: boolean;
  }>(() => {
    const today = new Date().toISOString().split("T")[0];
    const expiry = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    return {
      warrantycode: item.individualWarranty?.warrantycode || "",
      startdate: item.individualWarranty?.startdate || today,
      expirydate: item.individualWarranty?.expirydate || expiry,
      status: item.individualWarranty?.status || "Active",
      branchId: item.individualWarranty?.branchid ? Number(item.individualWarranty.branchid) : null,
      hasWarranty: !!item.individualWarranty,
    };
  });

  const [nowTimestamp] = useState(() => Date.now());

  const [showPrintView, setShowPrintView] = useState(false);

  // Use the print hook
  const { componentRef, handlePrint } = usePrint();

  const isUpdate = !!item.individualWarranty;

  const { mutate: generateWarrantyMutate, loading: generatingCode } = useApiMutation<{
    warrantyCode: string;
  }>("post");
  const { mutate: createUpdateWarrantyMutate, loading: submittingCreate } = useApiMutation("post");
  const { mutate: deleteWarrantyMutate, loading: submittingDelete } = useApiMutation("post");

  // Auto-select first branch (one-time init)
  const branchAutoSelectedRef = useRef(false);
  useEffect(() => {
    if (
      branchesData &&
      !isUpdate &&
      branchesData.length > 0 &&
      !warrantyData.branchId &&
      !branchAutoSelectedRef.current
    ) {
      branchAutoSelectedRef.current = true;
      setWarrantyData((prev) => ({
        ...prev,
        branchId: branchesData[0].branchid,
      }));
    }
  }, [branchesData, isUpdate, warrantyData.branchId]);

  // Show error toast when fetch fails
  useEffect(() => {
    if (branchesError) {
      toast.error("خطا در دریافت لیست شعبه‌ها");
    }
  }, [branchesError]);

  // Compute duration from dates
  const durationText = (() => {
    if (!warrantyData.startdate || !warrantyData.expirydate) return null;
    try {
      const start = new Date(warrantyData.startdate);
      const end = new Date(warrantyData.expirydate);
      if (isNaN(start.getTime()) || isNaN(end.getTime())) return "خطا در محاسبه تاریخ";
      if (start >= end) return "تاریخ پایان باید بعد از تاریخ شروع باشد";

      const startYear = start.getFullYear();
      const startMonth = start.getMonth();
      const startDay = start.getDate();
      const endYear = end.getFullYear();
      const endMonth = end.getMonth();
      const endDay = end.getDate();

      let years = endYear - startYear;
      let months = endMonth - startMonth;
      let days = endDay - startDay;

      if (days < 0) {
        const lastDayOfLastMonth = new Date(endYear, endMonth, 0).getDate();
        days += lastDayOfLastMonth;
        months--;
      }
      if (months < 0) {
        months += 12;
        years--;
      }

      let durationStr = "";
      if (years > 0) durationStr += `${years} سال `;
      if (months > 0) durationStr += `${months} ماه `;
      if (days > 0 || (years === 0 && months === 0)) durationStr += `${days} روز`;
      return durationStr.trim();
    } catch {
      return "خطا در محاسبه مدت";
    }
  })();

  // Update status based on expiry date
  const statusRef = useRef(warrantyData.status);
  useEffect(() => {
    if (warrantyData.expirydate) {
      const currentDate = new Date();
      const expiryDate = new Date(warrantyData.expirydate);
      const expectedStatus = expiryDate < currentDate ? "Expired" : "Active";
      if (warrantyData.status !== expectedStatus && statusRef.current !== expectedStatus) {
        statusRef.current = expectedStatus;
        setWarrantyData((prev) => ({ ...prev, status: expectedStatus }));
      }
    }
  }, [warrantyData.expirydate, warrantyData.status]);

  const generateWarrantyCode = async () => {
    await generateWarrantyCodeForInvoice(
      branches,
      item,
      warrantyData,
      setWarrantyData,
      generateWarrantyMutate
    );
  };

  const handleStartDateChange = (date: any) => {
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

  const handleBranchChange = (value: number) => {
    setWarrantyData((prevData) => ({
      ...prevData,
      branchId: value,
      warrantycode: "",
    }));
    if (!isUpdate && value && warrantyData.hasWarranty) {
      generateWarrantyCode();
    }
  };

  const handleWarrantyToggle = (checked: boolean) => {
    setWarrantyData((prev) => ({
      ...prev,
      hasWarranty: checked,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!warrantyData.hasWarranty) {
      if (isUpdate) {
        const result = await deleteWarrantyMutate("/api/admin/warranty/delete", {
          warrantyId: item.individualWarranty?.warrantyid,
        });
        if (result) {
          toast.success("گارانتی با موفقیت حذف شد");
          onSuccess();
          onClose();
        } else {
          toast.error("خطا در حذف گارانتی");
        }
      } else {
        onClose();
      }
      return;
    }

    if (warrantyData.hasWarranty && !isUpdate && !warrantyData.branchId) {
      toast.error("لطفا شعبه را انتخاب کنید");
      return;
    }

    const endpoint = `/api/admin/warranty/${isUpdate ? "update" : "create"}`;
    const payload = {
      invoiceId,
      invoiceDetailId: item.Invoice_Details,
      productId: item.ProductId,
      warrantyData: {
        ...warrantyData,
        warrantyid: item.individualWarranty?.warrantyid,
        branchId: warrantyData.branchId,
      },
    };

    const result = await createUpdateWarrantyMutate(endpoint, payload);
    if (result) {
      toast.success(
        isUpdate ? "گارانتی با موفقیت به‌روزرسانی شد" : "گارانتی جدید با موفقیت ایجاد شد"
      );
      onSuccess();
      onClose();
    } else {
      toast.error("خطا در مدیریت گارانتی");
    }
  };

  // Get selected branch name
  const selectedBranchName =
    branches.find((branch) => branch.branchid === warrantyData.branchId)?.name || "";

  // Handle print of warranty card
  const handleWarrantyPrint = () => {
    // Only allow printing if we have a valid warranty
    if (!warrantyData.hasWarranty || (!isUpdate && !warrantyData.warrantycode)) {
      toast.error("ابتدا گارانتی را ایجاد کنید");
      return;
    }

    // Show print view and prepare for printing
    setShowPrintView(true);

    // Wait for the DOM to update before printing
    setTimeout(() => {
      handlePrint({
        printTitle: `گارانتی ${warrantyData.warrantycode}`,
        hideElements: [".no-print", "button", ".warranty-form-elements"],
        stickerMode: true, // Enable sticker mode for compact printing
      });

      // Hide print view after printing
      setTimeout(() => {
        setShowPrintView(false);
      }, 1000);
    }, 100);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="w-full max-w-md rounded-lg bg-slate-900" onClick={(e) => e.stopPropagation()}>
        <div className="border-b border-slate-700 p-6">
          <h2 className="text-center text-xl font-bold text-white">
            {isUpdate ? "ویرایش گارانتی" : "افزودن گارانتی جدید"}
          </h2>
        </div>

        {/* Main form view */}
        <div className={showPrintView ? "hidden" : ""}>
          {isUpdate ? (
            <WarrantyUpdateMode
              item={item}
              selectedBranchName={selectedBranchName}
              warrantyData={warrantyData}
              handleStartDateChange={handleStartDateChange}
              handleEndDateChange={handleEndDateChange}
              handleWarrantyToggle={handleWarrantyToggle}
              handleSubmit={handleSubmit}
              durationText={durationText}
              nowTimestamp={nowTimestamp}
              onClose={onClose}
              submittingCreate={submittingCreate}
              submittingDelete={submittingDelete}
              handleWarrantyPrint={handleWarrantyPrint}
            />
          ) : (
            <WarrantyCreateMode
              item={item}
              branches={branches}
              loadingBranches={loadingBranches}
              warrantyData={warrantyData}
              generatingCode={generatingCode}
              handleBranchChange={handleBranchChange}
              handleStartDateChange={handleStartDateChange}
              handleEndDateChange={handleEndDateChange}
              handleWarrantyToggle={handleWarrantyToggle}
              generateWarrantyCode={generateWarrantyCode}
              handleSubmit={handleSubmit}
              durationText={durationText}
              nowTimestamp={nowTimestamp}
              onClose={onClose}
              submittingCreate={submittingCreate}
            />
          )}
        </div>

        {/* Print view */}
        <WarrantyPrintMode
          warrantyData={warrantyData}
          item={item}
          durationText={durationText}
          showPrintView={showPrintView}
          printRef={componentRef}
          persianDateFormatter={persianDateFormatter}
        />
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

          .no-print,
          .warranty-form-elements {
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

          .warranty-certificate {
            padding: 1.5rem;
            border: 1px solid #ddd;
            border-radius: 8px;
            background-color: white;
            color: black;
            max-width: 600px;
            margin: 0 auto;
          }

          .warranty-certificate h1 {
            color: #000;
            font-size: 1.5rem;
            font-weight: bold;
          }

          .warranty-certificate .border-b {
            border-bottom: 1px solid #eee;
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

        /* Style for empty dropdown */
        .warranty-select-dropdown .ant-empty {
          margin: 8px 0;
        }

        .warranty-select-dropdown .ant-empty-description {
          color: #f87171 !important; /* red-400 */
          font-size: 0.875rem !important;
        }

        .warranty-select-dropdown .ant-empty-img-simple-path {
          fill: #4b5563 !important;
        }

        .warranty-select-dropdown .ant-empty-img-simple-ellipse {
          fill: #1e293b !important;
        }

        .warranty-select-dropdown .ant-select-item-empty {
          color: #f87171 !important;
          padding: 12px;
          text-align: center;
        }

        /* Style for the loading icon within select */
        .warranty-select .ant-select-arrow .anticon-loading {
          color: #3b82f6 !important;
        }

        /* Adjust disabled state */
        .warranty-select.ant-select-disabled .ant-select-selector {
          background-color: #0f172a !important;
          opacity: 0.7;
        }

        /* Fix RTL for Zaman DatePicker component */
        .zaman-input {
          text-align: right !important;
          direction: rtl !important;
        }

        /* Additional RTL fixes */
        [dir="rtl"] input,
        [dir="rtl"] select,
        [dir="rtl"] textarea {
          text-align: right;
        }

        /* Style for Switch component */
        .ant-switch {
          direction: ltr !important;
        }

        .warranty-print-view {
          padding: 0 !important;
          margin: 0 !important;
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

          .warranty-certificate {
            width: 3.5in !important;
            height: 2in !important;
            padding: 5px !important;
            border: 1px solid #000 !important;
            display: flex !important;
            flex-direction: column !important;
            box-sizing: border-box !important;
            font-size: 10px !important;
          }

          .warranty-certificate h1 {
            margin: 0 0 4px 0 !important;
            padding: 0 !important;
            font-size: 12px !important;
          }

          .warranty-certificate .flex {
            padding: 3px 0 !important;
            margin: 0 !important;
          }

          .warranty-certificate .border-b {
            border-bottom: 1px dotted #999 !important;
            margin-bottom: 2px !important;
          }

          .warranty-certificate .mt-auto {
            margin-top: auto !important;
          }
        }
      `}</style>
    </div>
  );
};

export default WarrantyManagementModal;
