import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/auth", () => ({
  requireAuth: vi.fn().mockResolvedValue({ userId: "1", username: "qa-admin", role: "Admin" }),
}));

const { mockPrisma } = vi.hoisted(() => ({
  mockPrisma: {
    $transaction: vi.fn(),
    blogs: { create: vi.fn() },
    blogCategories: { createMany: vi.fn() },
  },
}));
vi.mock("@/lib/prisma", () => ({ prisma: mockPrisma }));

import { POST } from "../route";

function makeRequest(body: Record<string, unknown>) {
  return new Request("http://localhost/api/blogs/create", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/blogs/create", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPrisma.$transaction.mockImplementation(async (callback) => callback(mockPrisma));
  });

  it("groups the draft and category writes in one transaction", async () => {
    mockPrisma.blogs.create.mockResolvedValue({ id: 8, title: "QA", slug: "qa" });
    mockPrisma.blogCategories.createMany.mockResolvedValue({ count: 1 });
    const res = await POST(makeRequest({ title: "QA", slug: "qa", categories: [3] }));
    expect(res.status).toBe(200);
    expect(mockPrisma.$transaction).toHaveBeenCalledOnce();
    expect(await res.json()).toMatchObject({ id: 8 });
  });

  it("rejects invalid category IDs before creating a draft", async () => {
    const res = await POST(makeRequest({ title: "QA", slug: "qa", categories: ["3"] }));
    expect(res.status).toBe(400);
    expect(mockPrisma.blogs.create).not.toHaveBeenCalled();
  });

  it("creates a blog with Draft status and returns the blog", async () => {
    const createdBlog = { id: 1, title: "New Blog", slug: "new-blog", status: "Draft" };
    mockPrisma.blogs.create.mockResolvedValue(createdBlog);

    const req = makeRequest({
      title: "New Blog",
      SEO_Title: "New SEO",
      slug: "new-blog",
      author: "Author",
      SEO_description: "desc",
      image_URL: "img.jpg",
      image_alt: "alt",
    });

    const res = await POST(req as any);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.title).toBe("New Blog");
    expect(json.slug).toBe("new-blog");

    expect(mockPrisma.blogs.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          title: "New Blog",
          slug: "new-blog",
          status: "Draft",
          content: "",
          views_count: 0,
        }),
      })
    );
  });

  it("creates blog-category relationships when categories are provided", async () => {
    const createdBlog = { id: 1, title: "Blog", slug: "blog" };
    mockPrisma.blogs.create.mockResolvedValue(createdBlog);
    mockPrisma.blogCategories.createMany.mockResolvedValue({ count: 2 });

    const req = makeRequest({
      title: "Blog",
      slug: "blog",
      categories: [1, 2],
    });

    const res = await POST(req as any);
    expect(res.status).toBe(200);

    expect(mockPrisma.blogCategories.createMany).toHaveBeenCalledWith({
      data: [
        { blog_id: 1, category_id: 1 },
        { blog_id: 1, category_id: 2 },
      ],
    });
  });

  it("does not call createMany when categories is empty", async () => {
    const createdBlog = { id: 1, title: "Blog", slug: "blog" };
    mockPrisma.blogs.create.mockResolvedValue(createdBlog);

    const req = makeRequest({ title: "Blog", slug: "blog", categories: [] });

    await POST(req as any);
    expect(mockPrisma.blogCategories.createMany).not.toHaveBeenCalled();
  });

  it("does not call createMany when categories is undefined", async () => {
    const createdBlog = { id: 1, title: "Blog", slug: "blog" };
    mockPrisma.blogs.create.mockResolvedValue(createdBlog);

    const req = makeRequest({ title: "Blog", slug: "blog" });

    await POST(req as any);
    expect(mockPrisma.blogCategories.createMany).not.toHaveBeenCalled();
  });

  it("returns 400 on P2002 duplicate slug", async () => {
    const error = new Error("Unique constraint") as any;
    error.code = "P2002";
    mockPrisma.blogs.create.mockRejectedValue(error);

    const req = makeRequest({ title: "Blog", slug: "duplicate" });

    const res = await POST(req as any);
    expect(res.status).toBe(400);

    const json = await res.json();
    expect(json.error).toContain("اسلاگ");
  });

  it("returns 500 on generic error", async () => {
    mockPrisma.blogs.create.mockRejectedValue(new Error("DB error"));

    const req = makeRequest({ title: "Blog", slug: "blog" });

    const res = await POST(req as any);
    expect(res.status).toBe(500);
  });
});
