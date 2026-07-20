import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

vi.mock("react-hot-toast", () => ({
  default: { success: vi.fn(), error: vi.fn() },
  toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock("@/helpers/Usd2RialRate", () => ({
  fetchUsdToRialRate: vi.fn().mockResolvedValue(50000),
}));

vi.mock("@/hooks/useApiMutation", () => ({
  useApiMutation: () => ({
    mutate: vi.fn().mockResolvedValue({ success: true }),
    loading: false,
    error: null,
    reset: vi.fn(),
  }),
}));

vi.mock("../GradeList", () => ({
  default: ({ productId }: any) => (
    <div data-testid="grade-list">GradeList for product {productId}</div>
  ),
}));

import ProductGradeModal from "../ProductGradeModal";

const mockProduct = {
  ProductId: 1,
  Name: "Test",
  Type: "Laptop",
  Price: "500",
  Discount: "50",
  Available: true,
  categoryName: "Electronics",
  CategoryId: 1,
  subCategoryName: "",
  productSlug: "laptop",
  Description: "",
  SEO_Title: "",
  SEO_Description: "",
  link: "laptop",
  img1: null,
  img2: null,
  CategoryContentId: "1",
  CategoryContentIds: [],
  QrCode_Key: null,
  QrCode_expiryDays: null,
  productBlog: "",
  Minimum_Amount: 0,
  Maximum_Amount: 0,
};

describe("ProductGradeModal", () => {
  const mockOnClose = vi.fn();
  const mockRefetch = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the modal with product type heading", () => {
    render(<ProductGradeModal product={mockProduct} onClose={mockOnClose} refetchProducts={mockRefetch} />);
    expect(screen.getByText("Laptop")).toBeInTheDocument();
  });

  it("renders grade form fields", () => {
    render(<ProductGradeModal product={mockProduct} onClose={mockOnClose} refetchProducts={mockRefetch} />);
    expect(screen.getByLabelText("گرید")).toBeInTheDocument();
    expect(screen.getByLabelText("قیمت")).toBeInTheDocument();
    expect(screen.getByLabelText("تخفیف")).toBeInTheDocument();
  });

  it("renders submit button", () => {
    render(<ProductGradeModal product={mockProduct} onClose={mockOnClose} refetchProducts={mockRefetch} />);
    expect(screen.getByText("افزودن گرید")).toBeInTheDocument();
  });

  it("calls onClose when close button is clicked", () => {
    render(<ProductGradeModal product={mockProduct} onClose={mockOnClose} refetchProducts={mockRefetch} />);
    fireEvent.click(screen.getByLabelText("بستن"));
    expect(mockOnClose).toHaveBeenCalled();
  });

  it("shows grade list component", () => {
    render(<ProductGradeModal product={mockProduct} onClose={mockOnClose} refetchProducts={mockRefetch} />);
    expect(screen.getByTestId("grade-list")).toBeInTheDocument();
    expect(screen.getByText("GradeList for product 1")).toBeInTheDocument();
  });

  it("converts grade input to uppercase", () => {
    render(<ProductGradeModal product={mockProduct} onClose={mockOnClose} refetchProducts={mockRefetch} />);
    const gradeInput = screen.getByLabelText("گرید");
    fireEvent.change(gradeInput, { target: { name: "grade", value: "a" } });
    expect((gradeInput as HTMLInputElement).value).toBe("A");
  });

  it("shows product price in the info section", async () => {
    render(<ProductGradeModal product={mockProduct} onClose={mockOnClose} refetchProducts={mockRefetch} />);
    await waitFor(() => {
      expect(screen.getByText("قیمت اصلی:")).toBeInTheDocument();
    });
  });
});
