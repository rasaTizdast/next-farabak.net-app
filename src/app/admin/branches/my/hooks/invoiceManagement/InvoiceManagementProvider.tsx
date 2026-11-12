"use client";

import React, { ReactNode, useMemo, useReducer } from "react";

import { useInvoiceActions } from "./hooks/useInvoiceActions";
import { useInvoiceColumns } from "./hooks/useInvoiceColumns";
import { useInvoiceFilters } from "./hooks/useInvoiceFilters";
import { useInvoiceList } from "./hooks/useInvoiceList";
import { useInvoiceSelection } from "./hooks/useInvoiceSelection";
import {
  InvoiceManagementContext,
  InvoiceManagementCoreContext,
  initialInvoiceManagementState,
  invoiceManagementReducer,
  useInvoiceManagementCore,
  type InvoiceManagementActions,
  type InvoiceManagementMeta,
} from "./invoiceManagementContext";

/**
 * Sits inside the core context provider, runs the feature hooks (which read
 * state/dispatch from the core context) and composes them into the public
 * `actions` object.
 */
function InvoiceManagementActionsComposer({ children }: { children: ReactNode }) {
  const { state, meta, dispatch } = useInvoiceManagementCore();

  const list = useInvoiceList();
  const { updateInvoiceStatus } = useInvoiceActions();
  const selection = useInvoiceSelection();
  const filters = useInvoiceFilters();
  const columns = useInvoiceColumns({
    updateInvoiceStatus,
    setSelectedInvoice: selection.setSelectedInvoice,
  });

  const actions: InvoiceManagementActions = useMemo(
    () => ({
      list: { ...list, updateInvoiceStatus },
      selection,
      filters,
      columns,
    }),
    [list, updateInvoiceStatus, selection, filters, columns]
  );

  const contextValue = useMemo(
    () => ({ state, actions, meta, dispatch }),
    [state, actions, meta, dispatch]
  );

  return (
    <InvoiceManagementContext.Provider value={contextValue}>
      {children}
    </InvoiceManagementContext.Provider>
  );
}

export function InvoiceManagementProvider({
  children,
  branchRef,
}: {
  children: ReactNode;
  branchRef: InvoiceManagementMeta["branchRef"];
}) {
  const [state, dispatch] = useReducer(invoiceManagementReducer, initialInvoiceManagementState);

  const meta: InvoiceManagementMeta = useMemo(() => ({ branchRef }), [branchRef]);

  const coreValue = useMemo(() => ({ state, meta, dispatch }), [state, meta, dispatch]);

  return (
    <InvoiceManagementCoreContext.Provider value={coreValue}>
      <InvoiceManagementActionsComposer>{children}</InvoiceManagementActionsComposer>
    </InvoiceManagementCoreContext.Provider>
  );
}
