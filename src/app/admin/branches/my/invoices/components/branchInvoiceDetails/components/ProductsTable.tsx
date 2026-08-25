"use client";

import { useBranchInvoiceDetails } from "../BranchInvoiceDetailsContext";
import { useExpandedItems } from "../hooks/useExpandedItems";
import { useProductColors } from "../hooks/useProductColors";
import { ExpandedInvoiceItem } from "../types";

const currencyFormatter = new Intl.NumberFormat("fa-IR");
const dateFormatter = new Intl.DateTimeFormat("fa-IR", { timeZone: "Asia/Tehran" });

function formatCurrency(amount: number) {
  if (!amount && amount !== 0) return "-";
  try {
    return currencyFormatter.format(amount);
  } catch (e) {
    console.error("Error formatting currency:", e);
    return amount.toString();
  }
}

export function ProductsTable({
  tableContainerRef,
}: {
  tableContainerRef?: React.RefObject<HTMLDivElement | null>;
}) {
  const { state, actions } = useBranchInvoiceDetails();
  const { expandedItems, isWarrantyExpired } = useExpandedItems();
  const { getProductColor, getProductBorderColor } = useProductColors();
  const { invoice } = state;

  const handleViewWarranty = (item: ExpandedInvoiceItem) => {
    actions.setSelectedItem(item);
  };

  const handleAddWarranty = (item: ExpandedInvoiceItem) => {
    actions.setAddWarrantyItem(item);
  };

  if (!invoice) return null;

  return (
    <div className="overflow-x-auto rounded-lg bg-slate-800">
      <div ref={tableContainerRef} className="invoice-table-container max-h-[500px] overflow-auto">
        <table className="w-full text-xs whitespace-nowrap sm:text-sm">
          <thead className="sticky top-0 z-10 bg-slate-700">
            <tr>
              <th className="p-2 text-right font-medium text-gray-300 sm:p-4">نام محصول</th>
              <th className="p-2 text-right font-medium text-gray-300 sm:p-4">قیمت واحد - تومان</th>
              <th className="p-2 text-right font-medium text-gray-300 sm:p-4">گارانتی</th>
              <th className="p-2 text-right font-medium text-gray-300 sm:p-4 print:hidden">
                عملیات
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700 [&>tr:nth-child(even)]:!bg-slate-900 [&>tr:nth-child(odd)]:!bg-slate-800">
            {expandedItems.length > 0 ? (
              expandedItems.map((item) => {
                const sameProductItems = expandedItems.filter(
                  (i) => i.ProductId === item.ProductId
                );

                const currentIndex = sameProductItems.findIndex((i) => i === item);
                const isFirstOccurrence = currentIndex === 0;

                const itemIndicator =
                  sameProductItems.length > 1
                    ? `محصول ${currentIndex + 1} از ${sameProductItems.length}: `
                    : "";

                let rowClass = "hover:bg-slate-750";
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

                rowClass += ` ${getProductBorderColor(item.ProductId)}`;

                return (
                  <tr key={`${item.ProductId}-${item.itemNumber}`} className={rowClass}>
                    <td className="p-2 sm:p-4">
                      {isFirstOccurrence ? (
                        <div className="flex items-start gap-2">
                          <span className="text-white">
                            {item.Name || item.Type || "در حال بارگذاری..."}
                          </span>
                          {sameProductItems.length > 1 && (
                            <span
                              className={`${getProductColor(item.ProductId)} rounded-full px-2 py-0.5 text-xs text-white`}
                            >
                              {sameProductItems.length}×
                            </span>
                          )}
                        </div>
                      ) : null}
                    </td>
                    <td className="p-2 text-white sm:p-4">{formatCurrency(item.price)}</td>
                    <td className="p-2 sm:p-4">
                      {item.individualWarranty && item.individualWarranty.warrantycode ? (
                        <div className="flex flex-col gap-1">
                          {isWarrantyExpired(item.individualWarranty) ? (
                            <span className="inline-block w-fit rounded-full bg-red-900/40 px-2 py-1 text-xs text-red-300 print:hidden">
                              منقضی شده
                            </span>
                          ) : (
                            <span className="inline-block w-fit rounded-full bg-green-900/40 px-2 py-1 text-xs text-green-300 print:hidden">
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
                                  {dateFormatter.format(
                                    new Date(item.individualWarranty.startdate)
                                  )}{" "}
                                  تا{" "}
                                  <span
                                    className={
                                      isWarrantyExpired(item.individualWarranty)
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
                    <td className="p-2 sm:p-4 print:hidden">
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
                <td colSpan={4} className="p-2 text-center text-gray-400 sm:p-4">
                  هیچ محصولی در این فاکتور وجود ندارد
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
