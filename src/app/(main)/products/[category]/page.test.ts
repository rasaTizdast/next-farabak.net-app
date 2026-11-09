import { beforeEach, describe, expect, it, vi } from "vitest";

const { getProductsByCategory } = vi.hoisted(() => ({
  getProductsByCategory: vi.fn(),
}));

vi.mock("@/lib/data/products", () => ({
  getProductsByCategory,
  getCategoryName: vi.fn(),
  getSubCategoryName: vi.fn(),
}));

import CategoryPage, { generateMetadata } from "./page";

describe("category metadata", () => {
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_BASE_URL", "https://farabak.net");
    getProductsByCategory.mockReset();
  });

  it("keeps a populated category indexable when its SEO record is missing", async () => {
    getProductsByCategory.mockResolvedValue({
      data: [{ ProductId: 1 }],
      pagination: {
        totalCount: 8,
        currentPage: 1,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false,
      },
      seoDetails: null,
    });

    const metadata = await generateMetadata({
      params: Promise.resolve({ category: "x-ray" }),
    });

    expect(metadata.robots).toMatchObject({ index: true, follow: true });
    expect(metadata.title).toBe("محصولات دسته‌بندی x-ray");
    expect(metadata.description).toBe("محصولات دسته‌بندی x-ray");
    expect(metadata.alternates?.canonical).toBe("https://farabak.net/products/x-ray");
  });

  it("returns 404 metadata for a missing product feed", async () => {
    getProductsByCategory.mockResolvedValue(null);

    await expect(
      generateMetadata({ params: Promise.resolve({ category: "unknown-category" }) })
    ).rejects.toThrow("NEXT_HTTP_ERROR_FALLBACK;404");

    expect(getProductsByCategory).toHaveBeenCalledWith("unknown-category", { page: 1, limit: 30 });
  });

  it("calls notFound before rendering when the category feed is missing", async () => {
    getProductsByCategory.mockResolvedValue(null);

    await expect(
      CategoryPage({ params: Promise.resolve({ category: "unknown-category" }) })
    ).rejects.toThrow();
  });

  it("propagates a temporary data failure instead of emitting noindex metadata", async () => {
    getProductsByCategory.mockRejectedValue(new Error("database unavailable"));

    await expect(
      generateMetadata({ params: Promise.resolve({ category: "x-ray" }) })
    ).rejects.toThrow("database unavailable");
  });
});
