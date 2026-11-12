"use client";

import { useCallback, useEffect, useMemo } from "react";

import { useWarrantyStep, type WarrantyItem } from "../WarrantyStepContext";

export function useWarrantyProducts() {
  const { state, actions, meta: contextMeta } = useWarrantyStep();

  // Calculate duration for display
  const calculateDuration = useCallback(
    (startDate: string | null, endDate: string | null): string | null => {
      if (!startDate || !endDate) return null;

      try {
        const start = new Date(startDate);
        const end = new Date(endDate);

        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
          return "تاریخ نامعتبر";
        }

        if (start >= end) return "تاریخ پایان باید پس از تاریخ شروع باشد";

        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const totalMonths = Math.floor(diffDays / 30);

        if (diffDays < 30) {
          return `${diffDays} روز`;
        } else if (totalMonths < 12) {
          return `${totalMonths} ماه`;
        } else {
          const years = Math.floor(totalMonths / 12);
          const remainingMonths = totalMonths % 12;

          if (remainingMonths === 0) {
            return `${years} سال`;
          } else {
            return `${years} سال و ${remainingMonths} ماه`;
          }
        }
      } catch (error) {
        console.error("Error calculating duration:", error);
        return "خطا در محاسبه مدت گارانتی";
      }
    },
    []
  );

  // Generate warranty codes and update products
  const generateWarranties = useCallback(async () => {
    const { selectedProducts, productsWithWarranty, branch } = state;
    const { generateBatchWarrantyCodes } = contextMeta;
    if (selectedProducts.length === 0) return;

    actions.setGeneratingCodes(true);

    try {
      const branchCode = branch?.location || "HQ";
      const date = new Date();
      const persianYearFormatter = new Intl.DateTimeFormat("fa-IR", { year: "numeric" });
      const persianMonthFormatter = new Intl.DateTimeFormat("fa-IR", { month: "2-digit" });

      const persianYear = persianYearFormatter.format(date);
      const yearStr = persianYear; // persianToEnglishDigits
      const yearNum = yearStr.slice(-3);

      const persianMonth = persianMonthFormatter.format(date);
      const monthNum = persianMonth; // persianToEnglishDigits
      const yearMonth = yearNum + monthNum.padStart(2, "0");

      const currentDate = new Date();
      const startDate = currentDate.toISOString().split("T")[0];
      const oneYearLater = new Date(currentDate);
      oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);
      oneYearLater.setDate(currentDate.getDate());
      const endDate = oneYearLater.toISOString().split("T")[0];

      let totalCodesNeeded = 0;
      const productCodeNeeds: {
        productId: number;
        existingCodes: string[];
        codesNeeded: number;
      }[] = [];

      for (const product of selectedProducts) {
        const items = productsWithWarranty.filter((p) => p.ProductId === product.ProductId);
        const existingCodes = items.flatMap((item) =>
          item.warranty?.warrantycode ? [item.warranty.warrantycode] : []
        );
        const codesNeeded = Math.max(0, product.quantity - existingCodes.length);
        totalCodesNeeded += codesNeeded;
        productCodeNeeds.push({
          productId: product.ProductId,
          existingCodes,
          codesNeeded,
        });
      }

      let allNewCodes: string[] = [];
      if (totalCodesNeeded > 0) {
        allNewCodes = await generateBatchWarrantyCodes(branchCode, yearMonth, totalCodesNeeded);
      }

      const expandedItems: WarrantyItem[] = [];
      let usedCodesCount = 0;

      for (let i = 0; i < productCodeNeeds.length; i++) {
        const product = selectedProducts[i];
        const { existingCodes, codesNeeded } = productCodeNeeds[i];

        const productNewCodes = allNewCodes.slice(usedCodesCount, usedCodesCount + codesNeeded);
        usedCodesCount += codesNeeded;

        let warrantyCodes = [...existingCodes];
        if (codesNeeded > 0) {
          warrantyCodes = [...warrantyCodes, ...productNewCodes];
        } else if (product.quantity < existingCodes.length) {
          warrantyCodes = warrantyCodes.slice(0, product.quantity);
        }

        const items = productsWithWarranty.filter((p) => p.ProductId === product.ProductId);

        for (let j = 0; j < product.quantity; j++) {
          const existingItem = items[j];
          expandedItems.push({
            ...product,
            singleItemId: `${product.ProductId}-${j}`,
            itemIndex: j,
            itemNumber: j + 1,
            warranty: existingItem?.warranty
              ? { ...existingItem.warranty, warrantycode: warrantyCodes[j] || "" }
              : {
                  ProductId: product.ProductId,
                  startdate: startDate,
                  expirydate: endDate,
                  warrantycode: warrantyCodes[j] || "",
                  hasWarranty: true,
                },
          });
        }
      }

      actions.setProductsWithWarranty(expandedItems);
    } catch (error) {
      console.error("Error updating warranty codes:", error);
    } finally {
      actions.setGeneratingCodes(false);
    }
  }, [state, actions, contextMeta]);

  // Trigger generation when products change
  useEffect(() => {
    if (state.selectedProducts.length > 0 && !state.isGeneratingCodes) {
      generateWarranties();
    }
  }, [state.selectedProducts, state.isGeneratingCodes, generateWarranties]);

  // Get grouped products for display
  const groupedProducts = useMemo(() => {
    const groups = new Map<number, WarrantyItem[]>();
    state.productsWithWarranty.forEach((item) => {
      const group = groups.get(item.ProductId) || [];
      group.push(item);
      groups.set(item.ProductId, group);
    });
    return Array.from(groups.entries()).map(([productId, items]) => ({
      productId,
      name: items[0].Name,
      items,
      count: items.length,
    }));
  }, [state.productsWithWarranty]);

  return {
    selectedProducts: state.selectedProducts,
    productsWithWarranty: state.productsWithWarranty,
    groupedProducts,
    isGeneratingCodes: state.isGeneratingCodes,
    calculateDuration,
    setProductsWithWarranty: actions.setProductsWithWarranty,
    generateWarranties,
  };
}
