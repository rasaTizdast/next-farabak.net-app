import { useState, useEffect } from "react";
import { usePrint } from "@/app/utils/usePrint";
import PrintButton from "@/app/components/ui/PrintButton";
import { ExpandedInvoiceItem } from "./BranchInvoiceDetailsModal";
import { Spin } from "antd";

type BranchWarrantyViewModalProps = {
  item: ExpandedInvoiceItem;
  onClose: () => void;
};

const BranchWarrantyViewModal: React.FC<BranchWarrantyViewModalProps> = ({
  item,
  onClose,
}) => {
  // Use the print hook for printing
  const { componentRef, handlePrint } = usePrint();
  const [branchName, setBranchName] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [showPrintView, setShowPrintView] = useState<boolean>(false);

  // Log the entire item and warranty object to debug the structure
  useEffect(() => {
    console.log("Full item object:", item);

    if (item?.individualWarranty) {
      // Log all properties directly on the warranty object
      console.log("Warranty properties:", Object.keys(item.individualWarranty));

      // Check if branchname already exists on the warranty object
      console.log("Direct branch name:", item.individualWarranty.branchname);

      // Check if branch object exists and has name
      if ((item.individualWarranty as any).branch) {
        console.log("Branch object:", (item.individualWarranty as any).branch);
        console.log(
          "Branch name from relationship:",
          (item.individualWarranty as any).branch.name
        );
      }
    }
  }, [item]);

  if (!item || !item.individualWarranty) return null;

  const warranty = item.individualWarranty;
  const hasValidWarranty = Boolean(warranty?.warrantycode);

  // If the branch name is already present in the warranty data, use it directly
  useEffect(() => {
    // Check if branch name is already available in the data
    if ((warranty as any).branchname) {
      setBranchName((warranty as any).branchname);
      return;
    }

    // Check if branch object with name is present
    if ((warranty as any).branch?.name) {
      setBranchName((warranty as any).branch.name);
      return;
    }

    // If no branch name is available in data, then try API fetch
    const branchId = warranty.branchid;

    // Log what we're using
    console.log("Using branch ID for API fetch:", branchId);

    const fetchBranchName = async () => {
      if (!branchId) {
        console.log("No branch ID available for API fetch");
        setBranchName("تعیین نشده");
        return;
      }

      try {
        setLoading(true);
        console.log("Fetching branch name for ID:", branchId);

        const url = `/api/admin/branches/${branchId}`;
        console.log("Request URL:", url);

        const response = await fetch(url);
        console.log("Response status:", response.status, "OK:", response.ok);

        if (response.ok) {
          const responseText = await response.text();
          console.log("Raw response:", responseText);

          let branchData;
          try {
            branchData = JSON.parse(responseText);
            console.log("Parsed branch data:", branchData);

            // The API returns an object with a 'name' property
            setBranchName(branchData.name || "تعیین نشده");
          } catch (parseError) {
            console.error("Error parsing JSON response:", parseError);
            setBranchName("خطا در پردازش پاسخ");
          }
        } else {
          console.error(
            "Failed to fetch branch name, status:",
            response.status
          );
          setBranchName("خطا در دریافت اطلاعات شعبه");
        }
      } catch (error) {
        console.error("Error fetching branch name:", error);
        setBranchName("خطا در ارتباط با سرور");
      } finally {
        setLoading(false);
      }
    };

    // Only fetch if branch name isn't already set and we have a branch ID
    if (!branchName && branchId) {
      fetchBranchName();
    } else if (!branchId) {
      setBranchName("تعیین نشده");
    }
  }, [warranty, branchName]);

  // Format date for display
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("fa-IR");
  };

  // Calculate warranty duration
  const calculateDuration = () => {
    if (!warranty.startdate || !warranty.expirydate) return null;

    try {
      const start = new Date(warranty.startdate);
      const end = new Date(warranty.expirydate);

      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return "خطا در محاسبه تاریخ";
      }

      if (start >= end) {
        return "تاریخ پایان باید بعد از تاریخ شروع باشد";
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

      return durationStr.trim();
    } catch (error) {
      console.error("Error calculating duration:", error);
      return "خطا در محاسبه مدت";
    }
  };

  // Handle print of warranty card
  const handleWarrantyPrint = () => {
    // Only print if there's a valid warranty
    if (!hasValidWarranty) {
      return;
    }

    // Show print view and prepare for printing
    setShowPrintView(true);

    // Wait for the DOM to update before printing
    setTimeout(() => {
      if (componentRef.current) {
        handlePrint({
          printTitle: `گارانتی ${warranty.warrantycode}`,
          hideElements: [".no-print", "button"],
          stickerMode: true, // Enable sticker mode for compact printing
        });
      }

      // Hide print view after printing
      setTimeout(() => {
        setShowPrintView(false);
      }, 1000);
    }, 100);
  };

  const durationText = calculateDuration();
  const isExpired =
    warranty.status === "Expired" ||
    warranty.displayStatus === "Expired" ||
    (warranty.expirydate && new Date(warranty.expirydate) < new Date());

  // Use branch name from state or fallback
  const displayBranchName = branchName || "در حال بارگذاری...";

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={(e) => e.stopPropagation()}
    >
      <div
        className="bg-slate-900 rounded-lg w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 border-b border-slate-700">
          <h2 className="text-xl font-bold text-white text-center">
            مشاهده گارانتی
          </h2>
        </div>

        {/* Main form view - only visible when not printing */}
        <div className={showPrintView ? "hidden" : ""}>
          <div className="p-6 space-y-4">
            <div className="space-y-2 text-right">
              <label
                htmlFor="productName"
                className="block text-sm font-medium text-gray-300 no-print"
              >
                محصول
              </label>
              <input
                type="text"
                id="productName"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-3 text-white disabled:opacity-70 text-right no-print"
                value={item.Name || `محصول #${item.ProductId}`}
                disabled
                readOnly
              />
              <div className="print-only">
                <span className="font-semibold">محصول:</span>{" "}
                {item.Name || `محصول #${item.ProductId}`}
              </div>
            </div>

            <div className="space-y-2 text-right">
              <label
                htmlFor="warrantycode"
                className="block text-sm font-medium text-gray-300 no-print"
              >
                کد گارانتی
              </label>
              <input
                type="text"
                id="warrantycode"
                name="warrantycode"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-3 text-white disabled:bg-slate-700 text-right no-print"
                value={warranty.warrantycode || "بدون گارانتی"}
                disabled
                readOnly
              />
              <div className="print-only">
                <span className="font-semibold">کد گارانتی:</span>{" "}
                {warranty.warrantycode}
              </div>
            </div>

            <div className="space-y-2 text-right">
              <label
                htmlFor="branchname"
                className="block text-sm font-medium text-gray-300 no-print"
              >
                شعبه مسئول گارانتی
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="branchname"
                  name="branchname"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-3 text-white disabled:bg-slate-700 text-right no-print"
                  value={loading ? "در حال بارگذاری..." : displayBranchName}
                  disabled
                  readOnly
                />
                {loading && (
                  <div className="absolute top-1/2 transform -translate-y-1/2 left-3">
                    <Spin size="small" />
                  </div>
                )}
              </div>
              <div className="print-only">
                <span className="font-semibold">شعبه مسئول:</span>{" "}
                {displayBranchName}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 no-print">
              <div className="space-y-2 text-right">
                <label
                  htmlFor="startdate"
                  className="block text-sm font-medium text-gray-300"
                >
                  تاریخ شروع
                </label>
                <input
                  type="text"
                  id="startdate"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-3 text-white disabled:opacity-70 text-right"
                  value={formatDate(warranty.startdate)}
                  disabled
                  readOnly
                />
              </div>

              <div className="space-y-2 text-right">
                <label
                  htmlFor="expirydate"
                  className="block text-sm font-medium text-gray-300"
                >
                  تاریخ انقضا
                </label>
                <input
                  type="text"
                  id="expirydate"
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2 px-3 text-white disabled:opacity-70 text-right"
                  value={formatDate(warranty.expirydate)}
                  disabled
                  readOnly
                />
              </div>
            </div>

            <div className="print-only">
              <div className="flex justify-between items-center border-b border-gray-200 py-1">
                <span className="font-semibold">تاریخ شروع:</span>
                <span dir="ltr">{formatDate(warranty.startdate)}</span>
              </div>
              <div className="flex justify-between items-center border-b border-gray-200 py-1">
                <span className="font-semibold">تاریخ انقضا:</span>
                <span dir="ltr">{formatDate(warranty.expirydate)}</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="font-semibold">مدت گارانتی:</span>
                <span>{durationText}</span>
              </div>
            </div>

            <div className="text-center mt-4 no-print">
              <span className="text-gray-300 text-xs">وضعیت گارانتی: </span>
              {!hasValidWarranty ? (
                <span className="text-amber-400 text-xs">بدون گارانتی</span>
              ) : isExpired ? (
                <span className="text-red-400 text-xs">منقضی شده</span>
              ) : (
                <span className="text-green-400 text-xs">فعال</span>
              )}
            </div>

            {durationText && hasValidWarranty && (
              <div
                className={`text-center p-2 rounded mt-2 no-print ${
                  durationText.includes("باید") || durationText.includes("خطا")
                    ? "bg-red-900/40 text-red-300"
                    : "bg-blue-900/40 text-blue-300"
                }`}
              >
                <span>مدت گارانتی: {durationText}</span>
              </div>
            )}
          </div>

          <div className="flex justify-between gap-4 p-6 no-print">
            {hasValidWarranty && (
              <PrintButton
                onPrint={handleWarrantyPrint}
                className="px-3 py-2 bg-green-700 hover:bg-green-600 text-white rounded-lg text-sm flex gap-2 items-center"
              />
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white ml-auto"
            >
              بستن
            </button>
          </div>
        </div>

        {/* Print view with warranty card format - displayed only when printing */}
        <div
          ref={componentRef}
          className={`warranty-print-view ${!showPrintView ? "hidden" : ""}`}
          dir="rtl"
        >
          <div className="warranty-certificate">
            <div className="text-center mb-1">
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
              <div className="flex justify-between items-center border-b border-gray-200">
                <span className="font-semibold text-sm">کد گارانتی:</span>
                <span className="text-sm">{warranty.warrantycode}</span>
              </div>

              <div className="flex justify-between items-center border-b border-gray-200">
                <span className="font-semibold text-sm">محصول:</span>
                <span className="text-sm">
                  {item.Name || `محصول #${item.ProductId}`}
                </span>
              </div>

              <div className="flex justify-between items-center border-b border-gray-200">
                <span className="font-semibold text-sm">تاریخ شروع:</span>
                <span className="text-sm" dir="ltr">
                  {formatDate(warranty.startdate)}
                </span>
              </div>

              <div className="flex justify-between items-center border-b border-gray-200">
                <span className="font-semibold text-sm">تاریخ انقضا:</span>
                <span className="text-sm" dir="ltr">
                  {formatDate(warranty.expirydate)}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="font-semibold text-sm">مدت گارانتی:</span>
                <span className="text-sm">{durationText}</span>
              </div>
            </div>

            <div className="text-xs text-center border-t border-gray-200 mt-2 pt-1">
              <p>www.farabak.net</p>
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
          
          .warranty-certificate img {
            width: 60px !important;
            height: 60px !important;
            margin-bottom: 1px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default BranchWarrantyViewModal;
