import { beforeEach, describe, expect, it, vi } from "vitest";

import { getBlogCategories } from "@/lib/data/blogCategories";
import { prisma } from "@/lib/prisma";

vi.mock("@/lib/prisma", () => ({
  prisma: { categories: { findMany: vi.fn() } },
}));

describe("blog categories", () => {
  beforeEach(() => {
    vi.mocked(prisma.categories.findMany).mockReset();
  });

  it("requests categories with a published public blog and returns them unchanged", async () => {
    const categories = [{ id: 1, name: "Guides", slug: "guides" }];
    vi.mocked(prisma.categories.findMany).mockResolvedValue(categories as never);

    await expect(getBlogCategories()).resolves.toBe(categories);
    expect(prisma.categories.findMany).toHaveBeenCalledWith({
      where: {
        BlogCategories: {
          some: {
            Blogs: { status: "Published", QrCode_key: null },
          },
        },
      },
    });
  });
});
