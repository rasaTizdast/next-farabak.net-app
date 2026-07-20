import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockPrisma } = vi.hoisted(() => ({
  mockPrisma: {
    product: { findMany: vi.fn() },
    category: { findMany: vi.fn() },
    categoryContent: { findMany: vi.fn(), findFirst: vi.fn() },
    blogs: { findMany: vi.fn() },
    categories: { findMany: vi.fn() },
    projects: { findMany: vi.fn() },
  },
}));
vi.mock("@/lib/prisma", () => ({ prisma: mockPrisma }));

import { GET } from "../route";

describe("GET /api/sitemap", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns all URL categories with static URLs", async () => {
    mockPrisma.product.findMany.mockResolvedValue([]);
    mockPrisma.category.findMany.mockResolvedValue([]);
    mockPrisma.categoryContent.findMany.mockResolvedValue([]);
    mockPrisma.blogs.findMany.mockResolvedValue([]);
    mockPrisma.categories.findMany.mockResolvedValue([]);
    mockPrisma.projects.findMany.mockResolvedValue([]);

    const res = await GET();
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.urls).toBeDefined();
    expect(json.urls.length).toBeGreaterThanOrEqual(12);
    expect(json.urls).toContain("https://farabak.net");
    expect(json.urls).toContain("https://farabak.net/products");
  });

  it("generates product URLs with category and subcategory slugs", async () => {
    mockPrisma.product.findMany.mockResolvedValue([
      { Slug: "camera-1", CategoryContentId: "1", Category: { Slug: "home-edition" } },
    ]);
    mockPrisma.category.findMany.mockResolvedValue([]);
    mockPrisma.categoryContent.findMany.mockResolvedValue([]);
    mockPrisma.categoryContent.findFirst.mockResolvedValue({ Slug: "battery" });
    mockPrisma.blogs.findMany.mockResolvedValue([]);
    mockPrisma.categories.findMany.mockResolvedValue([]);
    mockPrisma.projects.findMany.mockResolvedValue([]);

    const res = await GET();
    const json = await res.json();

    expect(json.urls).toContain(
      "https://farabak.net/products/home-edition/battery/camera-1"
    );
  });

  it("generates category URLs", async () => {
    mockPrisma.product.findMany.mockResolvedValue([]);
    mockPrisma.category.findMany.mockResolvedValue([{ Slug: "outdoor" }]);
    mockPrisma.categoryContent.findMany.mockResolvedValue([]);
    mockPrisma.blogs.findMany.mockResolvedValue([]);
    mockPrisma.categories.findMany.mockResolvedValue([]);
    mockPrisma.projects.findMany.mockResolvedValue([]);

    const res = await GET();
    const json = await res.json();

    expect(json.urls).toContain("https://farabak.net/products/outdoor");
  });

  it("generates subcategory URLs", async () => {
    mockPrisma.product.findMany.mockResolvedValue([]);
    mockPrisma.category.findMany.mockResolvedValue([]);
    mockPrisma.categoryContent.findMany.mockResolvedValue([
      { Slug: "nvr", Category: { Slug: "home-edition" } },
    ]);
    mockPrisma.blogs.findMany.mockResolvedValue([]);
    mockPrisma.categories.findMany.mockResolvedValue([]);
    mockPrisma.projects.findMany.mockResolvedValue([]);

    const res = await GET();
    const json = await res.json();

    expect(json.urls).toContain("https://farabak.net/products/home-edition/nvr");
  });

  it("generates blog URLs with category", async () => {
    mockPrisma.product.findMany.mockResolvedValue([]);
    mockPrisma.category.findMany.mockResolvedValue([]);
    mockPrisma.categoryContent.findMany.mockResolvedValue([]);
    mockPrisma.blogs.findMany.mockResolvedValue([
      {
        slug: "test-blog",
        BlogCategories: [{ Categories: { slug: "tech" } }],
      },
    ]);
    mockPrisma.categories.findMany.mockResolvedValue([]);
    mockPrisma.projects.findMany.mockResolvedValue([]);

    const res = await GET();
    const json = await res.json();

    expect(json.urls).toContain("https://farabak.net/support/blog/tech/test-blog");
  });

  it("generates blog URLs without category as fallback", async () => {
    mockPrisma.product.findMany.mockResolvedValue([]);
    mockPrisma.category.findMany.mockResolvedValue([]);
    mockPrisma.categoryContent.findMany.mockResolvedValue([]);
    mockPrisma.blogs.findMany.mockResolvedValue([{ slug: "no-cat-blog", BlogCategories: [] }]);
    mockPrisma.categories.findMany.mockResolvedValue([]);
    mockPrisma.projects.findMany.mockResolvedValue([]);

    const res = await GET();
    const json = await res.json();

    expect(json.urls).toContain("https://farabak.net/support/blog/no-cat-blog");
  });

  it("generates project URLs", async () => {
    mockPrisma.product.findMany.mockResolvedValue([]);
    mockPrisma.category.findMany.mockResolvedValue([]);
    mockPrisma.categoryContent.findMany.mockResolvedValue([]);
    mockPrisma.blogs.findMany.mockResolvedValue([]);
    mockPrisma.categories.findMany.mockResolvedValue([]);
    mockPrisma.projects.findMany.mockResolvedValue([{ Slug: "project-1" }]);

    const res = await GET();
    const json = await res.json();

    expect(json.urls).toContain("https://farabak.net/about-us/projects/project-1");
  });

  it("returns 500 on prisma error", async () => {
    mockPrisma.product.findMany.mockRejectedValue(new Error("DB error"));

    const res = await GET();
    expect(res.status).toBe(500);
  });
});
