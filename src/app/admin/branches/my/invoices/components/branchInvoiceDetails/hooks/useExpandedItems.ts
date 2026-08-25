"use client";

import { useMemo } from "react";

import { useBranchInvoiceDetails } from "../BranchInvoiceDetailsContext";
import { ExpandedInvoiceItem, ExtendedWarranty } from "../types";

export function useExpandedItems() {
  const { state } = useBranchInvoiceDetails();
  const { invoice, productNames, nowTimestamp } = state;

  const expandedItems = useMemo((): ExpandedInvoiceItem[] => {
    if (
      !invoice ||
      !invoice.Invoice_Details ||
      !Array.isArray(invoice.Invoice_Details) ||
      invoice.Invoice_Details.length === 0
    ) {
      return [];
    }

    const items: ExpandedInvoiceItem[] = [];

    invoice.Invoice_Details.forEach((product) => {
      if (!product) return;

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

    return items;
  }, [invoice, productNames, nowTimestamp]);

  const isWarrantyExpired = useMemo(
    () => (warranty: ExtendedWarranty | null) => {
      if (!warranty || !warranty.expirydate) return false;
      return new Date(warranty.expirydate).getTime() < nowTimestamp;
    },
    [nowTimestamp]
  );

  return { expandedItems, isWarrantyExpired, nowTimestamp };
}
