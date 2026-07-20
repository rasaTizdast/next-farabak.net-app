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
    { Item: ({ children, label }: any) => <div><label>{label}</label>{children}</div> }
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

import EditBranchModal from "../EditBranchModal";

describe("EditBranchModal", () => {
  let form: any;
  const mockOnClose = vi.fn();
  const mockOnFinish = vi.fn();
  const mockBranch = {
    branchid: 1,
    name: "Test Branch",
    location: "BR001",
    productCount: 5,
    totalQuantity: 20,
    createdat: "2024-01-15",
    UserID: 1,
  };
  const mockUsers = [
    { UserID: 1, Username: "user1", FirstName: "Ali", LastName: "Rezaei", PhoneNumber: "09121234567" },
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
      <EditBranchModal visible={true} onClose={mockOnClose} onFinish={mockOnFinish} form={form} branch={mockBranch} users={mockUsers} />
    );
    expect(screen.getByTestId("modal")).toBeInTheDocument();
    expect(screen.getByTestId("modal-title")).toHaveTextContent("ویرایش شعبه");
  });

  it("does not render modal when not visible", () => {
    render(
      <EditBranchModal visible={false} onClose={mockOnClose} onFinish={mockOnFinish} form={form} branch={mockBranch} users={mockUsers} />
    );
    expect(screen.queryByTestId("modal")).not.toBeInTheDocument();
  });

  it("sets branch values in form when visible", () => {
    render(
      <EditBranchModal visible={true} onClose={mockOnClose} onFinish={mockOnFinish} form={form} branch={mockBranch} users={mockUsers} />
    );
    expect(form.setFieldsValue).toHaveBeenCalledWith({
      name: "Test Branch",
      location: "BR001",
    });
  });

  it("renders update submit button text", () => {
    render(
      <EditBranchModal visible={true} onClose={mockOnClose} onFinish={mockOnFinish} form={form} branch={mockBranch} users={mockUsers} />
    );
    expect(screen.getByText("بروزرسانی شعبه")).toBeInTheDocument();
  });

  it("does not render user selector in edit mode", () => {
    render(
      <EditBranchModal visible={true} onClose={mockOnClose} onFinish={mockOnFinish} form={form} branch={mockBranch} users={mockUsers} />
    );
    expect(screen.queryByLabelText("انتخاب کاربر")).not.toBeInTheDocument();
  });

  it("calls onClose and resets form when cancel is clicked", () => {
    render(
      <EditBranchModal visible={true} onClose={mockOnClose} onFinish={mockOnFinish} form={form} branch={mockBranch} users={mockUsers} />
    );
    fireEvent.click(screen.getByText("انصراف"));
    expect(form.resetFields).toHaveBeenCalled();
    expect(mockOnClose).toHaveBeenCalled();
  });
});
