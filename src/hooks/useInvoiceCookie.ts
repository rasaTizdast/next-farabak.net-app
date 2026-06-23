"use client";

import { useState } from "react";

import { InvoiceData } from "@/utils/invoiceJwt";

async function apiFetch<T>(url: string, options?: RequestInit): Promise<T | null> {
  try {
    const response = await fetch(url, options);
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.message || "Request failed");
    }
    return result;
  } catch (err) {
    console.error(`API error (${url}):`, err);
    return null;
  }
}

async function apiFetchData<T>(url: string): Promise<T | null> {
  try {
    const response = await fetch(url);
    const result = await response.json();
    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error(result.message || "Request failed");
    }
    return result.data;
  } catch (err) {
    console.error(`API error (${url}):`, err);
    return null;
  }
}

export function useInvoiceCookie() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const saveInvoiceToCookie = async (invoiceData: Omit<InvoiceData, "timestamp">) => {
    setIsLoading(true);
    setError(null);
    const result = await apiFetch("/api/invoice/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(invoiceData),
    });
    if (!result) setError("Failed to save invoice data");
    setIsLoading(false);
    return result;
  };

  const getInvoiceFromCookie = async () => {
    setIsLoading(true);
    setError(null);
    const result = await apiFetchData<InvoiceData>("/api/invoice/retrieve");
    if (!result) setError("Failed to retrieve invoice data");
    setIsLoading(false);
    return result;
  };

  const clearInvoiceCookie = async () => {
    setIsLoading(true);
    setError(null);
    const result = await apiFetch("/api/invoice/clear", { method: "POST" });
    if (!result) setError("Failed to clear invoice data");
    setIsLoading(false);
    return result;
  };

  return { saveInvoiceToCookie, getInvoiceFromCookie, clearInvoiceCookie, isLoading, error };
}
