import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockPrisma } = vi.hoisted(() => ({
  mockPrisma: {
    blogs: { findUnique: vi.fn(), delete: vi.fn() },
    blogCategories: { deleteMany: vi.fn() },
  },
}));
vi.mock("@/lib/prisma", () => ({ prisma: mockPrisma }));
vi.mock("aws-sdk", () => ({
  S3: vi.fn().mockImplementation(function () {
    return {
      listObjectsV2: vi
        .fn()
        .mockReturnValue({ promise: vi.fn().mockResolvedValue({ Contents: [] }) }),
      deleteObjects: vi.fn().mockReturnValue({ promise: vi.fn().mockResolvedValue({}) }),
    };
  }),
}));

import { DELETE } from "../route";

describe("DELETE /api/blogs/delete/[id]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deletes a blog and its categories successfully", async () => {
    const blog = { id: 1, slug: "test-blog" };
    mockPrisma.blogs.findUnique.mockResolvedValue(blog);
    mockPrisma.blogCategories.deleteMany.mockResolvedValue({ count: 2 });
    mockPrisma.blogs.delete.mockResolvedValue(blog);

    const res = await DELETE(undefined as any, { params: Promise.resolve({ id: "1" }) });
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.message).toContain("موفقیت");

    expect(mockPrisma.blogCategories.deleteMany).toHaveBeenCalledWith({ where: { blog_id: 1 } });
    expect(mockPrisma.blogs.delete).toHaveBeenCalledWith({ where: { id: 1 } });
  });

  it("returns 400 for invalid blog id", async () => {
    const res = await DELETE(undefined as any, { params: Promise.resolve({ id: "abc" }) });
    expect(res.status).toBe(400);

    const json = await res.json();
    expect(json.error).toBeDefined();
  });

  it("returns 404 when blog not found", async () => {
    mockPrisma.blogs.findUnique.mockResolvedValue(null);

    const res = await DELETE(undefined as any, { params: Promise.resolve({ id: "999" }) });
    expect(res.status).toBe(404);

    const json = await res.json();
    expect(json.error).toContain("پیدا نشد");
  });

  it("returns 500 on prisma error", async () => {
    mockPrisma.blogs.findUnique.mockRejectedValue(new Error("DB error"));

    const res = await DELETE(undefined as any, { params: Promise.resolve({ id: "1" }) });
    expect(res.status).toBe(500);
  });
});
