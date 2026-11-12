import type { ProductSpecs } from "@prisma/client";
import { cacheLife, cacheTag } from "next/cache";

import { prisma } from "@/lib/prisma";

import { TAGS } from "./tags";

export interface ProductSpecsResult {
  data: ProductSpecs[];
}

// /api/products/getProductSpecsByProductId
async function queryProductSpecsByProductId(productId: number): Promise<ProductSpecsResult> {
  const specs = await prisma.productSpecs.findMany({
    where: { ProductId: productId },
  });

  return { data: specs };
}

export async function getProductSpecsByProductId(productId: number): Promise<ProductSpecsResult> {
  "use cache";
  cacheTag(TAGS.productSpecs);
  cacheLife("minutes");

  return queryProductSpecsByProductId(productId);
}
