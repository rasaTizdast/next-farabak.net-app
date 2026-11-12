import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/components/ui/antd/Button", () => ({
  Button: ({ children, onClick, variant, className, loading }: any) => (
    <button onClick={onClick} className={className} data-variant={variant} disabled={loading}>
      {loading ? "loading..." : children}
    </button>
  ),
}));

vi.mock("@/components/ui/antd/DataTable", () => ({
  DataTable: ({ dataSource, rowKey, columns, loading, pagination }: any) => (
    <div data-testid="table-base">
      {loading && <div data-testid="loading">loading</div>}
      {dataSource?.map((item: any) => (
        <div key={rowKey(item)}>
          {columns?.map((col: any) => (
            <div key={col.key || col.title}>
              {col.render ? col.render(null, item) : item[col.dataIndex]}
            </div>
          ))}
        </div>
      ))}
      {pagination?.total > 0 && <button onClick={() => pagination.onChange?.(2)}>next page</button>}
    </div>
  ),
}));

import WarehousesTable from "../WarehousesTable";

const mockItems = [
  {
    warehouseid: 1,
    name: "Warehouse A",
    location: "Tehran",
    createdat: "2024-01-15",
    productCount: 5,
    totalQuantity: 50,
    specificProductQuantity: 3,
  },
  {
    warehouseid: 2,
    name: "Warehouse B",
    location: "Isfahan",
    createdat: "2024-02-20",
    productCount: 0,
    totalQuantity: 0,
    specificProductQuantity: 0,
  },
];

describe("WarehousesTable", () => {
  const defaultProps = {
    items: mockItems,
    loading: false,
    page: 1,
    total: 2,
    onPageChange: vi.fn(),
    onEdit: vi.fn(),
    onDelete: vi.fn(),
    onProducts: vi.fn(),
    isSearching: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the table", () => {
    render(<WarehousesTable {...defaultProps} />);
    expect(screen.getByTestId("table-base")).toBeInTheDocument();
  });

  it("renders warehouse names", () => {
    render(<WarehousesTable {...defaultProps} />);
    expect(screen.getByText("Warehouse A")).toBeInTheDocument();
    expect(screen.getByText("Warehouse B")).toBeInTheDocument();
  });

  it("renders warehouse locations", () => {
    render(<WarehousesTable {...defaultProps} />);
    expect(screen.getByText("Tehran")).toBeInTheDocument();
    expect(screen.getByText("Isfahan")).toBeInTheDocument();
  });

  it("renders product counts", () => {
    render(<WarehousesTable {...defaultProps} />);
    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("renders total quantities", () => {
    render(<WarehousesTable {...defaultProps} />);
    expect(screen.getByText("50")).toBeInTheDocument();
  });

  it("renders edit buttons for each warehouse", () => {
    render(<WarehousesTable {...defaultProps} />);
    const editButtons = screen.getAllByText("ویرایش");
    expect(editButtons).toHaveLength(2);
  });

  it("renders delete buttons for each warehouse", () => {
    render(<WarehousesTable {...defaultProps} />);
    const deleteButtons = screen.getAllByText("حذف");
    expect(deleteButtons).toHaveLength(2);
  });

  it("renders product buttons for each warehouse", () => {
    render(<WarehousesTable {...defaultProps} />);
    const productButtons = screen.getAllByText("محصولات");
    expect(productButtons).toHaveLength(2);
  });

  it("calls onEdit when edit is clicked", () => {
    render(<WarehousesTable {...defaultProps} />);
    const editButtons = screen.getAllByText("ویرایش");
    fireEvent.click(editButtons[0]);
    expect(defaultProps.onEdit).toHaveBeenCalledWith(mockItems[0]);
  });

  it("calls onDelete when delete is clicked", () => {
    render(<WarehousesTable {...defaultProps} />);
    const deleteButtons = screen.getAllByText("حذف");
    fireEvent.click(deleteButtons[0]);
    expect(defaultProps.onDelete).toHaveBeenCalledWith(mockItems[0]);
  });

  it("calls onProducts when products button is clicked", () => {
    render(<WarehousesTable {...defaultProps} />);
    const productButtons = screen.getAllByText("محصولات");
    fireEvent.click(productButtons[0]);
    expect(defaultProps.onProducts).toHaveBeenCalledWith(mockItems[0]);
  });

  it("shows loading indicator when loading", () => {
    render(<WarehousesTable {...defaultProps} loading={true} />);
    expect(screen.getByTestId("loading")).toBeInTheDocument();
  });

  it("shows specific product quantity column when searching", () => {
    render(<WarehousesTable {...defaultProps} isSearching={true} />);
    expect(screen.getByText("3 عدد")).toBeInTheDocument();
  });

  it("shows 'نامexisting' for zero specific quantity when searching", () => {
    render(<WarehousesTable {...defaultProps} isSearching={true} />);
    expect(screen.getByText("ناموجود")).toBeInTheDocument();
  });

  it("does not show specific quantity column when not searching", () => {
    render(<WarehousesTable {...defaultProps} isSearching={false} />);
    expect(screen.queryByText("تعداد این محصول")).not.toBeInTheDocument();
  });
});
