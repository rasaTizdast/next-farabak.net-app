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

describe("global product pagination metadata", () => {
  beforeEach(() => {
    vi.stubEnv("NEXT_PUBLIC_BASE_URL", "https://farabak.net");
    getAllProducts.mockReset();
  });

  it("returns 404 metadata when an out-of-range page has no data", async () => {
    getAllProducts.mockResolvedValue(null);

    await expect(
      generateMetadata({ params: Promise.resolve({ pageNumber: "999" }) })
    ).rejects.toThrow("NEXT_HTTP_ERROR_FALLBACK;404");

    expect(getAllProducts).toHaveBeenCalledWith({ page: 999, limit: 30 });
  });

  it("does not turn a temporary data error into a noindex directive", async () => {
    getAllProducts.mockRejectedValue(new Error("temporary database error"));

    const metadata = await generateMetadata({
      params: Promise.resolve({ pageNumber: "2" }),
    });

    expect(metadata.robots).toMatchObject({ index: true, follow: true });
    expect(metadata.alternates?.canonical).toBe("https://farabak.net/products/page/2");
    expect(metadata.openGraph?.images).toEqual(["/opengraph-image.webp"]);
  });
});
