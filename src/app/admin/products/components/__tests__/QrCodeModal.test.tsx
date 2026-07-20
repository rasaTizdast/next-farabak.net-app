import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

vi.mock("react-hot-toast", () => ({
  default: { success: vi.fn(), error: vi.fn() },
  toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock("@/hooks/useApiMutation", () => ({
  useApiMutation: () => ({
    mutate: vi.fn().mockResolvedValue({ success: true }),
    loading: false,
    error: null,
    reset: vi.fn(),
  }),
}));

vi.mock("qrcode.react", () => ({
  QRCodeCanvas: ({ value, size }: any) => (
    <canvas data-testid="qr-canvas" data-value={value} width={size} height={size} />
  ),
}));

import QrCodeModal from "../QrCodeModal";

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
  link: "laptop-test",
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

describe("QrCodeModal", () => {
  const mockOnClose = vi.fn();
  const mockRefetch = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the modal heading", () => {
    render(<QrCodeModal onClose={mockOnClose} product={mockProduct} refetchProducts={mockRefetch} />);
    expect(screen.getByText("تولید کد QR")).toBeInTheDocument();
  });

  it("renders generate normal QR button", () => {
    render(<QrCodeModal onClose={mockOnClose} product={mockProduct} refetchProducts={mockRefetch} />);
    expect(screen.getByText("تولید کد QR برای لینک محصول")).toBeInTheDocument();
  });

  it("renders generate unique QR button", () => {
    render(<QrCodeModal onClose={mockOnClose} product={mockProduct} refetchProducts={mockRefetch} />);
    expect(screen.getByText("تولید کد QR با لینک یکتا")).toBeInTheDocument();
  });

  it("calls onClose when close button is clicked", () => {
    render(<QrCodeModal onClose={mockOnClose} product={mockProduct} refetchProducts={mockRefetch} />);
    fireEvent.click(screen.getByLabelText("بستن"));
    expect(mockOnClose).toHaveBeenCalledWith(false);
  });

  it("returns null when product is null", () => {
    const { container } = render(<QrCodeModal onClose={mockOnClose} product={null} refetchProducts={mockRefetch} />);
    expect(container.innerHTML).toBe("");
  });

  it("shows expiry days selector", () => {
    render(<QrCodeModal onClose={mockOnClose} product={mockProduct} refetchProducts={mockRefetch} />);
    expect(screen.getByLabelText("مدت زمان اعتبار")).toBeInTheDocument();
  });

  it("shows QR code when generate normal QR is clicked", () => {
    render(<QrCodeModal onClose={mockOnClose} product={mockProduct} refetchProducts={mockRefetch} />);
    fireEvent.click(screen.getByText("تولید کد QR برای لینک محصول"));
    expect(screen.getByText("کد QR شما:")).toBeInTheDocument();
    expect(screen.getByTestId("qr-canvas")).toBeInTheDocument();
  });

  it("shows download button after QR is generated", () => {
    render(<QrCodeModal onClose={mockOnClose} product={mockProduct} refetchProducts={mockRefetch} />);
    fireEvent.click(screen.getByText("تولید کد QR برای لینک محصول"));
    expect(screen.getByText("دانلود تصویر کد QR")).toBeInTheDocument();
  });

  it("shows confirm modal when unique QR button is clicked", () => {
    render(<QrCodeModal onClose={mockOnClose} product={mockProduct} refetchProducts={mockRefetch} />);
    fireEvent.click(screen.getByText("تولید کد QR با لینک یکتا"));
    expect(screen.getByText("بله، تولید کن")).toBeInTheDocument();
    expect(screen.getByText("انصراف")).toBeInTheDocument();
  });

  it("dismisses confirm modal when cancel is clicked", () => {
    render(<QrCodeModal onClose={mockOnClose} product={mockProduct} refetchProducts={mockRefetch} />);
    fireEvent.click(screen.getByText("تولید کد QR با لینک یکتا"));
    fireEvent.click(screen.getByText("انصراف"));
    expect(screen.queryByText("بله، تولید کن")).not.toBeInTheDocument();
  });
});
