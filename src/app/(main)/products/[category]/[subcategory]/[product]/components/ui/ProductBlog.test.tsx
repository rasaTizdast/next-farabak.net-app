import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/script", () => ({ default: () => null }));

import ProductBlog from "./ProductBlog";

describe("ProductBlog heading hierarchy", () => {
  it("removes a duplicate product title and demotes editorial H1s", () => {
    const html = renderToStaticMarkup(
      <ProductBlog
        pageTitle="راهنمای انتخاب دستگاه"
        productBlog={
          "<h1><strong>راهنمای انتخاب</strong>&nbsp; دستگاه</h1><h1>مدل دوربین</h1><h2>مشخصات</h2>"
        }
      />
    );

    expect(html).not.toMatch(/<h1\b/);
    expect(html).not.toContain("راهنمای انتخاب</strong>&nbsp; دستگاه");
    expect(html).toContain("<h2>مدل دوربین</h2>");
    expect(html).toContain("<h2>مشخصات</h2>");
  });
});
