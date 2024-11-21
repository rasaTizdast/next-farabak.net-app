"use client";
import React, { createContext, useState, ReactNode, useContext } from "react";

// Define types for the product and invoice state
interface Product {
  name: string;
  amount: number;
}

interface InvoiceState {
  products: Product[];
  totalItems: number;
}

// Define the shape of the context value
interface InvoiceContextType {
  invoice: InvoiceState;
  addProductToInvoice: (productName: string, amount: number) => void;
  removeProductFromInvoice: (productName: string) => void;
  updateProductQuantity: (productName: string, newAmount: number) => void;
  getProductQuantity: (productName: string) => number;
  clearInvoice: () => void;
}

// Create the context with an initial value of `null`
export const InvoiceContext = createContext<InvoiceContextType | undefined>(
  undefined
);

// Define the props for the provider component
interface InvoiceProviderProps {
  children: ReactNode;
}

// Create the provider component
export const InvoiceProvider: React.FC<InvoiceProviderProps> = ({
  children,
}) => {
  const [invoice, setInvoice] = useState<InvoiceState>({
    products: [],
    totalItems: 0,
  });

  const addProductToInvoice = (productName: string, amount: number) => {
    setInvoice((prev) => {
      const existingProduct = prev.products.find((p) => p.name === productName);

      const updatedProducts = existingProduct
        ? prev.products.map((p) =>
            p.name === productName ? { ...p, amount: p.amount + amount } : p
          )
        : [...prev.products, { name: productName, amount }];

      return {
        ...prev,
        products: updatedProducts,
        totalItems: updatedProducts.reduce(
          (sum, product) => sum + product.amount,
          0
        ),
      };
    });
  };

  const removeProductFromInvoice = (productName: string) => {
    setInvoice((prev) => {
      const updatedProducts = prev.products.filter(
        (p) => p.name !== productName
      );
      return {
        ...prev,
        products: updatedProducts,
        totalItems: updatedProducts.reduce(
          (sum, product) => sum + product.amount,
          0
        ),
      };
    });
  };

  const updateProductQuantity = (productName: string, newAmount: number) => {
    setInvoice((prev) => {
      const updatedProducts = prev.products.map((p) =>
        p.name === productName ? { ...p, amount: newAmount } : p
      );
      return {
        ...prev,
        products: updatedProducts,
        totalItems: updatedProducts.reduce(
          (sum, product) => sum + product.amount,
          0
        ),
      };
    });
  };

  const getProductQuantity = (productName: string): number => {
    const product = invoice.products.find((p) => p.name === productName);
    return product ? product.amount : 0;
  };

  const clearInvoice = () => {
    setInvoice({
      products: [],
      totalItems: 0,
    });
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
