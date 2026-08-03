"use client";

import { Switch } from "antd";
import { DatePicker } from "zaman";

import PrintButton from "@/app/components/ui/PrintButton";
import { ExpandedInvoiceItem } from "./types";

interface WarrantyData {
  warrantycode: string;
  startdate: string;
  expirydate: string;
  status: string;
  branchId: number | null;
  hasWarranty: boolean;
}

interface WarrantyUpdateModeProps {
  item: ExpandedInvoiceItem;
  selectedBranchName: string;
  warrantyData: WarrantyData;
  handleStartDateChange: (date: any) => void;
  handleEndDateChange: (date: any) => void;
  handleWarrantyToggle: (checked: boolean) => void;
  handleSubmit: (e: React.FormEvent) => void;
  durationText: string | null;
  nowTimestamp: number;
  onClose: () => void;
  submittingCreate: boolean;
  submittingDelete: boolean;
  handleWarrantyPrint: () => void;
}

export default function WarrantyUpdateMode({
  item,
  selectedBranchName,
  warrantyData,
  handleStartDateChange,
  handleEndDateChange,
  handleWarrantyToggle,
  handleSubmit,
  durationText,
  nowTimestamp,
  onClose,
  submittingCreate,
  submittingDelete,
  handleWarrantyPrint,
}: WarrantyUpdateModeProps) {
  return (
    <>
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

        <div className="space-y-2 text-right">
          <div className="flex items-center justify-between">
            <label htmlFor="warranty-toggle" className="block text-sm font-medium text-gray-300">
              فعال کردن گارانتی
            </label>
            <Switch
              id="warranty-toggle"
              checked={warrantyData.hasWarranty}
              onChange={handleWarrantyToggle}
              className="bg-slate-700"
            />
          </div>
          {!warrantyData.hasWarranty && (
            <p className="text-sm text-amber-400">
              با غیرفعال کردن گارانتی، اطلاعات گارانتی فعلی حذف خواهد شد.
            </p>
          )}
        </div>

        {warrantyData.hasWarranty && (
          <>
            <div className="space-y-2 text-right">
              <label htmlFor="branch-select" className="block text-sm font-medium text-gray-300">
                شعبه مسئول گارانتی <span className="text-red-400">*</span>
              </label>
              <div className="mb-2 text-xs text-gray-400">
                شعبه انتخاب شده برای گارانتی غیرقابل تغییر است.
              </div>
              <input
                type="text"
                readOnly
                aria-label="شعبه انتخاب شده"
                className="w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-right text-white disabled:opacity-70"
                value={selectedBranchName}
                disabled
              />
            </div>

            <div className="mt-4 space-y-2 text-right">
              <label htmlFor="warrantycode" className="block text-sm font-medium text-gray-300">
                کد گارانتی
              </label>
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
          </>
        )}
      </form>

      <div className="no-print flex justify-between gap-4 p-6">
        <div className="flex items-center">
          {warrantyData.hasWarranty && (
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
                  durationText?.includes("باید") ||
                  durationText?.includes("خطا")))
            }
            className="rounded-lg bg-blue-700 px-4 py-2 text-white hover:bg-blue-600 disabled:bg-blue-900 disabled:text-gray-300"
          >
            {submittingCreate || submittingDelete
              ? "در حال پردازش..."
              : !warrantyData.hasWarranty
                ? "حذف گارانتی"
                : "بروزرسانی گارانتی"}
          </button>
        </div>
      </div>
    </>
  );
}
