"use client";

import Image from "next/image";
import { useState, useEffect } from "react";

import PrintButton from "@/app/components/ui/PrintButton";
import { usePrint } from "@/app/utils/usePrint";

import { ExpandedInvoiceItem } from "./types";
import WarrantyManagementModal from "./WarrantyManagementModal";
import { AdminInvoice } from "../../type";

const currencyFormatter = new Intl.NumberFormat("fa-IR");
const dateFormatter = new Intl.DateTimeFormat("fa-IR", { timeZone: "Asia/Tehran" });

function formatDateTime(isoString: string) {
  const date = new Date(isoString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");

  return `${year}/${month}/${day} | ${hours}:${minutes}:${seconds}`;
}

type Props = {
  invoice: AdminInvoice | null;
  onClose: () => void;
  onWarrantyUpdate?: () => Promise<void>;
};

const AdminInvoiceDetailsModal = ({ invoice, onClose, onWarrantyUpdate }: Props) => {
  const [productNames, setProductNames] = useState<{ [key: string]: string }>({});
  const [selectedItem, setSelectedItem] = useState<ExpandedInvoiceItem | null>(null);
  const [refreshCounter, setRefreshCounter] = useState(0);
  const [nowTimestamp] = useState(() => Date.now());

  const { componentRef, handlePrint } = usePrint();

  // Fetch product names when invoice or refreshCounter changes
  useEffect(() => {
    const fetchProductNames = async () => {
      setProductNames({});
      if (!invoice?.Invoice_Details || !Array.isArray(invoice.Invoice_Details)) {
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
  }, [invoice, refreshCounter, setProductNames]);

  const expandedItems = (() => {
    if (!invoice?.Invoice_Details || !Array.isArray(invoice.Invoice_Details)) return [];

    const items: ExpandedInvoiceItem[] = [];
    invoice.Invoice_Details.forEach((product) => {
      const warrantyCodes = product.warranty?.warrantycodes || [];
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
          Name: productNames[product.ProductId],
        });
        return;
      }
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
          Name: productNames[product.ProductId],
        });
      }
    });
    return items;
  })();

  if (!invoice) return null;

  const handleWarrantyUpdated = () => {
    setRefreshCounter((prev) => prev + 1);
    if (onWarrantyUpdate) {
      onWarrantyUpdate();
    }
  };

  // Function to handle opening the warranty modal
  const handleManageWarranty = (item: ExpandedInvoiceItem) => {
    setSelectedItem(item);
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
      hideElements: [".print-button", "button"],
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
                className="logo print-only mx-auto mt-4 mb-5 hidden print:inline-block"
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
                    {formatDateTime(invoice.Date)}
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
                  <table className="w-full text-xs whitespace-nowrap sm:text-sm">
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
                        expandedItems.map((item) => {
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
                          let rowClass = "odd:bg-slate-800 even:bg-slate-900";
                          if (sameProductItems.length > 1) {
                            if (currentIndex === 0) {
                              rowClass +=
                                " [&>td]:!border-b-0 [&>td]:!pb-2 [&>td:first-child]:!rounded-tl-[3px]";
                            } else if (currentIndex === sameProductItems.length - 1) {
                              rowClass +=
                                " [&>td]:!border-t-0 [&>td]:!pt-2 [&>td:first-child]:!rounded-bl-[3px]";
                            } else {
                              rowClass += " [&>td]:!border-y-0 [&>td]:!py-2";
                            }
                          }

                          // Add product-specific color class
                          const colorIndex = getProductColorIndex(item.ProductId);
                          rowClass += ` [&>td:first-child]:!border-l-[3px] ${colorBorderByIndex[getColorNameByIndex(colorIndex)]}`;

                          return (
                            <tr key={`${item.ProductId}-${item.itemNumber}`} className={rowClass}>
                              <td className="p-2 sm:p-4">
                                {isFirstOccurrence ? (
                                  <div className="flex items-start gap-2">
                                    <span>
                                      {productNames[item.ProductId] || "در حال بارگذاری..."}
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
                              <td className="p-2 sm:p-4">{currencyFormatter.format(item.price)}</td>
                              <td className="p-2 sm:p-4">
                                {item.individualWarranty ? (
                                  <div className="flex flex-col gap-1">
                                    {item.individualWarranty.status === "Expired" ? (
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
                                        {item.individualWarranty.warrantycode}
                                      </div>
                                      {item.individualWarranty.startdate &&
                                        item.individualWarranty.expirydate && (
                                          <div className="text-gray-500">
                                            اعتبار:{" "}
                                            {dateFormatter.format(
                                              new Date(item.individualWarranty.startdate)
                                            )}{" "}
                                            تا{" "}
                                            <span
                                              className={
                                                new Date(
                                                  item.individualWarranty.expirydate
                                                ).getTime() < nowTimestamp
                                                  ? "text-red-400"
                                                  : "text-gray-400"
                                              }
                                            >
                                              {dateFormatter.format(
                                                new Date(item.individualWarranty.expirydate)
                                              )}
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
                                <button
                                  type="button"
                                  onClick={() => handleManageWarranty(item)}
                                  className="rounded bg-blue-700 px-2 py-1 text-xs text-white transition-colors hover:bg-blue-600"
                                >
                                  {item.individualWarranty ? "ویرایش گارانتی" : "افزودن گارانتی"}
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr className="odd:bg-slate-800 even:bg-slate-900">
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
                      ? currencyFormatter.format(
                          invoice.Invoice_Details.reduce(
                            (sum, product) => sum + product.total_price,
                            0
                          )
                        )
                      : invoice.TotalAmount
                        ? currencyFormatter.format(invoice.TotalAmount)
                        : "0"}
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

      {/* Warranty Management Modal */}
      {selectedItem && (
        <WarrantyManagementModal
          item={selectedItem}
          invoiceId={invoice.Invoiceid}
          onClose={() => setSelectedItem(null)}
          onSuccess={handleWarrantyUpdated}
        />
      )}
    </div>
  );
};

const colorBorderByIndex: Record<string, string> = {
  blue: "[&>td:first-child]:!border-blue-500",
  green: "[&>td:first-child]:!border-emerald-500",
  purple: "[&>td:first-child]:!border-violet-500",
  orange: "[&>td:first-child]:!border-amber-500",
  pink: "[&>td:first-child]:!border-pink-500",
  cyan: "[&>td:first-child]:!border-cyan-500",
  red: "[&>td:first-child]:!border-red-500",
  lime: "[&>td:first-child]:!border-lime-500",
};

const colorBgByIndex: Record<string, string> = {
  blue: "!bg-blue-500",
  green: "!bg-emerald-500",
  purple: "!bg-violet-500",
  orange: "!bg-amber-500",
  pink: "!bg-pink-500",
  cyan: "!bg-cyan-500",
  red: "!bg-red-500",
  lime: "!bg-lime-500",
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
  return colorBgByIndex[getColorNameByIndex(colorIndex)];
};

// Get color name by index
const getColorNameByIndex = (index: number): string => {
  const colorNames = ["blue", "green", "purple", "orange", "pink", "cyan", "red", "lime"];

  return colorNames[index];
};

export default AdminInvoiceDetailsModal;
