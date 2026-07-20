import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockPrisma } = vi.hoisted(() => ({
  mockPrisma: {
    product: { findFirst: vi.fn() },
    categoryContent: { findFirst: vi.fn() },
  },
}));

vi.mock("@/lib/prisma", () => ({ prisma: mockPrisma }));

import { GET } from "../route";

describe("GET /api/products/getProductBySlug/[productSlug]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns product by slug", async () => {
    mockPrisma.product.findFirst.mockResolvedValue({
      ProductId: 1,
      Name: "Camera",
      Type: "PTZ",
      Price: "100000",
      Discount: "10000",
      CategoryContentId: "10",
      img1: "img1.jpg",
      img2: "img2.jpg",
      Available: true,
      Description: "A camera",
      CategoryId: 1,
      Slug: "camera",
      SEO_Title: "Camera SEO",
      SEO_Description: "Camera desc",
      QrCode_Key: null,
      QrCode_expiryDays: null,
      productBlog: null,
      Minimum_Amount: null,
      Maximum_Amount: null,
      Category: { Slug: "home-edition" },
    });
    mockPrisma.categoryContent.findFirst.mockResolvedValue({ Slug: "ptz" });

    const res = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ productSlug: "camera" }),
    });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.ProductId).toBe(1);
    expect(json.categorySlug).toBe("home-edition");
    expect(json.subCategorySlug).toBe("ptz");
  });

  it("returns 404 when not found", async () => {
    mockPrisma.product.findFirst.mockResolvedValue(null);
    const res = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ productSlug: "unknown" }),
    });
    expect(res.status).toBe(404);
  });

  it("returns 500 on error", async () => {
    mockPrisma.product.findFirst.mockRejectedValue(new Error("DB error"));
    const res = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ productSlug: "camera" }),
    });
    expect(res.status).toBe(500);
  });
});
