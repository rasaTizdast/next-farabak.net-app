import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

import BackToTop from "../BackToTop";

describe("BackToTop", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.defineProperty(window, "scrollY", { value: 0, writable: true, configurable: true });
    Object.defineProperty(window, "innerHeight", {
      value: 800,
      writable: true,
      configurable: true,
    });
    Object.defineProperty(window, "innerWidth", {
      value: 1024,
      writable: true,
      configurable: true,
    });
  });

  it("renders the back to top button", () => {
    render(<BackToTop />);
    expect(screen.getByLabelText("بازگشت به بالا")).toBeDefined();
  });

  it("calls window.scrollTo when button is clicked", () => {
    const scrollTo = vi.fn();
    window.scrollTo = scrollTo;

    render(<BackToTop />);
    fireEvent.click(screen.getByLabelText("بازگشت به بالا"));
    expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: "smooth" });
  });

  it("button is hidden when not scrolled", () => {
    render(<BackToTop />);
    const button = screen.getByLabelText("بازگشت به بالا");
    expect(button.className).toContain("-translate-x-[200%]");
  });

  it("shows text on hover on desktop", () => {
    Object.defineProperty(window, "innerWidth", {
      value: 1024,
      writable: true,
      configurable: true,
    });

    render(<BackToTop />);
    const button = screen.getByLabelText("بازگشت به بالا");
    fireEvent.mouseEnter(button);
    expect(screen.getByText("بازگشت به بالا")).toBeDefined();
  });

  it("hides text on mouse leave", () => {
    render(<BackToTop />);
    const button = screen.getByLabelText("بازگشت به بالا");
    fireEvent.mouseEnter(button);
    fireEvent.mouseLeave(button);
    const span = button.querySelector("span");
    expect(span?.className).toContain("max-w-0");
  });
});
