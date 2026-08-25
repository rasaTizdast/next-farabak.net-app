import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockPrisma } = vi.hoisted(() => ({
  mockPrisma: {
    categoryContent: {
      findFirst: vi.fn(),
    },
    category: {
      findFirst: vi.fn(),
    },
  },
}));
vi.mock("@/lib/prisma", () => ({ prisma: mockPrisma }));

import { GET } from "../route";

describe("GET /api/products/blogs", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return null blogs when no slugs provided", async () => {
    const req = new Request("http://localhost/api/products/blogs");
    const res = await GET(req as any);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.topBlog).toBeNull();
    expect(body.bottomBlog).toBeNull();
    expect(body.banner).toBeNull();
  });

  it("should return subcategory blog content", async () => {
    mockPrisma.categoryContent.findFirst.mockResolvedValue({
      TopBlog: "<p>Top</p>",
      BottomBlog: "<p>Bottom</p>",
      Banner: "/banner.png",
    });

    const req = new Request("http://localhost/api/products/blogs?subcategorySlug=ptz-cameras");
    const res = await GET(req as any);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.topBlog).toBe("<p>Top</p>");
    expect(body.bottomBlog).toBe("<p>Bottom</p>");
    expect(body.banner).toBe("/banner.png");
  });

  it("should return category blog content when no subcategorySlug", async () => {
    mockPrisma.category.findFirst.mockResolvedValue({
      TopBlog: "<p>Cat Top</p>",
      BottomBlog: "<p>Cat Bottom</p>",
      Banner: "/cat-banner.png",
    });

    const req = new Request("http://localhost/api/products/blogs?categorySlug=cameras");
    const res = await GET(req as any);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.topBlog).toBe("<p>Cat Top</p>");
    expect(body.bottomBlog).toBe("<p>Cat Bottom</p>");
    expect(body.banner).toBe("/cat-banner.png");
  });

  it("should return null values when category not found", async () => {
    mockPrisma.category.findFirst.mockResolvedValue(null);

    const req = new Request("http://localhost/api/products/blogs?categorySlug=nonexistent");
    const res = await GET(req as any);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.topBlog).toBeNull();
    expect(body.bottomBlog).toBeNull();
    expect(body.banner).toBeNull();
  });

  it("should return 500 on database error", async () => {
    mockPrisma.categoryContent.findFirst.mockRejectedValue(new Error("DB error"));

    const req = new Request("http://localhost/api/products/blogs?subcategorySlug=ptz");
    const res = await GET(req as any);
    await res.json();

    expect(res.status).toBe(500);
  });
});
