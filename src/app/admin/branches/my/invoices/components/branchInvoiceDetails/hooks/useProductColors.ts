"use client";

import { useMemo } from "react";

// Color utilities
const colorNames = ["blue", "green", "purple", "orange", "pink", "cyan", "red", "lime"];

const productBadgeColors: Record<string, string> = {
  blue: "bg-blue-500",
  green: "bg-emerald-500",
  purple: "bg-violet-500",
  orange: "bg-amber-500",
  pink: "bg-pink-500",
  cyan: "bg-cyan-500",
  red: "bg-red-500",
  lime: "bg-lime-500",
};

const productBorderColors: Record<string, string> = {
  blue: "[&>td:first-child]:!border-l-[3px] [&>td:first-child]:!border-blue-500",
  green: "[&>td:first-child]:!border-l-[3px] [&>td:first-child]:!border-emerald-500",
  purple: "[&>td:first-child]:!border-l-[3px] [&>td:first-child]:!border-violet-500",
  orange: "[&>td:first-child]:!border-l-[3px] [&>td:first-child]:!border-amber-500",
  pink: "[&>td:first-child]:!border-l-[3px] [&>td:first-child]:!border-pink-500",
  cyan: "[&>td:first-child]:!border-l-[3px] [&>td:first-child]:!border-cyan-500",
  red: "[&>td:first-child]:!border-l-[3px] [&>td:first-child]:!border-red-500",
  lime: "[&>td:first-child]:!border-l-[3px] [&>td:first-child]:!border-lime-500",
};

function getProductColorIndex(productId: string | number): number {
  const productIdStr = String(productId);
  const numbers = productIdStr.match(/\d+/g);
  let numValue = 0;

  if (numbers && numbers.length > 0) {
    numValue = parseInt(numbers[0], 10);
  } else {
    numValue = productIdStr.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  }

  return numValue % 8;
}

function getColorNameByIndex(index: number): string {
  return colorNames[index];
}

export function useProductColors() {
  const getProductColor = useMemo(
    () =>
      (productId: string | number): string => {
        const colorIndex = getProductColorIndex(productId);
        return productBadgeColors[getColorNameByIndex(colorIndex)] ?? "bg-blue-500";
      },
    []
  );

  const getProductBorderColor = useMemo(
    () =>
      (productId: string | number): string => {
        const colorIndex = getProductColorIndex(productId);
        return productBorderColors[getColorNameByIndex(colorIndex)] ?? productBorderColors.blue;
      },
    []
  );

  const getProductColorIndexFn = useMemo(() => getProductColorIndex, []);

  return { getProductColor, getProductBorderColor, getProductColorIndex: getProductColorIndexFn };
}
