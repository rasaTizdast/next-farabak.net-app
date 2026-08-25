"use client";

import React, { createContext, useContext, useReducer, useMemo, ReactNode } from "react";

import { SelectedProduct, ProductWithWarranty } from "../types";

// ============================================
// Types
// ============================================

export type Branch = {
  id: string;
  name: string;
  location?: string;
};

export type Product = SelectedProduct;

export type WarrantyItem = ProductWithWarranty;

export type WarrantyStepState = {
  selectedProducts: Product[];
  productsWithWarranty: WarrantyItem[];
  branch: Branch | null;
  isGeneratingCodes: boolean;
  editingProduct: WarrantyItem | null;
  modalVisible: boolean;
  formValues: {
    hasWarranty: boolean;
    startdate: Date | null;
    expirydate: Date | null;
    warrantycode: string;
  };
  durationText: string | null;
  isDatePickerLoading: boolean;
};

export type WarrantyErrors = {
  [key: string]: string;
};

export type WarrantyStepActions = {
  setSelectedProducts: (products: Product[]) => void;
  setProductsWithWarranty: (items: WarrantyItem[]) => void;
  setBranch: (branch: Branch) => void;
  setGeneratingCodes: (generating: boolean) => void;
  setEditingProduct: (product: WarrantyItem | null) => void;
  setModalVisible: (visible: boolean) => void;
  setFormValues: (values: Partial<WarrantyStepState["formValues"]>) => void;
  setDurationText: (text: string | null) => void;
  setDatePickerLoading: (loading: boolean) => void;
  updateWarrantyItem: (singleItemId: string, warranty: Partial<WarrantyItem["warranty"]>) => void;
  resetForm: () => void;
};

export type WarrantyStepMeta = {
  isBranch: boolean;
  generateBatchWarrantyCodes: (
    branchCode: string,
    yearMonth: string,
    count: number
  ) => Promise<string[]>;
};

export type WarrantyStepContextValue = {
  state: WarrantyStepState;
  errors: WarrantyErrors;
  actions: WarrantyStepActions;
  meta: WarrantyStepMeta;
};

// ============================================
// Initial State
// ============================================

const initialState: WarrantyStepState = {
  selectedProducts: [],
  productsWithWarranty: [],
  branch: null,
  isGeneratingCodes: false,
  editingProduct: null,
  modalVisible: false,
  formValues: {
    hasWarranty: true,
    startdate: null,
    expirydate: null,
    warrantycode: "",
  },
  durationText: null,
  isDatePickerLoading: false,
};

// ============================================
// Reducer
// ============================================

type WarrantyStepAction =
  | { type: "SET_SELECTED_PRODUCTS"; products: Product[] }
  | { type: "SET_PRODUCTS_WITH_WARRANTY"; items: WarrantyItem[] }
  | { type: "SET_BRANCH"; branch: Branch }
  | { type: "SET_GENERATING_CODES"; generating: boolean }
  | { type: "SET_EDITING_PRODUCT"; product: WarrantyItem | null }
  | { type: "SET_MODAL_VISIBLE"; visible: boolean }
  | { type: "SET_FORM_VALUES"; values: Partial<WarrantyStepState["formValues"]> }
  | { type: "SET_DURATION_TEXT"; text: string | null }
  | { type: "SET_DATE_PICKER_LOADING"; loading: boolean }
  | {
      type: "UPDATE_WARRANTY_ITEM";
      singleItemId: string;
      warranty: Partial<WarrantyItem["warranty"]>;
    }
  | { type: "RESET_FORM" };

function warrantyStepReducer(
  state: WarrantyStepState,
  action: WarrantyStepAction
): WarrantyStepState {
  switch (action.type) {
    case "SET_SELECTED_PRODUCTS":
      return { ...state, selectedProducts: action.products };
    case "SET_PRODUCTS_WITH_WARRANTY":
      return { ...state, productsWithWarranty: action.items };
    case "SET_BRANCH":
      return { ...state, branch: action.branch };
    case "SET_GENERATING_CODES":
      return { ...state, isGeneratingCodes: action.generating };
    case "SET_EDITING_PRODUCT":
      return { ...state, editingProduct: action.product };
    case "SET_MODAL_VISIBLE":
      return { ...state, modalVisible: action.visible };
    case "SET_FORM_VALUES":
      return { ...state, formValues: { ...state.formValues, ...action.values } };
    case "SET_DURATION_TEXT":
      return { ...state, durationText: action.text };
    case "SET_DATE_PICKER_LOADING":
      return { ...state, isDatePickerLoading: action.loading };
    case "UPDATE_WARRANTY_ITEM":
      return {
        ...state,
        productsWithWarranty: state.productsWithWarranty.map((item) =>
          item.singleItemId === action.singleItemId
            ? { ...item, warranty: { ...item.warranty, ...action.warranty } }
            : item
        ),
      };
    case "RESET_FORM":
      return {
        ...state,
        formValues: {
          hasWarranty: true,
          startdate: null,
          expirydate: null,
          warrantycode: "",
        },
        durationText: null,
      };
    default:
      return state;
  }
}

// ============================================
// Context & Provider
// ============================================

const WarrantyStepContext = createContext<WarrantyStepContextValue | null>(null);

export function WarrantyStepProvider({
  children,
  isBranch,
  generateBatchWarrantyCodes,
}: {
  children: ReactNode;
  isBranch: boolean;
  generateBatchWarrantyCodes: (
    branchCode: string,
    yearMonth: string,
    count: number
  ) => Promise<string[]>;
}) {
  const [state, dispatch] = useReducer(warrantyStepReducer, initialState);

  const actions: WarrantyStepActions = useMemo(
    () => ({
      setSelectedProducts: (products) => dispatch({ type: "SET_SELECTED_PRODUCTS", products }),
      setProductsWithWarranty: (items) => dispatch({ type: "SET_PRODUCTS_WITH_WARRANTY", items }),
      setBranch: (branch) => dispatch({ type: "SET_BRANCH", branch }),
      setGeneratingCodes: (generating) => dispatch({ type: "SET_GENERATING_CODES", generating }),
      setEditingProduct: (product) => dispatch({ type: "SET_EDITING_PRODUCT", product }),
      setModalVisible: (visible) => dispatch({ type: "SET_MODAL_VISIBLE", visible }),
      setFormValues: (values) => dispatch({ type: "SET_FORM_VALUES", values }),
      setDurationText: (text) => dispatch({ type: "SET_DURATION_TEXT", text }),
      setDatePickerLoading: (loading) => dispatch({ type: "SET_DATE_PICKER_LOADING", loading }),
      updateWarrantyItem: (singleItemId, warranty) =>
        dispatch({ type: "UPDATE_WARRANTY_ITEM", singleItemId, warranty }),
      resetForm: () => dispatch({ type: "RESET_FORM" }),
    }),
    []
  );

  const meta: WarrantyStepMeta = useMemo(
    () => ({ isBranch, generateBatchWarrantyCodes }),
    [isBranch, generateBatchWarrantyCodes]
  );

  const contextValue: WarrantyStepContextValue = {
    state,
    errors: {},
    actions,
    meta,
  };

  return (
    <WarrantyStepContext.Provider value={contextValue}>{children}</WarrantyStepContext.Provider>
  );
}

export function useWarrantyStep() {
  const context = useContext(WarrantyStepContext);
  if (!context) {
    throw new Error("useWarrantyStep must be used within a WarrantyStepProvider");
  }
  return context;
}
