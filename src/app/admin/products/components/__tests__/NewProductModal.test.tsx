import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

vi.mock("react-hot-toast", () => ({
  default: { success: vi.fn(), error: vi.fn() },
  toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock("react-icons/fi", () => ({
  FiChevronDown: () => <span>▼</span>,
  FiChevronUp: () => <span>▲</span>,
}));

vi.mock("react-icons/io", () => ({
  IoIosClose: ({ size }: any) => <span data-testid="close-icon">✕</span>,
}));

vi.mock("../NewOverviewDetailsModal", () => ({
  default: ({ onClose }: any) => (
    <div data-testid="overview-details-modal">
      <button onClick={onClose}>close overview</button>
    </div>
  ),
}));

vi.mock("../newProductModalComponents/BaseDetails", () => ({
  default: () => <div data-testid="base-details">BaseDetails</div>,
}));

vi.mock("../newProductModalComponents/FAQ", () => ({
  default: () => <div data-testid="faq">FAQ</div>,
}));

vi.mock("../newProductModalComponents/OverviewDetails", () => ({
  default: () => <div data-testid="overview-details">OverviewDetails</div>,
}));

vi.mock("../newProductModalComponents/ProductBlog", () => ({
  default: () => <div data-testid="product-blog">ProductBlog</div>,
}));

vi.mock("../newProductModalComponents/ProductOverview", () => ({
  default: () => <div data-testid="product-overview">ProductOverview</div>,
}));

vi.mock("../newProductModalComponents/Specs", () => ({
  default: () => <div data-testid="specs">Specs</div>,
}));

vi.mock("../newProductModalComponents/ProgressModal", () => ({
  default: ({ progress, currentStep }: any) => (
    <div data-testid="progress-modal">{progress}% - step {currentStep}</div>
  ),
}));

vi.mock("../utils/createProduct", () => ({
  createProduct: vi.fn().mockResolvedValue(undefined),
}));

import NewProductModal from "../NewProductModal";

const mockCategories = [
  {
    CategoryID: 1,
    Name: "Electronics",
    Available: true,
    Subcategories: [{ CategoryContentId: 10, Name: "Phones" }],
  },
];

describe("NewProductModal", () => {
  const mockSetShowNewProductModal = vi.fn();
  const mockRefetchProducts = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the modal with heading", () => {
    render(
      <NewProductModal
        setShowNewProductModal={mockSetShowNewProductModal}
        refetchProducts={mockRefetchProducts}
        categories={mockCategories}
      />
    );
    expect(screen.getByText("محصول جدید")).toBeInTheDocument();
  });

  it("renders all section toggle buttons", () => {
    render(
      <NewProductModal
        setShowNewProductModal={mockSetShowNewProductModal}
        refetchProducts={mockRefetchProducts}
        categories={mockCategories}
      />
    );
    expect(screen.getByText("جزئیات پایه")).toBeInTheDocument();
    expect(screen.getByText("بررسی محصول")).toBeInTheDocument();
    expect(screen.getByText("توضیحات محصول")).toBeInTheDocument();
    expect(screen.getByText("توضیحات تکمیلی (مقاله محصول)")).toBeInTheDocument();
    expect(screen.getByText("مشخصات محصول")).toBeInTheDocument();
    expect(screen.getByText("سوالات متداول")).toBeInTheDocument();
  });

  it("renders submit button", () => {
    render(
      <NewProductModal
        setShowNewProductModal={mockSetShowNewProductModal}
        refetchProducts={mockRefetchProducts}
        categories={mockCategories}
      />
    );
    expect(screen.getByText("ایجاد محصول")).toBeInTheDocument();
  });

  it("calls setShowNewProductModal(false) when close is clicked", () => {
    render(
      <NewProductModal
        setShowNewProductModal={mockSetShowNewProductModal}
        refetchProducts={mockRefetchProducts}
        categories={mockCategories}
      />
    );
    fireEvent.click(screen.getByLabelText("بستن"));
    expect(mockSetShowNewProductModal).toHaveBeenCalledWith(false);
  });

  it("toggles base details section open/closed", () => {
    render(
      <NewProductModal
        setShowNewProductModal={mockSetShowNewProductModal}
        refetchProducts={mockRefetchProducts}
        categories={mockCategories}
      />
    );
    // baseDetails starts closed, click to open
    fireEvent.click(screen.getByText("جزئیات پایه"));
    expect(screen.getByTestId("base-details")).toBeInTheDocument();
  });

  it("toggles product overview section", () => {
    render(
      <NewProductModal
        setShowNewProductModal={mockSetShowNewProductModal}
        refetchProducts={mockRefetchProducts}
        categories={mockCategories}
      />
    );
    fireEvent.click(screen.getByText("بررسی محصول"));
    expect(screen.getByTestId("product-overview")).toBeInTheDocument();
  });

  it("toggles specs section", () => {
    render(
      <NewProductModal
        setShowNewProductModal={mockSetShowNewProductModal}
        refetchProducts={mockRefetchProducts}
        categories={mockCategories}
      />
    );
    fireEvent.click(screen.getByText("مشخصات محصول"));
    expect(screen.getByTestId("specs")).toBeInTheDocument();
  });

  it("toggles FAQ section", () => {
    render(
      <NewProductModal
        setShowNewProductModal={mockSetShowNewProductModal}
        refetchProducts={mockRefetchProducts}
        categories={mockCategories}
      />
    );
    fireEvent.click(screen.getByText("سوالات متداول"));
    expect(screen.getByTestId("faq")).toBeInTheDocument();
  });

  it("toggles product blog section", () => {
    render(
      <NewProductModal
        setShowNewProductModal={mockSetShowNewProductModal}
        refetchProducts={mockRefetchProducts}
        categories={mockCategories}
      />
    );
    fireEvent.click(screen.getByText("توضیحات تکمیلی (مقاله محصول)"));
    expect(screen.getByTestId("product-blog")).toBeInTheDocument();
  });

  it("opens overview details section with button", () => {
    render(
      <NewProductModal
        setShowNewProductModal={mockSetShowNewProductModal}
        refetchProducts={mockRefetchProducts}
        categories={mockCategories}
      />
    );
    // Open overview details section first
    fireEvent.click(screen.getByText("توضیحات محصول"));
    // Click the create new overview details button
    fireEvent.click(screen.getByText("ساخت توضیحات محصول جدید"));
    expect(screen.getByTestId("overview-details-modal")).toBeInTheDocument();
  });

  it("submit button is initially disabled (has errors from empty state)", () => {
    render(
      <NewProductModal
        setShowNewProductModal={mockSetShowNewProductModal}
        refetchProducts={mockRefetchProducts}
        categories={mockCategories}
      />
    );
    const submitBtn = screen.getByTestId("create-product-button");
    expect(submitBtn).toBeInTheDocument();
  });
});
