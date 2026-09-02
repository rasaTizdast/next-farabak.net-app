import type { ProductSpecs } from "@prisma/client";

import { prisma } from "@/lib/prisma";

import { cachedQuery } from "./cache";
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

export const getProductSpecsByProductId = cachedQuery(
  "getProductSpecsByProductId",
  queryProductSpecsByProductId,
  {
    revalidate: 60,
    tags: [TAGS.productSpecs],
  }
);
