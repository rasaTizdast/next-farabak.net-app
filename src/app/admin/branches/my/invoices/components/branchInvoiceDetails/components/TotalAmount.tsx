"use client";

import { useBranchInvoiceDetails } from "../BranchInvoiceDetailsContext";

const currencyFormatter = new Intl.NumberFormat("fa-IR");

function formatCurrency(amount: number) {
  if (!amount && amount !== 0) return "-";
  try {
    return currencyFormatter.format(amount);
  } catch (e) {
    console.error("Error formatting currency:", e);
    return amount.toString();
  }
}

export function TotalAmount() {
  const { state } = useBranchInvoiceDetails();
  const { invoice } = state;

  if (!invoice) return null;

  const total =
    invoice.Invoice_Details && Array.isArray(invoice.Invoice_Details)
      ? invoice.Invoice_Details.reduce((sum, product) => sum + product.total_price, 0)
      : invoice.TotalAmount || 0;

  return (
    <div className="flex items-center justify-between rounded-lg bg-slate-800 p-3 text-base font-bold sm:p-4 sm:text-lg">
      <span className="text-gray-300">مجموع کل:</span>
      <span className="flex items-center gap-1 text-green-400">
        <span>{formatCurrency(total)}</span>
        <span>تومان</span>
      </span>
    </div>
  );
}
