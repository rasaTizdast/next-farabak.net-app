import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import ProductDeletionModal from "../ProductDeletionModal";

describe("ProductDeletionModal", () => {
  const mockHandleConfirm = vi.fn();
  const mockSetIsModalOpen = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders single delete confirmation message", () => {
    render(
      <ProductDeletionModal
        currentAction={{ id: 1, type: "delete", name: "Test Product" }}
        handleModalConfirm={mockHandleConfirm}
        setIsModalOpen={mockSetIsModalOpen}
      />
    );

    expect(screen.getByText("آیا از حذف محصول زیر مطمئن هستید؟")).toBeDefined();
    expect(screen.getByText(/Test Product/)).toBeDefined();
  });

  it("renders bulk delete confirmation message", () => {
    render(
      <ProductDeletionModal
        currentAction={{ id: [1, 2], type: "bulk-delete", name: ["Product A", "Product B"] }}
        handleModalConfirm={mockHandleConfirm}
        setIsModalOpen={mockSetIsModalOpen}
      />
    );

    expect(screen.getByText("آیا از حذف محصولات زیر مطمئن هستید؟")).toBeDefined();
    expect(screen.getByText(/Product A/)).toBeDefined();
    expect(screen.getByText(/Product B/)).toBeDefined();
  });

  it("renders default message for unknown type", () => {
    render(
      <ProductDeletionModal
        currentAction={{ id: 1, type: "" as any, name: "Some Product" }}
        handleModalConfirm={mockHandleConfirm}
        setIsModalOpen={mockSetIsModalOpen}
      />
    );

    expect(screen.getByText("عملیات انتخاب شده")).toBeDefined();
  });

  it("calls handleModalConfirm when confirm is clicked", () => {
    render(
      <ProductDeletionModal
        currentAction={{ id: 1, type: "delete", name: "Test Product" }}
        handleModalConfirm={mockHandleConfirm}
        setIsModalOpen={mockSetIsModalOpen}
      />
    );

    fireEvent.click(screen.getByText("تایید"));
    expect(mockHandleConfirm).toHaveBeenCalledTimes(1);
  });

  it("calls setIsModalOpen(false) when cancel is clicked", () => {
    render(
      <ProductDeletionModal
        currentAction={{ id: 1, type: "delete", name: "Test Product" }}
        handleModalConfirm={mockHandleConfirm}
        setIsModalOpen={mockSetIsModalOpen}
      />
    );

    fireEvent.click(screen.getByText("لغو"));
    expect(mockSetIsModalOpen).toHaveBeenCalledWith(false);
  });

  it("calls setIsModalOpen(false) when close button is clicked", () => {
    render(
      <ProductDeletionModal
        currentAction={{ id: 1, type: "delete", name: "Test Product" }}
        handleModalConfirm={mockHandleConfirm}
        setIsModalOpen={mockSetIsModalOpen}
      />
    );

    const closeButton = screen.getByText("✕");
    fireEvent.click(closeButton);
    expect(mockSetIsModalOpen).toHaveBeenCalledWith(false);
  });

  it("renders numbered product list for bulk delete", () => {
    render(
      <ProductDeletionModal
        currentAction={{
          id: [1, 2, 3],
          type: "bulk-delete",
          name: ["Alpha", "Beta", "Gamma"],
        }}
        handleModalConfirm={mockHandleConfirm}
        setIsModalOpen={mockSetIsModalOpen}
      />
    );

    expect(screen.getByText(/Alpha/)).toBeDefined();
    expect(screen.getByText(/Beta/)).toBeDefined();
    expect(screen.getByText(/Gamma/)).toBeDefined();
  });
});
