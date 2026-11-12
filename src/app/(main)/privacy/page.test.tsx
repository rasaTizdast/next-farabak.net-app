import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/script", () => ({
  default: () => null,
}));

import PrivacyPage from "./page";

describe("PrivacyPage", () => {
  it("exposes a labelled table of contents and anchored sections", () => {
    render(<PrivacyPage />);

    expect(
      screen.getByRole("heading", { level: 1, name: "حریم خصوصی، با زبان روشن" })
    ).toBeVisible();
    expect(screen.getByRole("navigation", { name: "فهرست سیاست حریم خصوصی" })).toBeVisible();
    expect(screen.getByRole("link", { name: "داده‌هایی که جمع‌آوری می‌کنیم" })).toHaveAttribute(
      "href",
      "#data-collection"
    );
    expect(document.getElementById("user-rights")).toContainElement(
      screen.getByRole("heading", { level: 2, name: "حقوق کاربران و ارتباط با ما" })
    );
  });
});
