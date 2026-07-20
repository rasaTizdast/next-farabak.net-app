import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

const mockFetch = vi.fn();
global.fetch = mockFetch;

vi.mock("antd", () => ({
  LoadingOutlined: () => <span data-testid="loading-icon">loading</span>,
  CheckCircleOutlined: () => <span>check</span>,
  PhoneOutlined: () => <span>phone</span>,
  UserOutlined: () => <span>user</span>,
  ReloadOutlined: () => <span>reload</span>,
  ExclamationCircleFilled: () => <span>!</span>,
  Table: ({ columns, dataSource, rowKey }: any) => (
    <div data-testid="table">
      {dataSource?.map((item: any) => (
        <div key={item[rowKey]}>
          {columns?.map((col: any) => (
            <div key={col.key}>
              {col.render ? col.render(item[col.dataIndex], item) : item[col.dataIndex]}
            </div>
          ))}
        </div>
      ))}
    </div>
  ),
  Spin: ({ indicator }: any) => <div data-testid="spin">{indicator}</div>,
  Alert: ({ message, description, type, showIcon }: any) => (
    <div data-testid={`alert-${type}`}>
      <span>{message}</span>
      <div>{description}</div>
    </div>
  ),
  Tag: ({ children, color }: any) => <span data-color={color}>{children}</span>,
  Typography: Object.assign({}, {
    Text: ({ children, className }: any) => <span className={className}>{children}</span>,
  }),
  Pagination: ({ current, pageSize, total, onChange }: any) => (
    <div data-testid="pagination">
      <button onClick={() => onChange?.(2)}>page 2</button>
    </div>
  ),
  Modal: Object.assign(
    ({ open, title, children }: any) => open ? <div>{children}</div> : null,
    { confirm: vi.fn() }
  ),
  Button: ({ children, onClick, icon, loading, htmlType, type, className }: any) => (
    <button onClick={onClick} data-loading={loading} className={className}>{icon}{children}</button>
  ),
}));

vi.mock("@ant-design/icons", () => ({
  LoadingOutlined: () => <span data-testid="loading-icon">loading</span>,
  CheckCircleOutlined: () => <span>check</span>,
  PhoneOutlined: () => <span>phone</span>,
  UserOutlined: () => <span>user</span>,
  ReloadOutlined: () => <span>reload</span>,
  ExclamationCircleFilled: () => <span>!</span>,
}));

import WarrantyRequests from "../WarrantyRequests";

describe("WarrantyRequests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns null when tab is not active and no data fetched", () => {
    mockFetch.mockResolvedValue({ ok: false });
    const { container } = render(<WarrantyRequests isTabActive={false} />);
    expect(container.innerHTML).toBe("");
  });

  it("shows loading state initially", async () => {
    mockFetch.mockImplementation(() => new Promise(() => {}));
    render(<WarrantyRequests isTabActive={true} />);
    expect(screen.getByTestId("spin")).toBeInTheDocument();
  });

  it("shows empty alert when no requests", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        requests: [],
        pagination: { currentPage: 1, pageSize: 10, totalCount: 0, totalPages: 0 },
      }),
    });

    render(<WarrantyRequests isTabActive={true} />);
    await waitFor(() => {
      expect(screen.getByText("هیچ درخواست بررسی گارانتی موجود نیست")).toBeInTheDocument();
    });
  });

  it("renders requests in table when data is available", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        requests: [
          {
            warrantyid: 1,
            warrantycode: "WR-001",
            startdate: "2024-01-01",
            expirydate: "2025-01-01",
            status: "requested",
            branch_name: "Branch A",
            product_name: "Laptop",
            customer_name: "Ali",
            customer_phone: "09121234567",
          },
        ],
        pagination: { currentPage: 1, pageSize: 10, totalCount: 1, totalPages: 1 },
      }),
    });

    render(<WarrantyRequests isTabActive={true} />);
    await waitFor(() => {
      expect(screen.getByTestId("table")).toBeInTheDocument();
    });
    expect(screen.getByText("WR-001")).toBeInTheDocument();
    expect(screen.getByText("Branch A")).toBeInTheDocument();
  });

  it("shows error alert on fetch failure", async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      statusText: "Internal Server Error",
    });

    render(<WarrantyRequests isTabActive={true} />);
    await waitFor(() => {
      expect(screen.getByText("خطا")).toBeInTheDocument();
    });
  });

  it("shows refresh button", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        requests: [],
        pagination: { currentPage: 1, pageSize: 10, totalCount: 0, totalPages: 0 },
      }),
    });

    render(<WarrantyRequests isTabActive={true} />);
    await waitFor(() => {
      expect(screen.getByText("بروزرسانی")).toBeInTheDocument();
    });
  });

  it("renders header text", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        requests: [],
        pagination: { currentPage: 1, pageSize: 10, totalCount: 0, totalPages: 0 },
      }),
    });

    render(<WarrantyRequests isTabActive={true} />);
    await waitFor(() => {
      expect(screen.getByText("درخواست‌های بررسی گارانتی")).toBeInTheDocument();
    });
  });
});
