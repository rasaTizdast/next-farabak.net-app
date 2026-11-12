import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockPrisma } = vi.hoisted(() => ({
  mockPrisma: {
    category: { findMany: vi.fn() },
  },
}));

vi.mock("@/lib/prisma", () => ({ prisma: mockPrisma }));

import { GET } from "../route";

describe("GET /api/categories/getAll", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns categories with subcategories", async () => {
    mockPrisma.category.findMany.mockResolvedValue([
      {
        CategoryID: 1,
        Name: "Electronics",
        Slug: "electronics",
        Available: true,
        SEO_Category: { SEO_Title: "SEO" },
        CategoryContent: [
          {
            CategoryContentId: "10",
            Name: "Phones",
            Slug: "phones",
            Available: true,
            SEO_CategoryContent: { SEO_Title: "Phones SEO" },
          },
        ],
      },
    ]);

    const res = await GET();
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json).toHaveLength(1);
    expect(json[0].Subcategories).toHaveLength(1);
    expect(json[0].Link).toBe("/products/electronics");
    expect(json[0].Subcategories[0].Link).toBe("/products/electronics/phones");
  });

  it("returns empty array when no categories", async () => {
    mockPrisma.category.findMany.mockResolvedValue([]);

    const res = await GET();
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json).toEqual([]);
  });

  it("returns 500 on database error", async () => {
    mockPrisma.category.findMany.mockRejectedValue(new Error("DB error"));

    const res = await GET();
    expect(res.status).toBe(500);
  });

  it("handles missing SEO details gracefully", async () => {
    mockPrisma.category.findMany.mockResolvedValue([
      {
        CategoryID: 1,
        Name: "Test",
        Slug: "test",
        Available: true,
        SEO_Category: null,
        CategoryContent: [],
      },
    ]);

    const res = await GET();
    const json = await res.json();
    expect(json[0].SEO_Details).toEqual({
      SEO_Title: null,
      SEO_Description: null,
      SEO_Keywords: null,
    });
  });
});
