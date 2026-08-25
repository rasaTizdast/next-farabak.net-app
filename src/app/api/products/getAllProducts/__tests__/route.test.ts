import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockPrisma } = vi.hoisted(() => ({
  mockPrisma: {
    product: { count: vi.fn(), findMany: vi.fn() },
    category: { findMany: vi.fn() },
    categoryContent: { findMany: vi.fn() },
  },
}));

vi.mock("@/lib/prisma", () => ({ prisma: mockPrisma }));

import { GET } from "../route";

function makeGetRequest(params?: Record<string, string>) {
  const url = new URL("http://localhost/api/products/getAllProducts");
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  }
  return new Request(url.toString());
}

describe("GET /api/products/getAllProducts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 404 when no products exist", async () => {
    mockPrisma.product.count.mockResolvedValue(0);

    const res = await GET(makeGetRequest());
    expect(res.status).toBe(404);
  });

  it("returns products with pagination", async () => {
    mockPrisma.product.count.mockResolvedValue(2);
    mockPrisma.category.findMany.mockResolvedValue([{ CategoryID: 1, Slug: "cat1", Name: "Cat1" }]);
    mockPrisma.categoryContent.findMany.mockResolvedValue([]);
    mockPrisma.product.findMany.mockResolvedValue([
      {
        ProductId: 1,
        Name: "Product 1",
        Type: "Type 1",
        Slug: "product-1",
        CategoryContentId: null,
        Category: { Slug: "cat1", Name: "Cat1", CategoryID: 1 },
      },
      {
        ProductId: 2,
        Name: "Product 2",
        Type: "Type 2",
        Slug: "product-2",
        CategoryContentId: null,
        Category: { Slug: "cat1", Name: "Cat1", CategoryID: 1 },
      },
    ]);

    const res = await GET(makeGetRequest({ page: "1", limit: "10" }));
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.pagination.totalCount).toBe(2);
    expect(json.data.length).toBeGreaterThan(0);
  });

  it("returns 500 on error", async () => {
    mockPrisma.product.count.mockRejectedValue(new Error("DB error"));

    const res = await GET(makeGetRequest());
    expect(res.status).toBe(500);
  });
});
