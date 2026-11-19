import { beforeEach, describe, expect, it, vi } from "vitest";

const { getProductsByCategoryMock } = vi.hoisted(() => ({
  getProductsByCategoryMock: vi.fn(),
}));

vi.mock("@/lib/data/products", () => ({
  getProductsByCategory: getProductsByCategoryMock,
  getCategoryName: vi.fn(),
}));
vi.mock("@/lib/data/usd2rial", () => ({ getUsdToRialRate: vi.fn() }));

import { generateMetadata } from "./page";
import { metadata as productNotFoundMetadata } from "../../../not-found";

describe("category pagination 404", () => {
  beforeEach(() => {
    getProductsByCategoryMock.mockReset();
  });

  it("keeps an out-of-range category page at 404 with error-specific metadata", async () => {
    getProductsByCategoryMock.mockResolvedValue(null);

    await expect(
      generateMetadata({
        params: Promise.resolve({ category: "x-ray", pageNumber: "99" }),
      })
    ).rejects.toThrow("NEXT_HTTP_ERROR_FALLBACK;404");

    expect(productNotFoundMetadata.alternates?.canonical).toBeNull();
    expect(productNotFoundMetadata.robots).toMatchObject({
      index: false,
      follow: true,
      googleBot: { index: false, follow: true },
    });
  });
});
