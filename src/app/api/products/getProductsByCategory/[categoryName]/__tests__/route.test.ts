import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockPrisma } = vi.hoisted(() => ({
  mockPrisma: {
    category: { findFirst: vi.fn() },
    product: { count: vi.fn(), findMany: vi.fn() },
    categoryContent: { findMany: vi.fn() },
  },
}));

vi.mock("@/lib/prisma", () => ({ prisma: mockPrisma }));

import { GET } from "../route";

describe("GET /api/products/getProductsByCategory/[categoryName]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns paginated products", async () => {
    mockPrisma.category.findFirst.mockResolvedValue({
      CategoryID: 1,
      Slug: "home-edition",
      SEO_Category: null,
    });
    mockPrisma.product.count.mockResolvedValue(1);
    mockPrisma.categoryContent.findMany.mockResolvedValue([]);
    mockPrisma.product.findMany.mockResolvedValue([{
      ProductId: 1,
      Name: "Camera",
      CategoryContentId: null,
      Category: { Slug: "home-edition", Name: "Home", CategoryID: 1 },
    }]);

    const res = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ categoryName: "home-edition" }),
    });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data).toHaveLength(1);
    expect(json.pagination.totalCount).toBe(1);
  });

  it("returns 404 when category not found", async () => {
    mockPrisma.category.findFirst.mockResolvedValue(null);
    const res = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ categoryName: "unknown" }),
    });
    expect(res.status).toBe(404);
  });

  it("returns 404 when no products", async () => {
    mockPrisma.category.findFirst.mockResolvedValue({
      CategoryID: 1,
      Slug: "home-edition",
      SEO_Category: null,
    });
    mockPrisma.product.count.mockResolvedValue(0);
    const res = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ categoryName: "home-edition" }),
    });
    expect(res.status).toBe(404);
  });

  it("returns 500 on error", async () => {
    mockPrisma.category.findFirst.mockRejectedValue(new Error("DB error"));
    const res = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ categoryName: "home-edition" }),
    });
    expect(res.status).toBe(500);
  });
});
