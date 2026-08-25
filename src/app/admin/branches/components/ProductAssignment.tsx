"use client";

import { FormInstance } from "antd";
import React from "react";

import InvoiceModal from "./invoice/InvoiceModal";
import ProductDrawer from "./ProductDrawer";
import { Branch, Product } from "./types";

interface ProductFormValues {
  productId: number;
  quantity: number;
}

interface ProductAssignmentProps {
  currentBranch: Branch | null;
  drawerVisible: boolean;
  invoiceVisible: boolean;
  products: Product[];
  allProducts: Product[];
  productsLoading: boolean;
  productForm: FormInstance<ProductFormValues>;
  selectedProduct: number | null;
  productQuantityRef: React.MutableRefObject<number>;
  onCloseDrawer: () => void;
  onCloseInvoice: () => void;
  onAddProduct: () => void;
  onUpdateQuantity: (productId: number, quantity: number) => void;
  onRemoveProduct: (productId: number) => void;
  onSelectProduct: (productId: number | null) => void;
  onQuantityChange: (value: number | null) => void;
}

const ProductAssignment: React.FC<ProductAssignmentProps> = ({
  currentBranch,
  drawerVisible,
  invoiceVisible,
  products,
  allProducts,
  productsLoading,
  productForm,
  selectedProduct,
  onCloseDrawer,
  onCloseInvoice,
  onAddProduct,
  onUpdateQuantity,
  onRemoveProduct,
  onSelectProduct,
  onQuantityChange,
}) => {
  if (!currentBranch) return null;

  return (
    <>
      <ProductDrawer
        visible={drawerVisible}
        onClose={onCloseDrawer}
        branch={currentBranch}
        products={products}
        allProducts={allProducts}
        onAddProduct={onAddProduct}
        onUpdateQuantity={onUpdateQuantity}
        onRemoveProduct={onRemoveProduct}
        productForm={productForm}
        loading={productsLoading}
        selectedProduct={selectedProduct}
        onSelectProduct={onSelectProduct}
        onQuantityChange={onQuantityChange}
      />

      <InvoiceModal visible={invoiceVisible} onClose={onCloseInvoice} branch={currentBranch} />
    </>
  );
};

export default ProductAssignment;
