"use client";

import { message } from "antd";

import { AdminInvoice } from "@/app/admin/invoices/type";
import { useApiMutation } from "@/hooks/useApiMutation";

import { useInvoiceManagementCore } from "../invoiceManagementContext";

export function useInvoiceActions() {
  const { state, dispatch } = useInvoiceManagementCore();
  const { list } = state;

  const { mutate: updateInvoiceStatusMutate } = useApiMutation("patch");

  const updateInvoiceStatus = async (invoice: AdminInvoice, checked: boolean) => {
    const result = await updateInvoiceStatusMutate(`/api/admin/invoices?id=${invoice.Invoiceid}`, {
      checked,
    });
    if (result) {
      const updatedInvoices = list.invoices.map((inv) => {
        if (inv.Invoiceid === invoice.Invoiceid) {
          return { ...inv, Checked: checked };
        }
        return inv;
      });
      dispatch({ type: "SET_INVOICES", invoices: updatedInvoices });
      message.success("وضعیت فاکتور با موفقیت بروزرسانی شد");
    } else {
      message.error("خطا در بروزرسانی وضعیت فاکتور");
    }
  };

  return { updateInvoiceStatus };
}
