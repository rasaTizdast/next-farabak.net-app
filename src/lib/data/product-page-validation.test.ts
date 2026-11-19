import { beforeEach, describe, expect, it, vi } from "vitest";

const { prismaMock } = vi.hoisted(() => ({
  prismaMock: {
    product: { count: vi.fn(), findFirst: vi.fn(), findMany: vi.fn() },
    category: { findFirst: vi.fn() },
    categoryContent: { findFirst: vi.fn(), findMany: vi.fn() },
  },
}));

vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));

import {
  hasProductDetailPage,
  hasProductListingPage,
  resolveProductDetailPage,
} from "./product-page-validation";

describe("hasProductDetailPage", () => {
  beforeEach(() => {
    prismaMock.product.findMany.mockReset();
    prismaMock.categoryContent.findMany.mockReset();
  });

  it("accepts a valid exact product route with an assigned category and subcategory", async () => {
    prismaMock.product.findMany.mockResolvedValue([
      {
        ProductId: 577,
        Slug: "CTX-9800-DSI",
        CategoryContentId: "42,41",
        CategoryId: 10,
        Available: true,
        QrCode_Key: null,
        QrCode_expiryDays: null,
        Category: { Slug: "x-ray" },
      },
    ] as never);
    prismaMock.categoryContent.findMany.mockResolvedValue([
      { CategoryContentId: 42, Slug: "airport-luggage", CategoryID: 10 },
      { CategoryContentId: 41, Slug: "smiths-detection", CategoryID: 10 },
    ] as never);

    await expect(
      hasProductDetailPage({
        type: "product",
        category: "x-ray",
        subcategory: "airport-luggage",
        product: "CTX-9800-DSI",
        key: null,
      })
    ).resolves.toBe(true);
  });

  it("rejects a missing product before exposing its page", async () => {
    prismaMock.product.findMany.mockResolvedValue([] as never);

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
});

describe("hasProductListingPage", () => {
  beforeEach(() => {
    prismaMock.product.count.mockReset();
    prismaMock.category.findFirst.mockReset();
    prismaMock.categoryContent.findFirst.mockReset();
    prismaMock.category.findFirst.mockReset();
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

  it("counts only categorized product rows assigned to a subcategory", async () => {
    prismaMock.category.findFirst.mockResolvedValue({ CategoryID: 8 });
    prismaMock.categoryContent.findFirst.mockResolvedValue({
      CategoryContentId: 42,
      CategoryID: 8,
    });
    prismaMock.product.count.mockResolvedValue(30);

    await expect(
      hasProductListingPage({
        type: "subcategory",
        category: "x-ray",
        subcategory: "vehicle-truck",
        page: 1,
      })
    ).resolves.toBe(true);
    expect(prismaMock.product.count).toHaveBeenCalledWith({
      where: {
        CategoryId: 8,
        OR: [
          { CategoryContentId: { equals: "42" } },
          { CategoryContentId: { startsWith: "42," } },
          { CategoryContentId: { endsWith: ",42" } },
          { CategoryContentId: { contains: ",42," } },
        ],
      },
    });
  });

  it("rejects a subcategory under a different category", async () => {
    prismaMock.category.findFirst.mockResolvedValue({ CategoryID: 8 });
    prismaMock.categoryContent.findFirst.mockResolvedValue({
      CategoryContentId: 42,
      CategoryID: 9,
    });

    await expect(
      hasProductListingPage({
        type: "subcategory",
        category: "x-ray",
        subcategory: "vehicle-truck",
        page: 1,
      })
    ).resolves.toBe(false);
    expect(prismaMock.product.count).not.toHaveBeenCalled();
  });
});

describe("resolveProductDetailPage", () => {
  beforeEach(() => {
    prismaMock.product.findMany.mockReset();
    prismaMock.categoryContent.findMany.mockReset();
  });

  const matchingPublicProduct = {
    ProductId: 42,
    Slug: "Argus-2",
    CategoryContentId: "41,42",
    Available: true,
    QrCode_Key: null,
    QrCode_expiryDays: null,
    CategoryId: 7,
    Category: { Slug: "reolink-cctv-camera" },
  };
  const matchingMemberships = [
    { CategoryContentId: 41, Slug: "night-vision", CategoryID: 7 },
    { CategoryContentId: 42, Slug: "wifi", CategoryID: 7 },
  ];

  beforeEach(() => {
    prismaMock.product.findMany.mockResolvedValue([matchingPublicProduct] as never);
    prismaMock.categoryContent.findMany.mockResolvedValue(matchingMemberships as never);
  });

  it("resolves a unique case-insensitive slug and redirects a valid secondary membership", async () => {
    await expect(
      resolveProductDetailPage({
        type: "product",
        category: "reolink-cctv-camera",
        subcategory: "wifi",
        product: "argus-2",
        key: null,
      })
    ).resolves.toEqual({
      canonicalPath: "/products/reolink-cctv-camera/night-vision/Argus-2",
      shouldRedirect: true,
    });
  });

  it("prefers an exact slug match when case-insensitive records collide", async () => {
    prismaMock.product.findMany.mockResolvedValue([
      matchingPublicProduct,
      {
        ...matchingPublicProduct,
        ProductId: 43,
        Slug: "ARGUS-2",
        CategoryContentId: "99",
      },
    ] as never);

    await expect(
      resolveProductDetailPage({
        type: "product",
        category: "reolink-cctv-camera",
        subcategory: "wifi",
        product: "Argus-2",
        key: null,
      })
    ).resolves.toEqual({
      canonicalPath: "/products/reolink-cctv-camera/night-vision/Argus-2",
      shouldRedirect: true,
    });
  });

  it("rejects a product slug under a subcategory that is not assigned to its product", async () => {
    await expect(
      resolveProductDetailPage({
        type: "product",
        category: "reolink-cctv-camera",
        subcategory: "ip",
        product: "Argus-2",
        key: null,
      })
    ).resolves.toBeNull();
  });

  it("does not redirect a valid QR access route or include its key in the canonical path", async () => {
    prismaMock.product.findMany.mockResolvedValue([
      {
        ...matchingPublicProduct,
        Available: false,
        QrCode_Key: "valid-key",
        QrCode_expiryDays: "2099-01-01",
      },
    ] as never);

    await expect(
      resolveProductDetailPage({
        type: "product",
        category: "reolink-cctv-camera",
        subcategory: "wifi",
        product: "Argus-2",
        key: "valid-key",
      })
    ).resolves.toEqual({
      canonicalPath: "/products/reolink-cctv-camera/night-vision/Argus-2",
      shouldRedirect: false,
    });
  });

  it("rejects ambiguous case-insensitive slugs when no exact spelling matches", async () => {
    prismaMock.product.findMany.mockResolvedValue([
      matchingPublicProduct,
      { ...matchingPublicProduct, ProductId: 43, Slug: "ARGUS-2" },
    ] as never);

    await expect(
      resolveProductDetailPage({
        type: "product",
        category: "reolink-cctv-camera",
        subcategory: "wifi",
        product: "argus-2",
        key: null,
      })
    ).resolves.toBeNull();
  });
});
