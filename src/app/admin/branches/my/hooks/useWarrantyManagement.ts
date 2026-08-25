"use client";

import { useState } from "react";

export function useWarrantyManagement() {
  const [activeTab, setActiveTab] = useState("products");

  const handleTabChange = (newActiveTab: string, fetchInvoices: () => Promise<void>) => {
    setActiveTab(newActiveTab);
    if (newActiveTab === "invoices") {
      fetchInvoices();
    }
  };

  return {
    activeTab,
    setActiveTab,
    handleTabChange,
  };
}
