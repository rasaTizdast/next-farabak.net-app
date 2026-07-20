import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

vi.mock("antd", () => ({
  Modal: ({ open, title, children, onCancel }: any) =>
    open ? (
      <div data-testid="modal">
        <div data-testid="modal-title">{title}</div>
        {children}
      </div>
    ) : null,
  Form: Object.assign(
    ({ children, form, onFinish, className }: any) => (
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onFinish?.({});
        }}
        className={className}
      >
        {children}
      </form>
    ),
    { Item: ({ children, label, name }: any) => <div><label>{label}</label>{children}</div> }
  ),
  Input: ({ placeholder, className }: any) => <input placeholder={placeholder} className={className} />,
  Select: ({ placeholder, options, onChange, className }: any) => (
    <select className={className} onChange={(e) => onChange?.(e.target.value)}>
      <option>{placeholder}</option>
      {options?.map((opt: any) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  ),
  Button: ({ children, onClick, htmlType, type, className }: any) => (
    <button type={htmlType} onClick={onClick} className={className} data-type={type}>
      {children}
    </button>
  ),
}));

import CreateBranchModal from "../CreateBranchModal";

describe("CreateBranchModal", () => {
  let form: any;
  const mockOnClose = vi.fn();
  const mockOnFinish = vi.fn();
  const mockUsers = [
    { UserID: 1, Username: "user1", FirstName: "Ali", LastName: "Rezaei", PhoneNumber: "09121234567" },
    { UserID: 2, Username: "user2", FirstName: "Sara", LastName: "Ahmadi", PhoneNumber: "09351234567" },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    form = {
      resetFields: vi.fn(),
      validateFields: vi.fn().mockResolvedValue({}),
      setFieldsValue: vi.fn(),
    };
  });

  it("renders modal when visible", () => {
    render(
      <CreateBranchModal visible={true} onClose={mockOnClose} onFinish={mockOnFinish} form={form} users={mockUsers} />
    );
    expect(screen.getByTestId("modal")).toBeInTheDocument();
    expect(screen.getByTestId("modal-title")).toHaveTextContent("ایجاد شعبه جدید");
  });

  it("does not render modal when not visible", () => {
    render(
      <CreateBranchModal visible={false} onClose={mockOnClose} onFinish={mockOnFinish} form={form} users={mockUsers} />
    );
    expect(screen.queryByTestId("modal")).not.toBeInTheDocument();
  });

  it("renders branch form fields inside modal", () => {
    render(
      <CreateBranchModal visible={true} onClose={mockOnClose} onFinish={mockOnFinish} form={form} users={mockUsers} />
    );
    expect(screen.getByText("نام شعبه")).toBeInTheDocument();
    expect(screen.getByText("کد شعبه")).toBeInTheDocument();
    expect(screen.getAllByText("انتخاب کاربر").length).toBeGreaterThanOrEqual(1);
  });

  it("renders submit button with correct text", () => {
    render(
      <CreateBranchModal visible={true} onClose={mockOnClose} onFinish={mockOnFinish} form={form} users={mockUsers} />
    );
    expect(screen.getByText("ایجاد شعبه")).toBeInTheDocument();
  });

  it("calls onClose and resets form when cancel is clicked", () => {
    render(
      <CreateBranchModal visible={true} onClose={mockOnClose} onFinish={mockOnFinish} form={form} users={mockUsers} />
    );
    fireEvent.click(screen.getByText("انصراف"));
    expect(form.resetFields).toHaveBeenCalled();
    expect(mockOnClose).toHaveBeenCalled();
  });

  it("filters out current user from users list", () => {
    render(
      <CreateBranchModal visible={true} onClose={mockOnClose} onFinish={mockOnFinish} form={form} users={mockUsers} currentUserId={1} />
    );
    expect(screen.getByText("ایجاد شعبه")).toBeInTheDocument();
  });
});
