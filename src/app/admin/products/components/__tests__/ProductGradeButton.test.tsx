import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import ProductGradeButton from "../ProductGradeButton";

vi.mock("react-hot-toast", () => ({
  default: { success: vi.fn(), error: vi.fn() },
  toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock("@/helpers/Usd2RialRate", () => ({
  fetchUsdToRialRate: vi.fn().mockResolvedValue(50000),
}));

vi.mock("@/hooks/useApiMutation", () => ({
  useApiMutation: () => ({
    mutate: vi.fn(),
    loading: false,
    error: null,
    reset: vi.fn(),
  }),
}));

vi.mock("../GradeList", () => ({
  default: () => <div data-testid="grade-list">GradeList</div>,
}));

const mockProduct = {
  ProductId: 1,
  Name: "Test Product",
  Type: "Test Type",
  categoryName: "Electronics",
  CategoryId: 1,
  subCategoryName: "Phones",
  productSlug: "test-product",
  Price: "100",
  Discount: "10",
  Available: true,
  Description: "test",
  SEO_Title: "Test",
  SEO_Description: "Test",
  link: "test-product",
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

describe("ProductGradeButton", () => {
  const mockRefetch = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders a button with grade icon", () => {
    render(<ProductGradeButton product={mockProduct} refetchProducts={mockRefetch} />);
    expect(screen.getByLabelText("مدیریت گرید‌های محصول")).toBeInTheDocument();
  });

  it("does not show modal initially", () => {
    render(<ProductGradeButton product={mockProduct} refetchProducts={mockRefetch} />);
    expect(screen.queryByTestId("grade-list")).not.toBeInTheDocument();
  });

  it("opens modal when button is clicked", () => {
    render(<ProductGradeButton product={mockProduct} refetchProducts={mockRefetch} />);
    fireEvent.click(screen.getByLabelText("مدیریت گرید‌های محصول"));
    expect(screen.getByTestId("grade-list")).toBeInTheDocument();
  });

  it("shows product grade modal with product type", () => {
    render(<ProductGradeButton product={mockProduct} refetchProducts={mockRefetch} />);
    fireEvent.click(screen.getByLabelText("مدیریت گرید‌های محصول"));
    expect(screen.getByText("مدیریت گرید‌های محصول")).toBeInTheDocument();
  });
});
