import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("react-hot-toast", () => ({
  default: { success: vi.fn(), error: vi.fn() },
}));

vi.mock("@/hooks/useApiFetch", () => ({
  useApiFetch: vi.fn(),
}));

vi.mock("@/hooks/useApiMutation", () => ({
  useApiMutation: vi.fn(() => ({
    mutate: vi.fn().mockResolvedValue({}),
  })),
}));

vi.mock("@/utils/jalaliDate", () => ({
  formatJalaliDate: vi.fn(() => "۱۴۰۳/۰۱/۰۱"),
}));

import { useApiFetch } from "@/hooks/useApiFetch";

import FaqManager from "../FaqManager";

const mockUseApiFetch = vi.mocked(useApiFetch);

describe("FaqManager", () => {
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseApiFetch.mockReturnValue({
      data: { faqs: [] },
      loading: false,
      refetch: vi.fn(),
    } as any);
  });

  it("renders the manager with title and close button", () => {
    render(<FaqManager blogId={1} onClose={mockOnClose} />);
    expect(screen.getByText("مدیریت سوالات متداول")).toBeDefined();
    expect(screen.getByLabelText("بستن")).toBeDefined();
  });

  it("calls onClose when close button is clicked", () => {
    render(<FaqManager blogId={1} onClose={mockOnClose} />);
    fireEvent.click(screen.getByLabelText("بستن"));
    expect(mockOnClose).toHaveBeenCalled();
  });

  it("shows empty state when no FAQs", () => {
    render(<FaqManager blogId={1} onClose={mockOnClose} />);
    expect(screen.getByText("هیچ سوال متداولی وجود ندارد")).toBeDefined();
  });

  it("displays loading spinner when loading", () => {
    mockUseApiFetch.mockReturnValue({
      data: null,
      loading: true,
      refetch: vi.fn(),
    } as any);

    render(<FaqManager blogId={1} onClose={mockOnClose} />);
    expect(screen.getByText("در حال بارگذاری...")).toBeDefined();
  });

  it("renders FAQ items when data is loaded", () => {
    mockUseApiFetch.mockReturnValue({
      data: {
        faqs: [
          { id: 1, question: "Question 1", answer: "Answer 1", order: 0, available: true },
          { id: 2, question: "Question 2", answer: "Answer 2", order: 1, available: true },
        ],
      },
      loading: false,
      refetch: vi.fn(),
    } as any);

    render(<FaqManager blogId={1} onClose={mockOnClose} />);
    expect(screen.getByText("Question 1")).toBeDefined();
    expect(screen.getByText("Question 2")).toBeDefined();
  });

  it("shows question and answer inputs", () => {
    render(<FaqManager blogId={1} onClose={mockOnClose} />);
    expect(screen.getByPlaceholderText("سوال خود را وارد کنید...")).toBeDefined();
    expect(screen.getByPlaceholderText("پاسخ خود را وارد کنید...")).toBeDefined();
  });

  it("shows add button with text", () => {
    render(<FaqManager blogId={1} onClose={mockOnClose} />);
    expect(screen.getByText("افزودن سوال")).toBeDefined();
  });

  it("shows unavailable badge for inactive FAQs", () => {
    mockUseApiFetch.mockReturnValue({
      data: {
        faqs: [{ id: 1, question: "Q1", answer: "A1", order: 0, available: false }],
      },
      loading: false,
      refetch: vi.fn(),
    } as any);

    render(<FaqManager blogId={1} onClose={mockOnClose} />);
    expect(screen.getByText("غیرفعال")).toBeDefined();
  });
});
