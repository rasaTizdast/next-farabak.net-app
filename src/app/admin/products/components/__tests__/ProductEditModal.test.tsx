import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("react-hot-toast", () => ({
  default: { success: vi.fn(), error: vi.fn() },
  toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock("react-icons/cg", () => ({
  CgSpinnerTwo: () => <span data-testid="spinner">spinner</span>,
}));

vi.mock("axios", () => ({
  default: { put: vi.fn(), get: vi.fn(), post: vi.fn() },
}));

vi.mock("@/hooks/useApiFetch", () => ({
  useApiFetch: () => ({
    data: [
      {
        CategoryID: 1,
        Name: "Electronics",
        Subcategories: [{ CategoryContentId: 10, Name: "Phones" }],
      },
    ],
    loading: false,
    error: null,
    refetch: vi.fn(),
  }),
}));

vi.mock("@/hooks/useApiMutation", () => ({
  useApiMutation: () => ({
    mutate: vi.fn().mockResolvedValue({ success: true }),
    loading: false,
    error: null,
    reset: vi.fn(),
  }),
}));

vi.mock("../EditModalFAQ", () => ({
  default: () => <div data-testid="edit-modal-faq">EditModalFAQ</div>,
}));

vi.mock("../EditModalOverview", () => ({
  default: () => <div data-testid="edit-modal-overview">EditModalOverview</div>,
}));

vi.mock("../EditModalOverviewDetails", () => ({
  default: () => <div data-testid="edit-modal-overview-details">EditModalOverviewDetails</div>,
}));

vi.mock("../EditModalProductBlog", () => ({
  default: () => <div data-testid="edit-modal-product-blog">EditModalProductBlog</div>,
}));

vi.mock("../EditModalSpecs", () => ({
  default: () => <div data-testid="edit-modal-specs">EditModalSpecs</div>,
}));

vi.mock("../ImageInput", () => ({
  default: ({ label }: any) => (
    <div data-testid="image-input">
      <span>{label}</span>
    </div>
  ),
}));

vi.mock("../NewOverviewDetailsModal", () => ({
  default: ({ onClose }: any) => (
    <div data-testid="new-overview-details-modal">
      <button onClick={onClose}>close</button>
    </div>
  ),
}));

import ProductEditModal from "../ProductEditModal";

const mockProduct = {
  ProductId: 1,
  Name: "Test Laptop",
  Type: "Laptop",
  categoryName: "Electronics",
  CategoryId: 1,
  subCategoryName: "Phones",
  productSlug: "test-laptop",
  Price: "500",
  Discount: "50",
  Available: true,
  Description: "test keywords",
  SEO_Title: "Test SEO",
  SEO_Description: "Test Description",
  link: "test-laptop",
  img1: "image1.jpg",
  img2: "image2.jpg",
  CategoryContentId: "10",
  CategoryContentIds: [{ CategoryContentId: 10, Name: "Phones" }],
  QrCode_Key: null,
  QrCode_expiryDays: null,
  productBlog: "",
  Minimum_Amount: 0,
  Maximum_Amount: 0,
};

describe("ProductEditModal", () => {
  const mockOnClose = vi.fn();
  const mockRefetchProducts = vi.fn();
  const mockSetIsEditModalOpen = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the modal heading", () => {
    render(
      <ProductEditModal
        product={mockProduct}
        onClose={mockOnClose}
        refetchProducts={mockRefetchProducts}
        setIsEditModalOpen={mockSetIsEditModalOpen}
      />
    );
    expect(screen.getByText("ویرایش محصول")).toBeInTheDocument();
  });

  it("renders product form fields", () => {
    render(
      <ProductEditModal
        product={mockProduct}
        onClose={mockOnClose}
        refetchProducts={mockRefetchProducts}
        setIsEditModalOpen={mockSetIsEditModalOpen}
      />
    );
    expect(screen.getByText("نام محصول")).toBeInTheDocument();
    expect(screen.getByText("توضیح محصول")).toBeInTheDocument();
    expect(screen.getByText("Slug")).toBeInTheDocument();
  });

  it("renders category select", () => {
    render(
      <ProductEditModal
        product={mockProduct}
        onClose={mockOnClose}
        refetchProducts={mockRefetchProducts}
        setIsEditModalOpen={mockSetIsEditModalOpen}
      />
    );
    expect(screen.getByText("دسته‌بندی")).toBeInTheDocument();
  });

  it("renders price and discount fields", () => {
    render(
      <ProductEditModal
        product={mockProduct}
        onClose={mockOnClose}
        refetchProducts={mockRefetchProducts}
        setIsEditModalOpen={mockSetIsEditModalOpen}
      />
    );
    expect(screen.getByText("قیمت (دلار)")).toBeInTheDocument();
    expect(screen.getByText("تخفیف (دلار)")).toBeInTheDocument();
  });

  it("renders SEO fields", () => {
    render(
      <ProductEditModal
        product={mockProduct}
        onClose={mockOnClose}
        refetchProducts={mockRefetchProducts}
        setIsEditModalOpen={mockSetIsEditModalOpen}
      />
    );
    expect(screen.getByText("عنوان SEO")).toBeInTheDocument();
    expect(screen.getByText("توضیحات SEO")).toBeInTheDocument();
  });

  it("renders cancel and save buttons", () => {
    render(
      <ProductEditModal
        product={mockProduct}
        onClose={mockOnClose}
        refetchProducts={mockRefetchProducts}
        setIsEditModalOpen={mockSetIsEditModalOpen}
      />
    );
    expect(screen.getByText("لغو")).toBeInTheDocument();
    expect(screen.getByText("ذخیره")).toBeInTheDocument();
  });

  it("calls onClose when cancel is clicked", () => {
    render(
      <ProductEditModal
        product={mockProduct}
        onClose={mockOnClose}
        refetchProducts={mockRefetchProducts}
        setIsEditModalOpen={mockSetIsEditModalOpen}
      />
    );
    fireEvent.click(screen.getByText("لغو"));
    expect(mockOnClose).toHaveBeenCalled();
  });

  it("returns null when product is null", () => {
    const { container } = render(
      <ProductEditModal
        product={null}
        onClose={mockOnClose}
        refetchProducts={mockRefetchProducts}
        setIsEditModalOpen={mockSetIsEditModalOpen}
      />
    );
    expect(container.innerHTML).toBe("");
  });

  it("renders image inputs", () => {
    render(
      <ProductEditModal
        product={mockProduct}
        onClose={mockOnClose}
        refetchProducts={mockRefetchProducts}
        setIsEditModalOpen={mockSetIsEditModalOpen}
      />
    );
    expect(screen.getByText("تصویر بدون پس‌زمینه")).toBeInTheDocument();
    expect(screen.getByText("تصویر بنر")).toBeInTheDocument();
  });

  it("renders overview, specs, FAQ, blog editors", () => {
    render(
      <ProductEditModal
        product={mockProduct}
        onClose={mockOnClose}
        refetchProducts={mockRefetchProducts}
        setIsEditModalOpen={mockSetIsEditModalOpen}
      />
    );
    expect(screen.getByTestId("edit-modal-overview")).toBeInTheDocument();
    expect(screen.getByTestId("edit-modal-specs")).toBeInTheDocument();
    expect(screen.getByTestId("edit-modal-faq")).toBeInTheDocument();
    expect(screen.getByTestId("edit-modal-product-blog")).toBeInTheDocument();
    expect(screen.getByTestId("edit-modal-overview-details")).toBeInTheDocument();
  });

  it("renders availability select", () => {
    render(
      <ProductEditModal
        product={mockProduct}
        onClose={mockOnClose}
        refetchProducts={mockRefetchProducts}
        setIsEditModalOpen={mockSetIsEditModalOpen}
      />
    );
    expect(screen.getByText("وضعیت موجودی")).toBeInTheDocument();
  });

  it("renders keywords input", () => {
    render(
      <ProductEditModal
        product={mockProduct}
        onClose={mockOnClose}
        refetchProducts={mockRefetchProducts}
        setIsEditModalOpen={mockSetIsEditModalOpen}
      />
    );
    expect(screen.getByText("کلمات کلیدی")).toBeInTheDocument();
  });

  it("renders create new overview details button", () => {
    render(
      <ProductEditModal
        product={mockProduct}
        onClose={mockOnClose}
        refetchProducts={mockRefetchProducts}
        setIsEditModalOpen={mockSetIsEditModalOpen}
      />
    );
    expect(screen.getByText("ایجاد توضیحات محصول جدید")).toBeInTheDocument();
  });
});
