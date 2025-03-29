import React from 'react';
import { Drawer } from 'antd';
import { Product, Branch } from './types';
import ProductSummary from './ProductSummary';
import ProductForm from './ProductForm';
import ProductTable from './ProductTable';

interface ProductDrawerProps {
  visible: boolean;
  onClose: () => void;
  branch: Branch | null;
  products: Product[];
  allProducts: Product[];
  productsLoading: boolean;
  form: any;
  selectedProduct: number | null;
  onSelectProduct: (value: number) => void;
  onQuantityChange: (value: number | null) => void;
  onAddProduct: () => void;
  onUpdateQuantity: (productId: number, quantity: number) => void;
  onRemoveProduct: (productId: number) => void;
}

const ProductDrawer: React.FC<ProductDrawerProps> = ({
  visible,
  onClose,
  branch,
  products,
  allProducts,
  productsLoading,
  form,
  selectedProduct,
  onSelectProduct,
  onQuantityChange,
  onAddProduct,
  onUpdateQuantity,
  onRemoveProduct
}) => {
  return (
    <Drawer
      title={`محصولات شعبه: ${branch?.name || ""}`}
      placement="left"
      closable={true}
      onClose={onClose}
      open={visible}
      width={600}
      className="rtl-drawer dark-drawer"
      styles={{
        header: {
          background: "#1f2937",
          color: "#f3f4f6",
          borderBottom: "1px solid #374151",
          padding: "16px 24px",
        },
        body: { background: "#111827", padding: "16px" },
        mask: { background: "rgba(0, 0, 0, 0.7)" },
        wrapper: { boxShadow: "0 0 15px rgba(0, 0, 0, 0.5)" },
        content: { backgroundColor: "#111827" },
        footer: {
          borderTop: "1px solid #374151",
          backgroundColor: "#1f2937",
        },
      }}
    >
      {branch && <ProductSummary products={products} />}

      <ProductForm
        form={form}
        allProducts={allProducts}
        onFinish={onAddProduct}
        onSelectProduct={onSelectProduct}
        onQuantityChange={onQuantityChange}
      />

      <div className="mb-4">
        <h3 className="text-lg font-medium mb-3 text-gray-200">
          لیست محصولات
        </h3>
        <ProductTable
          products={products}
          loading={productsLoading}
          onUpdateQuantity={onUpdateQuantity}
          onRemove={onRemoveProduct}
        />
      </div>
    </Drawer>
  );
};

export default ProductDrawer; 