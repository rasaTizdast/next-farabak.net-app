"use client";

import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";

import { usePrint } from "@/app/utils/usePrint";
import { useApiFetch } from "@/hooks/useApiFetch";
import { useApiMutation } from "@/hooks/useApiMutation";
import { formatDateToISOString, persianToEnglishDigits } from "@/lib/validators";

import { ExpandedInvoiceItem } from "./types";
import WarrantyCreateMode from "./WarrantyCreateMode";
import WarrantyPrintMode from "./WarrantyPrintMode";
import WarrantyUpdateMode from "./WarrantyUpdateMode";

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

type GenerateWarrantyResponse = { warrantyCode: string };
type GenerateWarrantyBody = { branchCode: string; yearMonth: string };

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
  generateWarrantyMutate: (
    url: string,
    data?: GenerateWarrantyBody
  ) => Promise<GenerateWarrantyResponse | null>
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

  const { mutate: generateWarrantyMutate, loading: generatingCode } = useApiMutation<
    GenerateWarrantyBody,
    GenerateWarrantyResponse
  >("post");
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

  const handleStartDateChange = (payload: { value: Date }) => {
    const formattedDate =
      payload && payload.value ? formatDateToISOString(new Date(payload.value)) : null;
    setWarrantyData({
      ...warrantyData,
      startdate: formattedDate || new Date().toISOString().split("T")[0],
    });
  };

  const handleEndDateChange = (payload: { value: Date }) => {
    // Convert the date object provided by zaman DatePicker
    const formattedDate =
      payload && payload.value ? formatDateToISOString(new Date(payload.value)) : null;
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
    </div>
  );
};

export default WarrantyManagementModal;
