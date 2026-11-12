import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

import Pagination from "../Pagination";

describe("Pagination", () => {
  const mockSetPagination = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders page buttons for total pages", () => {
    render(
      <Pagination
        pagination={{ currentPage: 1, totalPages: 3 }}
        setPagination={mockSetPagination}
      />
    );

    expect(screen.getByText("1")).toBeDefined();
    expect(screen.getByText("2")).toBeDefined();
    expect(screen.getByText("3")).toBeDefined();
  });

  it("disables previous button on first page", () => {
    render(
      <Pagination
        pagination={{ currentPage: 1, totalPages: 5 }}
        setPagination={mockSetPagination}
      />
    );

    const prevButton = screen.getByText("قبلی");
    expect(prevButton.hasAttribute("disabled")).toBe(true);
  });

  it("disables next button on last page", () => {
    render(
      <Pagination
        pagination={{ currentPage: 5, totalPages: 5 }}
        setPagination={mockSetPagination}
      />
    );

    const nextButton = screen.getByText("بعدی");
    expect(nextButton.hasAttribute("disabled")).toBe(true);
  });

  it("calls setPagination with new page when clicking a page number", () => {
    render(
      <Pagination
        pagination={{ currentPage: 1, totalPages: 3 }}
        setPagination={mockSetPagination}
      />
    );

    fireEvent.click(screen.getByText("2"));
    expect(mockSetPagination).toHaveBeenCalledWith({ currentPage: 2, totalPages: 3 });
  });

  it("calls setPagination for next page", () => {
    render(
      <Pagination
        pagination={{ currentPage: 1, totalPages: 3 }}
        setPagination={mockSetPagination}
      />
    );

    fireEvent.click(screen.getByText("بعدی"));
    expect(mockSetPagination).toHaveBeenCalledWith({ currentPage: 2, totalPages: 3 });
  });

  it("calls setPagination for previous page", () => {
    render(
      <Pagination
        pagination={{ currentPage: 2, totalPages: 3 }}
        setPagination={mockSetPagination}
      />
    );

    fireEvent.click(screen.getByText("قبلی"));
    expect(mockSetPagination).toHaveBeenCalledWith({ currentPage: 1, totalPages: 3 });
  });

  it("does not navigate below page 1", () => {
    render(
      <Pagination
        pagination={{ currentPage: 1, totalPages: 3 }}
        setPagination={mockSetPagination}
      />
    );

    const prevButton = screen.getByText("قبلی");
    fireEvent.click(prevButton);
    expect(mockSetPagination).not.toHaveBeenCalled();
  });

  it("does not navigate above total pages", () => {
    render(
      <Pagination
        pagination={{ currentPage: 3, totalPages: 3 }}
        setPagination={mockSetPagination}
      />
    );

    const nextButton = screen.getByText("بعدی");
    fireEvent.click(nextButton);
    expect(mockSetPagination).not.toHaveBeenCalled();
  });

  it("highlights the current page button", () => {
    render(
      <Pagination
        pagination={{ currentPage: 2, totalPages: 3 }}
        setPagination={mockSetPagination}
      />
    );

    const page2Button = screen.getByText("2");
    expect(page2Button.className).toContain("bg-blue-700");
  });
});
