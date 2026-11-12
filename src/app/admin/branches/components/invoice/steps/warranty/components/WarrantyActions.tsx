"use client";

import { Button, Space } from "antd";
import React from "react";

import { useWarrantyProducts } from "../hooks/useWarrantyProducts";
import { useWarrantyStep } from "../WarrantyStepContext";

export function WarrantyActions() {
  const { state, actions } = useWarrantyStep();
  const { generateWarranties } = useWarrantyProducts();

  const handleRegenerate = () => {
    actions.setProductsWithWarranty([]);
    generateWarranties();
  };

  return (
    <div className="mt-4 flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-400">
          {state.productsWithWarranty.length} مورد گارانتی تنظیم شده
        </p>
      </div>
      <Space size="middle">
        <Button
          type="default"
          size="small"
          onClick={handleRegenerate}
          disabled={state.isGeneratingCodes}
        >
          بازسازی کدهای گارانتی
        </Button>
      </Space>
    </div>
  );
}
