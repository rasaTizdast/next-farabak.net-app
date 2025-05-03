import React, { useState, useEffect, useRef } from "react";
import {
  AdminInvoice,
  InvoiceDetail,
  Warranty,
} from "@/app/admin/invoices/type";
import moment from "jalali-moment";
import axios from "axios";
import { usePrint } from "@/app/utils/usePrint";
import PrintButton from "@/app/components/ui/PrintButton";
import BranchWarrantyViewModal from "./BranchWarrantyViewModal";
import BranchWarrantyManagementModal from "./BranchWarrantyManagementModal";
import { message } from "antd";

// Extend the Warranty interface to include the hasWarranty property
interface ExtendedWarranty extends Warranty {
  hasWarranty?: boolean;
  branchname?: string;
  branchid?: string;
}

// Define an interface for expanded items with individual warranties
export interface ExpandedInvoiceItem extends InvoiceDetail {
  itemNumber?: number;
  itemIndex?: number;
  individualWarranty?: ExtendedWarranty | null;
  Name?: string; // Add Name field for use in both components
}

interface BranchInvoiceDetailsModalProps {
  invoice: AdminInvoice;
  onClose: () => void;
}

const BranchInvoiceDetailsModal: React.FC<BranchInvoiceDetailsModalProps> = ({
  invoice,
  onClose,
}) => {
  const [productNames, setProductNames] = useState<{ [key: string]: string }>(
    {}
  );
  const [expandedItems, setExpandedItems] = useState<ExpandedInvoiceItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<ExpandedInvoiceItem | null>(
    null
  );
  const [showPrintView, setShowPrintView] = useState(false);
  const [addWarrantyItem, setAddWarrantyItem] =
    useState<ExpandedInvoiceItem | null>(null);
  const [refreshCounter, setRefreshCounter] = useState(0);

  // Use the print hook for printing
  const { componentRef, handlePrint } = usePrint();

  if (!invoice) return null;

  // Ensure invoice structure is valid
  if (!invoice.Invoice_Details) {
    console.warn("Missing Invoice_Details in invoice:", invoice);
  }

  // Helper function to safely check if an item has warranty
  const hasValidWarranty = (item: any) => {
    return (
      item &&
      item.warranty &&
      item.warranty.hasWarranty !== false &&
      item.warranty.warrantycode
    );
  };

  // Convert Western digits to Persian digits
  const toPersianDigits = (text: string) => {
    const persianDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
    return text.replace(/[0-9]/g, (match) => persianDigits[parseInt(match)]);
  };

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
      try {
        if (
          !invoice.Invoice_Details ||
          !Array.isArray(invoice.Invoice_Details)
        ) {
          return;
        }

        // Map over Invoice_Details and make async calls for each product
        const productNameRequests = invoice.Invoice_Details.map(
          async (product) => {
            const res = await axios.get(
              `/api/products/getProductType/${product.ProductId}`
            );
            return { id: product.ProductId, name: res.data.productType };
          }
        );

        // Wait for all promises to resolve
        const results = await Promise.all(productNameRequests);

        // Update state with the resolved product names
        const names = results.reduce((acc, curr) => {
          acc[curr.id] = curr.name;
          return acc;
        }, {} as { [key: string]: string });

        setProductNames(names);
      } catch (error) {
        console.error("Error fetching product names:", error);
      }
    };

    fetchProductNames();
  }, [invoice, refreshCounter]);

  // Create expanded items list
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
      // Handle null or undefined product
      if (!product) {
        console.warn("Encountered null/undefined product in Invoice_Details");
        return;
      }

      // Get product quantity (default to 1 if not specified)
      const quantity = product.quantity || 1;

      // Check for warranty codes array
      let warrantyCodes: (
        | string
        | {
            code: string;
            startdate?: string;
            expirydate?: string;
            status?: string;
          }
      )[] = [];

      // Handle possible warranty data structures
      if (product.warranty) {
        if (Array.isArray(product.warranty.warrantycodes)) {
          warrantyCodes = product.warranty.warrantycodes;
        } else if (product.warranty.warrantycode) {
          // Single warranty code - convert to array format
          warrantyCodes = [product.warranty.warrantycode];
        }
      }

      // If no warranty, or only one item, or legacy single warranty code format
      if (!product.warranty || quantity <= 1 || warrantyCodes.length === 0) {
        // Just add the single item with its warranty
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

      // Create individual items with their own warranty codes
      for (let i = 0; i < quantity; i++) {
        // Get the warranty code for this item (string or object)
        const code = i < warrantyCodes.length ? warrantyCodes[i] : null;

        // Create individual warranty object based on code type
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

        // Add the expanded item
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
    // Close the warranty management modal
    setAddWarrantyItem(null);

    // Show success message
    message.success("گارانتی با موفقیت اضافه شد");

    // Fetch updated invoice data directly instead of just triggering useEffect
    try {
      const response = await axios.get(
        `/api/admin/invoices/${invoice.Invoiceid}`
      );
      if (response.data && response.data.invoice) {
        // Update with fresh data that includes branchid
        const updatedInvoice = response.data.invoice;

        // Update the invoice data
        if (updatedInvoice.Invoice_Details) {
          Object.assign(invoice, updatedInvoice);

          // Increment refresh counter to trigger re-render
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
          const response = await axios.get(
            `/api/admin/invoices/${invoice.Invoiceid}`
          );
          if (response.data && response.data.invoice) {
            // Update with fresh data
            const updatedInvoice = response.data.invoice;

            // Update invoice details with fresh data that includes the branchid
            if (updatedInvoice.Invoice_Details) {
              // The refresh will happen through existing useEffects that depend on invoice
              Object.assign(invoice, updatedInvoice);
            }
          }
        } catch (error) {
          console.error("Error refreshing invoice data:", error);
        }
      };

      fetchUpdatedInvoiceData();
    }
  }, [refreshCounter, invoice.Invoiceid]);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-slate-900 rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div ref={componentRef} className="p-3 sm:p-6">
          <div className="text-gray-100">
            {/* Header */}
            <div className="mb-4 sm:mb-8">
              <img
                src="/Farabak_Logo.webp"
                alt="Farabak Logo"
                width={130}
                height={130}
                className="mx-auto logo print-only flex justify-center items-center mt-4 mb-5"
              />
              <h2 className="text-xl sm:text-2xl font-bold text-center">
                جزئیات فاکتور
                <br />
                {invoice.FactorGuid}
              </h2>
            </div>

            <div className="space-y-4 sm:space-y-6" dir="rtl">
              {/* Customer Details */}
              <div className="space-y-3 sm:space-y-4 bg-slate-800 p-3 sm:p-4 rounded-lg text-sm sm:text-base">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">نام و نام خانوادگی:</span>
                  <span className="font-medium">{invoice.Fullname}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">شماره کاربر:</span>
                  <span className="font-medium">{invoice.Phonenumber}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1">
                  <span className="text-gray-300">تاریخ ثبت فاکتور:</span>
                  <span className="font-medium" dir="ltr">
                    {formatDate(invoice.Date)}
                  </span>
                </div>
                <div className="flex justify-between items-center no-print">
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
              <div className="overflow-x-auto bg-slate-800 rounded-lg">
                <div className="overflow-auto max-h-[500px] invoice-table-container">
                  <table className="w-full text-xs sm:text-sm whitespace-nowrap">
                    <thead className="bg-slate-700 sticky top-0 z-10">
                      <tr>
                        <th className="p-2 sm:p-4 text-right font-medium text-gray-300">
                          نام محصول
                        </th>
                        <th className="p-2 sm:p-4 text-right font-medium text-gray-300">
                          قیمت واحد - تومان
                        </th>
                        <th className="p-2 sm:p-4 text-right font-medium text-gray-300">
                          گارانتی
                        </th>
                        <th className="p-2 sm:p-4 text-right font-medium text-gray-300 no-print">
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
                          const currentIndex = sameProductItems.findIndex(
                            (i) => i === item
                          );

                          // Only show product name and count for first item in group
                          const isFirstOccurrence = currentIndex === 0;

                          // Generate item indicator for warranty
                          const itemIndicator =
                            sameProductItems.length > 1
                              ? `محصول ${currentIndex + 1} از ${
                                  sameProductItems.length
                                }: `
                              : "";

                          // Determine row class based on position in group
                          let rowClass = "hover:bg-slate-750";
                          if (sameProductItems.length > 1) {
                            if (currentIndex === 0) {
                              rowClass += " first-group-item";
                            } else if (
                              currentIndex ===
                              sameProductItems.length - 1
                            ) {
                              rowClass += " last-group-item";
                            } else {
                              rowClass += " middle-group-item";
                            }
                          }

                          // Add product-specific color class
                          const colorIndex = getProductColorIndex(
                            item.ProductId
                          );
                          rowClass += ` product-color-${getColorNameByIndex(
                            colorIndex
                          )}`;

                          return (
                            <tr
                              key={`${item.ProductId}-${
                                item.itemNumber || index
                              }`}
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
                                        )} text-xs text-white px-2 py-0.5 rounded-full`}
                                      >
                                        {sameProductItems.length}×
                                      </span>
                                    )}
                                  </div>
                                ) : null}
                              </td>
                              <td className="p-2 sm:p-4">
                                {formatCurrency(item.price)}
                              </td>
                              <td className="p-2 sm:p-4">
                                {item.individualWarranty &&
                                item.individualWarranty.warrantycode ? (
                                  <div className="flex flex-col gap-1">
                                    {item.individualWarranty.status ===
                                      "Expired" ||
                                    item.individualWarranty.displayStatus ===
                                      "Expired" ||
                                    (item.individualWarranty.expirydate &&
                                      new Date(
                                        item.individualWarranty.expirydate
                                      ) < new Date()) ? (
                                      <span className="text-xs bg-red-900/40 text-red-300 px-2 py-1 rounded-full inline-block w-fit no-print">
                                        منقضی شده
                                      </span>
                                    ) : (
                                      <span className="text-xs bg-green-900/40 text-green-300 px-2 py-1 rounded-full inline-block w-fit no-print">
                                        فعال
                                      </span>
                                    )}
                                    <div className="text-xs text-gray-400 border border-gray-700 rounded p-1">
                                      <div>
                                        {itemIndicator}
                                        {item.individualWarranty.warrantycode ||
                                          "بدون کد"}
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
                                                item.individualWarranty
                                                  .status === "Expired" ||
                                                item.individualWarranty
                                                  .displayStatus ===
                                                  "Expired" ||
                                                new Date(
                                                  item.individualWarranty.expirydate
                                                ) < new Date()
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
                                  <span className="text-xs text-gray-500">
                                    بدون گارانتی
                                  </span>
                                )}
                              </td>
                              <td className="p-2 sm:p-4 no-print">
                                {item.individualWarranty &&
                                item.individualWarranty.warrantycode ? (
                                  <button
                                    onClick={() => handleViewWarranty(item)}
                                    className="text-xs bg-blue-700 hover:bg-blue-600 text-white px-2 py-1 rounded transition-colors"
                                  >
                                    مشاهده گارانتی
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => handleAddWarranty(item)}
                                    className="text-xs bg-green-700 hover:bg-green-600 text-white px-2 py-1 rounded transition-colors"
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
                          <td colSpan={4} className="p-2 sm:p-4 text-center">
                            هیچ محصولی در این فاکتور وجود ندارد
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Total Amount */}
              <div className="flex justify-between items-center text-base sm:text-lg font-bold p-3 sm:p-4 bg-slate-800 rounded-lg">
                <span className="text-gray-300">مجموع کل:</span>
                <span className="text-green-400 flex gap-1 items-center">
                  <span>
                    {invoice.Invoice_Details &&
                    Array.isArray(invoice.Invoice_Details)
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
        <div className="flex justify-between gap-4 p-3 sm:p-6 border-t border-slate-700 no-print">
          <PrintButton onPrint={handleInvoicePrint} />
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 sm:px-6 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors duration-200 text-gray-100 text-sm sm:text-base"
          >
            بستن
          </button>
        </div>
      </div>

      {/* Warranty View Modal */}
      {selectedItem && (
        <BranchWarrantyViewModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
        />
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
    numValue = productIdStr
      .split("")
      .reduce((acc, char) => acc + char.charCodeAt(0), 0);
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
  const colorNames = [
    "blue",
    "green",
    "purple",
    "orange",
    "pink",
    "cyan",
    "red",
    "lime",
  ];

  return colorNames[index];
};

export default BranchInvoiceDetailsModal;
