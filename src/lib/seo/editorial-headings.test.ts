import { describe, expect, it } from "vitest";

import { normalizeEditorialHeadings } from "./editorial-headings";

describe("normalizeEditorialHeadings", () => {
  it("demotes editorial H1 headings while preserving existing section headings", () => {
    const content =
      '<h1 id="overview">بررسی مدل</h1><h2 id="features">ویژگی‌ها</h2><h3>جزئیات</h3>';

    expect(normalizeEditorialHeadings(content, "مدل دوربین")).toBe(
      '<h2 id="overview">بررسی مدل</h2><h2 id="features">ویژگی‌ها</h2><h3>جزئیات</h3>'
    );
  });

  it("removes an editorial H1 whose visible title duplicates the page title", () => {
    const content =
      '<h1 class="article-title"><strong>راهنمای انتخاب</strong>&nbsp; دستگاه</h1><p>متن مقاله</p>';

    expect(normalizeEditorialHeadings(content, "راهنمای انتخاب دستگاه")).toBe("<p>متن مقاله</p>");
  });
});
