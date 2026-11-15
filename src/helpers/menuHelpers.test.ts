import { Prisma } from "@prisma/client";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { fetchMenuCategories } from "@/helpers/menuHelpers";
import { prisma } from "@/lib/prisma";

vi.mock("@/lib/prisma", () => ({
  prisma: { category: { findMany: vi.fn() } },
}));

describe("fetchMenuCategories", () => {
  beforeEach(() => {
    vi.mocked(prisma.category.findMany).mockReset();
  });

  it("serves an empty menu for a connection failure and retries on the next call", async () => {
    vi.mocked(prisma.category.findMany).mockRejectedValueOnce(
      new Prisma.PrismaClientInitializationError("Can't reach database server", "test", "P1001")
    );
    expect(await fetchMenuCategories()).toEqual([]);

    vi.mocked(prisma.category.findMany).mockResolvedValueOnce([]);
    expect(await fetchMenuCategories()).toEqual([]);
    expect(prisma.category.findMany).toHaveBeenCalledTimes(2);
  });

  it("surfaces an unexpected query error", async () => {
    vi.mocked(prisma.category.findMany).mockRejectedValueOnce(new Error("invalid category query"));
    await expect(fetchMenuCategories()).rejects.toThrow("invalid category query");
  });

  it("returns only available subcategories and filters them in the database query", async () => {
    vi.mocked(prisma.category.findMany).mockResolvedValueOnce([
      {
        CategoryID: 5,
        Name: "Industrial CCTV",
        Available: true,
        Slug: "industrial-cctv-camera",
        CategoryContent: [
          {
            CategoryContentId: 23,
            Name: "Black Wonder",
            CategoryID: 5,
            Slug: "black-wonder",
            Available: true,
          },
          {
            CategoryContentId: 24,
            Name: "Explosion Proof",
            CategoryID: 5,
            Slug: "explosion-proof-cctv-camera",
            Available: false,
          },
        ],
      },
    ] as never);

    const categories = await fetchMenuCategories();

    expect(prisma.category.findMany).toHaveBeenCalledWith({
      orderBy: { CategoryID: "asc" },
      include: { CategoryContent: { where: { Available: true } } },
    });
    expect(categories).toMatchObject([
      {
        Slug: "industrial-cctv-camera",
        Subcategories: [{ Slug: "black-wonder", Available: true }],
      },
    ]);
    expect(JSON.stringify(categories)).not.toContain("explosion-proof-cctv-camera");
  });
});
