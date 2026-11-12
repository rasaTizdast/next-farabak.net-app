import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockPrisma } = vi.hoisted(() => ({
  mockPrisma: {
    categoryContent: { findFirst: vi.fn(), findMany: vi.fn() },
    product: { count: vi.fn(), findMany: vi.fn() },
  },
}));

vi.mock("@/lib/prisma", () => ({ prisma: mockPrisma }));

import { GET } from "../route";

describe("GET /api/products/getProductsBySubcategory/[subCategoryName]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns paginated products", async () => {
    mockPrisma.categoryContent.findFirst.mockResolvedValue({
      CategoryContentId: 10,
      Slug: "ptz",
      SEO_CategoryContent: null,
    });
    mockPrisma.product.count.mockResolvedValue(1);
    mockPrisma.categoryContent.findMany.mockResolvedValue([{ CategoryContentId: 10, Slug: "ptz" }]);
    mockPrisma.product.findMany.mockResolvedValue([
      {
        ProductId: 1,
        Name: "Camera",
        CategoryContentId: "10",
        Category: { Slug: "home-edition", Name: "Home", CategoryID: 1 },
      },
    ]);

    const res = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ subCategoryName: "ptz" }),
    });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.data).toHaveLength(1);
    expect(json.pagination.totalCount).toBe(1);
  });

  it("returns 404 when subcategory not found", async () => {
    mockPrisma.categoryContent.findFirst.mockResolvedValue(null);
    const res = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ subCategoryName: "unknown" }),
    });
    expect(res.status).toBe(404);
  });

  it("returns 404 when no products", async () => {
    mockPrisma.categoryContent.findFirst.mockResolvedValue({
      CategoryContentId: 10,
      Slug: "ptz",
      SEO_CategoryContent: null,
    });
    mockPrisma.product.count.mockResolvedValue(0);
    const res = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ subCategoryName: "ptz" }),
    });
    expect(res.status).toBe(404);
  });

  it("returns 500 on error", async () => {
    mockPrisma.categoryContent.findFirst.mockRejectedValue(new Error("DB error"));
    const res = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ subCategoryName: "ptz" }),
    });
    expect(res.status).toBe(500);
  });
});
