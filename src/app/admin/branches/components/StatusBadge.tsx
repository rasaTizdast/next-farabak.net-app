import React from "react";

interface StatusBadgeProps {
  productCount: number;
  totalQuantity: number;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ productCount, totalQuantity }) => {
  return (
    <div
      className={`rounded-lg px-3 py-2 text-center font-medium ${
        productCount > 0
          ? "border border-blue-700 bg-blue-900/30 text-blue-400"
          : "border border-yellow-700 bg-yellow-900/30 text-yellow-400"
      }`}
      style={{ direction: "rtl" }}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="whitespace-nowrap text-sm">{productCount} نوع محصول</div>
        {productCount > 0 ? (
          <div className="whitespace-nowrap rounded-md bg-blue-800/70 px-2 py-0.5 text-xs text-blue-100">
            {totalQuantity} عدد
          </div>
        ) : (
          <div className="whitespace-nowrap rounded-md bg-yellow-800/70 px-2 py-0.5 text-xs text-yellow-100">
            بدون موجودی
          </div>
        )}
      </div>
    </div>
  );
};

export default StatusBadge;
