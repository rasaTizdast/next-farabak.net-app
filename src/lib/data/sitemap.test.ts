import { beforeEach, describe, expect, it, vi } from "vitest";

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

vi.mock("next/cache", () => ({ cacheLife: vi.fn(), cacheTag: vi.fn() }));
vi.mock("@/lib/prisma", () => ({ prisma: mockPrisma }));

import { prisma } from "@/lib/prisma";

import { getSitemapUrls } from "./sitemap";

describe("getSitemapUrls product categories", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(prisma.product.findMany).mockResolvedValue([] as never);
    vi.mocked(prisma.category.findMany).mockResolvedValue([] as never);
    vi.mocked(prisma.categoryContent.findMany).mockResolvedValue([] as never);
    vi.mocked(prisma.categoryContent.findFirst).mockResolvedValue(null as never);
    vi.mocked(prisma.blogs.findMany).mockResolvedValue([] as never);
    vi.mocked(prisma.categories.findMany).mockResolvedValue([] as never);
    vi.mocked(prisma.projects.findMany).mockResolvedValue([] as never);
  });

  it("includes populated categories and subcategories, omitting empty ones", async () => {
    vi.mocked(prisma.product.findMany).mockResolvedValue([
      {
        Slug: "camera-1",
        CategoryContentId: "11, 12",
        Category: { CategoryID: 1, Slug: "camera-category" },
      },
    ] as never);
    vi.mocked(prisma.category.findMany).mockResolvedValue([
      { CategoryID: 1, Slug: "camera-category" },
      { CategoryID: 2, Slug: "empty-category" },
    ] as never);
    vi.mocked(prisma.categoryContent.findMany).mockResolvedValue([
      {
        CategoryContentId: 11,
        CategoryID: 1,
        Slug: "populated-subcategory",
        Category: { Slug: "camera-category" },
      },
      {
        CategoryContentId: 12,
        CategoryID: 1,
        Slug: "also-populated",
        Category: { Slug: "camera-category" },
      },
      {
        CategoryContentId: 13,
        CategoryID: 1,
        Slug: "empty-subcategory",
        Category: { Slug: "camera-category" },
      },
      {
        CategoryContentId: 14,
        CategoryID: 2,
        Slug: "subcategory-under-empty-category",
        Category: { Slug: "empty-category" },
      },
    ] as never);
    vi.mocked(prisma.categoryContent.findFirst).mockResolvedValue({
      Slug: "populated-subcategory",
    } as never);

    const { urls } = await getSitemapUrls();

    expect(urls).toContain("https://farabak.net/products/camera-category");
    expect(urls).toContain("https://farabak.net/products/camera-category/populated-subcategory");
    expect(urls).toContain("https://farabak.net/products/camera-category/also-populated");
    expect(urls).not.toContain("https://farabak.net/products/empty-category");
    expect(urls).not.toContain("https://farabak.net/products/camera-category/empty-subcategory");
    expect(urls).not.toContain(
      "https://farabak.net/products/empty-category/subcategory-under-empty-category"
    );
    expect(urls).toContain(
      "https://farabak.net/products/camera-category/populated-subcategory/camera-1"
    );
    expect(prisma.product.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { Available: true } })
    );
  });

  it("omits all product categories and subcategories when there are no available products", async () => {
    vi.mocked(prisma.category.findMany).mockResolvedValue([
      { CategoryID: 1, Slug: "conference-hall" },
    ] as never);
    vi.mocked(prisma.categoryContent.findMany).mockResolvedValue([
      {
        CategoryContentId: 21,
        CategoryID: 1,
        Slug: "led-wall",
        Category: { Slug: "conference-hall" },
      },
      {
        CategoryContentId: 22,
        CategoryID: 1,
        Slug: "conference-system",
        Category: { Slug: "conference-hall" },
      },
    ] as never);

    const { urls } = await getSitemapUrls();

    expect(urls).not.toContain("https://farabak.net/products/conference-hall");
    expect(urls).not.toContain("https://farabak.net/products/conference-hall/led-wall");
    expect(urls).not.toContain("https://farabak.net/products/conference-hall/conference-system");
  });
});
