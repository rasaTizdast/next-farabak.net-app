import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockPrisma } = vi.hoisted(() => ({
  mockPrisma: {
    blogCategories: { findMany: vi.fn() },
  },
}));
vi.mock("@/lib/prisma", () => ({ prisma: mockPrisma }));

import { GET } from "../route";

describe("GET /api/blogs/categories/[categoryId]/blogs", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns blogs in a category", async () => {
    mockPrisma.blogCategories.findMany.mockResolvedValue([
      { category_id: 1, Blogs: { id: 1, title: "Blog 1" } },
      { category_id: 1, Blogs: { id: 2, title: "Blog 2" } },
    ]);

    const res = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ categoryId: "1" }),
    });
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json).toHaveLength(2);
    expect(json[0].title).toBe("Blog 1");
    expect(json[1].title).toBe("Blog 2");
  });

  it("returns empty array when no blogs in category", async () => {
    mockPrisma.blogCategories.findMany.mockResolvedValue([]);

    const res = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ categoryId: "1" }),
    });
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json).toEqual([]);
  });

  it("queries with correct categoryId as number", async () => {
    mockPrisma.blogCategories.findMany.mockResolvedValue([]);

    await GET(new Request("http://localhost"), {
      params: Promise.resolve({ categoryId: "42" }),
    });

    expect(mockPrisma.blogCategories.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { category_id: 42 } })
    );
  });

  it("returns 500 on prisma error", async () => {
    mockPrisma.blogCategories.findMany.mockRejectedValue(new Error("DB error"));

    const res = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ categoryId: "1" }),
    });
    expect(res.status).toBe(500);
  });
});
