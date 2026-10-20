import { beforeEach, describe, expect, it, vi } from "vitest";

import { getHomepageData } from "@/lib/data/homepage";
import { getProjects } from "@/lib/data/projects";
import { prisma } from "@/lib/prisma";

vi.mock("@/lib/data/projects", () => ({ getProjects: vi.fn() }));
vi.mock("@/lib/prisma", () => ({
  prisma: { showcase_products: { findMany: vi.fn() }, blogs: { findMany: vi.fn() } },
}));

type CardRecord = {
  id: number;
  title: string;
  slug: string;
  image_URL: string;
  image_alt: string;
  created_at: string | null;
  SEO_description: string;
  BlogCategories: { Categories: { name: string | null; slug: string | null } }[];
};

function article(id: number, title: string, category: string | null, date: string): CardRecord {
  return {
    id,
    title,
    slug: `article-${id}`,
    image_URL: `/images/article-${id}.webp`,
    image_alt: `تصویر مقاله ${id}`,
    created_at: date,
    SEO_description: `توضیح مقاله ${id}`,
    BlogCategories: [{ Categories: { name: category, slug: category } }],
  };
}

function feed(records: CardRecord[]) {
  vi.mocked(prisma.blogs.findMany).mockResolvedValueOnce(records as never);
}

describe("homepage editorial feed", () => {
  beforeEach(() => {
    vi.mocked(getProjects).mockResolvedValue([]);
    vi.mocked(prisma.showcase_products.findMany).mockResolvedValue([]);
  });

  it("queries only published non-QR card fields and chooses one newest story per priority topic", async () => {
    feed([
      article(1, "راهنمای عمومی", "general", "2026-10-20T10:00:00.000Z"),
      article(2, "Reolink", "camera", "2026-10-19T10:00:00.000Z"),
      article(3, "Blackmagic", "cinema", "2026-10-18T10:00:00.000Z"),
      article(4, "X-ray", "inspection", "2026-10-17T10:00:00.000Z"),
      article(5, "X-ray older", "inspection", "2026-10-16T10:00:00.000Z"),
    ]);

    const result = await getHomepageData();
    expect(result.blogFeedStatus).toBe("ready");
    expect(result.blogs.map((blog) => blog.id)).toEqual([4, 3, 2]);
    expect(result.blogs.map((blog) => blog.topic)).toEqual(["xray", "blackmagic", "cctv"]);
    expect(prisma.blogs.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: { status: "Published", QrCode_key: null }, take: 120 })
    );
    const selected = vi.mocked(prisma.blogs.findMany).mock.calls.at(-1)?.[0]?.select;
    expect(selected).toMatchObject({ title: true, slug: true, image_URL: true });
    expect(selected).not.toHaveProperty("content");
    expect(selected).not.toHaveProperty("Comments");
    expect(selected).not.toHaveProperty("Likes");
  });

  it("requires safe article and category slugs; falls back to newer general articles", async () => {
    feed([
      article(1, "X-ray", null, "2026-10-20T10:00:00.000Z"),
      { ...article(2, "Blackmagic", "cinema", "2026-10-19T10:00:00.000Z"), slug: "../bad" },
      article(3, "Reolink", "camera", "2026-10-18T10:00:00.000Z"),
      article(4, "عمومی", "general", "2026-10-17T10:00:00.000Z"),
    ]);
    const result = await getHomepageData();
    expect(result.blogs.map((blog) => blog.id)).toEqual([3, 4]);
    expect(result.blogs[0]?.href).toBe("/support/blog/camera/article-3");
  });

  it("keeps a valid text card when image and date are invalid", async () => {
    feed([
      {
        ...article(1, "راهنما", "general", "not-a-date"),
        image_URL: "javascript:bad",
        image_alt: "bad",
      },
    ]);
    const result = await getHomepageData();
    expect(result.blogs[0]).toMatchObject({ image: null, imageAlt: null, date: null });
    expect(result.blogs[0]?.href).toBe("/support/blog/general/article-1");
  });

  it("distinguishes an empty feed from failure without losing independent feeds", async () => {
    feed([]);
    expect(await getHomepageData()).toMatchObject({ blogs: [], blogFeedStatus: "ready" });

    vi.mocked(prisma.blogs.findMany).mockRejectedValueOnce(new Error("blog database down"));
    vi.mocked(prisma.showcase_products.findMany).mockResolvedValueOnce([
      {
        id: 9,
        title: "محصول",
        description: "شرح",
        order: 1,
        image: "/images/product.webp",
        link: "/products",
      },
    ]);
    const failed = await getHomepageData();
    expect(failed.blogs).toEqual([]);
    expect(failed.blogFeedStatus).toBe("unavailable");
    expect(failed.products).toHaveLength(1);
    expect(failed.publishedProjectCount).toBe(0);
  });
});
