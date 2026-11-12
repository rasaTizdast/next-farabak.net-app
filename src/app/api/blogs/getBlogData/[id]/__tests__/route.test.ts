import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockPrisma } = vi.hoisted(() => ({
  mockPrisma: {
    blogs: { findUnique: vi.fn() },
    media: { findMany: vi.fn() },
  },
}));
vi.mock("@/lib/prisma", () => ({ prisma: mockPrisma }));

import { GET } from "../route";

const mockBlogData = {
  id: 1,
  title: "Test Blog",
  SEO_Title: "SEO",
  slug: "test-blog",
  created_at: "2025-01-01",
  status: "Published",
  views_count: 100,
  content: "content",
  author: "Author",
  SEO_description: "desc",
  image_URL: "img.jpg",
  image_alt: "alt",
  BlogCategories: [{ Categories: { id: 1, name: "Tech", slug: "tech" } }],
  Comments: [{ id: 1, content: "Nice!", created_at: "2025-01-02" }],
  Likes: [{ id: 1 }],
};

describe("GET /api/blogs/getBlogData/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns blog data with categories, comments, likes, and media", async () => {
    mockPrisma.blogs.findUnique.mockResolvedValue(mockBlogData);
    mockPrisma.media.findMany.mockResolvedValue([
      { id: 1, media_type: "image", media_URL: "http://media/1.jpg", media_alt: "pic" },
    ]);

    const res = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ id: "1" }),
    });
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.blog.id).toBe(1);
    expect(json.blog.title).toBe("Test Blog");
    expect(json.categories).toHaveLength(1);
    expect(json.categories[0].name).toBe("Tech");
    expect(json.comments).toHaveLength(1);
    expect(json.comments[0].content).toBe("Nice!");
    expect(json.likes).toBe(1);
    expect(json.media).toHaveLength(1);
    expect(json.media[0].media_type).toBe("image");
  });

  it("returns 404 when blog not found", async () => {
    mockPrisma.blogs.findUnique.mockResolvedValue(null);

    const res = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ id: "999" }),
    });
    expect(res.status).toBe(404);

    const json = await res.json();
    expect(json.message).toContain("یافت نشد");
  });

  it("queries blog by numeric id", async () => {
    mockPrisma.blogs.findUnique.mockResolvedValue(null);

    await GET(new Request("http://localhost"), { params: Promise.resolve({ id: "42" }) });

    expect(mockPrisma.blogs.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 42 } })
    );
  });

  it("returns 500 on prisma error", async () => {
    mockPrisma.blogs.findUnique.mockRejectedValue(new Error("DB error"));

    const res = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ id: "1" }),
    });
    expect(res.status).toBe(500);
  });
});
