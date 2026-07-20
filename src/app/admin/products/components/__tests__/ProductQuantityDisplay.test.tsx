import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), back: vi.fn() }),
  usePathname: () => "/",
}));

vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: any) => <a href={href} {...props}>{children}</a>,
}));

vi.mock("antd", () => ({
  Tooltip: ({ children, title, onOpenChange }: any) => (
    <div data-testid="tooltip" data-title={typeof title === "string" ? title : ""}>
      {typeof title !== "string" && <div data-testid="tooltip-content">{title}</div>}
      {children}
      {onOpenChange && (
        <button data-testid="tooltip-trigger" onClick={() => onOpenChange(true)}>
          hover
        </button>
      )}
    </div>
  ),
}));

import ProductQuantityDisplay from "../ProductQuantityDisplay";

describe("ProductQuantityDisplay", () => {
  const defaultProps = {
    warehouseCount: 5,
    branchCount: 3,
    productId: 42,
    Available: true,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows 'موجود' when Available is true", () => {
    render(<ProductQuantityDisplay {...defaultProps} />);
    expect(screen.getByText("موجود")).toBeInTheDocument();
  });

  it("shows 'ناموجود' when Available is false", () => {
    render(<ProductQuantityDisplay {...defaultProps} Available={false} />);
    expect(screen.getByText("ناموجود")).toBeInTheDocument();
  });

  it("applies green styling when available", () => {
    render(<ProductQuantityDisplay {...defaultProps} />);
    const badge = screen.getByText("موجود");
    expect(badge.className).toContain("bg-green-100");
    expect(badge.className).toContain("text-green-700");
  });

  it("applies red styling when not available", () => {
    render(<ProductQuantityDisplay {...defaultProps} Available={false} />);
    const badge = screen.getByText("ناموجود");
    expect(badge.className).toContain("bg-red-100");
    expect(badge.className).toContain("text-red-700");
  });

  it("shows loading text in tooltip when isLoading is true", () => {
    render(<ProductQuantityDisplay {...defaultProps} isLoading={true} />);
    expect(screen.getByText("در حال بارگذاری...")).toBeInTheDocument();
  });

  it("calls onHover when tooltip opens", () => {
    const onHover = vi.fn();
    render(<ProductQuantityDisplay {...defaultProps} onHover={onHover} />);
    fireEvent.click(screen.getByTestId("tooltip-trigger"));
    expect(onHover).toHaveBeenCalled();
  });

  it("renders tooltip content with warehouse and branch counts", () => {
    render(<ProductQuantityDisplay {...defaultProps} />);
    expect(screen.getByText("انبارها: 5")).toBeInTheDocument();
    expect(screen.getByText("شعبه‌ها: 3")).toBeInTheDocument();
  });

  it("renders tooltip with total count", () => {
    render(<ProductQuantityDisplay {...defaultProps} />);
    expect(screen.getByText("کل موجودی:")).toBeInTheDocument();
    expect(screen.getByText("8")).toBeInTheDocument();
  });
});
