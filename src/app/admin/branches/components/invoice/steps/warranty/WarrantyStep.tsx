"use client";

import { Card, Spin } from "antd";
import React, { Suspense } from "react";

import { useUser } from "@/context/UserContext";
import { useApiMutation } from "@/hooks/useApiMutation";

import { WarrantyActions } from "./components/WarrantyActions";
import { WarrantyConfigTable } from "./components/WarrantyConfigTable";
import { WarrantyFormModal } from "./components/WarrantyFormModal";
import { WarrantyStepProvider, useWarrantyStep } from "./WarrantyStepContext";
import { Branch } from "../../../types";
import { SelectedProduct, ProductWithWarranty } from "../types";

type WarrantyStepInnerProps = {
  selectedProducts: SelectedProduct[];
  branch: Branch;
  productsWithWarranty: ProductWithWarranty[];
  setProductsWithWarranty: React.Dispatch<React.SetStateAction<ProductWithWarranty[]>>;
};

function WarrantyStepInner({
  selectedProducts,
  branch,
  productsWithWarranty,
}: WarrantyStepInnerProps) {
  const { isBranch } = useUser();
  const { mutate } = useApiMutation<
    { branchCode: string; yearMonth: string; count: number },
    { warrantyCodes: string[] }
  >("post");

  // The generateBatchWarrantyCodes function needs to be provided
  // This would come from the parent component
  const generateBatchWarrantyCodes = React.useCallback(
    async (branchCode: string, yearMonth: string, count: number) => {
      // This will be implemented by the parent via the API
      const data = await mutate("/api/admin/warranty/generate-batch", {
        branchCode,
        yearMonth,
        count,
      });

      if (data && data.warrantyCodes) {
        return data.warrantyCodes;
      }

      // Fallback
      return Array(count)
        .fill(null)
        .map(() => {
          const randomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
          return `${branchCode}-${yearMonth}-${randomCode}`;
        });
    },
    [mutate]
  );

  return (
    <WarrantyStepProvider
      isBranch={isBranch}
      generateBatchWarrantyCodes={generateBatchWarrantyCodes}
    >
      <WarrantyStepContent
        selectedProducts={selectedProducts}
        branch={branch}
        productsWithWarranty={productsWithWarranty}
      />
    </WarrantyStepProvider>
  );
}

function WarrantyStepContent({
  selectedProducts,
  branch,
  productsWithWarranty,
}: {
  selectedProducts: SelectedProduct[];
  branch: Branch;
  productsWithWarranty: ProductWithWarranty[];
}) {
  const { state, actions, meta } = useWarrantyStep();

  // Sync initial props to context
  React.useEffect(() => {
    actions.setSelectedProducts(selectedProducts);
  }, [selectedProducts, actions]);

  React.useEffect(() => {
    actions.setProductsWithWarranty(productsWithWarranty);
  }, [productsWithWarranty, actions]);

  React.useEffect(() => {
    if (branch) {
      actions.setBranch({
        id: String(branch.branchid),
        name: branch.name,
        location: branch.location,
      });
    }
  }, [branch, actions]);

  return (
    <Card className="border-0 bg-gray-900 shadow-md">
      <h3 className="mb-4 text-lg font-medium text-white">تنظیم گارانتی برای محصولات</h3>

      {state.isGeneratingCodes ? (
        <div className="flex items-center justify-center p-8">
          <Spin size="large" />
          <div className="mr-4 text-white">در حال ایجاد کدهای گارانتی برای محصولات...</div>
        </div>
      ) : (
        <>
          <Suspense fallback={<div className="py-8 text-center">در حال بارگذاری...</div>}>
            <WarrantyConfigTable contextValue={{ state, actions, errors: {}, meta }} />
          </Suspense>
          <WarrantyActions />
          <WarrantyFormModal />
        </>
      )}
    </Card>
  );
}

export const WarrantyStep = {
  Provider: WarrantyStepProvider,
  Table: WarrantyConfigTable,
  FormModal: WarrantyFormModal,
  Actions: WarrantyActions,
  Inner: WarrantyStepInner,
};

export default function WarrantyStepWrapper(props: {
  selectedProducts: SelectedProduct[];
  branch: Branch;
  productsWithWarranty: ProductWithWarranty[];
  setProductsWithWarranty: React.Dispatch<React.SetStateAction<ProductWithWarranty[]>>;
}) {
  return <WarrantyStep.Inner {...props} />;
}
