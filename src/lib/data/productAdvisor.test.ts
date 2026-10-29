import { beforeEach, describe, expect, it, vi } from "vitest";

import { getAdvisorCategory } from "@/lib/data/productAdvisor";
import { prisma } from "@/lib/prisma";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    category: { findFirst: vi.fn() },
    categoryContent: { findMany: vi.fn() },
    product: { findMany: vi.fn() },
    productSpecs: { findMany: vi.fn() },
  },
}));

describe("getAdvisorCategory", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("loads only available products and verified specs for the requested category", async () => {
    vi.mocked(prisma.category.findFirst).mockResolvedValue({
      CategoryID: 1,
      Name: "رئولینک",
      Slug: "reolink-cctv-camera",
    } as never);
    vi.mocked(prisma.categoryContent.findMany).mockResolvedValue([
      { CategoryContentId: 4, Slug: "outdoor-camera" },
    ] as never);
    vi.mocked(prisma.product.findMany).mockResolvedValue([
      {
        ProductId: 12,
        Name: "دوربین فضای باز",
        Type: "RLC-OUT",
        img1: "outdoor.webp",
        Slug: "rlc-out",
        CategoryContentId: "4",
      },
    ] as never);
    vi.mocked(prisma.productSpecs.findMany).mockResolvedValue([
      { ProductId: 12, Name: "دید در شب", Title: null, Description: "رنگی" },
    ] as never);

    await expect(getAdvisorCategory("reolink-cctv-camera")).resolves.toMatchObject({
      category: { slug: "reolink-cctv-camera" },
      products: [
        {
          productId: 12,
          subcategorySlug: "outdoor-camera",
          specs: [{ key: "night-detail", value: "رنگی" }],
        },
      ],
    });
    expect(prisma.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { Available: true, CategoryId: 1 } })
    );
    expect(prisma.productSpecs.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { Available: true, ProductId: { in: [12] } } })
    );
  });
});
