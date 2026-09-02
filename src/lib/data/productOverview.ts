import type { ProductOverview } from "@prisma/client";

import { prisma } from "@/lib/prisma";

import { cachedQuery } from "./cache";
import { TAGS } from "./tags";

// ---------------------------------------------------------------------------
// /api/productOverview/getProductOverview/:productId
// ---------------------------------------------------------------------------

async function queryProductOverview(productId: number): Promise<ProductOverview | null> {
  const result = await prisma.productOverview.findFirst({
    where: { ProductId: productId },
  });

  return result;
}

export const getProductOverview = cachedQuery("getProductOverview", queryProductOverview, {
  revalidate: 60,
  tags: [TAGS.productOverview],
});

// ---------------------------------------------------------------------------
// /api/productOverviewDetails/getProductOverviewDetails/:productId
// ---------------------------------------------------------------------------

export interface ProductOverviewDetailItem {
  ProductOverviewDetailsId: number | null;
  Title: string | null;
  Description: string | null;
  Img: string | null;
  ProductName: string | null;
}

async function queryProductOverviewDetails(
  productId: number
): Promise<ProductOverviewDetailItem[]> {
  const details = await prisma.details_ProductOverviewDetails.findMany({
    where: { productid: productId },
    include: {
      Master_ProductOverviewDetails: true,
    },
  });

  if (!details || details.length === 0) {
    return [];
  }

  return details.map((detail): ProductOverviewDetailItem => {
    return {
      ProductOverviewDetailsId: detail.ProductOverviewDetailsId,
      Title: detail.Master_ProductOverviewDetails?.Title || null,
      Description: detail.Master_ProductOverviewDetails?.Description || null,
      Img: detail.Master_ProductOverviewDetails?.Img || null,
      ProductName: detail.ProductName,
    };
  });
}

export const getProductOverviewDetails = cachedQuery(
  "getProductOverviewDetails",
  queryProductOverviewDetails,
  {
    revalidate: 60,
    tags: [TAGS.productOverview],
  }
);
