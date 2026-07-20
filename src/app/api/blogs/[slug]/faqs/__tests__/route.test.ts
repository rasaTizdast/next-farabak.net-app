import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockPrisma } = vi.hoisted(() => ({
  mockPrisma: {
    blogs: { findUnique: vi.fn() },
    blogFAQs: { findMany: vi.fn() },
  },
}));
vi.mock("@prisma/client", () => ({
  PrismaClient: vi.fn().mockImplementation(function () { return mockPrisma; }),
}));

import { GET } from "../route";

describe("GET /api/blogs/[slug]/faqs", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns FAQs for a blog by slug", async () => {
    mockPrisma.blogs.findUnique.mockResolvedValue({ id: 1 });
    mockPrisma.blogFAQs.findMany.mockResolvedValue([
      { id: 1, question: "What is X?", answer: "X is Y", order: 1 },
      { id: 2, question: "Why Z?", answer: "Because", order: 2 },
    ]);

    const res = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ slug: "my-blog" }),
    });
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.faqs).toHaveLength(2);
    expect(json.faqs[0].question).toBe("What is X?");
    expect(json.faqs[1].order).toBe(2);
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

  it("queries FAQs with correct blog_id and available filter", async () => {
    mockPrisma.blogs.findUnique.mockResolvedValue({ id: 5 });
    mockPrisma.blogFAQs.findMany.mockResolvedValue([]);

    await GET(new Request("http://localhost"), { params: Promise.resolve({ slug: "blog" }) });

    expect(mockPrisma.blogFAQs.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { blog_id: 5, available: true },
        orderBy: { order: "asc" },
      })
    );
  });

  it("returns empty FAQs array when blog has no FAQs", async () => {
    mockPrisma.blogs.findUnique.mockResolvedValue({ id: 1 });
    mockPrisma.blogFAQs.findMany.mockResolvedValue([]);

    const res = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ slug: "blog" }),
    });
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.faqs).toEqual([]);
  });

  it("returns 500 on prisma error", async () => {
    mockPrisma.blogs.findUnique.mockRejectedValue(new Error("DB error"));

    const res = await GET(new Request("http://localhost"), {
      params: Promise.resolve({ slug: "blog" }),
    });
    expect(res.status).toBe(500);
  });
});
