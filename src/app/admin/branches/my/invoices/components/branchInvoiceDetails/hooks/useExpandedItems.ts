"use client";

import { useMemo } from "react";

import { AdminInvoice, InvoiceDetail, WarrantyCode } from "@/app/admin/invoices/type";

import { useBranchInvoiceDetails } from "../BranchInvoiceDetailsContext";
import { ExpandedInvoiceItem, ExtendedWarranty } from "../types";

type WarrantyCodeValue = string | WarrantyCode;

export function expandInvoiceItems(
  invoice: AdminInvoice | null,
  productNames: Record<string, string>
): ExpandedInvoiceItem[] {
  if (!invoice?.Invoice_Details || !Array.isArray(invoice.Invoice_Details)) return [];

  const items: ExpandedInvoiceItem[] = [];
  invoice.Invoice_Details.forEach((product: InvoiceDetail) => {
    if (!product) return;

    const quantity = Math.max(1, Math.floor(product.quantity || 1));
    const warranty = product.warranty;
    const warrantyCodes: WarrantyCodeValue[] = Array.isArray(warranty?.warrantycodes)
      ? warranty.warrantycodes
      : warranty?.warrantycode
        ? [warranty.warrantycode]
        : [];

    for (let index = 0; index < quantity; index++) {
      const code = warrantyCodes[index];
      const individualWarranty: ExtendedWarranty | null =
        code && warranty
          ? {
              ...warranty,
              warrantycode: typeof code === "string" ? code : code.code,
              startdate:
                typeof code === "string"
                  ? warranty.startdate
                  : code.startdate || warranty.startdate,
              expirydate:
                typeof code === "string"
                  ? warranty.expirydate
                  : code.expirydate || warranty.expirydate,
              status:
                typeof code === "string"
                  ? warranty.status
                  : code.status || warranty.status || "Active",
              hasWarranty: true,
              branchid: warranty.branchid,
            }
          : null;

      items.push({
        ...product,
        itemNumber: index + 1,
        individualWarranty,
        Name: productNames[product.ProductId],
      });
    }
  });

  return items;
}

export function useExpandedItems() {
  const { state } = useBranchInvoiceDetails();
  const { invoice, productNames, nowTimestamp } = state;

  const expandedItems = useMemo(
    () => expandInvoiceItems(invoice, productNames),
    [invoice, productNames, nowTimestamp]
  );

  const isWarrantyExpired = useMemo(
    () => (warranty: ExtendedWarranty | null) => {
      if (!warranty || !warranty.expirydate) return false;
      return new Date(warranty.expirydate).getTime() < nowTimestamp;
    },
    [nowTimestamp]
  );

  return { expandedItems, isWarrantyExpired, nowTimestamp };
}
