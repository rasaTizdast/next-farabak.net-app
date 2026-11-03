import { beforeEach, describe, expect, it, vi } from "vitest";

const { prismaMock } = vi.hoisted(() => ({
  prismaMock: {
    product: { count: vi.fn() },
    category: { findFirst: vi.fn() },
    categoryContent: { findFirst: vi.fn() },
  },
}));

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));

import { hasProductListingPage } from "./product-page-validation";

describe("hasProductListingPage", () => {
  beforeEach(() => {
    prismaMock.product.count.mockReset();
    prismaMock.category.findFirst.mockReset();
    prismaMock.categoryContent.findFirst.mockReset();
  });

  it("uses categorized product count to confirm a global page", async () => {
    prismaMock.product.count.mockResolvedValue(61);

    await expect(hasProductListingPage({ type: "all", page: 3 })).resolves.toBe(true);
    expect(prismaMock.product.count).toHaveBeenCalledWith({
      where: { CategoryId: { not: null } },
    });
  });

  it("rejects a global page past the final page", async () => {
    prismaMock.product.count.mockResolvedValue(61);

    await expect(hasProductListingPage({ type: "all", page: 4 })).resolves.toBe(false);
  });

  it("rejects a category with no products", async () => {
    prismaMock.category.findFirst.mockResolvedValue({ CategoryID: 8 });
    prismaMock.product.count.mockResolvedValue(0);

    await expect(
      hasProductListingPage({ type: "category", category: "empty", page: 1 })
    ).resolves.toBe(false);
    expect(prismaMock.product.count).toHaveBeenCalledWith({ where: { CategoryId: 8 } });
  });

  it("counts only categorized products in the requested subcategory", async () => {
    prismaMock.categoryContent.findFirst.mockResolvedValue({ CategoryContentId: 42 });
    prismaMock.product.count.mockResolvedValue(30);

    await expect(
      hasProductListingPage({ type: "subcategory", subcategory: "vehicle-truck", page: 1 })
    ).resolves.toBe(true);
    expect(prismaMock.product.count).toHaveBeenCalledWith({
      where: {
        CategoryId: { not: null },
        OR: [
          { CategoryContentId: { equals: "42" } },
          { CategoryContentId: { startsWith: "42," } },
          { CategoryContentId: { endsWith: ",42" } },
          { CategoryContentId: { contains: ",42," } },
        ],
      },
    });
  });
});
