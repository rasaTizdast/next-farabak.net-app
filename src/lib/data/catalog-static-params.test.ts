import { describe, expect, it, vi } from "vitest";

vi.mock("./sitemap", () => ({
  getSitemapUrls: async () => ({
    urls: [
      "https://farabak.net/support/blog/percent%off",
      "https://farabak.net/products/reolink-cctv-camera",
      "https://farabak.net/products/reolink-cctv-camera/bullet",
      "https://farabak.net/products/reolink-cctv-camera/bullet/B400",
      "https://farabak.net/products/reolink-cctv-camera/bullet/B400",
      "https://example.com/products/other/models/not-ours",
      "https://farabak.net/products/other/models/has?query",
      "https://farabak.net/products/other/models/has#fragment",
      "https://farabak.net/products/other/models/invalid%model",
      "not a URL",
    ],
  }),
}));

import { getCatalogStaticParams } from "./catalog-static-params";

describe("public catalog prerender paths", () => {
  it("keeps public catalog routes when unrelated or malformed sitemap rows cannot be decoded", async () => {
    await expect(getCatalogStaticParams()).resolves.toEqual({
      categories: [{ category: "reolink-cctv-camera" }],
      subcategories: [{ category: "reolink-cctv-camera", subcategory: "bullet" }],
      products: [{ category: "reolink-cctv-camera", subcategory: "bullet", product: "B400" }],
    });
  });
});
