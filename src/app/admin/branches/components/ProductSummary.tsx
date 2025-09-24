import React from "react";

import { Product } from "./types";

interface ProductSummaryProps {
  products: Product[] | any;
}

const ProductSummary: React.FC<ProductSummaryProps> = ({ products }) => {
  // Safely check if products is an array before using reduce
  const isValidArray = Array.isArray(products);

  const totalQuantity = isValidArray
    ? products.reduce((total, product) => total + (product.quantity || 0), 0)
    : 0;

  const productCount = isValidArray ? products.length : 0;

  return (
    <div className="mb-6 rounded-lg border border-blue-800/50 bg-blue-900/20 p-4">
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-sm text-gray-400">محصولات</span>
          <span className="text-lg font-medium text-white">{productCount} نوع محصول</span>
        </div>

        <div className="flex flex-col">
          <span className="text-sm text-gray-400">مجموع موجودی</span>
          <span className="text-lg font-medium text-white">{totalQuantity} عدد</span>
        </div>
      </div>
    </div>
  );
};

export default ProductSummary;
