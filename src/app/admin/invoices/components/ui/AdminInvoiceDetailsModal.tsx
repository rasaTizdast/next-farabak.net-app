import axios from "axios";
import { useEffect, useRef, useState } from "react";
import {
  AdminInvoice,
  InvoiceDetail,
  Warranty,
  WarrantyCode,
} from "../../type";
import WarrantyManagementModal from "./WarrantyManagementModal";

// Define an interface for expanded items with individual warranties
export interface ExpandedInvoiceItem extends InvoiceDetail {
  itemNumber?: number;
  itemIndex?: number;
  individualWarranty?: Warranty | null;
  Name?: string;
}

type Props = {
  invoice: AdminInvoice | null;
  onClose: () => void;
  onWarrantyUpdate?: () => Promise<void>;
};

const AdminInvoiceDetailsModal = ({ invoice, onClose, onWarrantyUpdate }: Props) => {
  const componentRef = useRef<HTMLDivElement>(null);
  const [productNames, setProductNames] = useState<{ [key: string]: string }>(
    {}
  );
  const [expandedItems, setExpandedItems] = useState<ExpandedInvoiceItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<ExpandedInvoiceItem | null>(null);
  const [refreshCounter, setRefreshCounter] = useState(0);

  if (!invoice) return null;

  // Helper function to format the date and time
  const formatDateTime = (isoString: string) => {
    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");

    return `${year}/${month}/${day} | ${hours}:${minutes}:${seconds}`;
  };

  // Refresh invoice data after warranty updates
  const handleWarrantyUpdated = () => {
    setRefreshCounter(prev => prev + 1);
    // Call parent's update function if provided
    if (onWarrantyUpdate) {
      onWarrantyUpdate();
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
        throw new Error("Error fetching product names:");
      }
    };

    fetchProductNames();
  }, [invoice, refreshCounter]); // Add refreshCounter to dependencies

  // Create expanded items list
  useEffect(() => {
    if (!invoice.Invoice_Details || !Array.isArray(invoice.Invoice_Details)) {
      setExpandedItems([]);
      return;
    }

    const items: ExpandedInvoiceItem[] = [];

    invoice.Invoice_Details.forEach((product) => {
      const warrantyCodes = product.warranty?.warrantycodes || [];

      // If no warranty, or only one item, or legacy single warranty code
      if (
        !product.warranty ||
        product.quantity === 1 ||
        !Array.isArray(warrantyCodes) ||
        warrantyCodes.length === 0
      ) {
        items.push({
          ...product,
          itemNumber: 1,
          individualWarranty: product.warranty,
          Name: productNames[product.ProductId]
        });
        return;
      }

      // Create individual items
      for (let i = 0; i < product.quantity; i++) {
        const code = warrantyCodes[i];
        items.push({
          ...product,
          itemNumber: i + 1,
          individualWarranty: code
            ? {
                ...product.warranty!,
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
              }
            : product.warranty,
          Name: productNames[product.ProductId]
        });
      }
    });

    setExpandedItems(items);
  }, [invoice.Invoice_Details, productNames, refreshCounter]); // Add refreshCounter to dependencies

  // Function to handle opening the warranty modal
  const handleManageWarranty = (item: ExpandedInvoiceItem) => {
    setSelectedItem(item);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-slate-900 rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div ref={componentRef} className="p-3 sm:p-6">
          <div className="text-gray-100">
            {/* Header */}
            <div className="mb-4 sm:mb-8">
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
                    {formatDateTime(invoice.Date)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
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
                <div className="overflow-auto max-h-[500px]">
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
                        <th className="p-2 sm:p-4 text-right font-medium text-gray-300">
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
                              ? `عدد ${currentIndex + 1} از ${
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
                                {item.price.toLocaleString("fa")}
                              </td>
                              <td className="p-2 sm:p-4">
                                {item.individualWarranty ? (
                                  <div className="flex flex-col gap-1">
                                    {item.individualWarranty.status ===
                                    "Expired" ? (
                                      <span className="text-xs bg-red-900/40 text-red-300 px-2 py-1 rounded-full inline-block w-fit">
                                        منقضی شده
                                      </span>
                                    ) : (
                                      <span className="text-xs bg-green-900/40 text-green-300 px-2 py-1 rounded-full inline-block w-fit">
                                        فعال
                                      </span>
                                    )}
                                    <div className="text-xs text-gray-400 border border-gray-700 rounded p-1">
                                      <div>
                                        {itemIndicator}
                                        {item.individualWarranty.warrantycode}
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
                              <td className="p-2 sm:p-4">
                                <button
                                  onClick={() => handleManageWarranty(item)}
                                  className="text-xs bg-blue-700 hover:bg-blue-600 text-white px-2 py-1 rounded transition-colors"
                                >
                                  {item.individualWarranty
                                    ? "ویرایش گارانتی"
                                    : "افزودن گارانتی"}
                                </button>
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
                      : invoice.TotalAmount?.toLocaleString("fa") || "0"}
                  </span>
                  <span>تومان</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4 p-3 sm:p-6 border-t border-slate-700">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 sm:px-6 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors duration-200 text-gray-100 text-sm sm:text-base"
          >
            بستن
          </button>
        </div>
      </div>

      {/* Warranty Management Modal */}
      {selectedItem && (
        <WarrantyManagementModal
          item={selectedItem}
          invoiceId={invoice.Invoiceid}
          onClose={() => setSelectedItem(null)}
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

export default AdminInvoiceDetailsModal;
