import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import BlogContent from "./BlogContent";

describe("BlogContent listing headings", () => {
  it("keeps Markdown headings below the listing page H1", async () => {
    const content = await BlogContent({ text: "# معرفی محصولات\n\n## ویژگی‌ها" });
    const html = renderToStaticMarkup(content);

    expect(html).not.toMatch(/<h1\b/i);
    expect(html).toContain("<h2>");
  });

  it("demotes legacy HTML H1 headings before rendering listing content", async () => {
    const content = await BlogContent({ html: '<h1 class="title">راهنمای انتخاب</h1>' });
    const html = renderToStaticMarkup(content);

    expect(html).not.toMatch(/<h1\b/i);
    expect(html).toContain('<h2 class="title">راهنمای انتخاب</h2>');
  });
});
