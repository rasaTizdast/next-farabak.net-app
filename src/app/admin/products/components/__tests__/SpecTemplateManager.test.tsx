import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import axios from "axios";

vi.mock("axios");
const mockAxiosGet = vi.mocked(axios.get);

vi.mock("react-hot-toast", () => ({
  default: { success: vi.fn(), error: vi.fn() },
  toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock("@/hooks/useApiFetch", () => ({
  useApiFetch: () => ({
    data: [
      {
        SpecTemplateId: 1,
        Name: "CPU Specs",
        Items: [
          { SpecTemplateItemId: 1, SpecTemplateId: 1, Title: "Core Count" },
          { SpecTemplateItemId: 2, SpecTemplateId: 1, Title: "Clock Speed" },
        ],
      },
    ],
    loading: false,
    error: null,
    refetch: vi.fn(),
  }),
}));

vi.mock("@/hooks/useApiMutation", () => ({
  useApiMutation: () => ({
    mutate: vi.fn().mockResolvedValue({ success: true }),
    loading: false,
    error: null,
    reset: vi.fn(),
  }),
}));

vi.mock("../SpecTemplateModal", () => ({
  default: ({ onClose, templateToEdit }: any) => (
    <div data-testid="spec-template-modal">
      {templateToEdit ? "Editing" : "Creating"}
      <button onClick={onClose}>Close Modal</button>
    </div>
  ),
}));

import SpecTemplateManager from "../SpecTemplateManager";

describe("SpecTemplateManager", () => {
  const mockOnClose = vi.fn();
  const mockOnTemplateSelect = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockAxiosGet.mockResolvedValue({ data: { Items: [{ Title: "Core Count" }, { Title: "Clock Speed" }] } });
  });

  it("renders the manager heading", () => {
    render(<SpecTemplateManager onClose={mockOnClose} onTemplateSelect={mockOnTemplateSelect} />);
    expect(screen.getByText("مدیریت قالب‌های مشخصات")).toBeInTheDocument();
  });

  it("renders create template button", () => {
    render(<SpecTemplateManager onClose={mockOnClose} onTemplateSelect={mockOnTemplateSelect} />);
    expect(screen.getByText("ایجاد قالب جدید")).toBeInTheDocument();
  });

  it("renders existing templates", () => {
    render(<SpecTemplateManager onClose={mockOnClose} onTemplateSelect={mockOnTemplateSelect} />);
    expect(screen.getByText("CPU Specs")).toBeInTheDocument();
    expect(screen.getByText("2 مورد مشخصات")).toBeInTheDocument();
  });

  it("renders close button", () => {
    render(<SpecTemplateManager onClose={mockOnClose} onTemplateSelect={mockOnTemplateSelect} />);
    expect(screen.getByText("بستن")).toBeInTheDocument();
  });

  it("calls onClose when close button is clicked", () => {
    render(<SpecTemplateManager onClose={mockOnClose} onTemplateSelect={mockOnTemplateSelect} />);
    fireEvent.click(screen.getByText("بستن"));
    expect(mockOnClose).toHaveBeenCalled();
  });

  it("opens template modal when create button is clicked", () => {
    render(<SpecTemplateManager onClose={mockOnClose} onTemplateSelect={mockOnTemplateSelect} />);
    fireEvent.click(screen.getByText("ایجاد قالب جدید"));
    expect(screen.getByTestId("spec-template-modal")).toBeInTheDocument();
    expect(screen.getByText("Creating")).toBeInTheDocument();
  });

  it("shows select button for each template", () => {
    render(<SpecTemplateManager onClose={mockOnClose} onTemplateSelect={mockOnTemplateSelect} />);
    expect(screen.getByText("انتخاب")).toBeInTheDocument();
  });

  it("shows edit button for each template", () => {
    render(<SpecTemplateManager onClose={mockOnClose} onTemplateSelect={mockOnTemplateSelect} />);
    expect(screen.getByLabelText("ویرایش قالب")).toBeInTheDocument();
  });

  it("shows delete button for each template", () => {
    render(<SpecTemplateManager onClose={mockOnClose} onTemplateSelect={mockOnTemplateSelect} />);
    expect(screen.getByLabelText("حذف قالب")).toBeInTheDocument();
  });

  it("opens edit modal when edit button is clicked", () => {
    render(<SpecTemplateManager onClose={mockOnClose} onTemplateSelect={mockOnTemplateSelect} />);
    fireEvent.click(screen.getByLabelText("ویرایش قالب"));
    expect(screen.getByText("Editing")).toBeInTheDocument();
  });
});
