import { useState, useEffect } from "react";
import { ExpandedInvoiceItem } from "./AdminInvoiceDetailsModal";
import toast from "react-hot-toast";
import { DatePicker } from "zaman";
import { Spin, Select } from "antd";

// Format a Date object to YYYY-MM-DD string
const formatDateToISOString = (date: Date | null): string | null => {
  if (!date) return null;
  // Use a fixed timezone (Tehran) for consistency
  const tehranDate = new Date(
    date.toLocaleString("en-US", { timeZone: "Asia/Tehran" })
  );
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
  const [loading, setLoading] = useState(false);
  const [loadingWarrantyCode, setLoadingWarrantyCode] = useState(false);
  const [loadingBranches, setLoadingBranches] = useState(true);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [warrantyData, setWarrantyData] = useState<{
    warrantycode: string;
    startdate: string;
    expirydate: string;
    status: string;
    branchId: number | null;
  }>({
    warrantycode: item.individualWarranty?.warrantycode || "",
    startdate: item.individualWarranty?.startdate || new Date().toISOString().split("T")[0],
    expirydate: item.individualWarranty?.expirydate || new Date(Date.now() + 730*24*60*60*1000).toISOString().split("T")[0],
    status: item.individualWarranty?.status || "Active",
    branchId: item.individualWarranty?.branchid ? Number(item.individualWarranty.branchid) : null,
  });
  const [durationText, setDurationText] = useState<string | null>(null);

  const isUpdate = !!item.individualWarranty;

  // Fetch branches when component mounts
  useEffect(() => {
    fetchBranches();
  }, []);
  
  // Fetch list of available branches
  const fetchBranches = async () => {
    try {
      setLoadingBranches(true);
      const response = await fetch('/api/admin/branches/list');
      
      if (!response.ok) {
        throw new Error('Failed to fetch branches');
      }
      
      const data = await response.json();
      setBranches(data);
      
      // If this is a new warranty and we have branches, select the first one by default
      if (!isUpdate && data.length > 0 && !warrantyData.branchId) {
        setWarrantyData(prev => ({
          ...prev,
          branchId: data[0].branchid
        }));
      }
    } catch (error) {
      console.error('Error fetching branches:', error);
      toast.error('خطا در دریافت لیست شعبه‌ها');
    } finally {
      setLoadingBranches(false);
    }
  };

  // Generate a unique warranty code when component mounts
  useEffect(() => {
    if (!isUpdate && warrantyData.branchId) {
      generateWarrantyCode();
    }
  }, [warrantyData.branchId, isUpdate]);

  // Calculate warranty duration and update status based on expiry date
  useEffect(() => {
    calculateDuration(new Date(warrantyData.startdate), new Date(warrantyData.expirydate));
    
    // Auto-set status based on expiry date
    const currentDate = new Date();
    const expiryDate = new Date(warrantyData.expirydate);
    
    // If expiry date is in the past, set status to Expired
    if (expiryDate < currentDate) {
      setWarrantyData(prev => ({
        ...prev,
        status: "Expired"
      }));
    } else {
      // Otherwise set to Active (only if current status is Expired)
      if (warrantyData.status === "Expired") {
        setWarrantyData(prev => ({
          ...prev,
          status: "Active"
        }));
      }
    }
  }, [warrantyData.startdate, warrantyData.expirydate]);

  const generateWarrantyCode = async () => {
    try {
      setLoadingWarrantyCode(true);

      // Find selected branch
      const selectedBranch = branches.find(b => b.branchid === warrantyData.branchId);
      if (!selectedBranch) {
        throw new Error("شعبه انتخاب شده یافت نشد");
      }
      
      // Use branch location code or name as branch code
      const branchCode = selectedBranch.location || selectedBranch.name.substring(0, 2).toUpperCase();

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
      
      // Update state with generated code
      setWarrantyData(prev => ({
        ...prev,
        warrantycode: data.warrantyCode
      }));
    } catch (error) {
      console.error("Error generating warranty code:", error);
      
      // Fallback to local generation
      const selectedBranch = branches.find(b => b.branchid === warrantyData.branchId);
      const branchCode = selectedBranch?.location || selectedBranch?.name.substring(0, 2).toUpperCase() || "FA";
      
      const randomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      
      // Use Persian date for the fallback as well
      const date = new Date();
      const persianYear = new Intl.DateTimeFormat("fa-IR", { year: "numeric" }).format(date);
      const persianMonth = new Intl.DateTimeFormat("fa-IR", { month: "2-digit" }).format(date);
      
      const yearStr = persianToEnglishDigits(persianYear);
      const monthStr = persianToEnglishDigits(persianMonth);
      
      const yearNum = yearStr.slice(-3); // Get last 3 digits, e.g., 404 from 1404
      const yearMonth = yearNum + monthStr.padStart(2, "0");
      
      setWarrantyData(prev => ({
        ...prev,
        warrantycode: `${branchCode}-${yearMonth}-${randomCode}`
      }));
    } finally {
      setLoadingWarrantyCode(false);
    }
  };

  const calculateDuration = (
    startDate: Date | string | null,
    endDate: Date | string | null
  ) => {
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
      startdate: formattedDate || new Date().toISOString().split("T")[0]
    });
  };

  const handleEndDateChange = (date: any) => {
    // Convert the date object provided by zaman DatePicker
    const formattedDate = date && date.value ? formatDateToISOString(new Date(date.value)) : null;
    setWarrantyData({
      ...warrantyData,
      expirydate: formattedDate || new Date(Date.now() + 730*24*60*60*1000).toISOString().split("T")[0]
    });
  };

  const handleBranchChange = (value: number) => {
    setWarrantyData(prevData => ({
      ...prevData,
      branchId: value,
      warrantycode: "" // Clear warranty code when branch changes
    }));
    // generateWarrantyCode will be triggered by the useEffect when branchId changes
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!warrantyData.branchId) {
      toast.error("لطفا شعبه را انتخاب کنید");
      return;
    }

    setLoading(true);

    try {
      const endpoint = `/api/admin/warranty/${isUpdate ? 'update' : 'create'}`;
      const payload = {
        invoiceId: invoiceId,
        invoiceDetailId: item.Invoice_Details,
        productId: item.ProductId,
        warrantyData: {
          ...warrantyData,
          warrantyid: item.individualWarranty?.warrantyid,
          branchId: warrantyData.branchId
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

      toast.success(isUpdate ? "گارانتی با موفقیت به‌روزرسانی شد" : "گارانتی جدید با موفقیت ایجاد شد");
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.message || "خطا در مدیریت گارانتی");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={(e) => e.stopPropagation()}>
      <div className="bg-slate-900 rounded-lg w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="p-6 border-b border-slate-700">
          <h2 className="text-xl font-bold text-white text-center">
            {isUpdate ? "ویرایش گارانتی" : "افزودن گارانتی جدید"}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4" dir="rtl">
          <div className="space-y-2">
            <label htmlFor="productName" className="block text-sm font-medium text-gray-300">
              محصول
            </label>
            <input
              type="text"
              id="productName"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-3 text-white disabled:opacity-70"
              value={item.Name || `محصول #${item.ProductId}`}
              disabled
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              شعبه مسئول گارانتی <span className="text-red-400">*</span>
            </label>
            {!isUpdate && <p className="text-xs text-gray-400 mb-1">ابتدا شعبه را انتخاب کنید، سپس کد گارانتی تولید خواهد شد</p>}
            {loadingBranches ? (
              <div className="flex justify-center p-2">
                <Spin size="small" />
              </div>
            ) : (
              <Select
                className="w-full custom-dark-select"
                placeholder="انتخاب شعبه"
                value={warrantyData.branchId || undefined}
                onChange={handleBranchChange}
                disabled={isUpdate} // Disable change for existing warranties
                style={{ width: '100%' }}
                popupClassName="custom-dark-popup"
              >
                {branches.map(branch => (
                  <Option key={branch.branchid} value={branch.branchid}>
                    {branch.name} {branch.location ? `(${branch.location})` : ''}
                  </Option>
                ))}
              </Select>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="warrantycode" className="block text-sm font-medium text-gray-300">
              کد گارانتی
            </label>
            {!warrantyData.branchId && !isUpdate ? (
              <p className="text-amber-400 text-sm mb-1">برای تولید کد گارانتی ابتدا شعبه را انتخاب کنید</p>
            ) : loadingWarrantyCode ? (
              <div className="flex justify-center p-2">
                <Spin size="small" />
              </div>
            ) : (
              <div className="flex gap-2">
                <input
                  type="text"
                  id="warrantycode"
                  name="warrantycode"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-3 text-white disabled:bg-slate-700"
                  value={warrantyData.warrantycode}
                  disabled
                  readOnly
                  required
                />
                {!isUpdate && warrantyData.branchId && (
                  <button
                    type="button"
                    onClick={generateWarrantyCode}
                    className="px-2 py-1 bg-blue-700 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors"
                    disabled={loadingWarrantyCode}
                  >
                    {loadingWarrantyCode ? <Spin size="small" /> : "ساخت مجدد"}
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="startdate" className="block text-sm font-medium text-gray-300">
                تاریخ شروع
              </label>
              <DatePicker
                defaultValue={new Date(warrantyData.startdate)}
                weekends={[5, 6]}
                round="x2"
                accentColor="#226bff"
                inputClass="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-white"
                className="z-[1000]"
                direction="rtl"
                onChange={handleStartDateChange}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="expirydate" className="block text-sm font-medium text-gray-300">
                تاریخ انقضا
              </label>
              <DatePicker
                defaultValue={new Date(warrantyData.expirydate)}
                weekends={[5, 6]}
                round="x2"
                accentColor="#226bff"
                inputClass="w-full p-2 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-white"
                className="z-[1000]"
                direction="rtl"
                onChange={handleEndDateChange}
              />
            </div>
          </div>

          {durationText && (
            <>
              <div className="text-center">
                <span className="text-gray-300 text-xs">وضعیت گارانتی: </span>
                {new Date(warrantyData.expirydate) < new Date() ? (
                  <span className="text-red-400 text-xs">منقضی شده</span>
                ) : (
                  <span className="text-green-400 text-xs">فعال</span>
                )}
                <span className="text-gray-500 text-xs"> (تعیین اتوماتیک براساس تاریخ انقضا)</span>
              </div>
              <div className={`text-center p-2 rounded ${
                durationText.includes("باید") || durationText.includes("خطا")
                  ? "bg-red-900/40 text-red-300"
                  : "bg-blue-900/40 text-blue-300"
              }`}>
                <span>مدت گارانتی: {durationText}</span>
              </div>
            </>
          )}

          <div className="flex justify-end space-x-3 rtl:space-x-reverse pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm font-medium transition-colors"
            >
              انصراف
            </button>
            <button
              type="submit"
              disabled={loading || !warrantyData.warrantycode || !warrantyData.branchId || durationText?.includes("باید") || durationText?.includes("خطا")}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? "در حال پردازش..." : isUpdate ? "به‌روزرسانی" : "ثبت گارانتی"}
            </button>
          </div>
        </form>
      </div>

      <style jsx global>{`
        .custom-dark-select .ant-select-selector {
          background-color: #1e293b !important;
          border-color: #334155 !important;
          color: white !important;
          height: 40px !important;
          border-radius: 0.5rem !important;
          display: flex;
          align-items: center;
        }
        
        .custom-dark-select .ant-select-selection-item {
          color: white !important;
        }
        
        .custom-dark-select .ant-select-arrow {
          color: #94a3b8 !important;
        }
        
        .custom-dark-popup {
          background-color: #1e293b !important;
          border: 1px solid #334155 !important;
          border-radius: 0.5rem !important;
        }
        
        .custom-dark-popup .ant-select-item {
          color: white !important;
        }
        
        .custom-dark-popup .ant-select-item-option-active:not(.ant-select-item-option-disabled) {
          background-color: #2d3748 !important;
        }
        
        .custom-dark-popup .ant-select-item-option-selected:not(.ant-select-item-option-disabled) {
          background-color: #3b82f6 !important;
        }
      `}</style>
    </div>
  );
};

export default WarrantyManagementModal; 