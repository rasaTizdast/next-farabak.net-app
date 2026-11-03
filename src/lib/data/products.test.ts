import { beforeEach, describe, expect, it, vi } from "vitest";

import { prisma } from "@/lib/prisma";

import { getAllProducts } from "./products";

vi.mock("next/cache", () => ({ cacheLife: vi.fn(), cacheTag: vi.fn() }));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    product: { count: vi.fn(), findMany: vi.fn() },
    category: { findMany: vi.fn() },
    categoryContent: { findMany: vi.fn() },
  },
}));

describe("getAllProducts pagination bounds", () => {
  beforeEach(() => {
    vi.mocked(prisma.product.count).mockReset().mockResolvedValue(1);
    vi.mocked(prisma.product.findMany)
      .mockReset()
      .mockResolvedValue([
        {
          ProductId: 1,
          Name: "Product one",
          Type: "Product one",
          Slug: "product-one",
          CategoryContentId: "1",
          Category: { CategoryID: 1, Slug: "x-ray", Name: "ایکس‌ری" },
        },
      ] as never);
    vi.mocked(prisma.category.findMany)
      .mockReset()
      .mockResolvedValue([] as never);
    vi.mocked(prisma.categoryContent.findMany)
      .mockReset()
      .mockResolvedValue([{ CategoryContentId: 1, Slug: "airport" }] as never);
  });

  it.each([0, 2])("does not return product data for invalid page %s", async (page) => {
    await expect(getAllProducts({ page, limit: 30 })).resolves.toBeNull();
  });
});
