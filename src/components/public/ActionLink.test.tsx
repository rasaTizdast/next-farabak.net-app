import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ActionLink } from "./ActionLink";

describe("ActionLink", () => {
  it("renders a keyboard-focusable current-page action with an accessible name", () => {
    render(
      <ActionLink href="/products" current variant="primary">
        محصولات
      </ActionLink>
    );

    const link = screen.getByRole("link", { name: "محصولات" });

    expect(link).toHaveAttribute("href", "/products");
    expect(link).toHaveAttribute("aria-current", "page");
    expect(link).toHaveClass(
      "focus-visible:outline-none",
      "focus-visible:ring-(--farabak-action-blue)",
      "min-h-11"
    );
  });
});
