"use client";

import { useMemo } from "react";

import { useInvoiceManagementCore } from "../invoiceManagementContext";

export function useInvoiceFilters() {
  const { state } = useInvoiceManagementCore();

  const searchOptions = useMemo(() => {
    const { searchText, invoices } = state.list;
    if (!searchText.trim()) return [];

    const lowerCaseSearch = searchText.toLowerCase();
    const options: { value: string; label: React.ReactNode }[] = [];

    if (invoices && Array.isArray(invoices) && invoices.length) {
      invoices.forEach((invoice) => {
        if (invoice.FactorGuid.toLowerCase().includes(lowerCaseSearch)) {
          options.push({
            value: invoice.FactorGuid,
            label: (
              <div>
                <span className="font-bold text-blue-500">شماره فاکتور: </span>
                {invoice.FactorGuid}
              </div>
            ),
          });
        }
      });

      invoices.forEach((invoice) => {
        if (invoice.Fullname.toLowerCase().includes(lowerCaseSearch)) {
          options.push({
            value: invoice.Fullname,
            label: (
              <div>
                <span className="font-bold text-green-500">نام مشتری: </span>
                {invoice.Fullname}
              </div>
            ),
          });
        }
      });

      invoices.forEach((invoice) => {
        if (invoice.Phonenumber && invoice.Phonenumber.includes(lowerCaseSearch)) {
          options.push({
            value: invoice.Phonenumber,
            label: (
              <div>
                <span className="font-bold text-purple-500">شماره تماس: </span>
                {invoice.Phonenumber}
              </div>
            ),
          });
        }
      });

      invoices.forEach((invoice) => {
        if (invoice.Invoice_Details && Array.isArray(invoice.Invoice_Details)) {
          invoice.Invoice_Details.forEach((detail) => {
            if (
              detail.warranty &&
              detail.warranty.warrantycode &&
              detail.warranty.warrantycode.toLowerCase().includes(lowerCaseSearch)
            ) {
              options.push({
                value: detail.warranty.warrantycode,
                label: (
                  <div>
                    <span className="font-bold text-yellow-500">کد گارانتی: </span>
                    {detail.warranty.warrantycode}
                    <span className="mr-2">
                      {detail.warranty.status === "Expired" ||
                      detail.warranty.displayStatus === "Expired" ? (
                        <span className="text-red-400">منقضی شده</span>
                      ) : (
                        <span className="text-green-400">فعال</span>
                      )}
                    </span>
                  </div>
                ),
              });
            }
          });
        }
      });
    }

    if (
      state.list.standaloneWarranties &&
      Array.isArray(state.list.standaloneWarranties) &&
      state.list.standaloneWarranties.length
    ) {
      state.list.standaloneWarranties.forEach((warranty) => {
        if (
          warranty.warrantycode &&
          warranty.warrantycode.toLowerCase().includes(lowerCaseSearch)
        ) {
          options.push({
            value: warranty.warrantycode,
            label: (
              <div>
                <span className="font-bold text-orange-500">کد گارانتی مستقل: </span>
                {warranty.warrantycode}
                <span className="mr-2">
                  {warranty.status === "Expired" || warranty.displayStatus === "Expired" ? (
                    <span className="text-red-400">منقضی شده</span>
                  ) : (
                    <span className="text-green-400">فعال</span>
                  )}
                </span>
              </div>
            ),
          });
        }

        if (warranty.Type && warranty.Type.toLowerCase().includes(lowerCaseSearch)) {
          options.push({
            value: warranty.Type,
            label: (
              <div>
                <span className="font-bold text-cyan-500">محصول با گارانتی مستقل: </span>
                {warranty.Type}
              </div>
            ),
          });
        }
      });
    }

    return options;
  }, [state.list.searchText, state.list.invoices, state.list.standaloneWarranties]);

  const filteredInvoices = useMemo(() => {
    const { searchText, invoices } = state.list;
    if (!searchText.trim()) return invoices;

    const lowerCaseSearch = searchText.toLowerCase();

    return invoices.filter(
      (invoice) =>
        invoice.FactorGuid.toLowerCase().includes(lowerCaseSearch) ||
        invoice.Fullname.toLowerCase().includes(lowerCaseSearch) ||
        (invoice.Phonenumber && invoice.Phonenumber.includes(lowerCaseSearch)) ||
        (invoice.Invoice_Details &&
          invoice.Invoice_Details.some(
            (detail) =>
              detail.warranty &&
              detail.warranty.warrantycode &&
              detail.warranty.warrantycode.toLowerCase().includes(lowerCaseSearch)
          ))
    );
  }, [state.list.searchText, state.list.invoices]);

  const filteredStandaloneWarranties = useMemo(() => {
    const { searchText, standaloneWarranties } = state.list;
    if (!searchText.trim()) return standaloneWarranties;

    const lowerCaseSearch = searchText.toLowerCase();

    return standaloneWarranties.filter(
      (warranty) =>
        (warranty.warrantycode && warranty.warrantycode.toLowerCase().includes(lowerCaseSearch)) ||
        (warranty.Type && warranty.Type.toLowerCase().includes(lowerCaseSearch))
    );
  }, [state.list.searchText, state.list.standaloneWarranties]);

  return {
    filteredInvoices,
    filteredStandaloneWarranties,
    searchOptions,
  };
}
