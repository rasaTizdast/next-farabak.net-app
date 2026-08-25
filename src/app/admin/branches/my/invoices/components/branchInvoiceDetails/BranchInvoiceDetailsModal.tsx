"use client";

import { message } from "antd";
import React from "react";

import { AdminInvoice } from "@/app/admin/invoices/type";

import {
  BranchInvoiceDetailsProvider,
  useBranchInvoiceDetails,
} from "./BranchInvoiceDetailsContext";
import BranchWarrantyManagementModal from "../BranchWarrantyManagementModal";
import BranchWarrantyViewModal from "../BranchWarrantyViewModal";
import { CustomerDetails } from "./components/CustomerDetails";
import { InvoiceActions } from "./components/InvoiceActions";
import { InvoiceHeader } from "./components/InvoiceHeader";
import { ProductsTable } from "./components/ProductsTable";
import { TotalAmount } from "./components/TotalAmount";
import { useInvoicePrint } from "./hooks/useInvoicePrint";

/**
 * Rendered INSIDE BranchInvoiceDetailsProvider so it can consume the context.
 * Owns the print refs which are attached to the printable markup below.
 */
function BranchInvoiceDetailsInner({ invoice }: { invoice: AdminInvoice }) {
  const { state, actions } = useBranchInvoiceDetails();
  const { componentRef, tableContainerRef, handleInvoicePrint } = useInvoicePrint(
    invoice.FactorGuid
  );

  const handleWarrantyUpdated = async () => {
    actions.setAddWarrantyItem(null);
    message.success("گارانتی با موفقیت اضافه شد");

    try {
      const res = await fetch(`/api/admin/invoices/${invoice.Invoiceid}`);
      if (res.ok) {
        const response = await res.json();
        if (response && response.invoice && response.invoice.Invoice_Details) {
          actions.setInvoice(response.invoice);
          actions.incrementRefreshCounter();
        }
      }
    } catch (error) {
      console.error("Error refreshing invoice data:", error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-2 backdrop-blur-sm sm:p-4">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-lg bg-slate-900">
        <div ref={componentRef} className="p-3 sm:p-6">
          <div className="text-gray-100">
            <InvoiceHeader />
            <div className="space-y-4 sm:space-y-6" dir="rtl">
              <CustomerDetails />
              <ProductsTable tableContainerRef={tableContainerRef} />
              <TotalAmount />
            </div>
          </div>
        </div>
        <InvoiceActions onPrint={handleInvoicePrint} />

        {state.selectedItem && (
          <BranchWarrantyViewModal
            item={state.selectedItem}
            onClose={() => actions.setSelectedItem(null)}
          />
        )}

        {state.addWarrantyItem && (
          <BranchWarrantyManagementModal
            item={state.addWarrantyItem}
            invoiceId={invoice.Invoiceid}
            onClose={() => actions.setAddWarrantyItem(null)}
            onSuccess={handleWarrantyUpdated}
          />
        )}
      </div>
    </div>
  );
}

export const BranchInvoiceDetailsModal = {
  Provider: BranchInvoiceDetailsProvider,
  Header: InvoiceHeader,
  CustomerDetails,
  ProductsTable,
  TotalAmount,
  Actions: InvoiceActions,
  Inner: BranchInvoiceDetailsInner,
};

export default function BranchInvoiceDetailsModalWrapper(props: {
  invoice: AdminInvoice;
  onClose: () => void;
}) {
  return (
    <BranchInvoiceDetailsProvider initialInvoice={props.invoice} onClose={props.onClose}>
      <BranchInvoiceDetailsModal.Inner invoice={props.invoice} />
    </BranchInvoiceDetailsProvider>
  );
}
