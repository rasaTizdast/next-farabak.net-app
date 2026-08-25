"use client";

import React, { createContext, useContext, useReducer, useCallback, ReactNode } from "react";

import { AdminInvoice } from "@/app/admin/invoices/type";

import { ExpandedInvoiceItem } from "./types";

// ============================================
// Types
// ============================================

export type BranchInvoiceState = {
  invoice: AdminInvoice | null;
  productNames: Record<string, string>;
  selectedItem: ExpandedInvoiceItem | null;
  addWarrantyItem: ExpandedInvoiceItem | null;
  refreshCounter: number;
  nowTimestamp: number;
  loadingProductNames: boolean;
};

export type BranchInvoiceErrors = {
  [key: string]: string;
};

export type BranchInvoiceActions = {
  setInvoice: (invoice: AdminInvoice) => void;
  setProductNames: (names: Record<string, string>) => void;
  setSelectedItem: (item: ExpandedInvoiceItem | null) => void;
  setAddWarrantyItem: (item: ExpandedInvoiceItem | null) => void;
  incrementRefreshCounter: () => void;
  fetchProductNames: (invoice: AdminInvoice) => Promise<void>;
  refreshInvoice: (invoiceId: string) => Promise<void>;
};

export type BranchInvoiceMeta = {
  onClose: () => void;
};

export type BranchInvoiceContextValue = {
  state: BranchInvoiceState;
  errors: BranchInvoiceErrors;
  actions: BranchInvoiceActions;
  meta: BranchInvoiceMeta;
};

// ============================================
// Initial State
// ============================================

const initialState: BranchInvoiceState = {
  invoice: null,
  productNames: {},
  selectedItem: null,
  addWarrantyItem: null,
  refreshCounter: 0,
  nowTimestamp: Date.now(),
  loadingProductNames: false,
};

// ============================================
// Reducer
// ============================================

type BranchInvoiceAction =
  | { type: "SET_INVOICE"; invoice: AdminInvoice }
  | { type: "SET_PRODUCT_NAMES"; names: Record<string, string> }
  | { type: "SET_SELECTED_ITEM"; item: ExpandedInvoiceItem | null }
  | { type: "SET_ADD_WARRANTY_ITEM"; item: ExpandedInvoiceItem | null }
  | { type: "INCREMENT_REFRESH_COUNTER" }
  | { type: "SET_LOADING_PRODUCT_NAMES"; loading: boolean };

function branchInvoiceReducer(
  state: BranchInvoiceState,
  action: BranchInvoiceAction
): BranchInvoiceState {
  switch (action.type) {
    case "SET_INVOICE":
      return { ...state, invoice: action.invoice };
    case "SET_PRODUCT_NAMES":
      return { ...state, productNames: action.names };
    case "SET_SELECTED_ITEM":
      return { ...state, selectedItem: action.item };
    case "SET_ADD_WARRANTY_ITEM":
      return { ...state, addWarrantyItem: action.item };
    case "INCREMENT_REFRESH_COUNTER":
      return { ...state, refreshCounter: state.refreshCounter + 1 };
    case "SET_LOADING_PRODUCT_NAMES":
      return { ...state, loadingProductNames: action.loading };
    default:
      return state;
  }
}

// ============================================
// Context & Provider
// ============================================

const BranchInvoiceContext = createContext<BranchInvoiceContextValue | null>(null);

export function BranchInvoiceDetailsProvider({
  children,
  initialInvoice,
  onClose,
}: {
  children: ReactNode;
  initialInvoice: AdminInvoice;
  onClose: () => void;
}) {
  const [state, dispatch] = useReducer(branchInvoiceReducer, initialState, () => ({
    ...initialState,
    invoice: initialInvoice,
    nowTimestamp: Date.now(),
  }));

  const fetchProductNames = useCallback(async (invoice: AdminInvoice) => {
    if (!invoice.Invoice_Details || !Array.isArray(invoice.Invoice_Details)) {
      return;
    }

    dispatch({ type: "SET_LOADING_PRODUCT_NAMES", loading: true });

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
      {} as Record<string, string>
    );

    dispatch({ type: "SET_PRODUCT_NAMES", names });
    dispatch({ type: "SET_LOADING_PRODUCT_NAMES", loading: false });
  }, []);

  const refreshInvoice = async (invoiceId: string) => {
    try {
      const res = await fetch(`/api/admin/invoices/${invoiceId}`);
      if (res.ok) {
        const response = await res.json();
        if (response && response.invoice && response.invoice.Invoice_Details) {
          dispatch({ type: "SET_INVOICE", invoice: response.invoice });
          dispatch({ type: "INCREMENT_REFRESH_COUNTER" });
        }
      }
    } catch (error) {
      console.error("Error refreshing invoice data:", error);
    }
  };

  const actions: BranchInvoiceActions = {
    setInvoice: (invoice) => dispatch({ type: "SET_INVOICE", invoice }),
    setProductNames: (names) => dispatch({ type: "SET_PRODUCT_NAMES", names }),
    setSelectedItem: (item) => dispatch({ type: "SET_SELECTED_ITEM", item }),
    setAddWarrantyItem: (item) => dispatch({ type: "SET_ADD_WARRANTY_ITEM", item }),
    incrementRefreshCounter: () => dispatch({ type: "INCREMENT_REFRESH_COUNTER" }),
    fetchProductNames,
    refreshInvoice,
  };

  const meta: BranchInvoiceMeta = { onClose };

  // Initial fetch
  React.useEffect(() => {
    if (initialInvoice) {
      fetchProductNames(initialInvoice);
    }
  }, [initialInvoice, fetchProductNames]);

  const contextValue: BranchInvoiceContextValue = {
    state,
    errors: {},
    actions,
    meta,
  };

  return (
    <BranchInvoiceContext.Provider value={contextValue}>{children}</BranchInvoiceContext.Provider>
  );
}

export function useBranchInvoiceDetails() {
  const context = useContext(BranchInvoiceContext);
  if (!context) {
    throw new Error("useBranchInvoiceDetails must be used within a BranchInvoiceDetailsProvider");
  }
  return context;
}
