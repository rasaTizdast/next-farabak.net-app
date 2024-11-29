"use client";
import React, { createContext, useState, ReactNode, useContext } from "react";

// Define types for the product and invoice state
interface Product {
  ProductId: number;
  Quantity: number;
  Price?: number;
}

interface InvoiceState {
  products: Product[];
  TotalAmount: number;
}

// Define the shape of the context value
interface InvoiceContextType {
  invoice: InvoiceState;
  addProductToInvoice: (ProductId: number, Quantity: number) => void;
  removeProductFromInvoice: (ProductId: number) => void;
  updateProductQuantity: (ProductId: number, Quantity: number) => void;
  getProductQuantity: (ProductId: number) => number;
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
    TotalAmount: 0,
  });

  const addProductToInvoice = (ProductId: number, Quantity: number) => {
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
        : [...prev.products, { ProductId, Quantity }];

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

  const removeProductFromInvoice = (ProductId: number) => {
    setInvoice((prev) => {
      const updatedProducts = prev.products.filter(
        (p) => p.ProductId !== ProductId
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

  const updateProductQuantity = (ProductId: number, newAmount: number) => {
    setInvoice((prev) => {
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

  const clearInvoice = () => {
    setInvoice({
      products: [],
      TotalAmount: 0,
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
