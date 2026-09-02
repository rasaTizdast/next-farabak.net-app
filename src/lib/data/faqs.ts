import type { FaqDetails, FAQs } from "@prisma/client";

import { prisma } from "@/lib/prisma";

import { cachedQuery } from "./cache";
import { TAGS } from "./tags";

export type GeneralFaqItem = Pick<FaqDetails, "FaqDetailsid" | "Q" | "A">;
export interface GeneralFaqsResult {
  faqs: GeneralFaqItem[];
}

// /api/faqs/general
async function queryGeneralFaqs(): Promise<GeneralFaqsResult> {
  const faqs = await prisma.faqDetails.findMany({
    where: {
      Available: true,
    },
    orderBy: {
      InsertDate: "desc",
    },
    select: {
      FaqDetailsid: true,
      Q: true,
      A: true,
    },
  });

  return { faqs };
}

export const getGeneralFaqs = cachedQuery("getGeneralFaqs", queryGeneralFaqs, {
  revalidate: 300,
  tags: [TAGS.faqs],
});

export type ProductFaqItem = Pick<FAQs, "FAQsId" | "Title" | "Description">;

// /api/faqs/product/:id
async function queryProductFaqs(productId: number): Promise<ProductFaqItem[]> {
  const faqs = await prisma.fAQs.findMany({
    where: {
      ProductId: productId,
      Available: true,
    },
    select: {
      FAQsId: true,
      Title: true,
      Description: true,
    },
  });

  return faqs;
}

export const getProductFaqs = cachedQuery("getProductFaqs", queryProductFaqs, {
  revalidate: 60,
  tags: [TAGS.faqs, TAGS.products],
});
