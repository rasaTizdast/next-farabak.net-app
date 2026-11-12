import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import ArticleTableOfContents from "./ArticleTableOfContents";

describe("article table of contents", () => {
  it("keeps an H3 under its H2 and restores its anchor when the branch reopens", () => {
    render(
      <ArticleTableOfContents
        headings={[
          { id: "section", text: "Section", level: 2 },
          { id: "detail", text: "Detail", level: 3 },
          { id: "summary", text: "Summary", level: 2 },
        ]}
      />
    );

    const menu = within(screen.getByRole("navigation"));
    const toggle = menu.getByRole("button", { name: /Section/ });
    const section = menu.getByRole("link", { name: "Section" }).closest("li");

    expect(section).not.toBeNull();
    expect(within(section!).getByRole("link", { name: "Detail" })).toHaveAttribute(
      "href",
      "#detail"
    );
    expect(toggle).toHaveAttribute("aria-expanded", "true");
    fireEvent.click(toggle);
    expect(menu.queryByRole("link", { name: "Detail" })).not.toBeInTheDocument();
    expect(menu.getByRole("link", { name: "Summary" })).toHaveAttribute("href", "#summary");

    fireEvent.click(toggle);
    fireEvent.click(menu.getByRole("link", { name: "Detail" }));
    expect(menu.getByRole("link", { name: "Detail" })).toHaveAttribute("aria-current", "location");
  });
});
