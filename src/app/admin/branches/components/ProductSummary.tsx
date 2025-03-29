import React from 'react';
import { Product } from './types';

interface ProductSummaryProps {
  products: Product[];
}

const ProductSummary: React.FC<ProductSummaryProps> = ({ products }) => {
  const totalQuantity = products.reduce(
    (total, product) => total + (product.quantity || 0),
    0
  );
  
  return (
    <div className="bg-blue-900/20 mb-6 p-4 rounded-lg border border-blue-800/50">
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-gray-400 text-sm">محصولات</span>
          <span className="text-white text-lg font-medium">
            {products.length} نوع محصول
          </span>
        </div>

        <div className="flex flex-col">
          <span className="text-gray-400 text-sm">مجموع موجودی</span>
          <span className="text-white text-lg font-medium">
            {totalQuantity} عدد
          </span>
        </div>
      </div>
    </div>
  );
};

export default ProductSummary; 