import { NextRequest } from "next/server";
import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

const {
  hasBlogCategoryPage,
  hasProductDetailPage,
  hasProductListingPage,
  resolveProductDetailPage,
} = vi.hoisted(() => ({
  hasBlogCategoryPage: vi.fn(),
  hasProductDetailPage: vi.fn(),
  hasProductListingPage: vi.fn(),
  resolveProductDetailPage: vi.fn(),
}));

vi.mock("@/lib/data/blog-page-validation", () => ({ hasBlogCategoryPage }));

vi.mock("@/lib/data/product-page-validation", () => ({
  hasProductDetailPage,
  hasProductListingPage,
  resolveProductDetailPage,
}));

let proxy: typeof import("./proxy").proxy;

beforeAll(async () => {
  vi.stubEnv("JWT_SECRET", "test-secret");
  vi.stubEnv("REFRESH_TOKEN_SECRET", "test-refresh-secret");
  ({ proxy } = await import("./proxy"));
});

beforeEach(() => {
  hasProductDetailPage.mockReset().mockResolvedValue(true);
  hasProductListingPage.mockReset().mockResolvedValue(true);
  resolveProductDetailPage.mockReset().mockResolvedValue({
    canonicalPath: "/products/x-ray/airport-luggage/ctx-5800",
    shouldRedirect: false,
  });
});

describe("canonical URL redirects", () => {
  it("permanently redirects the retired industrial category to its confirmed replacement", async () => {
    const response = await proxy(
      new NextRequest(
        "https://farabak.net/products/industrial-cctv-camera/explosion-proof-cctv-camera"
      )
    );

    expect(response.status).toBe(308);
    expect(response.headers.get("Location")).toBe(
      "https://farabak.net/products/industrial-cctv-camera/black-wonder"
    );
  });

  it.each([
    [
      "https://www.farabak.net/products?sort=recent&page=2",
      "https://farabak.net/products?sort=recent&page=2",
    ],
    [
      "https://www.farabak.net/products?page=1&sort=recent",
      "https://farabak.net/products?sort=recent",
    ],
    [
      "https://www.farabak.net/products/page/1?sort=recent",
      "https://farabak.net/products?sort=recent",
    ],
    [
      "https://www.farabak.net/products/x-ray/page/1?sort=recent",
      "https://farabak.net/products/x-ray?sort=recent",
    ],
    [
      "https://www.farabak.net/products/x-ray/airport-luggage/page/1?sort=recent",
      "https://farabak.net/products/x-ray/airport-luggage?sort=recent",
    ],
    [
      "https://www.farabak.net/products/x-ray/airport-luggage/ctx-9800?campaign=legacy",
      "https://farabak.net/products/x-ray/airport-luggage/ctx-9800-dsi?campaign=legacy",
    ],
    ["https://farabak.net/products/page/1?sort=recent", "https://farabak.net/products?sort=recent"],
  ])("redirects %s directly to %s", async (url, destination) => {
    const response = await proxy(new NextRequest(url));

    expect(response.status).toBe(308);
    expect(response.headers.get("Location")).toBe(destination);
  });

  it("uses the forwarded public host when the app server receives an internal URL", async () => {
    const request = new NextRequest("http://127.0.0.1:3000/products?sort=recent&page=2", {
      headers: { "x-forwarded-host": "www.farabak.net:443" },
    });
    const response = await proxy(request);

    expect(response.status).toBe(308);
    expect(response.headers.get("Location")).toBe(
      "https://farabak.net/products?sort=recent&page=2"
    );
  });

  it.each([
    "http://farabak.net/",
    "http://farabak.net/products/x-ray",
    "http://farabak.net/products/x-ray/airport-luggage/ctx-5800",
    "http://farabak.net/support/blog/x-ray/what-is-x-ray-inspection",
  ])("redirects the HTTP %s request directly to HTTPS", async (url) => {
    const response = await proxy(new NextRequest(url));

    expect(response.status).toBe(308);
    expect(response.headers.get("Location")).toBe(url.replace(/^http:/, "https:"));
  });

  it("redirects the verified global page-two query to its clean slice route", async () => {
    const response = await proxy(new NextRequest("https://farabak.net/products?page=2"));

    expect(response.status).toBe(308);
    expect(response.headers.get("Location")).toBe("https://farabak.net/products/page/2");
  });

  it("normalizes the verified category page-two query without collapsing the clean page-two route", async () => {
    const queryResponse = await proxy(new NextRequest("https://farabak.net/products/x-ray?page=2"));
    const cleanResponse = await proxy(new NextRequest("https://farabak.net/products/x-ray/page/2"));

    expect(queryResponse.status).toBe(308);
    expect(queryResponse.headers.get("Location")).toBe("https://farabak.net/products/x-ray");
    expect(cleanResponse.headers.get("x-middleware-next")).toBe("1");
  });

  it("keeps an unverified page-one path as a real 404", async () => {
    hasProductListingPage.mockResolvedValue(false);
    const response = await proxy(
      new NextRequest("https://farabak.net/products/unlisted-category/page/1")
    );

    expect(response.headers.get("x-middleware-rewrite")).toBe(
      "https://farabak.net/_product-listing-not-found"
    );
  });

  it("does not normalize page queries for unverified listing routes", async () => {
    hasProductListingPage.mockResolvedValueOnce(false);
    const queryResponse = await proxy(
      new NextRequest("https://farabak.net/products/unlisted-category?page=1")
    );
    const pageTwoResponse = await proxy(
      new NextRequest("https://farabak.net/products/blackmagic?page=2")
    );

    expect(queryResponse.headers.get("x-middleware-rewrite")).toBe(
      "https://farabak.net/_product-listing-not-found"
    );
    expect(pageTwoResponse.headers.get("x-middleware-next")).toBe("1");
  });

  it("validates a subcategory page against its category path", async () => {
    const response = await proxy(new NextRequest("https://farabak.net/products/x-ray/wifi"));

    expect(hasProductListingPage).toHaveBeenCalledWith({
      type: "subcategory",
      category: "x-ray",
      subcategory: "wifi",
      page: 1,
    });
    expect(response.headers.get("x-middleware-next")).toBe("1");
  });

  it("redirects an audited image alias only on the primary host", async () => {
    const path = "/productImages/ctx-5800/ctx-5800.png?campaign=legacy";
    const primaryResponse = await proxy(new NextRequest(`https://farabak.net${path}`));
    const otherHostResponse = await proxy(new NextRequest(`https://example.test${path}`));

    expect(primaryResponse.status).toBe(308);
    expect(primaryResponse.headers.get("Location")).toBe(
      "https://s3.farabak.net/productImages/ctx-5800/ctx-5800.png"
    );
    expect(otherHostResponse.headers.get("x-middleware-next")).toBe("1");
  });
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
    resolveProductDetailPage.mockResolvedValue(null);
    const request = new NextRequest(
      "https://farabak.net/products/x-ray/airport-luggage/missing-model"
    );
    const response = await proxy(request);

    expect(resolveProductDetailPage).toHaveBeenCalledWith({
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
    resolveProductDetailPage.mockResolvedValue({
      canonicalPath: "/products/reolink-cctv-camera/night-vision/Argus-2",
      shouldRedirect: false,
    });
    const request = new NextRequest(
      "https://farabak.net/products/reolink-cctv-camera/night-vision/Argus-2"
    );
    const response = await proxy(request);

    expect(resolveProductDetailPage).toHaveBeenCalledWith({
      type: "product",
      category: "reolink-cctv-camera",
      subcategory: "night-vision",
      product: "Argus-2",
      key: null,
    });
    expect(response.headers.get("x-middleware-next")).toBe("1");
  });

  it("redirects a verified secondary product route to the catalog primary route", async () => {
    resolveProductDetailPage.mockResolvedValue({
      canonicalPath: "/products/reolink-cctv-camera/night-vision/Argus-2",
      shouldRedirect: true,
    });

    const response = await proxy(
      new NextRequest(
        "https://farabak.net/products/reolink-cctv-camera/wifi/Argus-2?campaign=old&key=secret"
      )
    );

    expect(response.status).toBe(308);
    expect(response.headers.get("Location")).toBe(
      "https://farabak.net/products/reolink-cctv-camera/night-vision/Argus-2?campaign=old"
    );
  });

  it("redirects a case-only product alias to the stored slug spelling", async () => {
    resolveProductDetailPage.mockResolvedValue({
      canonicalPath: "/products/industrial-cctv-camera/thermal-cctv-camera/FTX-1932-Z",
      shouldRedirect: true,
    });

    const response = await proxy(
      new NextRequest(
        "https://farabak.net/products/industrial-cctv-camera/thermal-cctv-camera/ftx-1932-z"
      )
    );

    expect(response.status).toBe(308);
    expect(response.headers.get("Location")).toBe(
      "https://farabak.net/products/industrial-cctv-camera/thermal-cctv-camera/FTX-1932-Z"
    );
  });

  it("keeps the retired EXB-2323-S436 product route at 404", async () => {
    resolveProductDetailPage.mockResolvedValue(null);
    const request = new NextRequest(
      "https://farabak.net/products/industrial-cctv-camera/explosion-proof-cctv-camera/EXB-2323-S436"
    );
    const response = await proxy(request);

    expect(response.headers.get("x-middleware-rewrite")).toBe(
      "https://farabak.net/_product-listing-not-found"
    );
  });
});

describe("blog category 404 handling", () => {
  it("returns a real 404 for an empty blog category before the route starts streaming", async () => {
    hasBlogCategoryPage.mockResolvedValue(false);
    const request = new NextRequest("https://farabak.net/support/blog/installing");

    const response = await proxy(request);

    expect(hasBlogCategoryPage).toHaveBeenCalledWith("installing");
    expect(response.headers.get("x-middleware-rewrite")).toBe(
      "https://farabak.net/_product-listing-not-found"
    );
    expect(response.headers.get("Cache-Control")).toBe("no-store");
  });

  it("continues to the category route when published posts exist", async () => {
    hasBlogCategoryPage.mockResolvedValue(true);
    const request = new NextRequest("https://farabak.net/support/blog/x-ray");

    const response = await proxy(request);

    expect(hasBlogCategoryPage).toHaveBeenCalledWith("x-ray");
    expect(response.headers.get("x-middleware-next")).toBe("1");
  });
});
