import { Spin, Select, Switch } from "antd";
import { RotateCcw } from "lucide-react";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { DatePicker } from "zaman";

import PrintButton from "@/app/components/ui/PrintButton";
import { usePrint } from "@/app/utils/usePrint";
import { useApiFetch } from "@/hooks/useApiFetch";
import { useApiMutation } from "@/hooks/useApiMutation";

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
  quantity?: number; // Add quantity field
}

type WarrantyManagementModalProps = {
  item: ExpandedInvoiceItem;
  invoiceId: string;
  onClose: () => void;
  onSuccess: () => void;
};

const { Option } = Select;

const WarrantyManagementModal = ({
  item,
  invoiceId,
  onClose,
  onSuccess,
}: WarrantyManagementModalProps) => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [warrantyData, setWarrantyData] = useState<{
    warrantycode: string;
    startdate: string;
    expirydate: string;
    status: string;
    branchId: number | null;
    hasWarranty: boolean;
  }>({
    warrantycode: item.individualWarranty?.warrantycode || "",
    startdate: item.individualWarranty?.startdate || new Date().toISOString().split("T")[0],
    expirydate:
      item.individualWarranty?.expirydate ||
      new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    status: item.individualWarranty?.status || "Active",
    branchId: item.individualWarranty?.branchid ? Number(item.individualWarranty.branchid) : null,
    hasWarranty: !!item.individualWarranty,
  });

  const [durationText, setDurationText] = useState<string | null>(null);
  const [showPrintView, setShowPrintView] = useState(false);

  // Use the print hook
  const { componentRef, handlePrint } = usePrint();

  const isUpdate = !!item.individualWarranty;

  const { mutate: generateWarrantyMutate, loading: generatingCode } = useApiMutation<{ warrantyCode: string }>("post");
  const { mutate: createUpdateWarrantyMutate, loading: submittingCreate } = useApiMutation("post");
  const { mutate: deleteWarrantyMutate, loading: submittingDelete } = useApiMutation("post");

  const {
    data: branchesData,
    loading: loadingBranches,
    error: branchesError,
  } = useApiFetch<Branch[]>(`/api/admin/branches/product-stock?productId=${item.ProductId}`);

  // Sync fetched branches to local state and auto-select first branch
  useEffect(() => {
    if (branchesData) {
      setBranches(branchesData);

      if (!isUpdate && branchesData.length > 0 && !warrantyData.branchId) {
        setWarrantyData((prev) => ({
          ...prev,
          branchId: branchesData[0].branchid,
        }));
      }
    }
  }, [branchesData]);

  // Show error toast when fetch fails
  useEffect(() => {
    if (branchesError) {
      toast.error("خطا در دریافت لیست شعبه‌ها");
    }
  }, [branchesError]);

  // Generate a unique warranty code when component mounts
  useEffect(() => {
    if (!isUpdate && warrantyData.branchId && warrantyData.hasWarranty) {
      generateWarrantyCode();
    }
  }, [warrantyData.branchId, isUpdate, warrantyData.hasWarranty]);

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

  const generateWarrantyCode = async () => {
    try {
      const selectedBranch = branches.find(
        (b) => b.branchid === Number(item.individualWarranty?.branchid)
      );
      if (!selectedBranch) {
        toast.error("شعبه انتخاب شده یافت نشد");
        setWarrantyData((prev) => ({ ...prev, warrantycode: "" }));
        return;
      }

      const branchCode =
        selectedBranch.location || selectedBranch.name.substring(0, 2).toUpperCase();

      const date = new Date();
      const persianYear = new Intl.DateTimeFormat("fa-IR", { year: "numeric" }).format(date);
      const yearStr = persianToEnglishDigits(persianYear);
      const yearNum = yearStr.slice(-3);
      const persianMonth = new Intl.DateTimeFormat("fa-IR", { month: "2-digit" }).format(date);
      const monthNum = persianToEnglishDigits(persianMonth);
      const yearMonth = yearNum + monthNum.padStart(2, "0");

      const data = await generateWarrantyMutate(
        "/api/admin/warranty/generate",
        { branchCode, yearMonth }
      );

      if (data && data.warrantyCode) {
        setWarrantyData((prev) => ({ ...prev, warrantycode: data.warrantyCode }));
      } else {
        throw new Error("خطا در تولید کد گارانتی");
      }
    } catch (error) {
      console.error("Error generating warranty code:", error);

      const selectedBranch = branches.find((b) => b.branchid === warrantyData.branchId);
      const branchCode =
        selectedBranch?.location || selectedBranch?.name.substring(0, 2).toUpperCase() || "FA";

      const randomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      const date = new Date();
      const persianYear = new Intl.DateTimeFormat("fa-IR", { year: "numeric" }).format(date);
      const persianMonth = new Intl.DateTimeFormat("fa-IR", { month: "2-digit" }).format(date);
      const yearStr = persianToEnglishDigits(persianYear);
      const monthStr = persianToEnglishDigits(persianMonth);
      const yearNum = yearStr.slice(-3);
      const yearMonth = yearNum + monthStr.padStart(2, "0");

      setWarrantyData((prev) => ({
        ...prev,
        warrantycode: `${branchCode}-${yearMonth}-${randomCode}`,
      }));
    }
  };

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

  const handleBranchChange = (value: number) => {
    setWarrantyData((prevData) => ({
      ...prevData,
      branchId: value,
      warrantycode: "", // Clear warranty code when branch changes
    }));
    // generateWarrantyCode will be triggered by the useEffect when branchId changes
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
          <form onSubmit={handleSubmit} className="warranty-form-elements space-y-4 p-6" dir="rtl">
            <div className="space-y-2 text-right">
              <label htmlFor="productName" className="block text-sm font-medium text-gray-300">
                محصول
              </label>
              <input
                type="text"
                id="productName"
                readOnly
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-right text-white disabled:opacity-70"
                value={item.Name || `محصول #${item.ProductId}`}
                disabled
              />
            </div>

            {/* Add warranty toggle */}
            <div className="space-y-2 text-right">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-gray-300">فعال کردن گارانتی</label>
                <Switch
                  checked={warrantyData.hasWarranty}
                  onChange={handleWarrantyToggle}
                  className="bg-slate-700"
                />
              </div>
              {!warrantyData.hasWarranty && isUpdate && (
                <p className="text-sm text-amber-400">
                  با غیرفعال کردن گارانتی، اطلاعات گارانتی فعلی حذف خواهد شد.
                </p>
              )}
            </div>

            {/* Warranty form elements - only show if hasWarranty is true */}
            <div className={warrantyData.hasWarranty ? "" : "hidden"}>
              <div className="space-y-2 text-right">
                <label className="block text-sm font-medium text-gray-300">
                  شعبه مسئول گارانتی <span className="text-red-400">*</span>
                </label>
                {!isUpdate && (
                  <p className="mb-1 text-xs text-gray-400">
                    ابتدا شعبه را انتخاب کنید، سپس کد گارانتی تولید خواهد شد
                  </p>
                )}
                {/* Branch Selection */}
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-300">شعبه</label>

                  {/* Informative text about branch listing */}
                  <div className="mb-2 text-xs text-gray-400">
                    {isUpdate
                      ? "شعبه انتخاب شده برای گارانتی غیرقابل تغییر است."
                      : "توجه: فقط شعبه‌هایی که این محصول را در انبار خود دارند نمایش داده می‌شوند. با ثبت گارانتی، یک عدد از موجودی محصول در شعبه کم می‌شود."}
                  </div>

                  {loadingBranches ? (
                    <div className="flex justify-center p-2">
                      <Spin size="small" />
                    </div>
                  ) : isUpdate ? (
                    <input
                      type="text"
                      readOnly
                      className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-right text-white disabled:opacity-70"
                      value={selectedBranchName}
                      disabled
                    />
                  ) : (
                    <div>
                      <Select
                        className="warranty-select w-full text-right"
                        placeholder="انتخاب شعبه"
                        value={warrantyData.branchId || undefined}
                        onChange={handleBranchChange}
                        loading={loadingBranches}
                        disabled={loadingBranches || isUpdate}
                        popupClassName="warranty-select-dropdown"
                        notFoundContent={
                          <div className="py-3 text-center text-red-400">
                            هیچ شعبه‌ای با موجودی این محصول یافت نشد
                          </div>
                        }
                        dropdownStyle={{ textAlign: "right" }}
                      >
                        {branches.map((branch) => (
                          <Option key={branch.branchid} value={branch.branchid}>
                            {branch.name}
                            {branch.quantity ? ` (موجودی: ${branch.quantity})` : ""}
                          </Option>
                        ))}
                      </Select>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 space-y-2 text-right">
                <label htmlFor="warrantycode" className="block text-sm font-medium text-gray-300">
                  کد گارانتی
                </label>
                {!warrantyData.branchId && !isUpdate ? (
                  <p className="mb-1 text-sm text-amber-400">
                    برای تولید کد گارانتی ابتدا شعبه را انتخاب کنید
                  </p>
                ) : generatingCode ? (
                  <div className="flex justify-center p-2">
                    <Spin size="small" />
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      id="warrantycode"
                      name="warrantycode"
                      className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-right text-white disabled:bg-slate-700"
                      value={warrantyData.warrantycode}
                      disabled
                      readOnly
                      required
                    />
                    {!isUpdate && warrantyData.branchId && (
                      <button
                        type="button"
                        onClick={generateWarrantyCode}
                        className="rounded-lg bg-blue-700 px-2 py-1 text-sm font-medium text-white transition-colors hover:bg-blue-600"
                        disabled={generatingCode}
                      >
                        {generatingCode ? <Spin size="small" /> : <RotateCcw size={20} />}
                      </button>
                    )}
                  </div>
                )}
              </div>

              <div className="mt-4 grid grid-cols-2 gap-4">
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

              {durationText && (
                <>
                  <div className="mt-4 text-center">
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
                    className={`mt-2 rounded p-2 text-center ${
                      durationText.includes("باید") || durationText.includes("خطا")
                        ? "bg-red-900/40 text-red-300"
                        : "bg-blue-900/40 text-blue-300"
                    }`}
                  >
                    <span>مدت گارانتی: {durationText}</span>
                  </div>
                </>
              )}
            </div>
          </form>

          <div className="no-print flex justify-between gap-4 p-6">
            <div className="flex items-center">
              {isUpdate && warrantyData.hasWarranty && (
                <PrintButton
                  onPrint={handleWarrantyPrint}
                  className="flex items-center gap-2 rounded-lg bg-green-700 px-3 py-2 text-sm text-white hover:bg-green-600"
                />
              )}
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg bg-gray-700 px-4 py-2 text-white hover:bg-gray-600"
              >
                انصراف
              </button>
              <button
                type="submit"
                onClick={handleSubmit}
                disabled={
                  submittingCreate ||
                  submittingDelete ||
                  (warrantyData.hasWarranty &&
                    (!warrantyData.warrantycode ||
                      (!isUpdate && (branches.length === 0 || !warrantyData.branchId)) ||
                      durationText?.includes("باید") ||
                      durationText?.includes("خطا")))
                }
                className="rounded-lg bg-blue-700 px-4 py-2 text-white hover:bg-blue-600 disabled:bg-blue-900 disabled:text-gray-300"
              >
                {submittingCreate || submittingDelete
                  ? "در حال پردازش..."
                  : !warrantyData.hasWarranty && isUpdate
                    ? "حذف گارانتی"
                    : isUpdate
                      ? "بروزرسانی گارانتی"
                      : "ثبت گارانتی"}
              </button>
            </div>
          </div>
        </div>

        {/* Print view - only show if hasWarranty is true */}
        {warrantyData.hasWarranty && (
          <div
            ref={componentRef}
            className={`warranty-print-view ${!showPrintView ? "hidden" : ""}`}
          >
            <div className="warranty-certificate">
              <div className="mb-1 text-center">
                <img
                  src="/Farabak_Logo.webp"
                  alt="Farabak Logo"
                  width={100}
                  height={100}
                  className="mx-auto"
                />
                <h1 className="text-lg font-bold">کارت گارانتی</h1>
              </div>

              <div className="mt-1">
                <div className="flex items-center justify-between border-b border-gray-200">
                  <span className="text-sm font-semibold">کد گارانتی:</span>
                  <span className="text-sm">{warrantyData.warrantycode}</span>
                </div>

                <div className="flex items-center justify-between border-b border-gray-200">
                  <span className="text-sm font-semibold">محصول:</span>
                  <span className="text-sm">{item.Name || `محصول #${item.ProductId}`}</span>
                </div>

                <div className="flex items-center justify-between border-b border-gray-200">
                  <span className="text-sm font-semibold">تاریخ شروع:</span>
                  <span className="text-sm" dir="ltr">
                    {new Date(warrantyData.startdate).toLocaleDateString("fa-IR")}
                  </span>
                </div>

                <div className="flex items-center justify-between border-b border-gray-200">
                  <span className="text-sm font-semibold">تاریخ انقضا:</span>
                  <span className="text-sm" dir="ltr">
                    {new Date(warrantyData.expirydate).toLocaleDateString("fa-IR")}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold">مدت گارانتی:</span>
                  <span className="text-sm">{durationText}</span>
                </div>
              </div>

              <div className="mt-2 border-t border-gray-200 pt-1 text-center text-xs">
                <p>www.farabak.net</p>
              </div>
            </div>
          </div>
        )}
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
