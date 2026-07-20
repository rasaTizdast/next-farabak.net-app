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

function makeSearchRequest(query: string) {
  const url = new URL("http://localhost/api/products/search");
  url.searchParams.set("q", query);
  return new Request(url.toString());
}

describe("GET /api/products/search", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 400 when query is missing", async () => {
    const url = new URL("http://localhost/api/products/search");
    const res = await GET(new Request(url.toString()));
    expect(res.status).toBe(400);
  });

  it("returns 400 when query is empty", async () => {
    const res = await GET(makeSearchRequest("   "));
    expect(res.status).toBe(400);
  });

  it("returns empty results when no products match", async () => {
    mockPrisma.product.count.mockResolvedValue(0);
    mockPrisma.category.findMany.mockResolvedValue([]);
    mockPrisma.categoryContent.findMany.mockResolvedValue([]);
    mockPrisma.product.findMany.mockResolvedValue([]);

    const res = await GET(makeSearchRequest("nonexistent"));
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.data).toEqual([]);
  });

  it("returns matching products", async () => {
    mockPrisma.product.count.mockResolvedValue(1);
    mockPrisma.category.findMany.mockResolvedValue([
      { CategoryID: 1, Slug: "cat1", Name: "Cat1" },
    ]);
    mockPrisma.categoryContent.findMany.mockResolvedValue([]);
    mockPrisma.product.findMany.mockResolvedValue([
      {
        ProductId: 1,
        Name: "Ultra Studio Camera",
        Type: "Ultra Studio",
        Price: "5000000",
        Discount: "500000",
        Slug: "ultra-studio",
        Description: "Professional camera",
        SEO_Title: "Ultra Studio Camera",
        CategoryContentId: null,
        Category: { Slug: "cat1", Name: "Cat1", CategoryID: 1 },
      },
    ]);

    const res = await GET(makeSearchRequest("ultra studio"));
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.data.length).toBe(1);
    expect(json.pagination.totalCount).toBe(1);
  });

  it("returns 500 on error", async () => {
    mockPrisma.product.count.mockRejectedValue(new Error("DB error"));

    const res = await GET(makeSearchRequest("test"));
    expect(res.status).toBe(500);
  });
});
