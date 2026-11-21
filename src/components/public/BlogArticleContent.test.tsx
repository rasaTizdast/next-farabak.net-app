import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { BlogArticleContent } from "./BlogArticleContent";

describe("BlogArticleContent", () => {
  it("renders sanitized article HTML and keeps its stylesheet scoped to its own id", () => {
    const { container } = render(
      <BlogArticleContent
        scopeId="blog-content-xray"
        css="#blog-content-xray :is(.callout) { color: #123456; }"
        className="prose-view"
        html='<h2 class="callout" style="font-weight: bold">Scoped heading</h2><script>alert(1)</script>'
      />
    );

    expect(screen.getByRole("heading", { name: "Scoped heading" })).toBeVisible();
    expect(container.querySelector("#blog-content-xray.prose-view h2")).toHaveStyle({
      fontWeight: "bold",
    });
    expect(document.querySelector("style[data-blog-content-styles]")?.textContent).toContain(
      "#blog-content-xray :is(.callout)"
    );
    expect(container.innerHTML).not.toContain("alert(1)");
  });
});
