import { render, screen, waitFor } from "@testing-library/react";
import axios from "axios";
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("axios");
const mockAxiosGet = vi.mocked(axios.get);

vi.mock("@/hooks/useApiMutation", () => ({
  useApiMutation: () => ({
    mutate: vi.fn().mockResolvedValue({ success: true }),
    loading: false,
    error: null,
    reset: vi.fn(),
  }),
}));

vi.mock("@/components/ui/antd/Modal", () => ({
  Modal: ({ open, title, children }: any) =>
    open ? (
      <div data-testid="modal">
        <div data-testid="modal-title">{title}</div>
        {children}
      </div>
    ) : null,
}));

vi.mock("@/components/ui/antd/Button", () => ({
  Button: ({ children, onClick, variant, className, disabled, loading }: any) => (
    <button onClick={onClick} disabled={disabled} className={className} data-variant={variant}>
      {loading ? "loading..." : children}
    </button>
  ),
}));

vi.mock("@/components/ui/antd/Input", () => ({
  Input: ({ value, onChange, placeholder, type, min, id, className, disabled }: any) => (
    <input
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      type={type}
      min={min}
      id={id}
      className={className}
      disabled={disabled}
    />
  ),
}));

vi.mock("@/components/ui/antd/AutoComplete", () => ({
  AutoComplete: ({ value, onChange, placeholder, "aria-label": ariaLabel }: any) => (
    <input
      aria-label={ariaLabel}
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      placeholder={placeholder}
    />
  ),
}));

vi.mock("@/components/ui/antd/DataTable", () => ({
  DataTable: ({ dataSource, columns, rowKey }: any) => (
    <div data-testid="products-table">
      {dataSource?.map((item: any) => (
        <div key={rowKey(item)}>
          {columns?.map((col: any) => (
            <div key={col.key || col.title}>
              {col.render ? col.render(null, item) : item[col.dataIndex]}
            </div>
          ))}
        </div>
      ))}
    </div>
  ),
}));

import ProductsModal from "../ProductsModal";

const mockAllProducts = [
  {
    ProductId: 1,
    Type: "Laptop",
    ProductGrade: [
      { ProductGradeId: 1, Grade: "A", Price: 500 },
      { ProductGradeId: 2, Grade: "B", Price: 400 },
    ],
  },
  {
    ProductId: 2,
    Type: "Phone",
  },
];

describe("ProductsModal", () => {
  const defaultProps = {
    open: true,
    onClose: vi.fn(),
    warehouseId: 1,
    warehouseName: "Main Warehouse",
    allProducts: mockAllProducts,
    refreshWarehouses: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockAxiosGet.mockResolvedValue({
      data: [
        {
          warehouseproductid: 1,
          ProductId: 1,
          Type: "Laptop",
          Name: "Test",
          quantity: 5,
          ProductGradeId: 1,
          ProductGrade: { Grade: "A", Price: 500 },
          availableGrades: [
            { ProductGradeId: 1, Grade: "A", Price: 500 },
            { ProductGradeId: 2, Grade: "B", Price: 400 },
          ],
        },
      ],
    });
  });

  it("renders modal when open", async () => {
    render(<ProductsModal {...defaultProps} />);
    await waitFor(() => {
      expect(screen.getByTestId("modal")).toBeInTheDocument();
    });
  });

  it("does not render when not open", () => {
    render(<ProductsModal {...defaultProps} open={false} />);
    expect(screen.queryByTestId("modal")).not.toBeInTheDocument();
  });

  it("shows warehouse name in title", async () => {
    render(<ProductsModal {...defaultProps} />);
    await waitFor(() => {
      expect(screen.getByText(/Main Warehouse/)).toBeInTheDocument();
    });
  });

  it("renders add product form", async () => {
    render(<ProductsModal {...defaultProps} />);
    await waitFor(() => {
      expect(screen.getByText("افزودن محصول جدید")).toBeInTheDocument();
    });
  });

  it("renders product search input", async () => {
    render(<ProductsModal {...defaultProps} />);
    await waitFor(() => {
      expect(screen.getByLabelText("نام محصول")).toBeInTheDocument();
    });
  });

  it("renders quantity input", async () => {
    render(<ProductsModal {...defaultProps} />);
    await waitFor(() => {
      expect(screen.getByLabelText("تعداد")).toBeInTheDocument();
    });
  });

  it("disables add button when no product is selected", async () => {
    render(<ProductsModal {...defaultProps} />);
    await waitFor(() => {
      const addBtns = screen.getAllByText(/افزودن محصول/);
      const addBtn = addBtns.find((el) => el.closest("button"));
      expect(addBtn?.closest("button")).toBeDisabled();
    });
  });

  it("renders products table", async () => {
    render(<ProductsModal {...defaultProps} />);
    await waitFor(() => {
      expect(screen.getByTestId("products-table")).toBeInTheDocument();
    });
  });

  it("loads warehouse products on open", async () => {
    render(<ProductsModal {...defaultProps} />);
    await waitFor(() => {
      expect(mockAxiosGet).toHaveBeenCalledWith("/api/admin/warehouses/1/products");
    });
  });

  it("does not fetch when closed", () => {
    render(<ProductsModal {...defaultProps} open={false} />);
    expect(mockAxiosGet).not.toHaveBeenCalled();
  });
});
