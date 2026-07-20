import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockPrisma } = vi.hoisted(() => ({
  mockPrisma: {
    categories: { findMany: vi.fn(), create: vi.fn(), delete: vi.fn() },
    blogCategories: { findMany: vi.fn() },
    $transaction: vi.fn(),
  },
}));
vi.mock("@/lib/prisma", () => ({ prisma: mockPrisma }));

import { GET, POST, DELETE } from "../route";

describe("GET /api/blogs/categories", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns all categories", async () => {
    mockPrisma.categories.findMany.mockResolvedValue([
      { id: 1, name: "Tech", slug: "tech" },
      { id: 2, name: "News", slug: "news" },
    ]);

    const res = await GET();
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json).toHaveLength(2);
    expect(json[0].name).toBe("Tech");
  });

  it("returns empty array when no categories", async () => {
    mockPrisma.categories.findMany.mockResolvedValue([]);

    const res = await GET();
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json).toEqual([]);
  });

  it("returns 500 on error", async () => {
    mockPrisma.categories.findMany.mockRejectedValue(new Error("DB error"));

    const res = await GET();
    expect(res.status).toBe(500);
  });
});

describe("POST /api/blogs/categories", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a category with auto-generated slug", async () => {
    const newCategory = { id: 1, name: "Web Development", slug: "web-development" };
    mockPrisma.categories.create.mockResolvedValue(newCategory);

    const req = new Request("http://localhost/api/blogs/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Web Development" }),
    });

    const res = await POST(req as any);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.name).toBe("Web Development");
    expect(json.slug).toBe("web-development");

    expect(mockPrisma.categories.create).toHaveBeenCalledWith({
      data: { name: "Web Development", slug: "web-development" },
    });
  });

  it("generates slug from name with special chars removed", async () => {
    mockPrisma.categories.create.mockResolvedValue({ id: 1, name: "C++ & Java!", slug: "c-java" });

    const req = new Request("http://localhost/api/blogs/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "C++ & Java!" }),
    });

    const res = await POST(req as any);
    expect(res.status).toBe(200);

    expect(mockPrisma.categories.create).toHaveBeenCalledWith({
      data: { name: "C++ & Java!", slug: "c-java" },
    });
  });

  it("returns 400 on P2002 duplicate category", async () => {
    const error = new Error("Unique constraint") as any;
    error.code = "P2002";
    mockPrisma.categories.create.mockRejectedValue(error);

    const req = new Request("http://localhost/api/blogs/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Tech" }),
    });

    const res = await POST(req as any);
    expect(res.status).toBe(400);

    const json = await res.json();
    expect(json.error).toContain("وجود دارد");
  });

  it("returns 500 on generic error", async () => {
    mockPrisma.categories.create.mockRejectedValue(new Error("DB error"));

    const req = new Request("http://localhost/api/blogs/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Test" }),
    });

    const res = await POST(req as any);
    expect(res.status).toBe(500);
  });
});

describe("DELETE /api/blogs/categories", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deletes a category with no blog associations", async () => {
    mockPrisma.blogCategories.findMany.mockResolvedValue([]);
    mockPrisma.categories.delete.mockResolvedValue({ id: 1, name: "Tech", slug: "tech" });

    const req = new Request("http://localhost/api/blogs/categories", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: 1 }),
    });

    const res = await DELETE(req as any);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.id).toBe(1);
  });

  it("returns 400 when category is in use and force is false", async () => {
    mockPrisma.blogCategories.findMany.mockResolvedValue([
      { category_id: 1, Blogs: { id: 1, title: "Blog 1" } },
    ]);

    const req = new Request("http://localhost/api/blogs/categories", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: 1, force: false }),
    });

    const res = await DELETE(req as any);
    expect(res.status).toBe(400);

    const json = await res.json();
    expect(json.error).toContain("امکان حذف");
    expect(json.blogs).toHaveLength(1);
  });

  it("force deletes category and associated blogs via transaction", async () => {
    mockPrisma.blogCategories.findMany.mockResolvedValue([
      { category_id: 1, Blogs: { id: 1, title: "Blog 1" } },
    ]);
    mockPrisma.$transaction.mockResolvedValue(undefined);

    const req = new Request("http://localhost/api/blogs/categories", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: 1, force: true }),
    });

    const res = await DELETE(req as any);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.deletedBlogs).toBe(1);
    expect(mockPrisma.$transaction).toHaveBeenCalled();
  });

  it("returns 404 on P2025 (category not found)", async () => {
    const error = new Error("Record not found") as any;
    error.code = "P2025";
    mockPrisma.blogCategories.findMany.mockResolvedValue([]);
    mockPrisma.categories.delete.mockRejectedValue(error);

    const req = new Request("http://localhost/api/blogs/categories", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: 999 }),
    });

    const res = await DELETE(req as any);
    expect(res.status).toBe(404);
  });

  it("returns 500 on generic error", async () => {
    mockPrisma.blogCategories.findMany.mockRejectedValue(new Error("DB error"));

    const req = new Request("http://localhost/api/blogs/categories", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: 1 }),
    });

    const res = await DELETE(req as any);
    expect(res.status).toBe(500);
  });
});
