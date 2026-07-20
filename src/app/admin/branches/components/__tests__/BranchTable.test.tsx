import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

vi.mock("antd", () => ({
  Button: ({ children, onClick, icon, danger, className }: any) => (
    <button onClick={onClick} className={className} data-danger={danger}>
      {icon}
      {children}
    </button>
  ),
  Popconfirm: ({ children, onConfirm }: any) => (
    <div>
      {children}
      <button data-testid="popconfirm-confirm" onClick={onConfirm}>confirm</button>
    </div>
  ),
  Empty: Object.assign(({ description }: any) => <div>{description}</div>, { PRESENTED_IMAGE_SIMPLE: null }),
  Tooltip: ({ children, title }: any) => <div title={title}>{children}</div>,
  Tag: ({ children, color }: any) => <span data-color={color}>{children}</span>,
  Space: ({ children }: any) => <div>{children}</div>,
}));

vi.mock("../PersianTable", () => ({
  default: ({ columns, dataSource, rowKey, loading, locale }: any) => (
    <div data-testid="persian-table">
      {loading && <div data-testid="loading">loading</div>}
      {dataSource?.length === 0 && locale?.emptyText}
      {dataSource?.map((item: any) => (
        <div key={item[rowKey]} data-testid={`row-${item[rowKey]}`}>
          {columns.map((col: any, idx: number) => (
            <div key={`${rowKey}-${col.key}-${idx}`}>
              {col.render ? col.render(item[col.dataIndex], item) : item[col.dataIndex]}
            </div>
          ))}
        </div>
      ))}
    </div>
  ),
}));

vi.mock("../StatusBadge", () => ({
  default: ({ productCount, totalQuantity }: any) => (
    <span data-testid="status-badge">{productCount} products, {totalQuantity} total</span>
  ),
}));

import BranchTable from "../BranchTable";

const mockBranches = [
  {
    branchid: 1,
    name: "Branch A",
    location: "BR001",
    productCount: 5,
    totalQuantity: 20,
    specificProductQuantity: 3,
    createdat: "2024-01-15",
    UserID: 1,
  },
  {
    branchid: 2,
    name: "Branch B",
    location: "BR002",
    productCount: 0,
    totalQuantity: 0,
    specificProductQuantity: 0,
    createdat: "2024-02-20",
    UserID: 2,
  },
];

describe("BranchTable", () => {
  const defaultProps = {
    branches: mockBranches,
    loading: false,
    onEdit: vi.fn(),
    onDelete: vi.fn(),
    onViewProducts: vi.fn(),
    onCreateInvoice: vi.fn(),
    isSearching: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the table with branch data", () => {
    render(<BranchTable {...defaultProps} />);
    expect(screen.getByTestId("persian-table")).toBeInTheDocument();
    expect(screen.getByText("Branch A")).toBeInTheDocument();
    expect(screen.getByText("Branch B")).toBeInTheDocument();
  });

  it("renders branch locations", () => {
    render(<BranchTable {...defaultProps} />);
    expect(screen.getByText("BR001")).toBeInTheDocument();
    expect(screen.getByText("BR002")).toBeInTheDocument();
  });

  it("renders status badges", () => {
    render(<BranchTable {...defaultProps} />);
    expect(screen.getByText("5 products, 20 total")).toBeInTheDocument();
    expect(screen.getByText("0 products, 0 total")).toBeInTheDocument();
  });

  it("renders edit buttons for each branch", () => {
    render(<BranchTable {...defaultProps} />);
    const editButtons = screen.getAllByText("ویرایش");
    expect(editButtons).toHaveLength(2);
  });

  it("renders product buttons for each branch", () => {
    render(<BranchTable {...defaultProps} />);
    const productButtons = screen.getAllByText("محصولات");
    expect(productButtons).toHaveLength(2);
  });

  it("renders invoice buttons for each branch", () => {
    render(<BranchTable {...defaultProps} />);
    const invoiceButtons = screen.getAllByText("فاکتور");
    expect(invoiceButtons).toHaveLength(2);
  });

  it("renders delete buttons for each branch", () => {
    render(<BranchTable {...defaultProps} />);
    const deleteButtons = screen.getAllByText("حذف");
    expect(deleteButtons).toHaveLength(2);
  });

  it("calls onEdit with branch when edit is clicked", () => {
    render(<BranchTable {...defaultProps} />);
    const editButtons = screen.getAllByText("ویرایش");
    fireEvent.click(editButtons[0]);
    expect(defaultProps.onEdit).toHaveBeenCalledWith(mockBranches[0]);
  });

  it("calls onViewProducts when products button is clicked", () => {
    render(<BranchTable {...defaultProps} />);
    const productButtons = screen.getAllByText("محصولات");
    fireEvent.click(productButtons[0]);
    expect(defaultProps.onViewProducts).toHaveBeenCalledWith(mockBranches[0]);
  });

  it("calls onCreateInvoice when invoice button is clicked", () => {
    render(<BranchTable {...defaultProps} />);
    const invoiceButtons = screen.getAllByText("فاکتور");
    fireEvent.click(invoiceButtons[0]);
    expect(defaultProps.onCreateInvoice).toHaveBeenCalledWith(mockBranches[0]);
  });

  it("calls onDelete when delete confirm is clicked", () => {
    render(<BranchTable {...defaultProps} />);
    const confirmButtons = screen.getAllByTestId("popconfirm-confirm");
    fireEvent.click(confirmButtons[0]);
    expect(defaultProps.onDelete).toHaveBeenCalledWith(1);
  });

  it("shows loading indicator when loading", () => {
    render(<BranchTable {...defaultProps} loading={true} />);
    expect(screen.getByTestId("loading")).toBeInTheDocument();
  });

  it("shows specific product quantity when searching", () => {
    render(<BranchTable {...defaultProps} isSearching={true} />);
    expect(screen.getByText("3 عدد")).toBeInTheDocument();
  });

  it("shows not found text for zero specific product when searching", () => {
    const { container } = render(<BranchTable {...defaultProps} isSearching={true} />);
    expect(container.textContent).toContain("ناموجود");
  });
});
