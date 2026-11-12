import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import ProductGrid from "./ProductGrid";

vi.mock("@/lib/data/products", () => ({
  getProductsBlogContent: vi.fn(() => new Promise(() => {})),
}));

describe("ProductGrid intro suspense fallback", () => {
  it("does not add a second heading while the catalog intro is streaming", async () => {
    const html = renderToStaticMarkup(
      await ProductGrid({
        title: "دوربین مداربسته رئولینک Reolink",
        apiUrl:
          "https://farabak.net/api/products/getProductsByCategory/reolink-cctv-camera?page=1&limit=30",
        currentPage: 1,
        categorySlug: "reolink-cctv-camera",
      })
    );

    expect(html).not.toMatch(/<h1\b/i);
  });
});
