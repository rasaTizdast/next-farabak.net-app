"use client";
import React, {
  createContext,
  useState,
  ReactNode,
  useContext,
  useEffect,
  useRef,
} from "react";
import { useInvoiceCookie } from "@/hooks/useInvoiceCookie";

// Define types for the product and invoice state
interface Product {
  ProductId: number;
  ProductName: string;
  Quantity: number;
  Price?: number;
  Discount?: number;
}

interface InvoiceState {
  products: Product[];
  TotalAmount: number;
}

// Define the shape of the context value
interface InvoiceContextType {
  invoice: InvoiceState;
  addProductToInvoice: (
    ProductId: number,
    Quantity: number,
    ProductName: string,
    Price?: number,
    Discount?: number
  ) => void;
  removeProductFromInvoice: (ProductId: number) => void;
  updateProductQuantity: (ProductId: number, Quantity: number) => void;
  getProductQuantity: (ProductId: number) => number;
  clearInvoice: () => void;
  isLoading: boolean;
}

// Create the context with an initial value of `null`
export const InvoiceContext = createContext<InvoiceContextType | undefined>(
  undefined
);

// Define the props for the provider component
interface InvoiceProviderProps {
  children: ReactNode;
}

// Debounce time in milliseconds
const DEBOUNCE_DELAY = 2000; // 2 seconds

// Storage key for cross-tab communication
const INVOICE_SYNC_KEY = "invoice_sync_timestamp";
const INVOICE_CLEARED_KEY = "invoice_cleared";

// Create the provider component
export const InvoiceProvider: React.FC<InvoiceProviderProps> = ({
  children,
}) => {
  const [invoice, setInvoice] = useState<InvoiceState>({
    products: [],
    TotalAmount: 0,
  });

  const {
    saveInvoiceToCookie,
    getInvoiceFromCookie,
    clearInvoiceCookie,
    isLoading,
  } = useInvoiceCookie();

  // Debounce timer reference
  const debounceSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Flag to prevent infinite loops when updating
  const isUpdatingRef = useRef<boolean>(false);

  // Load invoice data from cookie when the component mounts
  useEffect(() => {
    const loadInvoiceFromCookie = async () => {
      // Check if invoice was cleared by another tab
      if (
        typeof window !== "undefined" &&
        localStorage.getItem(INVOICE_CLEARED_KEY) === "true"
      ) {
        setInvoice({
          products: [],
          TotalAmount: 0,
        });
        return;
      }

      const savedInvoice = await getInvoiceFromCookie();

      if (savedInvoice) {
        setInvoice({
          products: savedInvoice.products || [],
          TotalAmount: savedInvoice.TotalAmount || 0,
        });
      }
    };

    loadInvoiceFromCookie();
  }, [getInvoiceFromCookie]);

  // Function to save invoice data with debouncing
  const debounceSaveInvoice = (currentInvoice: InvoiceState) => {
    // Clear any existing timer
    if (debounceSaveTimerRef.current) {
      clearTimeout(debounceSaveTimerRef.current);
    }

    // Set a new timer
    debounceSaveTimerRef.current = setTimeout(async () => {
      try {
        if (currentInvoice.products.length > 0) {
          await saveInvoiceToCookie(currentInvoice);

          // Remove cleared flag if it exists
          if (typeof window !== "undefined") {
            localStorage.removeItem(INVOICE_CLEARED_KEY);
          }

          // Trigger cross-tab sync by updating localStorage
          if (typeof window !== "undefined") {
            localStorage.setItem(INVOICE_SYNC_KEY, Date.now().toString());
          }
        } else {
          await clearInvoiceCookie();

          // Set cleared flag for other tabs
          if (typeof window !== "undefined") {
            localStorage.setItem(INVOICE_CLEARED_KEY, "true");
            // Also trigger sync event
            localStorage.setItem(
              INVOICE_SYNC_KEY,
              "cleared:" + Date.now().toString()
            );
          }
        }
      } catch (error) {
        console.error("Error saving invoice to cookie:", error);
      }
    }, DEBOUNCE_DELAY);
  };

  // Save invoice data to cookie whenever it changes (with debouncing)
  useEffect(() => {
    // Skip if this update was triggered by storage event
    if (isUpdatingRef.current) {
      isUpdatingRef.current = false;
      return;
    }

    // Only attempt to save if the invoice has been loaded/modified
    if (invoice.products.length > 0) {
      debounceSaveInvoice(invoice);
    } else if (invoice.products.length === 0 && invoice.TotalAmount === 0) {
      // If invoice is empty, ensure cookie is cleared
      clearInvoiceCookie();

      // Set cleared flag for other tabs
      if (typeof window !== "undefined") {
        localStorage.setItem(INVOICE_CLEARED_KEY, "true");
        localStorage.setItem(
          INVOICE_SYNC_KEY,
          "cleared:" + Date.now().toString()
        );
      }
    }

    // Cleanup function to clear the timeout if the component unmounts
    return () => {
      if (debounceSaveTimerRef.current) {
        clearTimeout(debounceSaveTimerRef.current);
      }
    };
  }, [invoice, saveInvoiceToCookie, clearInvoiceCookie]);

  // Listen for changes from other tabs/windows
  useEffect(() => {
    const syncFromOtherTabs = async (event: StorageEvent) => {
      if (event.key === INVOICE_SYNC_KEY) {
        // Set flag to prevent echo
        isUpdatingRef.current = true;

        // Check if invoice was cleared
        if (
          event.newValue?.startsWith("cleared:") ||
          localStorage.getItem(INVOICE_CLEARED_KEY) === "true"
        ) {
          setInvoice({
            products: [],
            TotalAmount: 0,
          });
          return;
        }

        // Fetch latest invoice data from cookie
        const latestInvoice = await getInvoiceFromCookie();

        if (latestInvoice) {
          setInvoice({
            products: latestInvoice.products || [],
            TotalAmount: latestInvoice.TotalAmount || 0,
          });
        } else {
          // If no invoice data found, set to empty
          setInvoice({
            products: [],
            TotalAmount: 0,
          });
        }
      } else if (
        event.key === INVOICE_CLEARED_KEY &&
        event.newValue === "true"
      ) {
        // Direct response to cleared flag
        isUpdatingRef.current = true;
        setInvoice({
          products: [],
          TotalAmount: 0,
        });
      }
    };

    // Add event listener for storage changes
    if (typeof window !== "undefined") {
      window.addEventListener("storage", syncFromOtherTabs);
    }

    // Cleanup
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("storage", syncFromOtherTabs);
      }
    };
  }, [getInvoiceFromCookie]);

  const addProductToInvoice = (
    ProductId: number,
    Quantity: number,
    ProductName: string,
    Price?: number,
    Discount?: number
  ) => {
    setInvoice((prev) => {
      const existingProduct = prev.products.find(
        (p) => p.ProductId === ProductId
      );

      const updatedProducts = existingProduct
        ? prev.products.map((p) =>
            p.ProductId === ProductId
              ? { ...p, Quantity: p.Quantity + Quantity }
              : p
          )
        : [
            ...prev.products,
            { ProductId, Quantity, ProductName, Price, Discount },
          ];

      return {
        ...prev,
        products: updatedProducts,
        TotalAmount: updatedProducts.reduce(
          (sum, product) => sum + product.Quantity,
          0
        ),
      };
    });

    // Remove cleared flag if it exists when adding products
    if (typeof window !== "undefined") {
      localStorage.removeItem(INVOICE_CLEARED_KEY);
    }
  };

  const removeProductFromInvoice = (ProductId: number) => {
    setInvoice((prev) => {
      const updatedProducts = prev.products.filter(
        (p) => p.ProductId !== ProductId
      );

      const updatedInvoice = {
        ...prev,
        products: updatedProducts,
        TotalAmount: updatedProducts.reduce(
          (sum, product) => sum + product.Quantity,
          0
        ),
      };

      // If removing this product results in an empty invoice, clear the cookie immediately
      if (updatedProducts.length === 0) {
        // Use setTimeout to make this asynchronous and not block the UI
        setTimeout(() => {
          clearInvoiceCookie();
          // Set cleared flag for other tabs
          if (typeof window !== "undefined") {
            localStorage.setItem(INVOICE_CLEARED_KEY, "true");
            localStorage.setItem(
              INVOICE_SYNC_KEY,
              "cleared:" + Date.now().toString()
            );
          }
        }, 0);
      }

      return updatedInvoice;
    });
  };

  const updateProductQuantity = (ProductId: number, newAmount: number) => {
    setInvoice((prev) => {
      // If the new amount is zero or less, remove the product entirely
      if (newAmount <= 0) {
        const updatedProducts = prev.products.filter(
          (p) => p.ProductId !== ProductId
        );

        const updatedInvoice = {
          ...prev,
          products: updatedProducts,
          TotalAmount: updatedProducts.reduce(
            (sum, product) => sum + product.Quantity,
            0
          ),
        };

        // If this was the last product, clear the cookie immediately
        if (updatedProducts.length === 0) {
          setTimeout(() => {
            clearInvoiceCookie();
            // Set cleared flag for other tabs
            if (typeof window !== "undefined") {
              localStorage.setItem(INVOICE_CLEARED_KEY, "true");
              localStorage.setItem(
                INVOICE_SYNC_KEY,
                "cleared:" + Date.now().toString()
              );
            }
          }, 0);
        }

        return updatedInvoice;
      }

      // Otherwise update the quantity
      const updatedProducts = prev.products.map((p) =>
        p.ProductId === ProductId ? { ...p, Quantity: newAmount } : p
      );

      return {
        ...prev,
        products: updatedProducts,
        TotalAmount: updatedProducts.reduce(
          (sum, product) => sum + product.Quantity,
          0
        ),
      };
    });
  };

  const getProductQuantity = (ProductId: number) => {
    const product = invoice.products.find((p) => p.ProductId === ProductId);
    return product ? product.Quantity : 0;
  };

  const clearInvoice = async () => {
    setInvoice({
      products: [],
      TotalAmount: 0,
    });

    // Clear debounce timer when explicitly clearing the invoice
    if (debounceSaveTimerRef.current) {
      clearTimeout(debounceSaveTimerRef.current);
      debounceSaveTimerRef.current = null;
    }

    // Always immediately clear the cookie when explicitly clearing the invoice
    await clearInvoiceCookie();

    // Set cleared flag for other tabs
    if (typeof window !== "undefined") {
      localStorage.setItem(INVOICE_CLEARED_KEY, "true");
      localStorage.setItem(
        INVOICE_SYNC_KEY,
        "cleared:" + Date.now().toString()
      );
    }
  };

  return (
    <InvoiceContext.Provider
      value={{
        invoice,
        addProductToInvoice,
        removeProductFromInvoice,
        updateProductQuantity,
        getProductQuantity,
        clearInvoice,
        isLoading,
      }}
    >
      {children}
    </InvoiceContext.Provider>
  );
};

export const useInvoice = () => {
  const context = useContext(InvoiceContext);
  if (!context) {
    throw new Error("useInvoice must be used within an InvoiceProvider");
  }
  return context;
};
