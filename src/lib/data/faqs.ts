import type { FaqDetails, FAQs } from "@prisma/client";
import { cacheLife, cacheTag } from "next/cache";

import { prisma } from "@/lib/prisma";

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

export async function getGeneralFaqs(): Promise<GeneralFaqsResult> {
  "use cache";
  cacheTag(TAGS.faqs);
  cacheLife("minutes");

  return queryGeneralFaqs();
}

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

export async function getProductFaqs(productId: number): Promise<ProductFaqItem[]> {
  "use cache";
  cacheTag(TAGS.faqs);
  cacheTag(TAGS.products);
  cacheLife("minutes");

  return queryProductFaqs(productId);
}
