"use client";

import { useState, useCallback } from "react";

import { InvoiceData } from "@/utils/invoiceJwt";

/**
 * Hook for managing invoice cookie operations on the client side
 */
export function useInvoiceCookie() {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Save invoice data to secure cookie via API
   */
  const saveInvoiceToCookie = useCallback(async (invoiceData: Omit<InvoiceData, "timestamp">) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/invoice/save", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(invoiceData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to save invoice data");
      }

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
      setError(errorMessage);
      console.error("Error saving invoice data:", err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Retrieve invoice data from secure cookie via API
   */
  const getInvoiceFromCookie = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/invoice/retrieve", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();

      if (!response.ok) {
        // Return null data but don't throw for 404 - no invoice is a valid state
        if (response.status === 404) {
          return null;
        }
        throw new Error(result.message || "Failed to retrieve invoice data");
      }

      return result.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
      setError(errorMessage);
      console.error("Error retrieving invoice data:", err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Clear invoice data from secure cookie via API
   */
  const clearInvoiceCookie = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/invoice/clear", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to clear invoice data");
      }

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error occurred";
      setError(errorMessage);
      console.error("Error clearing invoice data:", err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    saveInvoiceToCookie,
    getInvoiceFromCookie,
    clearInvoiceCookie,
    isLoading,
    error,
  };
}
