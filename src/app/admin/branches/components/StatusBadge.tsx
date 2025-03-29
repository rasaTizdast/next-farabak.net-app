import React from 'react';

interface StatusBadgeProps {
  productCount: number;
  totalQuantity: number;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ productCount, totalQuantity }) => {
  return (
    <div
      className={`px-3 py-2 rounded-lg text-center font-medium ${
        productCount > 0
          ? "bg-blue-900/30 text-blue-400 border border-blue-700"
          : "bg-yellow-900/30 text-yellow-400 border border-yellow-700"
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="text-sm whitespace-nowrap">{productCount} نوع محصول</div>
        {productCount > 0 ? (
          <div className="text-xs px-2 py-0.5 rounded-md bg-blue-800/70 text-blue-100 whitespace-nowrap">
            {totalQuantity} عدد
          </div>
        ) : (
          <div className="text-xs px-2 py-0.5 rounded-md bg-yellow-800/70 text-yellow-100 whitespace-nowrap">
            بدون موجودی
          </div>
        )}
      </div>
    </div>
  );
};

export default StatusBadge; 