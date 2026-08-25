import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

import BranchForm from "../BranchForm";

vi.mock("antd", () => ({
  Form: Object.assign(
    ({ children, onFinish, className }: any) => (
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
    {
      Item: ({ children, label, name }: any) => (
        <div data-testid={`form-item-${name}`}>
          <label>{label}</label>
          {children}
        </div>
      ),
    }
  ),
  Input: ({ placeholder, className, maxLength }: any) => (
    <input placeholder={placeholder} className={className} maxLength={maxLength} />
  ),
  Select: ({ placeholder, options, onChange, className }: any) => (
    <select className={className} onChange={(e) => onChange?.(e.target.value)}>
      <option>{placeholder}</option>
      {options?.map((opt: any) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  ),
  Button: ({ children, onClick, htmlType, type, className }: any) => (
    <button type={htmlType} onClick={onClick} className={className} data-type={type}>
      {children}
    </button>
  ),
}));

describe("BranchForm", () => {
  const mockOnFinish = vi.fn();
  const mockOnCancel = vi.fn();
  const mockForm = {
    getFieldValue: vi.fn(),
    getFieldsValue: vi.fn().mockReturnValue({}),
    setFieldsValue: vi.fn(),
    resetFields: vi.fn(),
    validateFields: vi.fn().mockResolvedValue({}),
  };
  const mockUsers = [
    {
      UserID: 1,
      Username: "user1",
      FirstName: "Ali",
      LastName: "Rezaei",
      PhoneNumber: "09121234567",
    },
    {
      UserID: 2,
      Username: "user2",
      FirstName: "Sara",
      LastName: "Ahmadi",
      PhoneNumber: "09351234567",
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderForm = (props: Partial<React.ComponentProps<typeof BranchForm>> = {}) => {
    return render(
      <BranchForm
        form={mockForm as any}
        onFinish={mockOnFinish}
        onCancel={mockOnCancel}
        submitButtonText="ایجاد"
        {...props}
      />
    );
  };

  it("renders branch name input", () => {
    renderForm();
    expect(screen.getByText("نام شعبه")).toBeInTheDocument();
  });

  it("renders branch code input", () => {
    renderForm();
    expect(screen.getByText("کد شعبه")).toBeInTheDocument();
  });

  it("renders user selector when not in edit mode", () => {
    renderForm({ users: mockUsers });
    expect(screen.getAllByText("انتخاب کاربر").length).toBeGreaterThanOrEqual(1);
  });

  it("hides user selector in edit mode", () => {
    renderForm({ isEdit: true, users: mockUsers });
    expect(screen.queryByText("انتخاب کاربر")).not.toBeInTheDocument();
  });

  it("renders submit button with provided text", () => {
    renderForm({ submitButtonText: "ایجاد شعبه" });
    expect(screen.getByText("ایجاد شعبه")).toBeInTheDocument();
  });

  it("renders cancel button", () => {
    renderForm();
    expect(screen.getByText("انصراف")).toBeInTheDocument();
  });

  it("calls onCancel when cancel button is clicked", () => {
    renderForm();
    fireEvent.click(screen.getByText("انصراف"));
    expect(mockOnCancel).toHaveBeenCalled();
  });
});
