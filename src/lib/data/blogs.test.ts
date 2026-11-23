import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockPrisma, cacheLifeMock, cacheTagMock } = vi.hoisted(() => ({
  mockPrisma: {
    blogs: { findMany: vi.fn(), findUnique: vi.fn() },
    media: { findMany: vi.fn() },
  },
  cacheLifeMock: vi.fn(),
  cacheTagMock: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({ prisma: mockPrisma }));
vi.mock("next/cache", () => ({ cacheLife: cacheLifeMock, cacheTag: cacheTagMock }));

import { getBlogBySlug, getBlogs, getBlogsByCategory } from "./blogs";

const blogRow = {
  id: 1,
  title: "Public article",
  SEO_Title: "Article SEO",
  slug: "public-article",
  created_at: "2025-01-01",
  status: "Published",
  views_count: 12,
  content: "Article body",
  author: "Author",
  SEO_description: "Description",
  image_URL: "article.webp",
  image_alt: "Article image",
  QrCode_key: null,
  QrCode_expiryDays: null,
  BlogCategories: [],
  BlogFAQs: [],
  Comments: [{ id: 91, content: "Legacy comment must stay hidden", created_at: "2024-01-01" }],
  Likes: [],
};

describe("public blog comment projection", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it.each([
    ["list", () => getBlogs()],
    ["category", () => getBlogsByCategory("support")],
  ])("counts only approved public comments in the %s feed", async (_label, query) => {
    mockPrisma.blogs.findMany.mockResolvedValue([{ ...blogRow, _count: { publicComments: 1 } }]);

    const result = await query();

    expect(result.blogs[0].comments).toBe(1);
    const [args] = mockPrisma.blogs.findMany.mock.calls[0];
    expect(args.include).not.toHaveProperty("Comments");
    expect(args.include._count.select.publicComments.where).toEqual({
      status: "APPROVED",
      parentId: null,
    });
  });

  it("returns only approved public rows from the shared detail data function", async () => {
    mockPrisma.blogs.findUnique.mockResolvedValue({
      ...blogRow,
      _count: { publicComments: 2 },
      publicComments: [
        {
          id: 7,
          body: "Approved comment",
          publishedAt: new Date("2025-01-03T12:00:00.000Z"),
          parentId: null,
        },
      ],
    });
    mockPrisma.media.findMany.mockResolvedValue([]);

    const result = await getBlogBySlug("public-article");

    expect(result?.comments).toEqual([
      { id: 7, content: "Approved comment", created_at: "2025-01-03T12:00:00.000Z" },
    ]);
    expect(result?.comments_count).toBe(2);
    expect(JSON.stringify(result)).not.toContain("Legacy comment must stay hidden");
    expect(mockPrisma.blogs.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({
        include: expect.objectContaining({
          publicComments: expect.objectContaining({
            where: { status: "APPROVED", parentId: null },
          }),
          _count: {
            select: {
              publicComments: { where: { status: "APPROVED", parentId: null } },
            },
          },
        }),
      })
    );
  });

  it("keeps approved comments out of the shared data projection for QR-only blogs", async () => {
    mockPrisma.blogs.findUnique.mockResolvedValue({
      ...blogRow,
      QrCode_key: "private-key",
      _count: { publicComments: 2 },
      publicComments: [
        {
          id: 7,
          body: "Approved but private",
          publishedAt: new Date("2025-01-03T12:00:00.000Z"),
          parentId: null,
        },
      ],
    });
    mockPrisma.media.findMany.mockResolvedValue([]);

    const result = await getBlogBySlug("public-article");

    expect(result?.comments).toEqual([]);
    expect(result?.comments_count).toBe(0);
  });
});
