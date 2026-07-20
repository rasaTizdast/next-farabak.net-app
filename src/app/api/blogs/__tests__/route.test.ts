import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockPrisma } = vi.hoisted(() => ({
  mockPrisma: {
    blogs: { findMany: vi.fn() },
  },
}));
vi.mock("@/lib/prisma", () => ({ prisma: mockPrisma }));

import { GET } from "../route";

describe("GET /api/blogs", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns published blogs formatted with categories, comments count, and likes count", async () => {
    mockPrisma.blogs.findMany.mockResolvedValue([
      {
        id: 1,
        title: "Test Blog",
        SEO_Title: "SEO Title",
        slug: "test-blog",
        image_URL: "http://img.test/1.jpg",
        image_alt: "alt text",
        created_at: "2025-01-01",
        status: "Published",
        views_count: 100,
        content: "content",
        author: "Author",
        SEO_description: "desc",
        BlogCategories: [
          { Categories: { name: "Tech", slug: "tech" } },
          { Categories: { name: "News", slug: "news" } },
        ],
        Comments: [{ id: 1 }, { id: 2 }],
        Likes: [{ id: 1 }],
      },
    ]);

    const res = await GET();
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.blogs).toHaveLength(1);
    expect(json.blogs[0]).toEqual(
      expect.objectContaining({
        id: 1,
        title: "Test Blog",
        SEO_Title: "SEO Title",
        slug: "test-blog",
        image: "http://img.test/1.jpg",
        image_alt: "alt text",
        categories: [
          { name: "Tech", slug: "tech" },
          { name: "News", slug: "news" },
        ],
        comments: 2,
        likes: 1,
      })
    );
  });

  it("returns empty blogs array when no published blogs exist", async () => {
    mockPrisma.blogs.findMany.mockResolvedValue([]);

    const res = await GET();
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.blogs).toEqual([]);
  });

  it("queries with correct where clause (Published, no QR code key)", async () => {
    mockPrisma.blogs.findMany.mockResolvedValue([]);

    await GET();

    expect(mockPrisma.blogs.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          status: "Published",
          QrCode_key: null,
        },
      })
    );
  });

  it("returns 500 on prisma error", async () => {
    mockPrisma.blogs.findMany.mockRejectedValue(new Error("DB error"));

    const res = await GET();
    expect(res.status).toBe(500);

    const json = await res.json();
    expect(json.error).toBeDefined();
  });
});
