import { beforeEach, describe, expect, it, vi } from "vitest";

const { getAllProducts } = vi.hoisted(() => ({
  getAllProducts: vi.fn(),
}));

vi.mock("@/lib/data/products", () => ({
  getAllProducts,
  getProductsByCategory: vi.fn(),
  getProductsBySubcategory: vi.fn(),
  getProductsBlogContent: vi.fn(),
}));

import { generateMetadata } from "./page";

describe("global product query pagination metadata", () => {
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_BASE_URL", "https://farabak.net");
    getAllProducts.mockReset();
  });

  it.each(["0", ["2", "3"]])("returns 404 metadata for invalid page query %s", async (page) => {
    await expect(generateMetadata({ searchParams: Promise.resolve({ page }) })).rejects.toThrow(
      "NEXT_HTTP_ERROR_FALLBACK;404"
    );
    expect(getAllProducts).not.toHaveBeenCalled();
  });

  it("returns 404 metadata for an out-of-range page", async () => {
    getAllProducts.mockResolvedValue(null);

    await expect(
      generateMetadata({ searchParams: Promise.resolve({ page: "999" }) })
    ).rejects.toThrow("NEXT_HTTP_ERROR_FALLBACK;404");

    expect(getAllProducts).toHaveBeenCalledWith({ page: 999, limit: 30 });
  });

  it("canonicalizes valid page two to its path route", async () => {
    getAllProducts.mockResolvedValue({ data: [], pagination: { totalPages: 2 } });

    const metadata = await generateMetadata({
      searchParams: Promise.resolve({ page: "2" }),
    });

    expect(metadata.robots).toMatchObject({ index: true, follow: true });
    expect(metadata.alternates?.canonical).toBe("https://farabak.net/products/page/2");
    expect(metadata.openGraph?.images).toEqual(["/opengraph-image.webp"]);
  });
});
