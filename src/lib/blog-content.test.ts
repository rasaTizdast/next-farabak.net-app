import { describe, expect, it } from "vitest";

import {
  BLOG_HTML_MODE_MARKER,
  getBlogEditorMode,
  createBlogContentScopeId,
  extractScopedBlogStyles,
  markBlogContentAsHtml,
  sanitizeBlogMarkup,
  stripBlogEditorModeMarker,
} from "./blog-content";

describe("blog content HTML", () => {
  it("extracts embedded CSS and scopes it to the article, including media rules", () => {
    const result = extractScopedBlogStyles(
      `<style>
        .hero, body { color: #123456; }
        @media (max-width: 600px) { .hero { display: block; } }
        @import url("https://example.test/global.css");
      </style><p>Article text</p>`,
      "blog-content-xray-guide"
    );

    expect(result.content).toBe("<p>Article text</p>");
    expect(result.css).toContain("#blog-content-xray-guide :is(.hero)");
    expect(result.css).toContain("#blog-content-xray-guide {");
    expect(result.css).toContain("@media (max-width: 600px)");
    expect(result.css).not.toContain("@import");
    expect(result.css).not.toMatch(/(?:^|})\s*body\s*\{/);
  });

  it("drops CSS constructs and declarations that could escape the article scope", () => {
    const result = extractScopedBlogStyles(
      `<style>
        @keyframes shared-name { from { opacity: 0; } to { opacity: 1; } }
        .card { animation: shared-name 1s; background: url(javascript:alert(1)); color: red; }
      </style><div class="card">Card</div>`,
      "blog-content-safe"
    );

    expect(result.css).toContain("#blog-content-safe :is(.card)");
    expect(result.css).toContain("color: red");
    expect(result.css).not.toContain("@keyframes");
    expect(result.css).not.toContain("javascript:");
  });

  it("removes executable markup but keeps safe inline styling", () => {
    const safeMarkup = sanitizeBlogMarkup(
      `<p style="color: red" onclick="alert(1)">Safe text</p><script>alert(2)</script><img src="photo.jpg" onerror="alert(3)">`
    );

    expect(safeMarkup).toContain('<p style="color: red">Safe text</p>');
    expect(safeMarkup).toContain('<img src="photo.jpg">');
    expect(safeMarkup).not.toContain("script");
    expect(safeMarkup).not.toContain("onclick");
    expect(safeMarkup).not.toContain("onerror");
  });

  it("creates stable safe scope ids from blog slugs", () => {
    expect(createBlogContentScopeId("x-ray-guide")).toBe("blog-content-x-ray-guide");
    expect(createBlogContentScopeId("/guide <script>")).toBe("blog-content-guide-script");
  });

  it("remembers HTML mode in stored content without exposing the marker in the editor", () => {
    const html = '<section class="custom"><p>Custom article</p></section>';

    expect(markBlogContentAsHtml(html)).toBe(`${BLOG_HTML_MODE_MARKER}${html}`);
    expect(stripBlogEditorModeMarker(markBlogContentAsHtml(html))).toBe(html);
    expect(getBlogEditorMode(markBlogContentAsHtml(html))).toBe("html");
  });

  it("opens legacy posts with inline or embedded styles in HTML mode", () => {
    expect(getBlogEditorMode('<p style="color: red">Styled</p>')).toBe("html");
    expect(getBlogEditorMode("<style>.notice { color: red; }</style><p>Styled</p>")).toBe("html");
    expect(getBlogEditorMode("<p><strong>Existing TipTap content</strong></p>")).toBe("visual");
  });
});
