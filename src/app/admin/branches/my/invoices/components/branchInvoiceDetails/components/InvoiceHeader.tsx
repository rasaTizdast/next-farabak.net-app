"use client";

import Image from "next/image";

import { useBranchInvoiceDetails } from "../BranchInvoiceDetailsContext";

export function InvoiceHeader() {
  const { state } = useBranchInvoiceDetails();
  const { invoice } = state;

  if (!invoice) return null;

  return (
    <div className="mb-4 sm:mb-8">
      <Image
        src="/Farabak_Logo.webp"
        alt="Farabak Logo"
        width={130}
        height={130}
        className="logo mx-auto mt-4 mb-5 hidden items-center justify-center print:flex"
      />
      <h2 className="text-center text-xl font-bold text-white sm:text-2xl">
        جزئیات فاکتور
        <br />
        {invoice.FactorGuid}
      </h2>
    </div>
  );
}
