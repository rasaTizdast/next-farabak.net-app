import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { addArticleHeadingAnchors, extractArticleHeadings } from "./blog-helpers";
import BlogCategoryNav from "./BlogCategoryNav";

describe("blog article helpers", () => {
  it("extracts a readable table of contents from article headings", () => {
    expect(extractArticleHeadings("<h2>راهنمای انتخاب</h2><p>متن</p><h3>نکته اول</h3>")).toEqual([
      { id: "section-1", level: 2, text: "راهنمای انتخاب" },
      { id: "section-2", level: 3, text: "نکته اول" },
    ]);
  });

  it("adds stable anchors while preserving heading content", () => {
    expect(addArticleHeadingAnchors('<h2 class="title">راهنمای انتخاب</h2>')).toBe(
      '<h2 class="title" id="section-1">راهنمای انتخاب</h2>'
    );
  });

  it("marks the active category for assistive technology", () => {
    const { container } = render(
      <BlogCategoryNav
        currentSlug="cameras"
        categories={[{ id: 1, name: "دوربین", slug: "cameras" }]}
      />
    );

    expect(container.querySelector('[aria-current="page"]')).toHaveTextContent("دوربین");
  });
});
