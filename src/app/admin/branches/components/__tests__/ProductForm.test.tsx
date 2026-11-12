import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

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
      Item: ({ children, label, className }: any) => (
        <div className={className}>
          {label && <label>{label}</label>}
          {children}
        </div>
      ),
    }
  ),
  Select: ({ placeholder, options, onChange, className }: any) => (
    <select className={className} onChange={(e) => onChange?.(Number(e.target.value))}>
      <option>{placeholder}</option>
      {options?.map((opt: any) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  ),
  InputNumber: ({ min, onChange, className }: any) => (
    <input
      type="number"
      min={min}
      onChange={(e) => onChange?.(Number(e.target.value))}
      className={className}
    />
  ),
  Button: ({ children, onClick, htmlType, icon, className, type }: any) => (
    <button type={htmlType} onClick={onClick} className={className} data-type={type}>
      {icon}
      {children}
    </button>
  ),
}));

vi.mock("@ant-design/icons", () => ({
  PlusOutlined: () => <span>+</span>,
}));

import ProductForm from "../ProductForm";

describe("ProductForm", () => {
  let form: any;
  const mockOnFinish = vi.fn();
  const mockOnSelectProduct = vi.fn();
  const mockOnQuantityChange = vi.fn();
  const mockProducts = [
    {
      ProductId: 1,
      Type: "Laptop",
      Name: "Test Laptop",
      Price: "500",
      Discount: "50",
      quantity: 10,
    },
    { ProductId: 2, Type: "Phone", Name: "Test Phone", Price: "300", Discount: "30", quantity: 20 },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    form = {
      resetFields: vi.fn(),
      validateFields: vi.fn().mockResolvedValue({}),
      setFieldsValue: vi.fn(),
    };
  });

  it("renders add product heading", () => {
    render(
      <ProductForm
        form={form}
        allProducts={mockProducts}
        onFinish={mockOnFinish}
        onSelectProduct={mockOnSelectProduct}
        onQuantityChange={mockOnQuantityChange}
      />
    );
    expect(screen.getByText("افزودن محصول جدید")).toBeInTheDocument();
  });

  it("renders product select dropdown", () => {
    render(
      <ProductForm
        form={form}
        allProducts={mockProducts}
        onFinish={mockOnFinish}
        onSelectProduct={mockOnSelectProduct}
        onQuantityChange={mockOnQuantityChange}
      />
    );
    expect(screen.getByText("انتخاب محصول")).toBeInTheDocument();
  });

  it("renders quantity input", () => {
    render(
      <ProductForm
        form={form}
        allProducts={mockProducts}
        onFinish={mockOnFinish}
        onSelectProduct={mockOnSelectProduct}
        onQuantityChange={mockOnQuantityChange}
      />
    );
    expect(screen.getByText("تعداد")).toBeInTheDocument();
  });

  it("renders submit button", () => {
    render(
      <ProductForm
        form={form}
        allProducts={mockProducts}
        onFinish={mockOnFinish}
        onSelectProduct={mockOnSelectProduct}
        onQuantityChange={mockOnQuantityChange}
      />
    );
    expect(screen.getByText("افزودن محصول")).toBeInTheDocument();
  });

  it("renders product options in select", () => {
    render(
      <ProductForm
        form={form}
        allProducts={mockProducts}
        onFinish={mockOnFinish}
        onSelectProduct={mockOnSelectProduct}
        onQuantityChange={mockOnQuantityChange}
      />
    );
    expect(screen.getByText("Laptop")).toBeInTheDocument();
    expect(screen.getByText("Phone")).toBeInTheDocument();
  });
});
