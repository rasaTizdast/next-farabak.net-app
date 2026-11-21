import { isValidElement, Suspense, type ReactNode } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import { GridContentServer } from "./GridContentServer";
import ProductGrid from "./ProductGrid";

vi.mock("@/lib/data/products", () => ({
  getProductsBlogContent: vi.fn(() => new Promise(() => {})),
}));
vi.mock("./GridContentServer", () => ({
  GridContentServer: () => <div data-product-grid="server-rendered" />,
}));

const feed = {
  data: [],
  pagination: {
    totalCount: 1,
    currentPage: 1,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  },
};

function isGridUnderSuspense(element: unknown, insideSuspense = false): boolean | null {
  if (Array.isArray(element)) {
    for (const child of element) {
      const found = isGridUnderSuspense(child, insideSuspense);
      if (found !== null) return found;
    }
    return null;
  }
  if (!isValidElement<{ children?: ReactNode }>(element)) return null;

  const nextInsideSuspense = insideSuspense || element.type === Suspense;
  if (element.type === GridContentServer) return nextInsideSuspense;

  return isGridUnderSuspense(element.props.children, nextInsideSuspense);
}

describe("ProductGrid initial HTML", () => {
  it("renders the grid in the initial markup outside Suspense fallbacks", async () => {
    const grid = await ProductGrid({
      title: "دوربین مداربسته رئولینک Reolink",
      feed,
      currentPage: 1,
      categorySlug: "reolink-cctv-camera",
      usdRate: null,
    });
    const html = renderToStaticMarkup(grid);

    expect(html).toMatch(/<h1\b/i);
    expect(html).toContain('data-product-grid="server-rendered"');
    expect(isGridUnderSuspense(grid)).toBe(false);
  });

  it("places category navigation after the compact page intro and before the guide", async () => {
    const grid = await ProductGrid({
      title: "دوربین مداربسته رئولینک Reolink",
      feed,
      currentPage: 1,
      categorySlug: "reolink-cctv-camera",
      usdRate: null,
      introAddon: <nav data-testid="category-selector">زیر دسته‌ها</nav>,
    });
    const html = renderToStaticMarkup(grid);

    expect(html.indexOf("<h1")).toBeLessThan(html.indexOf('data-testid="category-selector"'));
    expect(html).toContain("gap-3 py-4");
    expect(html).toContain('data-testid="category-selector"');
  });
});
