import { beforeEach, describe, expect, it, vi } from "vitest";

const { getProductsBySubcategory } = vi.hoisted(() => ({
  getProductsBySubcategory: vi.fn(),
}));

vi.mock("@/lib/data/catalog-static-params", () => ({
  getCatalogStaticParams: async () => ({
    subcategories: [
      { category: "reolink-cctv-camera", subcategory: "bullet" },
      { category: "blackmagic", subcategory: "disk-recorder" },
    ],
  }),
}));

vi.mock("@/lib/data/products", () => ({
  getProductsBySubcategory,
  getCategoryName: vi.fn(),
  getSubCategoryName: vi.fn(),
}));

import SubcategoryPage, { generateMetadata, generateStaticParams } from "./page";

describe("subcategory metadata", () => {
  it("prerenders subcategories without assuming sibling pages supply parent params", async () => {
    await expect(generateStaticParams({ params: {} } as never)).resolves.toEqual([
      { category: "reolink-cctv-camera", subcategory: "bullet" },
      { category: "blackmagic", subcategory: "disk-recorder" },
    ]);
  });
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_BASE_URL", "https://farabak.net");
    getProductsBySubcategory.mockReset();
  });

  it("keeps a populated subcategory indexable when its SEO record is missing", async () => {
    getProductsBySubcategory.mockResolvedValue({
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
      params: Promise.resolve({ category: "x-ray", subcategory: "vehicle-truck" }),
    });

    expect(metadata.robots).toMatchObject({ index: true, follow: true });
    expect(metadata.title).toBe("محصولات دسته‌بندی vehicle-truck | فرابک");
    expect(metadata.alternates?.canonical).toBe("https://farabak.net/products/x-ray/vehicle-truck");
  });

  it("returns 404 metadata for a missing product feed", async () => {
    getProductsBySubcategory.mockResolvedValue(null);

    await expect(
      generateMetadata({
        params: Promise.resolve({ category: "conference-hall", subcategory: "led-wall" }),
      })
    ).rejects.toThrow("NEXT_HTTP_ERROR_FALLBACK;404");

    expect(getProductsBySubcategory).toHaveBeenCalledWith(
      "led-wall",
      { page: 1, limit: 30 },
      "conference-hall"
    );
  });

  it("calls notFound before rendering when the subcategory feed is missing", async () => {
    getProductsBySubcategory.mockResolvedValue(null);

    await expect(
      SubcategoryPage({
        params: Promise.resolve({ category: "conference-hall", subcategory: "led-wall" }),
      })
    ).rejects.toThrow();
  });

  it("propagates a temporary data failure instead of emitting noindex metadata", async () => {
    getProductsBySubcategory.mockRejectedValue(new Error("database unavailable"));

    await expect(
      generateMetadata({
        params: Promise.resolve({ category: "x-ray", subcategory: "vehicle-truck" }),
      })
    ).rejects.toThrow("database unavailable");
  });
});
