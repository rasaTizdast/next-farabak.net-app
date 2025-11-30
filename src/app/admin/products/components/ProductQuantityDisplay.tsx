"use client";

import { Tooltip } from "antd";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo } from "react";

type QuantityDisplayProps = {
  warehouseCount: number;
  branchCount: number;
  productId: number;
  Available: boolean;
  isLoading?: boolean;
  onHover?: () => void;
};

type QuantityTooltipProps = {
  total: number;
  warehouseCount: number;
  branchCount: number;
  productId: number;
  router: ReturnType<typeof useRouter>;
};

function QuantityTooltip({ total, warehouseCount, branchCount, productId }: QuantityTooltipProps) {
  return (
    <div className="space-y-2 px-1">
      <div className="flex items-center justify-between gap-4">
        <span className="text-gray-300">کل موجودی:</span>
        <span className="font-medium text-white">{total}</span>
      </div>
      <div className="flex items-center gap-4">
        <Link
          href={`/admin/warehouses?productId=${productId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="min-w-0 p-0 text-xs text-emerald-500 hover:text-emerald-400"
          style={{ background: "none", border: "none", cursor: "pointer" }}
        >
          انبارها: {warehouseCount}
        </Link>
        <Link
          href={`/admin/branches?productId=${productId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="min-w-0 p-0 text-xs text-blue-500 hover:text-blue-400"
          style={{ background: "none", border: "none", cursor: "pointer" }}
        >
          شعبه‌ها: {branchCount}
        </Link>
      </div>
    </div>
  );
}

export default function ProductQuantityDisplay({
  warehouseCount,
  branchCount,
  productId,
  Available,
  isLoading,
  onHover,
}: QuantityDisplayProps) {
  const router = useRouter();
  const total = useMemo(() => warehouseCount + branchCount, [warehouseCount, branchCount]);

  return (
    <Tooltip
      title={
        isLoading ? (
          <div className="px-1">
            <span className="text-gray-300">در حال بارگذاری...</span>
          </div>
        ) : (
          <QuantityTooltip
            total={total}
            warehouseCount={warehouseCount}
            branchCount={branchCount}
            productId={productId}
            router={router}
          />
        )
      }
      overlayClassName="product-quantity-tooltip"
      onOpenChange={(visible) => {
        if (visible && onHover) {
          onHover();
        }
      }}
    >
      <span
        className={`cursor-pointer rounded-lg px-3 py-1 text-xs ${
          Available ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
        }`}
      >
        {Available ? "موجود" : "ناموجود"}
      </span>
    </Tooltip>
  );
}
