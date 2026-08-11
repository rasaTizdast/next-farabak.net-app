"use client";

import { Spin, Select, Switch } from "antd";
import { RotateCcw } from "lucide-react";
import { DatePicker } from "zaman";

import { ExpandedInvoiceItem } from "./types";

const { Option } = Select;

interface Branch {
  branchid: number;
  name: string;
  location?: string;
  quantity?: number;
}

interface WarrantyData {
  warrantycode: string;
  startdate: string;
  expirydate: string;
  status: string;
  branchId: number | null;
  hasWarranty: boolean;
}

interface WarrantyCreateModeProps {
  item: ExpandedInvoiceItem;
  branches: Branch[];
  loadingBranches: boolean;
  warrantyData: WarrantyData;
  generatingCode: boolean;
  handleBranchChange: (value: number) => void;
  handleStartDateChange: (date: any) => void;
  handleEndDateChange: (date: any) => void;
  handleWarrantyToggle: (checked: boolean) => void;
  generateWarrantyCode: () => Promise<void>;
  handleSubmit: (e: React.FormEvent) => void;
  durationText: string | null;
  nowTimestamp: number;
  onClose: () => void;
  submittingCreate: boolean;
}

export default function WarrantyCreateMode({
  item,
  branches,
  loadingBranches,
  warrantyData,
  generatingCode,
  handleBranchChange,
  handleStartDateChange,
  handleEndDateChange,
  handleWarrantyToggle,
  generateWarrantyCode,
  handleSubmit,
  durationText,
  nowTimestamp,
  onClose,
  submittingCreate,
}: WarrantyCreateModeProps) {
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
        </div>

        {warrantyData.hasWarranty && (
          <>
            <div className="space-y-2 text-right">
              <label htmlFor="branch-select" className="block text-sm font-medium text-gray-300">
                شعبه مسئول گارانتی <span className="text-red-400">*</span>
              </label>
              <p className="mb-1 text-xs text-gray-400">
                ابتدا شعبه را انتخاب کنید، سپس کد گارانتی تولید خواهد شد
              </p>
              <div>
                <label
                  htmlFor="branch-select"
                  className="mb-2 block text-sm font-medium text-gray-300"
                >
                  شعبه
                </label>
                <div className="mb-2 text-xs text-gray-400">
                  توجه: فقط شعبه‌هایی که این محصول را در انبار خود دارند نمایش داده می‌شوند. با ثبت
                  گارانتی، یک عدد از موجودی محصول در شعبه کم می‌شود.
                </div>
                {loadingBranches ? (
                  <div className="flex justify-center p-2">
                    <Spin size="small" />
                  </div>
                ) : (
                  <div>
                    <Select
                      id="branch-select"
                      className="warranty-select w-full text-right [&.ant-select-disabled_.ant-select-selector]:!bg-slate-900 [&.ant-select-disabled_.ant-select-selector]:!opacity-70 [&_.ant-select-arrow]:!text-slate-400 [&_.ant-select-arrow_.anticon-loading]:!text-blue-500 [&_.ant-select-clear]:!bg-slate-800 [&_.ant-select-clear]:!text-slate-400 [&_.ant-select-focused_.ant-select-selector]:!border-blue-500 [&_.ant-select-focused_.ant-select-selector]:!shadow-[0_0_0_2px_rgba(59,130,246,0.2)] [&_.ant-select-selection-item]:!pr-3 [&_.ant-select-selection-item]:!text-right [&_.ant-select-selection-item]:!text-white [&_.ant-select-selection-placeholder]:!text-slate-400 [&_.ant-select-selector]:!flex [&_.ant-select-selector]:!h-10 [&_.ant-select-selector]:!items-center [&_.ant-select-selector]:!rounded-lg [&_.ant-select-selector]:!border-slate-700 [&_.ant-select-selector]:!bg-slate-800 [&_.ant-select-selector]:!text-right [&_.ant-select-selector]:!text-white hover:[&_.ant-select-selector]:!border-gray-600 hover:[&_.ant-select-selector]:!shadow-[0_0_0_2px_rgba(59,130,246,0.1)]"
                      placeholder="انتخاب شعبه"
                      value={warrantyData.branchId || undefined}
                      onChange={handleBranchChange}
                      loading={loadingBranches}
                      disabled={loadingBranches}
                      popupClassName="warranty-select-dropdown !bg-slate-800 !border !border-slate-700 !rounded-lg [&_.ant-select-item]:!pr-3 [&_.ant-select-item]:!text-right [&_.ant-select-item]:!text-white [&_.ant-select-item-option-active:not(.ant-select-item-option-disabled)]:!bg-[#2d3748] [&_.ant-select-item-option-selected:not(.ant-select-item-option-disabled)]:!bg-blue-500 [&_.ant-empty-description]:!text-red-400 [&_.ant-select-item-empty]:!py-3 [&_.ant-select-item-empty]:!text-center [&_.ant-select-item-empty]:!text-red-400"
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
              {!warrantyData.branchId ? (
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
                  {warrantyData.branchId && (
                    <button
                      type="button"
                      onClick={generateWarrantyCode}
                      aria-label="تولید مجدد کد گارانتی"
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
        <div className="flex items-center" />
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
              (warrantyData.hasWarranty &&
                (!warrantyData.warrantycode ||
                  branches.length === 0 ||
                  !warrantyData.branchId ||
                  durationText?.includes("باید") ||
                  durationText?.includes("خطا")))
            }
            className="rounded-lg bg-blue-700 px-4 py-2 text-white hover:bg-blue-600 disabled:bg-blue-900 disabled:text-gray-300"
          >
            {submittingCreate ? "در حال پردازش..." : "ثبت گارانتی"}
          </button>
        </div>
      </div>
    </>
  );
}
