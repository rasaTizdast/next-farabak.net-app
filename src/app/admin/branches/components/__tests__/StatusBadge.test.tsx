import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";

import StatusBadge from "../StatusBadge";

describe("StatusBadge", () => {
  it("renders product count text", () => {
    render(<StatusBadge productCount={3} totalQuantity={15} />);
    expect(screen.getByText("3 نوع محصول")).toBeInTheDocument();
  });

  it("shows total quantity when productCount > 0", () => {
    render(<StatusBadge productCount={5} totalQuantity={42} />);
    expect(screen.getByText("42 عدد")).toBeInTheDocument();
  });

  it("shows 'بدون موجودی' when productCount is 0", () => {
    render(<StatusBadge productCount={0} totalQuantity={0} />);
    expect(screen.getByText("بدون موجودی")).toBeInTheDocument();
  });

  it("applies blue styling when products exist", () => {
    const { container } = render(<StatusBadge productCount={2} totalQuantity={10} />);
    const badge = container.firstElementChild as HTMLElement;
    expect(badge.className).toContain("border-blue-700");
    expect(badge.className).toContain("bg-blue-900/30");
    expect(badge.className).toContain("text-blue-400");
  });

  it("applies yellow styling when no products", () => {
    const { container } = render(<StatusBadge productCount={0} totalQuantity={0} />);
    const badge = container.firstElementChild as HTMLElement;
    expect(badge.className).toContain("border-yellow-700");
    expect(badge.className).toContain("bg-yellow-900/30");
    expect(badge.className).toContain("text-yellow-400");
  });

  it("sets RTL direction", () => {
    const { container } = render(<StatusBadge productCount={1} totalQuantity={5} />);
    const badge = container.firstElementChild as HTMLElement;
    expect(badge).toHaveStyle({ direction: "rtl" });
  });
});
