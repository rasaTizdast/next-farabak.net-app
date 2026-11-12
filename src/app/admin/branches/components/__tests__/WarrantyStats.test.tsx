import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@ant-design/icons", () => ({
  LoadingOutlined: () => <span data-testid="loading-icon">loading</span>,
  CheckCircleOutlined: () => <span>check</span>,
  CloseCircleOutlined: () => <span>close</span>,
  SyncOutlined: () => <span data-testid="sync-icon">sync</span>,
  TeamOutlined: () => <span>team</span>,
  ReloadOutlined: () => <span>reload</span>,
}));

vi.mock("antd", () => ({
  Card: ({ children, title, className }: any) => (
    <div className={className}>
      {title && <div>{title}</div>}
      {children}
    </div>
  ),
  Spin: ({ indicator }: any) => <div data-testid="spin">{indicator}</div>,
  Alert: ({ message, description, type }: any) => (
    <div data-testid={`alert-${type}`}>
      <span>{message}</span>
      <div>{description}</div>
    </div>
  ),
  Statistic: ({ title, value, prefix }: any) => (
    <div data-testid="statistic">
      {prefix}
      <div>{title}</div>
      <span>{value}</span>
    </div>
  ),
  Row: ({ children }: any) => <div>{children}</div>,
  Col: ({ children }: any) => <div>{children}</div>,
  Typography: {
    Title: ({ children }: any) => <div>{children}</div>,
    Text: ({ children, className }: any) => <span className={className}>{children}</span>,
  },
  Empty: ({ description }: any) => <div data-testid="empty">{description}</div>,
  Button: ({ children, onClick, icon, loading }: any) => (
    <button onClick={onClick} data-loading={loading}>
      {icon}
      {children}
    </button>
  ),
}));

const mockRefetch = vi.fn();

let mockUseApiFetchResult: any = {
  data: {
    allBranches: [
      {
        branchid: 1,
        branch_name: "Branch A",
        active_count: 5,
        expired_count: 2,
        requested_count: 3,
      },
      {
        branchid: 2,
        branch_name: "Branch B",
        active_count: 10,
        expired_count: 1,
        requested_count: 0,
      },
    ],
  },
  loading: false,
  error: null,
  refetch: mockRefetch,
};

vi.mock("@/hooks/useApiFetch", () => ({
  useApiFetch: () => mockUseApiFetchResult,
}));

import WarrantyStats from "../WarrantyStats";

describe("WarrantyStats", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseApiFetchResult = {
      data: {
        allBranches: [
          {
            branchid: 1,
            branch_name: "Branch A",
            active_count: 5,
            expired_count: 2,
            requested_count: 3,
          },
          {
            branchid: 2,
            branch_name: "Branch B",
            active_count: 10,
            expired_count: 1,
            requested_count: 0,
          },
        ],
      },
      loading: false,
      error: null,
      refetch: mockRefetch,
    };
  });

  it("renders the component with data", () => {
    render(<WarrantyStats />);
    expect(screen.getByText("آمار کلی گارانتی‌ها")).toBeInTheDocument();
  });

  it("renders branch names", () => {
    render(<WarrantyStats />);
    expect(screen.getByText("Branch A")).toBeInTheDocument();
    expect(screen.getByText("Branch B")).toBeInTheDocument();
  });

  it("renders refresh button", () => {
    render(<WarrantyStats />);
    expect(screen.getByText("بروزرسانی")).toBeInTheDocument();
  });

  it("renders total statistics", () => {
    render(<WarrantyStats />);
    const statistics = screen.getAllByTestId("statistic");
    expect(statistics.length).toBeGreaterThanOrEqual(3);
  });

  it("calls refetch when refresh button is clicked", () => {
    render(<WarrantyStats />);
    fireEvent.click(screen.getByText("بروزرسانی"));
    expect(mockRefetch).toHaveBeenCalled();
  });

  it("shows loading spinner when loading", () => {
    mockUseApiFetchResult = {
      data: null,
      loading: true,
      error: null,
      refetch: mockRefetch,
    };
    render(<WarrantyStats />);
    expect(screen.getByTestId("spin")).toBeInTheDocument();
  });

  it("shows error alert on error", () => {
    mockUseApiFetchResult = {
      data: null,
      loading: false,
      error: "Failed to load",
      refetch: mockRefetch,
    };
    render(<WarrantyStats />);
    expect(screen.getByText("خطا")).toBeInTheDocument();
    expect(screen.getByText("تلاش مجدد")).toBeInTheDocument();
  });

  it("shows empty message when no branches", () => {
    mockUseApiFetchResult = {
      data: { allBranches: [] },
      loading: false,
      error: null,
      refetch: mockRefetch,
    };
    render(<WarrantyStats />);
    expect(screen.getByText("هیچ آماری موجود نیست")).toBeInTheDocument();
  });
});
