import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { ProductListingSkeleton, ProductsPageSkeleton } from "./ProductListSkeletons";

describe("product listing loading fallbacks", () => {
  it.each([
    ["category listing", <ProductListingSkeleton key="category" title="دسته‌بندی ایکس‌ری" />],
    ["all products", <ProductsPageSkeleton key="all" />],
  ])("does not add a duplicate page heading while %s is streaming", (_name, fallback) => {
    const html = renderToStaticMarkup(fallback);

    expect(html).not.toMatch(/<h1\b/i);
  });
});
