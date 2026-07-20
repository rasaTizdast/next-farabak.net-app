import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

vi.mock("../ui", () => ({
  ModalBase: ({ open, onClose, title, children, footer }: any) =>
    open ? (
      <div data-testid="modal">
        <div data-testid="modal-title">{title}</div>
        <div data-testid="modal-body">{children}</div>
        <div data-testid="modal-footer">{footer}</div>
      </div>
    ) : null,
  ButtonBase: ({ children, onClick, disabled, variant, className }: any) => (
    <button onClick={onClick} disabled={disabled} className={className} data-variant={variant}>
      {children}
    </button>
  ),
  InputBase: ({ value, onChange, placeholder, required, className, id, type, min }: any) => (
    <input
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      className={className}
      id={id}
      type={type}
      min={min}
    />
  ),
}));

import WarehouseFormModal from "../WarehouseFormModal";

describe("WarehouseFormModal", () => {
  const defaultProps = {
    open: true,
    onClose: vi.fn(),
    onSubmit: vi.fn(),
    editing: false,
    formName: "",
    setFormName: vi.fn(),
    formLocation: "",
    setFormLocation: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders create modal when not editing", () => {
    render(<WarehouseFormModal {...defaultProps} />);
    expect(screen.getByTestId("modal-title")).toHaveTextContent("ایجاد انبار جدید");
  });

  it("renders edit modal when editing", () => {
    render(<WarehouseFormModal {...defaultProps} editing={true} />);
    expect(screen.getByTestId("modal-title")).toHaveTextContent("ویرایش انبار");
  });

  it("does not render when not open", () => {
    render(<WarehouseFormModal {...defaultProps} open={false} />);
    expect(screen.queryByTestId("modal")).not.toBeInTheDocument();
  });

  it("renders warehouse name input", () => {
    render(<WarehouseFormModal {...defaultProps} />);
    expect(screen.getByPlaceholderText("نام انبار را وارد کنید")).toBeInTheDocument();
  });

  it("renders location input", () => {
    render(<WarehouseFormModal {...defaultProps} />);
    expect(screen.getByPlaceholderText("مکان انبار را وارد کنید")).toBeInTheDocument();
  });

  it("renders cancel button", () => {
    render(<WarehouseFormModal {...defaultProps} />);
    expect(screen.getByText("انصراف")).toBeInTheDocument();
  });

  it("renders submit button", () => {
    render(<WarehouseFormModal {...defaultProps} />);
    expect(screen.getByText("ایجاد")).toBeInTheDocument();
  });

  it("renders update button when editing", () => {
    render(<WarehouseFormModal {...defaultProps} editing={true} />);
    expect(screen.getByText("ذخیره")).toBeInTheDocument();
  });

  it("calls onClose when cancel is clicked", () => {
    render(<WarehouseFormModal {...defaultProps} />);
    fireEvent.click(screen.getByText("انصراف"));
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it("calls onSubmit when submit button is clicked", () => {
    render(<WarehouseFormModal {...defaultProps} formName="Warehouse 1" formLocation="Location 1" />);
    fireEvent.click(screen.getByText("ایجاد"));
    expect(defaultProps.onSubmit).toHaveBeenCalled();
  });

  it("disables submit when form is invalid", () => {
    render(<WarehouseFormModal {...defaultProps} formName="" formLocation="" />);
    const submitBtn = screen.getByText("ایجاد");
    expect(submitBtn).toBeDisabled();
  });

  it("enables submit when form is valid", () => {
    render(<WarehouseFormModal {...defaultProps} formName="Warehouse 1" formLocation="Location 1" />);
    const submitBtn = screen.getByText("ایجاد");
    expect(submitBtn).not.toBeDisabled();
  });

  it("shows duplicate name error", () => {
    render(
      <WarehouseFormModal
        {...defaultProps}
        formName="Warehouse A"
        formLocation="Loc"
        existingWarehouses={[{ warehouseid: 1, name: "Warehouse A" }]}
      />
    );
    expect(screen.getAllByText("نام انبار تکراری است. لطفاً نام دیگری انتخاب کنید.").length).toBeGreaterThanOrEqual(1);
  });

  it("allows same name when editing that warehouse", () => {
    render(
      <WarehouseFormModal
        {...defaultProps}
        editing={true}
        editingWarehouseId={1}
        formName="Warehouse A"
        formLocation="Loc"
        existingWarehouses={[{ warehouseid: 1, name: "Warehouse A" }]}
      />
    );
    expect(screen.queryByText("نام انبار تکراری است. لطفاً نام دیگری انتخاب کنید.")).not.toBeInTheDocument();
  });

  it("calls setFormName when name input changes", () => {
    render(<WarehouseFormModal {...defaultProps} />);
    const nameInput = screen.getByPlaceholderText("نام انبار را وارد کنید");
    fireEvent.change(nameInput, { target: { value: "New Name" } });
    expect(defaultProps.setFormName).toHaveBeenCalled();
  });

  it("calls setFormLocation when location input changes", () => {
    render(<WarehouseFormModal {...defaultProps} />);
    const locInput = screen.getByPlaceholderText("مکان انبار را وارد کنید");
    fireEvent.change(locInput, { target: { value: "New Location" } });
    expect(defaultProps.setFormLocation).toHaveBeenCalled();
  });
});
