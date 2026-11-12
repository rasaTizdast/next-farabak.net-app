import { describe, expect, it, vi } from "vitest";

const { countMock } = vi.hoisted(() => ({
  countMock: vi.fn(),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: { blogs: { count: countMock } },
}));

import { hasBlogCategoryPage } from "./blog-page-validation";

describe("hasBlogCategoryPage", () => {
  it("checks for published public posts assigned to the category", async () => {
    countMock.mockResolvedValue(1);

    await expect(hasBlogCategoryPage("x-ray")).resolves.toBe(true);
    expect(countMock).toHaveBeenCalledWith({
      where: {
        status: "Published",
        QrCode_key: null,
        BlogCategories: { some: { Categories: { slug: "x-ray" } } },
      },
    });
  });

  it("returns false when the category has no published public posts", async () => {
    countMock.mockResolvedValue(0);

    await expect(hasBlogCategoryPage("installing")).resolves.toBe(false);
  });
});
