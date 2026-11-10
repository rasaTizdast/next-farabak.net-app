import { NextRequest } from "next/server";
import { beforeAll, describe, expect, it, vi } from "vitest";

const { hasProductDetailPage } = vi.hoisted(() => ({ hasProductDetailPage: vi.fn() }));

vi.mock("@/lib/data/product-page-validation", () => ({
  hasProductDetailPage,
  hasProductListingPage: vi.fn(),
}));

let proxy: typeof import("./proxy").proxy;

beforeAll(async () => {
  vi.stubEnv("JWT_SECRET", "test-secret");
  vi.stubEnv("REFRESH_TOKEN_SECRET", "test-refresh-secret");
  ({ proxy } = await import("./proxy"));
});

describe("product route 404 handling", () => {
  it.each(["GET", "HEAD"])(
    "rewrites an invalid product page to the App Router's unmatched route for %s",
    async (method) => {
      const request = new NextRequest("https://farabak.net/products?page=0", { method });
      const response = await proxy(request);

      expect(response.headers.get("x-middleware-rewrite")).toBe(
        "https://farabak.net/_product-listing-not-found"
      );
      expect(response.headers.get("Cache-Control")).toBe("no-store");
      expect(response.body).toBeNull();
    }
  );

  it("lets the product segment handle a client navigation", async () => {
    const request = new NextRequest("https://farabak.net/products?page=0", {
      headers: { RSC: "1" },
    });
    const response = await proxy(request);

    expect(response.headers.get("x-middleware-next")).toBe("1");
  });

  it("returns a permanent redirect from the query-based page-one URL", async () => {
    const request = new NextRequest("https://farabak.net/products?page=1&sort=featured");
    const response = await proxy(request);

    expect(response.status).toBe(308);
    expect(response.headers.get("Location")).toBe("https://farabak.net/products?sort=featured");
  });

  it("rewrites a genuinely missing streamed product detail to the native not-found route", async () => {
    hasProductDetailPage.mockResolvedValue(false);
    const request = new NextRequest(
      "https://farabak.net/products/x-ray/airport-luggage/missing-model"
    );
    const response = await proxy(request);

    expect(hasProductDetailPage).toHaveBeenCalledWith({
      type: "product",
      category: "x-ray",
      subcategory: "airport-luggage",
      product: "missing-model",
      key: null,
    });
    expect(response.headers.get("x-middleware-rewrite")).toBe(
      "https://farabak.net/_product-listing-not-found"
    );
    expect(response.headers.get("Cache-Control")).toBe("no-store");
  });

  it("keeps valid secondary-membership product paths available", async () => {
    hasProductDetailPage.mockResolvedValue(true);
    const request = new NextRequest(
      "https://farabak.net/products/reolink-cctv-camera/wifi/Argus-2"
    );
    const response = await proxy(request);

    expect(hasProductDetailPage).toHaveBeenCalledWith({
      type: "product",
      category: "reolink-cctv-camera",
      subcategory: "wifi",
      product: "Argus-2",
      key: null,
    });
    expect(response.headers.get("x-middleware-next")).toBe("1");
  });
});
