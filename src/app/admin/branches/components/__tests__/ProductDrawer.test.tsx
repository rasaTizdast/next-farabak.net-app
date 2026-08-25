import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("antd", () => ({
  Drawer: ({ open, title, children, onClose }: any) =>
    open ? (
      <div data-testid="drawer">
        <div data-testid="drawer-title">{title}</div>
        <button data-testid="drawer-close" onClick={onClose}>
          close
        </button>
        {children}
      </div>
    ) : null,
}));

vi.mock("../ProductForm", () => ({
  default: () => <div data-testid="product-form">ProductForm</div>,
}));

vi.mock("../ProductSummary", () => ({
  default: ({ products }: any) => (
    <div data-testid="product-summary">ProductSummary: {products?.length || 0} items</div>
  ),
}));

vi.mock("../ProductTable", () => ({
  default: ({ products, loading, showRemoveButton }: any) => (
    <div data-testid="product-table">
      ProductTable: {products?.length || 0} items
      {loading && <span data-testid="loading">loading</span>}
      {showRemoveButton && <span data-testid="has-remove">remove</span>}
    </div>
  ),
}));

import ProductDrawer from "../ProductDrawer";

const mockBranch = {
  branchid: 1,
  name: "Main Branch",
  location: "BR001",
  productCount: 2,
  totalQuantity: 10,
  createdat: "2024-01-15",
  UserID: 1,
};

const mockProducts = [
  { ProductId: 1, Type: "Laptop", Name: "Test", Price: "500", Discount: "0", quantity: 5 },
];

describe("ProductDrawer", () => {
  const defaultProps = {
    visible: true,
    onClose: vi.fn(),
    branch: mockBranch,
    products: mockProducts,
    allProducts: mockProducts,
    loading: false,
    productForm: {} as any,
    selectedProduct: null,
    onSelectProduct: vi.fn(),
    onQuantityChange: vi.fn(),
    onAddProduct: vi.fn(),
    onUpdateQuantity: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders drawer when visible", () => {
    render(<ProductDrawer {...defaultProps} />);
    expect(screen.getByTestId("drawer")).toBeInTheDocument();
  });

  it("does not render drawer when not visible", () => {
    render(<ProductDrawer {...defaultProps} visible={false} />);
    expect(screen.queryByTestId("drawer")).not.toBeInTheDocument();
  });

  it("shows branch name in title", () => {
    render(<ProductDrawer {...defaultProps} />);
    expect(screen.getByTestId("drawer-title")).toHaveTextContent("محصولات شعبه: Main Branch");
  });

  it("renders product form", () => {
    render(<ProductDrawer {...defaultProps} />);
    expect(screen.getByTestId("product-form")).toBeInTheDocument();
  });

  it("renders product summary with products count", () => {
    render(<ProductDrawer {...defaultProps} />);
    expect(screen.getByTestId("product-summary")).toBeInTheDocument();
    expect(screen.getByText("ProductSummary: 1 items")).toBeInTheDocument();
  });

  it("renders product table with products count", () => {
    render(<ProductDrawer {...defaultProps} />);
    expect(screen.getByTestId("product-table")).toBeInTheDocument();
    expect(screen.getByText("ProductTable: 1 items")).toBeInTheDocument();
  });

  it("passes loading to product table", () => {
    render(<ProductDrawer {...defaultProps} loading={true} />);
    expect(screen.getByTestId("loading")).toBeInTheDocument();
  });

  it("shows remove button when onRemoveProduct is provided", () => {
    render(<ProductDrawer {...defaultProps} onRemoveProduct={vi.fn()} />);
    expect(screen.getByTestId("has-remove")).toBeInTheDocument();
  });

  it("does not show remove button when onRemoveProduct is not provided", () => {
    render(<ProductDrawer {...defaultProps} />);
    expect(screen.queryByTestId("has-remove")).not.toBeInTheDocument();
  });
});
