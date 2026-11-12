"use client";

import { useRef } from "react";

import { usePrint } from "@/app/utils/usePrint";

export function useInvoicePrint(factorGuid?: string) {
  const { componentRef, handlePrint } = usePrint();
  const tableContainerRef = useRef<HTMLDivElement>(null);

  const handleInvoicePrint = () => {
    // Remove height restriction from table container right before printing
    if (tableContainerRef.current) {
      tableContainerRef.current.style.maxHeight = "none";
      tableContainerRef.current.style.overflow = "visible";
    }

    handlePrint({
      printTitle: `فاکتور ${factorGuid || ""}`,
      hideElements: [".print-button", "button"],
      compactMode: true,
    });

    // Reset the styles after print dialog is shown
    setTimeout(() => {
      if (tableContainerRef.current) {
        tableContainerRef.current.style.maxHeight = "500px";
        tableContainerRef.current.style.overflow = "auto";
      }
    }, 1000);
  };

  return { componentRef, tableContainerRef, handleInvoicePrint };
}
