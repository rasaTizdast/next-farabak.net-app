import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { BlogHtmlEditor } from "./BlogHtmlEditor";

describe("BlogHtmlEditor", () => {
  it("edits HTML and previews article-scoped styles", () => {
    const onChange = vi.fn();
    render(
      <BlogHtmlEditor
        value={'<style>.hero { color: red; }</style><h2 class="hero">Preview heading</h2>'}
        onChange={onChange}
      />
    );

    const textarea = screen.getByRole("textbox", { name: "کد HTML وبلاگ" });
    expect(textarea).toHaveValue(
      '<style>.hero { color: red; }</style><h2 class="hero">Preview heading</h2>'
    );
    expect(screen.getByText("Preview heading")).toBeVisible();
    expect(document.querySelector("style[data-blog-content-styles]")?.textContent).toContain(
      "#blog-html-preview :is(.hero)"
    );

    fireEvent.change(textarea, { target: { value: "<p>Updated</p>" } });
    expect(onChange).toHaveBeenCalledWith("<p>Updated</p>");
  });
});
