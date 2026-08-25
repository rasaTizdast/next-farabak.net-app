"use client";

import React, { createContext, useContext } from "react";

import { AdminInvoice } from "@/app/admin/invoices/type";

import { ExpandedInvoiceItem } from "../../invoices/components/branchInvoiceDetails/types";

export interface StandaloneWarranty {
  warrantyid: string;
  warrantycode: string;
  status: string;
  startdate: string;
  expirydate: string;
  ProductId: string;
  branchid: string;
  invoicedetailid: string;
  displayStatus?: string;
  Type?: string;
  quantity?: number;
  price?: number;
}

// ============================================
// Types
// ============================================

export type InvoiceListState = {
  invoices: AdminInvoice[];
  standaloneWarranties: StandaloneWarranty[];
  warrantySummary: { active: number; expired: number };
  loading: boolean;
  searchText: string;
  pagination: { current: number; pageSize: number; total: number };
  modalVisible: boolean;
};

export type InvoiceActions = {
  setInvoices: (invoices: AdminInvoice[]) => void;
  setStandaloneWarranties: (warranties: StandaloneWarranty[]) => void;
  setWarrantySummary: (summary: { active: number; expired: number }) => void;
  setLoading: (loading: boolean) => void;
  setSearchText: (text: string) => void;
  setPagination: (pagination: Partial<InvoiceListState["pagination"]>) => void;
  setModalVisible: (visible: boolean) => void;
  fetchInvoices: (page?: number, pageSize?: number) => Promise<void>;
  handleCreateInvoice: () => void;
  handleInvoiceCreationSuccess: () => void;
  updateInvoiceStatus: (invoice: AdminInvoice, checked: boolean) => Promise<void>;
};

export type InvoiceSelection = {
  selectedInvoice: AdminInvoice | null;
  selectedStandaloneWarranty: ExpandedInvoiceItem | null;
  setSelectedInvoice: (invoice: AdminInvoice | null) => void;
  setSelectedStandaloneWarranty: (warranty: ExpandedInvoiceItem | null) => void;
};

export type InvoiceFilters = {
  filteredInvoices: AdminInvoice[];
  filteredStandaloneWarranties: StandaloneWarranty[];
  searchOptions: { value: string; label: React.ReactNode }[];
};

export type InvoiceColumns = {
  memoizedInvoiceColumns: import("@/app/admin/branches/my/hooks/invoiceManagement/hooks/useInvoiceColumns").InvoiceColumn[];
};

export type InvoiceManagementState = {
  list: InvoiceListState;
  selection: InvoiceSelection;
};

export type InvoiceManagementActions = {
  list: InvoiceActions;
  selection: InvoiceSelection;
  filters: InvoiceFilters;
  columns: InvoiceColumns;
};

export type InvoiceManagementMeta = {
  branchRef: React.MutableRefObject<{ branchid: number | string } | null>;
};

export type InvoiceManagementCoreValue = {
  state: InvoiceManagementState;
  meta: InvoiceManagementMeta;
  dispatch: React.Dispatch<InvoiceManagementAction>;
};

export type InvoiceManagementContextValue = {
  state: InvoiceManagementState;
  actions: InvoiceManagementActions;
  meta: InvoiceManagementMeta;
  dispatch: React.Dispatch<InvoiceManagementAction>;
};

// ============================================
// Initial State
// ============================================

const initialListState = {
  invoices: [],
  standaloneWarranties: [],
  warrantySummary: { active: 0, expired: 0 },
  loading: false,
  searchText: "",
  pagination: { current: 1, pageSize: 10, total: 0 },
  modalVisible: false,
};

const initialSelectionState = {
  selectedInvoice: null as AdminInvoice | null,
  selectedStandaloneWarranty: null as ExpandedInvoiceItem | null,
  setSelectedInvoice: (() => {}) as (invoice: AdminInvoice | null) => void,
  setSelectedStandaloneWarranty: (() => {}) as (warranty: ExpandedInvoiceItem | null) => void,
};

export const initialInvoiceManagementState: InvoiceManagementState = {
  list: initialListState,
  selection: initialSelectionState,
};

// ============================================
// Reducer
// ============================================

type InvoiceManagementAction =
  // List actions
  | { type: "SET_INVOICES"; invoices: AdminInvoice[] }
  | { type: "SET_STANDALONE_WARRANTIES"; warranties: StandaloneWarranty[] }
  | { type: "SET_WARRANTY_SUMMARY"; summary: { active: number; expired: number } }
  | { type: "SET_LOADING"; loading: boolean }
  | { type: "SET_SEARCH_TEXT"; text: string }
  | {
      type: "SET_PAGINATION";
      pagination: Partial<{ current: number; pageSize: number; total: number }>;
    }
  | { type: "SET_MODAL_VISIBLE"; visible: boolean }
  // Selection actions
  | { type: "SET_SELECTED_INVOICE"; invoice: AdminInvoice | null }
  | { type: "SET_SELECTED_STANDALONE_WARRANTY"; warranty: ExpandedInvoiceItem | null };

export function invoiceManagementReducer(
  state: InvoiceManagementState,
  action: InvoiceManagementAction
): InvoiceManagementState {
  switch (action.type) {
    case "SET_INVOICES":
      return { ...state, list: { ...state.list, invoices: action.invoices } };
    case "SET_STANDALONE_WARRANTIES":
      return { ...state, list: { ...state.list, standaloneWarranties: action.warranties } };
    case "SET_WARRANTY_SUMMARY":
      return { ...state, list: { ...state.list, warrantySummary: action.summary } };
    case "SET_LOADING":
      return { ...state, list: { ...state.list, loading: action.loading } };
    case "SET_SEARCH_TEXT":
      return { ...state, list: { ...state.list, searchText: action.text } };
    case "SET_PAGINATION":
      return {
        ...state,
        list: { ...state.list, pagination: { ...state.list.pagination, ...action.pagination } },
      };
    case "SET_MODAL_VISIBLE":
      return { ...state, list: { ...state.list, modalVisible: action.visible } };
    case "SET_SELECTED_INVOICE":
      return { ...state, selection: { ...state.selection, selectedInvoice: action.invoice } };
    case "SET_SELECTED_STANDALONE_WARRANTY":
      return {
        ...state,
        selection: { ...state.selection, selectedStandaloneWarranty: action.warranty },
      };
    default:
      return state;
  }
}

// ============================================
// Contexts
// ============================================

/**
 * Core context holds the reducer state + dispatch + meta. It exists so the
 * feature hooks (useInvoiceList, useInvoiceActions, ...) can read state and
 * dispatch actions while the public provider composes them into `actions`.
 */
export const InvoiceManagementCoreContext = createContext<InvoiceManagementCoreValue | null>(null);

export function useInvoiceManagementCore() {
  const context = useContext(InvoiceManagementCoreContext);
  if (!context) {
    throw new Error("useInvoiceManagementCore must be used within an InvoiceManagementProvider");
  }
  return context;
}

export const InvoiceManagementContext = createContext<InvoiceManagementContextValue | null>(null);

export function useInvoiceManagement() {
  const context = useContext(InvoiceManagementContext);
  if (!context) {
    // Return default empty context for backward compatibility
    return {
      state: {
        list: {
          invoices: [],
          standaloneWarranties: [] as StandaloneWarranty[],
          warrantySummary: { active: 0, expired: 0 },
          loading: false,
          searchText: "",
          pagination: { current: 1, pageSize: 10, total: 0 },
          modalVisible: false,
        },
        selection: {
          selectedInvoice: null as AdminInvoice | null,
          selectedStandaloneWarranty: null as ExpandedInvoiceItem | null,
          setSelectedInvoice: () => {},
          setSelectedStandaloneWarranty: () => {},
        },
      },
      actions: {
        list: {
          invoices: [],
          standaloneWarranties: [] as StandaloneWarranty[],
          warrantySummary: { active: 0, expired: 0 },
          loading: false,
          searchText: "",
          pagination: { current: 1, pageSize: 10, total: 0 },
          modalVisible: false,
          fetchInvoices: async () => {},
          handleCreateInvoice: () => {},
          handleInvoiceCreationSuccess: () => {},
          updateInvoiceStatus: async () => {},
          setInvoices: () => {},
          setStandaloneWarranties: () => {},
          setWarrantySummary: () => {},
          setLoading: () => {},
          setSearchText: () => {},
          setPagination: () => {},
          setModalVisible: () => {},
        },
        selection: {
          selectedInvoice: null as AdminInvoice | null,
          selectedStandaloneWarranty: null as ExpandedInvoiceItem | null,
          setSelectedInvoice: () => {},
          setSelectedStandaloneWarranty: () => {},
        },
        filters: {
          filteredInvoices: [],
          filteredStandaloneWarranties: [] as StandaloneWarranty[],
          searchOptions: [],
        },
        columns: { memoizedInvoiceColumns: [] },
      },
      meta: { branchRef: { current: null } },
      dispatch: () => {},
    };
  }
  return context;
}
