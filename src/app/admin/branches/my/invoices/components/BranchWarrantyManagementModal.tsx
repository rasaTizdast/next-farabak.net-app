import { Spin } from "antd";
import { RotateCcw } from "lucide-react";
import Image from "next/image";
import { useMemo, useState, useEffect, useRef, useCallback } from "react";
import toast from "react-hot-toast";
import { DatePicker } from "zaman";

import { useApiFetch } from "@/hooks/useApiFetch";
import { useApiMutation } from "@/hooks/useApiMutation";
import { formatDateToISOString, persianToEnglishDigits } from "@/lib/validators";

import { ExpandedInvoiceItem } from "./types";

const persianYearFormatter = new Intl.DateTimeFormat("fa-IR", { year: "numeric" });
const persianMonthFormatter = new Intl.DateTimeFormat("fa-IR", { month: "2-digit" });
const persianDateFormatter = new Intl.DateTimeFormat("fa-IR");

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

type GenerateWarrantyRequest = { branchCode: string; yearMonth: string };
type GenerateWarrantyResponse = { warrantyCode: string };

async function generateWarrantyCodeForBranch(
  currentBranch: Branch | null,
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
    data?: GenerateWarrantyRequest
  ) => Promise<GenerateWarrantyResponse | null>,
  branchId?: number
): Promise<string | null> {
  if (!branchId && !warrantyData.branchId) return null;

  try {
    const selectedBranchId = branchId || warrantyData.branchId;

    const selectedBranch =
      currentBranch && currentBranch.branchid === selectedBranchId ? currentBranch : null;

    if (!selectedBranch) {
      toast.error("اطلاعات شعبه یافت نشد");
      return null;
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
      setWarrantyData((prev) => ({
        ...prev,
        warrantycode: data.warrantyCode,
        hasWarranty: true,
      }));
      return data.warrantyCode;
    } else {
      toast.error("خطا در تولید کد گارانتی");
      return null;
    }
  } catch (error) {
    console.error("Error generating warranty code:", error);

    if (currentBranch) {
      const branchCode =
        currentBranch.location || currentBranch.name.substring(0, 2).toUpperCase() || "FA";

      const randomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      const date = new Date();
      const persianYear = persianYearFormatter.format(date);
      const persianMonth = persianMonthFormatter.format(date);
      const yearStr = persianToEnglishDigits(persianYear);
      const monthStr = persianToEnglishDigits(persianMonth);
      const yearNum = yearStr.slice(-3);
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
  }
}

const BranchWarrantyManagementModal = ({
  item,
  invoiceId,
  onClose,
  onSuccess,
}: BranchWarrantyManagementModalProps) => {
  const { data: currentBranchData } = useApiFetch<Branch>("/api/admin/branches/current");
  const { data: productCheckData } = useApiFetch<{ hasProduct: boolean }>(
    currentBranchData?.branchid
      ? `/api/admin/branches/check-product?branchId=${currentBranchData.branchid}&productId=${item.ProductId}&invoiceId=${invoiceId}`
      : null
  );
  type GenerateWarrantyRequest = { branchCode: string; yearMonth: string };
  type GenerateWarrantyResponse = { warrantyCode: string };

  const { mutate: generateWarrantyMutate, loading: generatingCode } = useApiMutation<
    GenerateWarrantyRequest,
    GenerateWarrantyResponse
  >("post");
  const { mutate: createWarrantyMutate, loading: submittingCreate } = useApiMutation("post");

  const [nowTimestamp] = useState(() => Date.now());
  const [loading] = useState(true);
  const [isInitialized] = useState(false);
  const currentBranch = currentBranchData ?? null;
  const branchHasProduct = productCheckData?.hasProduct ?? false;
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
      warrantycode: "",
      startdate: today,
      expirydate: expiry,
      status: "Active",
      branchId: null,
      hasWarranty: false,
    };
  });

  // Use the print hook with ref for the warranty card area
  const componentRef = useRef<HTMLDivElement>(null);
  const branchSyncedRef = useRef(false);

  // Sync branchId from currentBranchData (one-time)
  useEffect(() => {
    if (currentBranchData && !branchSyncedRef.current) {
      branchSyncedRef.current = true;

      setWarrantyData((prev) => ({ ...prev, branchId: currentBranchData.branchid }));
    }
  }, [currentBranchData]);

  const generateWarrantyCode = useCallback(
    async (branchId?: number): Promise<string | null> => {
      return generateWarrantyCodeForBranch(
        currentBranch,
        warrantyData,
        setWarrantyData,
        generateWarrantyMutate,
        branchId
      );
    },
    [currentBranch, warrantyData, generateWarrantyMutate]
  );

  // Compute duration from dates
  const durationText = useMemo(() => {
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
  }, [warrantyData.startdate, warrantyData.expirydate]);

  // Update status based on expiry date
  const statusRef = useRef(warrantyData.status);
  useEffect(() => {
    if (warrantyData.expirydate) {
      const cd = new Date();
      const ed = new Date(warrantyData.expirydate);
      const expectedStatus = ed < cd ? "Expired" : "Active";
      if (warrantyData.status !== expectedStatus && statusRef.current !== expectedStatus) {
        statusRef.current = expectedStatus;

        setWarrantyData((p) => ({ ...p, status: expectedStatus }));
      }
    }
  }, [warrantyData.expirydate, warrantyData.status]);

  // Generate warranty code when dependencies become ready
  useEffect(() => {
    if (
      branchHasProduct &&
      currentBranch &&
      (!warrantyData.warrantycode || warrantyData.warrantycode === "")
    ) {
      generateWarrantyCode(currentBranch.branchid);
    }
  }, [branchHasProduct, currentBranch, warrantyData.warrantycode, generateWarrantyCode]);

  interface DatePickerValue {
    value?: Date | number | string;
  }

  const handleStartDateChange = (date: DatePickerValue) => {
    // Convert the date object provided by zaman DatePicker
    const formattedDate = date && date.value ? formatDateToISOString(new Date(date.value)) : null;
    setWarrantyData({
      ...warrantyData,
      startdate: formattedDate || new Date().toISOString().split("T")[0],
    });
  };

  const handleEndDateChange = (date: DatePickerValue) => {
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

    const payload = {
      invoiceId,
      invoiceDetailId: item.Invoice_Details,
      productId: item.ProductId,
      warrantyData: {
        ...warrantyData,
        branchId: warrantyData.branchId,
        dontReduceStock: true,
      },
    };

    const result = await createWarrantyMutate("/api/admin/warranty/create", payload);
    if (result) {
      toast.success("گارانتی جدید با موفقیت ایجاد شد");
      onSuccess();
      onClose();
    } else {
      toast.error("خطا در ایجاد گارانتی");
    }
  };

  // Check if the submit button should be disabled
  const isSubmitDisabled = () => {
    const disabled =
      submittingCreate ||
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
          <span className="mt-4 mr-2 text-white">در حال بارگذاری فرم گارانتی...</span>
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
                className="block text-sm font-medium text-gray-300 print:hidden"
              >
                محصول
              </label>
              <input
                type="text"
                id="productName"
                readOnly
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-right text-white disabled:opacity-70 print:hidden"
                value={item.Name || `محصول #${item.ProductId}`}
                disabled
              />
              <div className="hidden print:block">
                <span className="font-semibold">محصول:</span>{" "}
                {item.Name || `محصول #${item.ProductId}`}
              </div>
            </div>

            <div className="space-y-2 text-right print:hidden">
              <label
                htmlFor="warranty-branch-name"
                className="block text-sm font-medium text-gray-300"
              >
                شعبه مسئول گارانتی
              </label>
              <input
                id="warranty-branch-name"
                type="text"
                readOnly
                aria-label="شعبه مسئول گارانتی"
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
                className="block text-sm font-medium text-gray-300 print:hidden"
              >
                کد گارانتی
              </label>
              {!branchHasProduct ? (
                <p className="mb-1 text-sm text-amber-400 print:hidden">
                  شعبه شما این محصول را در موجودی ندارد
                </p>
              ) : generatingCode ? (
                <div className="flex justify-center p-2 print:hidden">
                  <Spin size="small" />
                </div>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    id="warrantycode"
                    name="warrantycode"
                    className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-right text-white disabled:bg-slate-700 print:hidden"
                    value={warrantyData.warrantycode}
                    disabled
                    readOnly
                    required
                  />
                  <button
                    type="button"
                    onClick={() => generateWarrantyCode()}
                    className="rounded-lg bg-blue-700 px-2 py-1 text-sm font-medium text-white transition-colors hover:bg-blue-600 print:hidden"
                    disabled={generatingCode || !branchHasProduct}
                  >
                    {generatingCode ? <Spin size="small" /> : <RotateCcw size={20} />}
                  </button>
                </div>
              )}
              <div className="hidden print:block">
                <span className="font-semibold">کد گارانتی:</span> {warrantyData.warrantycode}
              </div>
              <div className="hidden print:block">
                <span className="font-semibold">شعبه مسئول:</span> {currentBranch?.name}
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4 print:hidden">
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
                  className="z-1000"
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
                  className="z-1000"
                  direction="rtl"
                  onChange={handleEndDateChange}
                />
              </div>
            </div>

            <div className="hidden print:block">
              <div className="flex items-center justify-between border-b border-gray-200 py-1">
                <span className="font-semibold">تاریخ شروع:</span>
                <span dir="ltr">
                  {persianDateFormatter.format(new Date(warrantyData.startdate))}
                </span>
              </div>
              <div className="flex items-center justify-between border-b border-gray-200 py-1">
                <span className="font-semibold">تاریخ انقضا:</span>
                <span dir="ltr">
                  {persianDateFormatter.format(new Date(warrantyData.expirydate))}
                </span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="font-semibold">مدت گارانتی:</span>
                <span>{durationText}</span>
              </div>
            </div>

            {durationText && (
              <>
                <div className="mt-4 text-center print:hidden">
                  <span className="text-xs text-gray-300">وضعیت گارانتی: </span>
                  {nowTimestamp && new Date(warrantyData.expirydate).getTime() < nowTimestamp ? (
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

            <div className="mt-4 hidden text-center print:block">
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

          <div className="flex justify-between gap-4 p-6 print:hidden">
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
                {submittingCreate ? "در حال پردازش..." : "ثبت گارانتی"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BranchWarrantyManagementModal;
