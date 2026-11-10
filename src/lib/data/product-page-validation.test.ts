import { beforeEach, describe, expect, it, vi } from "vitest";

const { prismaMock } = vi.hoisted(() => ({
  prismaMock: {
    product: { count: vi.fn(), findFirst: vi.fn() },
    category: { findFirst: vi.fn() },
    categoryContent: { findFirst: vi.fn() },
  },
}));

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));

import { hasProductDetailPage, hasProductListingPage } from "./product-page-validation";

describe("hasProductDetailPage", () => {
  beforeEach(() => {
    prismaMock.product.findFirst.mockReset();
    prismaMock.categoryContent.findFirst.mockReset();
  });

  it("checks the product, category, and subcategory before rendering the streamed detail page", async () => {
    prismaMock.product.findFirst.mockResolvedValue({
      ProductId: 577,
      CategoryContentId: "42,41",
      Available: true,
      QrCode_Key: null,
      QrCode_expiryDays: null,
      Category: { Slug: "x-ray" },
    });
    prismaMock.categoryContent.findFirst.mockResolvedValue({ CategoryContentId: 42 });

    await expect(
      hasProductDetailPage({
        type: "product",
        category: "x-ray",
        subcategory: "airport-luggage",
        product: "CTX-9800-DSI",
        key: null,
      })
    ).resolves.toBe(true);
    expect(prismaMock.product.findFirst).toHaveBeenCalledWith({
      where: { Slug: { equals: "ctx-9800-dsi", mode: "insensitive" } },
      select: {
        ProductId: true,
        CategoryContentId: true,
        Available: true,
        QrCode_Key: true,
        QrCode_expiryDays: true,
        Category: { select: { Slug: true } },
      },
    });
    expect(prismaMock.categoryContent.findFirst).toHaveBeenCalledWith({
      where: { Slug: "airport-luggage" },
      select: { CategoryContentId: true },
    });
  });

  it("rejects an unknown product slug", async () => {
    prismaMock.product.findFirst.mockResolvedValue(null);
    prismaMock.categoryContent.findFirst.mockResolvedValue(null);

    await expect(
      hasProductDetailPage({
        type: "product",
        category: "x-ray",
        subcategory: "airport-luggage",
        product: "missing-model",
        key: null,
      })
    ).resolves.toBe(false);
  });

  it("allows a product through each stored subcategory membership", async () => {
    prismaMock.product.findFirst.mockResolvedValue({
      ProductId: 42,
      CategoryContentId: "42,41",
      Available: true,
      QrCode_Key: null,
      QrCode_expiryDays: null,
      Category: { Slug: "reolink-cctv-camera" },
    });
    prismaMock.categoryContent.findFirst.mockResolvedValue({ CategoryContentId: 41 });

    await expect(
      hasProductDetailPage({
        type: "product",
        category: "reolink-cctv-camera",
        subcategory: "wifi",
        product: "Argus-2",
        key: null,
      })
    ).resolves.toBe(true);
  });

  it("rejects a product slug under an unrelated category or subcategory", async () => {
    prismaMock.product.findFirst.mockResolvedValue({
      ProductId: 42,
      CategoryContentId: "42,41",
      Available: true,
      QrCode_Key: null,
      QrCode_expiryDays: null,
      Category: { Slug: "reolink-cctv-camera" },
    });
    prismaMock.categoryContent.findFirst.mockResolvedValue({ CategoryContentId: 99 });

    await expect(
      hasProductDetailPage({
        type: "product",
        category: "x-ray",
        subcategory: "unknown-category-membership",
        product: "Argus-2",
        key: null,
      })
    ).resolves.toBe(false);
  });

  it("validates QR availability and expiry before a streamed response starts", async () => {
    prismaMock.product.findFirst.mockResolvedValue({
      ProductId: 43,
      CategoryContentId: "41",
      Available: false,
      QrCode_Key: "valid-key",
      QrCode_expiryDays: "2099-01-01",
      Category: { Slug: "reolink-cctv-camera" },
    });
    prismaMock.categoryContent.findFirst.mockResolvedValue({ CategoryContentId: 41 });

    await expect(
      hasProductDetailPage({
        type: "product",
        category: "reolink-cctv-camera",
        subcategory: "wifi",
        product: "Argus-2",
        key: "valid-key",
      })
    ).resolves.toBe(true);

    await expect(
      hasProductDetailPage({
        type: "product",
        category: "reolink-cctv-camera",
        subcategory: "wifi",
        product: "Argus-2",
        key: "wrong-key",
      })
    ).resolves.toBe(false);
  });
});

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
