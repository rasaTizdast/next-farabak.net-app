import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import toast from "react-hot-toast";
import { describe, it, expect, vi, beforeEach } from "vitest";

const { mutate } = vi.hoisted(() => ({ mutate: vi.fn() }));

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
    mutate,
    loading: false,
    error: null,
    reset: vi.fn(),
  }),
}));

vi.mock("../EditModalFAQ", () => ({
  default: ({ setFaqs }: { setFaqs: (faqs: { question: string; answer: string }[]) => void }) => (
    <button
      type="button"
      onClick={() => setFaqs([{ question: "Question", answer: "Answer" }])}
      data-testid="edit-modal-faq"
    >
      EditModalFAQ
    </button>
  ),
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
    mutate.mockResolvedValue({ success: true });
  });

  it("keeps the edit modal open while saving when Escape or the backdrop is clicked", async () => {
    mutate.mockImplementation(() => new Promise(() => {}));
    render(
      <ProductEditModal
        product={mockProduct}
        onClose={mockOnClose}
        refetchProducts={mockRefetchProducts}
        setIsEditModalOpen={mockSetIsEditModalOpen}
      />
    );
    fireEvent.click(screen.getByText("ذخیره"));
    await screen.findByRole("button", { name: "در حال ذخیره..." });

    fireEvent.keyDown(document, { key: "Escape" });
    fireEvent.mouseDown(screen.getByRole("dialog", { name: "ویرایش محصول" }).parentElement!);

    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it("keeps the entered draft open when the main save fails", async () => {
    mutate.mockResolvedValue(null);
    render(
      <ProductEditModal
        product={mockProduct}
        onClose={mockOnClose}
        refetchProducts={mockRefetchProducts}
        setIsEditModalOpen={mockSetIsEditModalOpen}
      />
    );

    fireEvent.click(screen.getByText("ذخیره"));

    await waitFor(() => expect(toast.error).toHaveBeenCalled());
    expect(mockSetIsEditModalOpen).not.toHaveBeenCalled();
    expect(toast.success).not.toHaveBeenCalled();
    expect(screen.getByRole("dialog", { name: "ویرایش محصول" })).toBeInTheDocument();
  });

  it("does not clear detail selections or FAQs that have not loaded", async () => {
    render(
      <ProductEditModal
        product={mockProduct}
        onClose={mockOnClose}
        refetchProducts={mockRefetchProducts}
        setIsEditModalOpen={mockSetIsEditModalOpen}
      />
    );

    fireEvent.click(screen.getByText("ذخیره"));

    await waitFor(() => expect(mockSetIsEditModalOpen).toHaveBeenCalledWith(false));
    const urls = mutate.mock.calls.map(([url]) => url);
    expect(urls).not.toContain("/api/productOverviewDetails/update");
    expect(urls).not.toContain("/api/faqs/product/1");
  });

  it("does not report complete success or discard the draft when FAQ saving fails", async () => {
    mutate.mockImplementation(async (url: string) =>
      url === "/api/faqs/product/1" ? null : { success: true }
    );
    render(
      <ProductEditModal
        product={mockProduct}
        onClose={mockOnClose}
        refetchProducts={mockRefetchProducts}
        setIsEditModalOpen={mockSetIsEditModalOpen}
      />
    );
    fireEvent.click(screen.getByTestId("edit-modal-faq"));
    fireEvent.click(screen.getByText("ذخیره"));

    await waitFor(() => expect(toast.error).toHaveBeenCalled());
    expect(toast.success).not.toHaveBeenCalled();
    expect(mockSetIsEditModalOpen).not.toHaveBeenCalled();
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
