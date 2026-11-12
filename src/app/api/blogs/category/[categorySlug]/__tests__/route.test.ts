import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockPrisma } = vi.hoisted(() => ({
  mockPrisma: {
    blogs: { findMany: vi.fn() },
  },
}));
vi.mock("@/lib/prisma", () => ({ prisma: mockPrisma }));

import { GET } from "../route";

describe("GET /api/blogs/category/[categorySlug]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns formatted blogs for a category slug", async () => {
    mockPrisma.blogs.findMany.mockResolvedValue([
      {
        id: 1,
        title: "Blog in Tech",
        SEO_Title: "Tech SEO",
        slug: "blog-in-tech",
        image_URL: "img.jpg",
        image_alt: "alt",
        created_at: "2025-01-01",
        status: "Published",
        views_count: 50,
        content: "content",
        author: "Author",
        SEO_description: "desc",
        BlogCategories: [{ Categories: { name: "Tech", slug: "tech" } }],
        Comments: [{ id: 1 }],
        Likes: [{ id: 1 }, { id: 2 }],
      },
    ]);

    const res = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ categorySlug: "tech" }),
    });
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.blogs).toHaveLength(1);
    expect(json.blogs[0]).toEqual(
      expect.objectContaining({
        id: 1,
        title: "Blog in Tech",
        slug: "blog-in-tech",
        image: "img.jpg",
        categories: [{ name: "Tech", slug: "tech" }],
        comments: 1,
        likes: 2,
      })
    );
  });

  it("returns empty blogs when no blogs match category", async () => {
    mockPrisma.blogs.findMany.mockResolvedValue([]);

    const res = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ categorySlug: "nonexistent" }),
    });
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.blogs).toEqual([]);
  });

  it("queries with correct category slug filter", async () => {
    mockPrisma.blogs.findMany.mockResolvedValue([]);

    await GET(new Request("http://localhost"), {
      params: Promise.resolve({ categorySlug: "programming" }),
    });

    expect(mockPrisma.blogs.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          status: "Published",
          QrCode_key: null,
          BlogCategories: {
            some: { Categories: { slug: "programming" } },
          },
        }),
      })
    );
  });

  it("returns 500 on prisma error", async () => {
    mockPrisma.blogs.findMany.mockRejectedValue(new Error("DB error"));

    const res = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ categorySlug: "tech" }),
    });
    expect(res.status).toBe(500);

    const json = await res.json();
    expect(json.error).toBeDefined();
  });
});
