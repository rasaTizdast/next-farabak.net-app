"use client";

import { useCallback } from "react";

import { AdminInvoice } from "@/app/admin/invoices/type";

import { ExpandedInvoiceItem } from "../../../invoices/components/branchInvoiceDetails/types";
import { StandaloneWarranty, useInvoiceManagementCore } from "../invoiceManagementContext";

export function useInvoiceSelection() {
  const { state, dispatch } = useInvoiceManagementCore();
  const { selection } = state;

  const setSelectedInvoice = useCallback(
    (invoice: AdminInvoice | null) => {
      dispatch({ type: "SET_SELECTED_INVOICE", invoice });
    },
    [dispatch]
  );

  const setSelectedStandaloneWarranty = useCallback(
    (warranty: StandaloneWarranty | ExpandedInvoiceItem | null) => {
      // Accepts either a raw standalone warranty (converted here) or an
      // already-expanded item passed through as-is.
      let warrantyItem: ExpandedInvoiceItem | null = null;
      if (warranty) {
        if ("individualWarranty" in warranty || "Invoice_Details" in warranty) {
          warrantyItem = warranty as ExpandedInvoiceItem;
        } else {
          const sw = warranty as StandaloneWarranty;
          warrantyItem = {
            Invoice_Details: String(sw.invoicedetailid || ""),
            ProductId: String(sw.ProductId || ""),
            quantity: sw.quantity || 1,
            price: sw.price || 0,
            total_price: (sw.price || 0) * (sw.quantity || 1),
            Name: sw.Type,
            Type: sw.Type,
            individualWarranty: {
              ...sw,
              warrantyid: String(sw.warrantyid || ""),
              invoicedetailid: String(sw.invoicedetailid || ""),
              ProductId: String(sw.ProductId || ""),
              branchid: String(sw.branchid || ""),
            },
          };
        }
      }
      dispatch({ type: "SET_SELECTED_STANDALONE_WARRANTY", warranty: warrantyItem });
    },
    [dispatch]
  );

  return {
    ...selection,
    setSelectedInvoice,
    setSelectedStandaloneWarranty,
  };
}
