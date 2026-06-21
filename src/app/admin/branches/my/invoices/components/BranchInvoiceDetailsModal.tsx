import { message } from "antd";
import Image from "next/image";
import React, { useState, useEffect } from "react";

import { AdminInvoice } from "@/app/admin/invoices/type";
import PrintButton from "@/app/components/ui/PrintButton";
import { usePrint } from "@/app/utils/usePrint";

import BranchWarrantyManagementModal from "./BranchWarrantyManagementModal";
import BranchWarrantyViewModal from "./BranchWarrantyViewModal";
import { ExpandedInvoiceItem, ExtendedWarranty } from "./types";

interface BranchInvoiceDetailsModalProps {
  invoice: AdminInvoice;
  onClose: () => void;
}

const BranchInvoiceDetailsModal: React.FC<BranchInvoiceDetailsModalProps> = ({
  invoice,
  onClose,
}) => {
  const [productNames, setProductNames] = useState<{ [key: string]: string }>({});
  const [expandedItems, setExpandedItems] = useState<ExpandedInvoiceItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<ExpandedInvoiceItem | null>(null);
  const [addWarrantyItem, setAddWarrantyItem] = useState<ExpandedInvoiceItem | null>(null);
  const [refreshCounter, setRefreshCounter] = useState(0);

  // Use the print hook for printing
  const { componentRef, handlePrint } = usePrint();

  // Ensure invoice structure is valid
  if (!invoice.Invoice_Details) {
    console.warn("Missing Invoice_Details in invoice:", invoice);
  }

  // Format date using jalali moment
  const formatDate = (dateString: string, includeTime: boolean = true) => {
    if (!dateString) return "-";
    try {
      // Create a date object
      const date = new Date(dateString);

      // Format date like AdminInvoiceDetailsModal
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");
      const seconds = String(date.getSeconds()).padStart(2, "0");

      if (includeTime) {
        return `${year}/${month}/${day} | ${hours}:${minutes}:${seconds}`;
      } else {
        // Use toLocaleDateString for consistency with AdminInvoiceDetailsModal
        return new Date(dateString).toLocaleDateString("fa-IR");
      }
    } catch (e) {
      console.error("Error formatting date:", e);
      return dateString;
    }
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    if (!amount && amount !== 0) return "-";
    try {
      // Use toLocaleString like AdminInvoiceDetailsModal
      return amount.toLocaleString("fa");
    } catch (e) {
      console.error("Error formatting currency:", e);
      return amount.toString();
    }
  };

  // Fetch product names
  useEffect(() => {
    const fetchProductNames = async () => {
      if (!invoice.Invoice_Details || !Array.isArray(invoice.Invoice_Details)) {
        return;
      }

      const productNameRequests = invoice.Invoice_Details.map(async (product) => {
        try {
          const res = await fetch(`/api/products/getProductType/${product.ProductId}`);
          if (!res.ok) return { id: product.ProductId, name: "" };
          const data = await res.json();
          return { id: product.ProductId, name: data.productType };
        } catch {
          return { id: product.ProductId, name: "" };
        }
      });

      const results = await Promise.all(productNameRequests);

      const names = results.reduce(
        (acc, curr) => {
          acc[curr.id] = curr.name;
          return acc;
        },
        {} as { [key: string]: string }
      );

      setProductNames(names);
    };

    fetchProductNames();
  }, [invoice, refreshCounter]);

  // eslint-disable-next-line react-compiler/set-state-in-effect
  useEffect(() => {
    if (
      !invoice ||
      !invoice.Invoice_Details ||
      !Array.isArray(invoice.Invoice_Details) ||
      invoice.Invoice_Details.length === 0
    ) {
      setExpandedItems([]);
      return;
    }
    const items: ExpandedInvoiceItem[] = [];
    invoice.Invoice_Details.forEach((product) => {
      if (!product) {
        console.warn("Encountered null/undefined product in Invoice_Details");
        return;
      }
      const quantity = product.quantity || 1;
      let warrantyCodes: (
        | string
        | { code: string; startdate?: string; expirydate?: string; status?: string }
      )[] = [];
      if (product.warranty) {
        if (Array.isArray(product.warranty.warrantycodes)) {
          warrantyCodes = product.warranty.warrantycodes;
        } else if (product.warranty.warrantycode) {
          warrantyCodes = [product.warranty.warrantycode];
        }
      }
      if (!product.warranty || quantity <= 1 || warrantyCodes.length === 0) {
        const individualWarranty: ExtendedWarranty | null = product.warranty
          ? {
              ...product.warranty,
              hasWarranty: !!product.warranty.warrantycode,
              branchid: product.warranty.branchid,
            }
          : null;
        items.push({
          ...product,
          itemNumber: 1,
          individualWarranty,
          Name: productNames[product.ProductId],
        });
        return;
      }
      for (let i = 0; i < quantity; i++) {
        const code = i < warrantyCodes.length ? warrantyCodes[i] : null;
        const individualWarranty: ExtendedWarranty | null = code
          ? {
              ...product.warranty,
              warrantycode: typeof code === "string" ? code : code.code,
              startdate:
                typeof code === "string"
                  ? product.warranty?.startdate
                  : code.startdate || product.warranty?.startdate,
              expirydate:
                typeof code === "string"
                  ? product.warranty?.expirydate
                  : code.expirydate || product.warranty?.expirydate,
              status:
                typeof code === "string"
                  ? product.warranty?.status
                  : code.status || product.warranty?.status || "Active",
              hasWarranty: true,
              branchid: product.warranty.branchid,
            }
          : product.warranty;
        items.push({
          ...product,
          itemNumber: i + 1,
          individualWarranty,
          Name: productNames[product.ProductId],
        });
      }
    });
    setExpandedItems(items);
  }, [invoice?.Invoice_Details, productNames, refreshCounter]);

  // Handle refresh after warranty actions
  const handleWarrantyUpdated = async () => {
    setAddWarrantyItem(null);
    message.success("گارانتی با موفقیت اضافه شد");

    try {
      const res = await fetch(`/api/admin/invoices/${invoice.Invoiceid}`);
      if (res.ok) {
        const response = await res.json();
        if (response && response.invoice && response.invoice.Invoice_Details) {
          Object.assign(invoice, response.invoice);
          setRefreshCounter((prev) => prev + 1);
        }
      }
    } catch (error) {
      console.error("Error refreshing invoice data:", error);
    }
  };

  // Handle view warranty
  const handleViewWarranty = (item: ExpandedInvoiceItem) => {
    setSelectedItem(item);
  };

  // Handle add warranty
  const handleAddWarranty = (item: ExpandedInvoiceItem) => {
    setAddWarrantyItem(item);
  };

  // Handle print with specific options
  const handleInvoicePrint = () => {
    // Remove height restriction from table container right before printing
    const tableContainer = document.querySelector(".invoice-table-container");
    if (tableContainer) {
      (tableContainer as HTMLElement).style.maxHeight = "none";
      (tableContainer as HTMLElement).style.overflow = "visible";
    }

    handlePrint({
      printTitle: `فاکتور ${invoice.FactorGuid}`,
      hideElements: [".print-button", "button"], // Removed ".no-print" to match admin component
      compactMode: true, // Enable compact mode for smaller print
    });

    // Reset the styles after print dialog is shown
    setTimeout(() => {
      if (tableContainer) {
        (tableContainer as HTMLElement).style.maxHeight = "500px";
        (tableContainer as HTMLElement).style.overflow = "auto";
      }
    }, 1000);
  };

  // Add effect to refresh invoice data when refreshCounter changes
  useEffect(() => {
    if (refreshCounter > 0) {
      const fetchUpdatedInvoiceData = async () => {
        try {
          const res = await fetch(`/api/admin/invoices/${invoice.Invoiceid}`);
          if (res.ok) {
            const response = await res.json();
            if (response && response.invoice && response.invoice.Invoice_Details) {
              Object.assign(invoice, response.invoice);
            }
          }
        } catch (error) {
          console.error("Error refreshing invoice data:", error);
        }
      };

      fetchUpdatedInvoiceData();
    }
  }, [refreshCounter, invoice.Invoiceid]);

  if (!invoice) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-2 backdrop-blur-sm sm:p-4">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-lg bg-slate-900">
        <div ref={componentRef} className="p-3 sm:p-6">
          <div className="text-gray-100">
            {/* Header */}
            <div className="mb-4 sm:mb-8">
              <Image
                src="/Farabak_Logo.webp"
                alt="Farabak Logo"
                width={130}
                height={130}
                className="logo print-only mx-auto mb-5 mt-4 flex items-center justify-center"
              />
              <h2 className="text-center text-xl font-bold sm:text-2xl">
                جزئیات فاکتور
                <br />
                {invoice.FactorGuid}
              </h2>
            </div>

            <div className="space-y-4 sm:space-y-6" dir="rtl">
              {/* Customer Details */}
              <div className="space-y-3 rounded-lg bg-slate-800 p-3 text-sm sm:space-y-4 sm:p-4 sm:text-base">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">نام و نام خانوادگی:</span>
                  <span className="font-medium">{invoice.Fullname}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">شماره کاربر:</span>
                  <span className="font-medium">{invoice.Phonenumber}</span>
                </div>
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <span className="text-gray-300">تاریخ ثبت فاکتور:</span>
                  <span className="font-medium" dir="ltr">
                    {formatDate(invoice.Date)}
                  </span>
                </div>
                <div className="no-print flex items-center justify-between">
                  <span className="text-gray-300">وضعیت فاکتور:</span>
                  <span className="font-medium">
                    {invoice.Checked ? (
                      <span className="text-green-400">بررسی شده</span>
                    ) : (
                      <span className="text-yellow-400">در انتظار بررسی</span>
                    )}
                  </span>
                </div>
              </div>

              {/* Products Table */}
              <div className="overflow-x-auto rounded-lg bg-slate-800">
                <div className="invoice-table-container max-h-[500px] overflow-auto">
                  <table className="w-full whitespace-nowrap text-xs sm:text-sm">
                    <thead className="sticky top-0 z-10 bg-slate-700">
                      <tr>
                        <th className="p-2 text-right font-medium text-gray-300 sm:p-4">
                          نام محصول
                        </th>
                        <th className="p-2 text-right font-medium text-gray-300 sm:p-4">
                          قیمت واحد - تومان
                        </th>
                        <th className="p-2 text-right font-medium text-gray-300 sm:p-4">گارانتی</th>
                        <th className="no-print p-2 text-right font-medium text-gray-300 sm:p-4">
                          عملیات
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                      {expandedItems.length > 0 ? (
                        expandedItems.map((item, index) => {
                          // Find all items with the same product ID
                          const sameProductItems = expandedItems.filter(
                            (i) => i.ProductId === item.ProductId
                          );

                          // Find index of current item in its product group
                          const currentIndex = sameProductItems.findIndex((i) => i === item);

                          // Only show product name and count for first item in group
                          const isFirstOccurrence = currentIndex === 0;

                          // Generate item indicator for warranty
                          const itemIndicator =
                            sameProductItems.length > 1
                              ? `محصول ${currentIndex + 1} از ${sameProductItems.length}: `
                              : "";

                          // Determine row class based on position in group
                          let rowClass = "hover:bg-slate-750";
                          if (sameProductItems.length > 1) {
                            if (currentIndex === 0) {
                              rowClass += " first-group-item";
                            } else if (currentIndex === sameProductItems.length - 1) {
                              rowClass += " last-group-item";
                            } else {
                              rowClass += " middle-group-item";
                            }
                          }

                          // Add product-specific color class
                          const colorIndex = getProductColorIndex(item.ProductId);
                          rowClass += ` product-color-${getColorNameByIndex(colorIndex)}`;

                          return (
                            <tr
                              key={`${item.ProductId}-${item.itemNumber || index}`}
                              className={rowClass}
                            >
                              <td className="p-2 sm:p-4">
                                {isFirstOccurrence ? (
                                  <div className="flex items-start gap-2">
                                    <span>
                                      {productNames[item.ProductId] ||
                                        item.Type ||
                                        "در حال بارگذاری..."}
                                    </span>
                                    {sameProductItems.length > 1 && (
                                      <span
                                        className={`${getProductColor(
                                          item.ProductId
                                        )} rounded-full px-2 py-0.5 text-xs text-white`}
                                      >
                                        {sameProductItems.length}×
                                      </span>
                                    )}
                                  </div>
                                ) : null}
                              </td>
                              <td className="p-2 sm:p-4">{formatCurrency(item.price)}</td>
                              <td className="p-2 sm:p-4">
                                {item.individualWarranty && item.individualWarranty.warrantycode ? (
                                  <div className="flex flex-col gap-1">
                                    {item.individualWarranty.status === "Expired" ||
                                    item.individualWarranty.displayStatus === "Expired" ||
                                    (item.individualWarranty.expirydate &&
                                      new Date(item.individualWarranty.expirydate) < new Date()) ? (
                                      <span className="no-print inline-block w-fit rounded-full bg-red-900/40 px-2 py-1 text-xs text-red-300">
                                        منقضی شده
                                      </span>
                                    ) : (
                                      <span className="no-print inline-block w-fit rounded-full bg-green-900/40 px-2 py-1 text-xs text-green-300">
                                        فعال
                                      </span>
                                    )}
                                    <div className="rounded border border-gray-700 p-1 text-xs text-gray-400">
                                      <div>
                                        {itemIndicator}
                                        {item.individualWarranty.warrantycode || "بدون کد"}
                                      </div>
                                      {item.individualWarranty.startdate &&
                                        item.individualWarranty.expirydate && (
                                          <div className="text-gray-500">
                                            اعتبار:{" "}
                                            {new Date(
                                              item.individualWarranty.startdate
                                            ).toLocaleDateString("fa-IR")}{" "}
                                            تا{" "}
                                            <span
                                              className={
                                                item.individualWarranty.status === "Expired" ||
                                                item.individualWarranty.displayStatus ===
                                                  "Expired" ||
                                                new Date(item.individualWarranty.expirydate) <
                                                  new Date()
                                                  ? "text-red-400"
                                                  : "text-gray-400"
                                              }
                                            >
                                              {new Date(
                                                item.individualWarranty.expirydate
                                              ).toLocaleDateString("fa-IR")}
                                            </span>
                                          </div>
                                        )}
                                    </div>
                                  </div>
                                ) : (
                                  <span className="text-xs text-gray-500">بدون گارانتی</span>
                                )}
                              </td>
                              <td className="no-print p-2 sm:p-4">
                                {item.individualWarranty && item.individualWarranty.warrantycode ? (
                                  <button
                                    type="button"
                                    onClick={() => handleViewWarranty(item)}
                                    className="rounded bg-blue-700 px-2 py-1 text-xs text-white transition-colors hover:bg-blue-600"
                                  >
                                    مشاهده گارانتی
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => handleAddWarranty(item)}
                                    className="rounded bg-green-700 px-2 py-1 text-xs text-white transition-colors hover:bg-green-600"
                                  >
                                    افزودن گارانتی
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={4} className="p-2 text-center sm:p-4">
                            هیچ محصولی در این فاکتور وجود ندارد
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Total Amount */}
              <div className="flex items-center justify-between rounded-lg bg-slate-800 p-3 text-base font-bold sm:p-4 sm:text-lg">
                <span className="text-gray-300">مجموع کل:</span>
                <span className="flex items-center gap-1 text-green-400">
                  <span>
                    {invoice.Invoice_Details && Array.isArray(invoice.Invoice_Details)
                      ? invoice.Invoice_Details.reduce(
                          (sum, product) => sum + product.total_price,
                          0
                        ).toLocaleString("fa")
                      : (invoice.TotalAmount || 0).toLocaleString("fa")}
                  </span>
                  <span>تومان</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="no-print flex justify-between gap-4 border-t border-slate-700 p-3 sm:p-6">
          <PrintButton onPrint={handleInvoicePrint} />
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-lg bg-slate-700 px-4 py-2 text-sm text-gray-100 transition-colors duration-200 hover:bg-slate-600 sm:w-auto sm:px-6 sm:text-base"
          >
            بستن
          </button>
        </div>
      </div>

      {/* Warranty View Modal */}
      {selectedItem && (
        <BranchWarrantyViewModal item={selectedItem} onClose={() => setSelectedItem(null)} />
      )}

      {/* Warranty Management Modal for adding new warranties */}
      {addWarrantyItem && (
        <BranchWarrantyManagementModal
          item={addWarrantyItem}
          invoiceId={invoice.Invoiceid}
          onClose={() => setAddWarrantyItem(null)}
          onSuccess={handleWarrantyUpdated}
        />
      )}

      {/* Add styles for product grouping */}
      <style jsx>{`
        /* Clean group styling */
        .first-group-item td {
          border-bottom-width: 0 !important;
          padding-bottom: 8px !important;
        }

        .middle-group-item td {
          border-top-width: 0 !important;
          border-bottom-width: 0 !important;
          padding-top: 8px !important;
          padding-bottom: 8px !important;
        }

        .last-group-item td {
          border-top-width: 0 !important;
          padding-top: 8px !important;
        }

        /* Group row backgrounds */
        tr:nth-child(odd) {
          background-color: #1e293b !important;
        }

        tr:nth-child(even) {
          background-color: #0f172a !important;
        }

        /* Product color indicators */
        .product-color-blue td:first-child {
          border-left: 3px solid #3b82f6 !important;
        }

        .product-color-green td:first-child {
          border-left: 3px solid #10b981 !important;
        }

        .product-color-purple td:first-child {
          border-left: 3px solid #8b5cf6 !important;
        }

        .product-color-orange td:first-child {
          border-left: 3px solid #f59e0b !important;
        }

        .product-color-pink td:first-child {
          border-left: 3px solid #ec4899 !important;
        }

        .product-color-cyan td:first-child {
          border-left: 3px solid #06b6d4 !important;
        }

        .product-color-red td:first-child {
          border-left: 3px solid #ef4444 !important;
        }

        .product-color-lime td:first-child {
          border-left: 3px solid #84cc16 !important;
        }

        /* Badge colors for quantity */
        .bg-color-blue {
          background-color: #3b82f6 !important;
        }

        .bg-color-green {
          background-color: #10b981 !important;
        }

        .bg-color-purple {
          background-color: #8b5cf6 !important;
        }

        .bg-color-orange {
          background-color: #f59e0b !important;
        }

        .bg-color-pink {
          background-color: #ec4899 !important;
        }

        .bg-color-cyan {
          background-color: #06b6d4 !important;
        }

        .bg-color-red {
          background-color: #ef4444 !important;
        }

        .bg-color-lime {
          background-color: #84cc16 !important;
        }

        /* Round corners for first and last items */
        .first-group-item td:first-child {
          border-top-left-radius: 3px;
        }

        .last-group-item td:first-child {
          border-bottom-left-radius: 3px;
        }

        /* Ensure header stays on top */
        thead {
          position: sticky;
          top: 0;
          z-index: 10;
        }

        /* Print-specific styles */
        @media print {
          .no-print {
            display: none !important;
          }

          .print-only {
            display: inline-block !important;
          }

          body {
            background-color: white;
            color: black;
          }

          .bg-slate-900,
          .bg-slate-800,
          .bg-slate-700 {
            background-color: white !important;
            color: black !important;
          }

          .text-gray-100,
          .text-gray-300,
          .text-gray-400 {
            color: #333 !important;
          }

          /* Invoice table specific styles */
          .invoice-table-container {
            max-height: none !important;
            height: auto !important;
            overflow: visible !important;
          }

          /* Remove height limits and overflow restrictions when printing */
          .overflow-auto,
          .overflow-x-auto {
            overflow: visible !important;
            max-height: none !important;
          }

          /* Ensure table rows don't break across pages */
          tr {
            page-break-inside: avoid;
          }

          /* Ensure proper spacing between table rows in print */
          td,
          th {
            padding: 8px !important;
          }
        }

        /* Add class to hide logo in normal view */
        .print-only {
          display: none;
        }
      `}</style>
    </div>
  );
};

// Function to get color index for product ID
const getProductColorIndex = (productId: string | number): number => {
  // Ensure productId is a string
  const productIdStr = String(productId);

  // Extract numbers from the productId if possible
  const numbers = productIdStr.match(/\d+/g);
  let numValue = 0;

  if (numbers && numbers.length > 0) {
    // Use the first number found in the ID
    numValue = parseInt(numbers[0], 10);
  } else {
    // If no numbers, use the sum of char codes
    numValue = productIdStr.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  }

  // Return color index (0-7)
  return numValue % 8;
};

// Function to deterministically assign a color class based on product ID
const getProductColor = (productId: string | number): string => {
  const colorIndex = getProductColorIndex(productId);
  return `bg-color-${getColorNameByIndex(colorIndex)}`;
};

// Get color name by index
const getColorNameByIndex = (index: number): string => {
  const colorNames = ["blue", "green", "purple", "orange", "pink", "cyan", "red", "lime"];

  return colorNames[index];
};

export default BranchInvoiceDetailsModal;
