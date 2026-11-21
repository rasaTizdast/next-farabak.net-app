import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import {
  CategoryPageSkeleton,
  ProductListingSkeleton,
  ProductsPageSkeleton,
  SubcategoryPageSkeleton,
} from "./ProductListSkeletons";

describe("product listing loading fallbacks", () => {
  it.each([
    ["category listing", <ProductListingSkeleton key="category" title="دسته‌بندی ایکس‌ری" />],
    ["all products", <ProductsPageSkeleton key="all" />],
  ])("retains a page heading while %s is streaming", (_name, fallback) => {
    const html = renderToStaticMarkup(fallback);

    expect(html).toMatch(/<h1\b/i);
  });

  it("uses a listing-only fallback for subcategory pages", () => {
    const html = renderToStaticMarkup(<SubcategoryPageSkeleton />);

    expect(html).toContain('aria-label="در حال بارگذاری محصولات زیر دسته‌بندی"');
    expect(html).not.toContain("مرور دسته‌بندی‌ها");
    expect(html).not.toContain("مرور زیر دسته‌بندی‌ها");
  });

  it("keeps the category loading order aligned with the rendered page", () => {
    const html = renderToStaticMarkup(<CategoryPageSkeleton />);

    expect(html.indexOf("کاتالوگ تجهیزات فرابک")).toBeLessThan(
      html.indexOf("مرور زیر دسته‌بندی‌ها")
    );
    expect(html).toContain("gap-3 py-4 md:gap-4 md:py-6");
  });
});
