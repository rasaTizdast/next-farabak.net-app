import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import ProductTabs from "./ProductTabs";

describe("ProductTabs", () => {
  it("exposes the dossier sections as keyboard-accessible navigation links", () => {
    render(<ProductTabs />);

    const navigation = screen.getByRole("navigation", { name: "بخش‌های محصول" });
    expect(screen.getByRole("link", { name: "توضیحات" })).toHaveAttribute("href", "#overview");
    expect(screen.getByRole("link", { name: "مشخصات" })).toHaveAttribute("href", "#specs");
    expect(navigation).toHaveClass("sticky");
  });

  it("scrolls to a selected section without requiring a pointer-only interaction", () => {
    const scrollTo = vi.fn();
    Object.defineProperty(window, "scrollTo", { value: scrollTo, writable: true });
    const section = document.createElement("div");
    section.id = "faq";
    section.getBoundingClientRect = () => ({ top: 400 }) as DOMRect;
    document.body.appendChild(section);

    render(<ProductTabs />);
    fireEvent.click(screen.getByRole("link", { name: "سوالات" }));

    expect(scrollTo).toHaveBeenCalled();
  });
});
