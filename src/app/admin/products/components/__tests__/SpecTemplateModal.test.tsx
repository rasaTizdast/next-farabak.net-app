import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("react-hot-toast", () => ({
  default: { success: vi.fn(), error: vi.fn() },
  toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock("@/hooks/useApiMutation", () => ({
  useApiMutation: () => ({
    mutate: vi.fn().mockResolvedValue({ success: true }),
    loading: false,
    error: null,
    reset: vi.fn(),
  }),
}));

import SpecTemplateModal from "../SpecTemplateModal";

describe("SpecTemplateModal", () => {
  const mockOnClose = vi.fn();
  const mockOnTemplateAdded = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders create template heading when no template to edit", () => {
    render(<SpecTemplateModal onClose={mockOnClose} onTemplateAdded={mockOnTemplateAdded} />);
    expect(screen.getByText("ایجاد قالب مشخصات جدید")).toBeInTheDocument();
  });

  it("renders edit heading when template is provided", () => {
    const template = {
      SpecTemplateId: 1,
      Name: "CPU Specs",
      Items: [{ SpecTemplateItemId: 1, SpecTemplateId: 1, Title: "Core Count" }],
    };
    render(
      <SpecTemplateModal
        onClose={mockOnClose}
        onTemplateAdded={mockOnTemplateAdded}
        templateToEdit={template}
      />
    );
    expect(screen.getByText("ویرایش قالب مشخصات")).toBeInTheDocument();
  });

  it("renders template name input", () => {
    render(<SpecTemplateModal onClose={mockOnClose} onTemplateAdded={mockOnTemplateAdded} />);
    expect(screen.getByLabelText("نام قالب")).toBeInTheDocument();
  });

  it("renders add item button", () => {
    render(<SpecTemplateModal onClose={mockOnClose} onTemplateAdded={mockOnTemplateAdded} />);
    expect(screen.getByText("+ افزودن مورد")).toBeInTheDocument();
  });

  it("adds a new item when add button is clicked", () => {
    render(<SpecTemplateModal onClose={mockOnClose} onTemplateAdded={mockOnTemplateAdded} />);
    const items = screen.getAllByLabelText("عنوان مشخصات");
    expect(items).toHaveLength(1);
    fireEvent.click(screen.getByText("+ افزودن مورد"));
    const updatedItems = screen.getAllByLabelText("عنوان مشخصات");
    expect(updatedItems).toHaveLength(2);
  });

  it("calls onClose when cancel button is clicked", () => {
    render(<SpecTemplateModal onClose={mockOnClose} onTemplateAdded={mockOnTemplateAdded} />);
    fireEvent.click(screen.getByText("انصراف"));
    expect(mockOnClose).toHaveBeenCalled();
  });

  it("calls onClose when close button is clicked", () => {
    render(<SpecTemplateModal onClose={mockOnClose} onTemplateAdded={mockOnTemplateAdded} />);
    fireEvent.click(screen.getByLabelText("بستن"));
    expect(mockOnClose).toHaveBeenCalled();
  });

  it("shows create button text in create mode", () => {
    render(<SpecTemplateModal onClose={mockOnClose} onTemplateAdded={mockOnTemplateAdded} />);
    expect(screen.getByText("ایجاد")).toBeInTheDocument();
  });

  it("shows update button text in edit mode", () => {
    const template = {
      SpecTemplateId: 1,
      Name: "CPU Specs",
      Items: [],
    };
    render(
      <SpecTemplateModal
        onClose={mockOnClose}
        onTemplateAdded={mockOnTemplateAdded}
        templateToEdit={template}
      />
    );
    expect(screen.getByText("به‌روزرسانی")).toBeInTheDocument();
  });

  it("initializes form with template data in edit mode", () => {
    const template = {
      SpecTemplateId: 1,
      Name: "CPU Specs",
      Items: [
        { SpecTemplateItemId: 1, SpecTemplateId: 1, Title: "Core Count" },
        { SpecTemplateItemId: 2, SpecTemplateId: 1, Title: "Clock Speed" },
      ],
    };
    render(
      <SpecTemplateModal
        onClose={mockOnClose}
        onTemplateAdded={mockOnTemplateAdded}
        templateToEdit={template}
      />
    );
    expect((screen.getByLabelText("نام قالب") as HTMLInputElement).value).toBe("CPU Specs");
    const items = screen.getAllByLabelText("عنوان مشخصات");
    expect(items).toHaveLength(2);
    expect((items[0] as HTMLInputElement).value).toBe("Core Count");
    expect((items[1] as HTMLInputElement).value).toBe("Clock Speed");
  });
});
