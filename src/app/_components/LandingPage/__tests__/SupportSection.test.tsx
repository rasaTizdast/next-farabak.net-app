import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock("../SupportSection.module.css", () => ({
  default: {
    main: "main",
    cards: "cards",
    card: "card",
  },
}));

import SupportSection from "../SupportSection";

describe("SupportSection", () => {
  it("renders the heading", () => {
    render(<SupportSection />);
    expect(screen.getByText("پشتیبانی")).toBeDefined();
  });

  it("renders support cards from data", () => {
    render(<SupportSection />);
    // The component renders cards from supportData.json
    const links = screen.getAllByText("مشاهده");
    expect(links.length).toBeGreaterThan(0);
  });

  it("renders card links with correct href", () => {
    render(<SupportSection />);
    const links = screen.getAllByText("مشاهده");
    links.forEach((link) => {
      const anchor = link.closest("a");
      expect(anchor?.getAttribute("href")).toMatch(/^support\//);
    });
  });
});
