import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockPrisma } = vi.hoisted(() => ({
  mockPrisma: {
    blogs: { findUnique: vi.fn() },
    media: { findMany: vi.fn() },
  },
}));
vi.mock("@prisma/client", () => ({
  PrismaClient: vi.fn().mockImplementation(function () {
    return mockPrisma;
  }),
}));

import { GET } from "../route";

const mockBlogData = {
  id: 1,
  title: "Blog by Slug",
  SEO_Title: "SEO",
  slug: "blog-by-slug",
  created_at: "2025-01-01",
  status: "Published",
  views_count: 50,
  content: "content here",
  author: "Writer",
  SEO_description: "desc",
  image_URL: "img.jpg",
  image_alt: "alt",
  QrCode_key: null,
  QrCode_expiryDays: null,
  BlogCategories: [{ Categories: { id: 1, name: "Tech", slug: "tech" } }],
  Comments: [{ id: 1, content: "Great!", created_at: "2025-01-02" }],
  Likes: [{ id: 1 }, { id: 2 }],
  BlogFAQs: [{ id: 1, question: "Q1?", answer: "A1", order: 1 }],
};

describe("GET /api/blogs/[slug]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns blog by slug with all related data", async () => {
    mockPrisma.blogs.findUnique.mockResolvedValue(mockBlogData);
    mockPrisma.media.findMany.mockResolvedValue([
      { id: 1, media_type: "video", media_URL: "http://v.test/1.mp4", media_alt: "vid" },
    ]);

    const res = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ slug: "blog-by-slug" }),
    });
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.blog.title).toBe("Blog by Slug");
    expect(json.blog.slug).toBe("blog-by-slug");
    expect(json.blog.QrCode_key).toBeNull();
    expect(json.categories).toHaveLength(1);
    expect(json.comments).toHaveLength(1);
    expect(json.likes).toBe(2);
    expect(json.media).toHaveLength(1);
    expect(json.faqs).toHaveLength(1);
    expect(json.faqs[0].question).toBe("Q1?");
  });

  it("returns 404 when blog not found", async () => {
    mockPrisma.blogs.findUnique.mockResolvedValue(null);

    const res = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ slug: "nonexistent" }),
    });
    expect(res.status).toBe(404);

    const json = await res.json();
    expect(json.message).toContain("یافت نشد");
  });

  it("queries with correct slug and Published status", async () => {
    mockPrisma.blogs.findUnique.mockResolvedValue(null);

    await GET(new Request("http://localhost"), { params: Promise.resolve({ slug: "my-slug" }) });

    expect(mockPrisma.blogs.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { slug: "my-slug", status: "Published" },
      })
    );
  });

  it("returns 500 on prisma error", async () => {
    mockPrisma.blogs.findUnique.mockRejectedValue(new Error("DB error"));

    const res = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ slug: "test" }),
    });
    expect(res.status).toBe(500);

    const json = await res.json();
    expect(json.message).toContain("خطای داخلی");
  });
});
