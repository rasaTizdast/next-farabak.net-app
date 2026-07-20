import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockPrisma } = vi.hoisted(() => ({
  mockPrisma: {
    blogs: { update: vi.fn() },
    blogCategories: { deleteMany: vi.fn(), createMany: vi.fn() },
  },
}));
vi.mock("@/lib/prisma", () => ({ prisma: mockPrisma }));

import { PUT, PATCH } from "../route";

function makeRequest(body: Record<string, unknown>) {
  return new Request("http://localhost/api/blogs/update/1", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("PUT /api/blogs/update/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("updates blog content and status", async () => {
    const updatedBlog = { id: 1, content: "new content", status: "Published" };
    mockPrisma.blogs.update.mockResolvedValue(updatedBlog);

    const req = makeRequest({ content: "new content", status: "Published" });
    const res = await PUT(req as any, { params: Promise.resolve({ id: "1" }) });
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.content).toBe("new content");
    expect(json.status).toBe("Published");

    expect(mockPrisma.blogs.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: { content: "new content", status: "Published" },
    });
  });

  it("returns 500 on prisma error", async () => {
    mockPrisma.blogs.update.mockRejectedValue(new Error("Not found"));

    const req = makeRequest({ content: "x", status: "Draft" });
    const res = await PUT(req as any, { params: Promise.resolve({ id: "1" }) });
    expect(res.status).toBe(500);
  });
});

describe("PATCH /api/blogs/update/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("updates blog metadata and categories", async () => {
    const updatedBlog = { id: 1, title: "Updated" };
    mockPrisma.blogs.update.mockResolvedValue(updatedBlog);
    mockPrisma.blogCategories.deleteMany.mockResolvedValue({ count: 0 });
    mockPrisma.blogCategories.createMany.mockResolvedValue({ count: 2 });

    const req = makeRequest({
      title: "Updated",
      SEO_Title: "SEO",
      slug: "updated",
      author: "Author",
      SEO_description: "desc",
      image_URL: "img.jpg",
      image_alt: "alt",
      categories: [1, 2],
    });

    const res = await PATCH(req as any, { params: Promise.resolve({ id: "1" }) });
    expect(res.status).toBe(200);

    expect(mockPrisma.blogs.update).toHaveBeenCalledWith({
      where: { id: 1 },
      data: {
        title: "Updated",
        SEO_Title: "SEO",
        slug: "updated",
        author: "Author",
        SEO_description: "desc",
        image_URL: "img.jpg",
        image_alt: "alt",
      },
    });
    expect(mockPrisma.blogCategories.deleteMany).toHaveBeenCalledWith({
      where: { blog_id: 1 },
    });
    expect(mockPrisma.blogCategories.createMany).toHaveBeenCalledWith({
      data: [
        { blog_id: 1, category_id: 1 },
        { blog_id: 1, category_id: 2 },
      ],
    });
  });

  it("does not call createMany when categories is empty", async () => {
    mockPrisma.blogs.update.mockResolvedValue({ id: 1 });
    mockPrisma.blogCategories.deleteMany.mockResolvedValue({ count: 0 });

    const req = makeRequest({ title: "X", categories: [] });
    await PATCH(req as any, { params: Promise.resolve({ id: "1" }) });

    expect(mockPrisma.blogCategories.createMany).not.toHaveBeenCalled();
  });

  it("returns 500 on prisma error", async () => {
    mockPrisma.blogs.update.mockRejectedValue(new Error("DB error"));

    const req = makeRequest({ title: "X" });
    const res = await PATCH(req as any, { params: Promise.resolve({ id: "1" }) });
    expect(res.status).toBe(500);
  });
});
