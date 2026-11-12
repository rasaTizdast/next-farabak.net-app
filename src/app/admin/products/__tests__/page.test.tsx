import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import axios from "axios";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import ProductsPage from "../page";

vi.mock("axios", () => ({
  default: {
    get: vi.fn(),
    delete: vi.fn(),
    isAxiosError: (error: unknown) =>
      Boolean(error && typeof error === "object" && "isAxiosError" in error),
  },
}));
vi.mock("react-hot-toast", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
  default: { success: vi.fn(), error: vi.fn() },
  Toaster: () => null,
}));
vi.mock("../components/newProductModal/NewProductWizard", () => ({ default: () => null }));
vi.mock("../components/FilterModal", () => ({ default: () => null }));
vi.mock("../components/ProductsTable", () => ({
  default: ({
    setCurrentAction,
    setIsModalOpen,
  }: {
    setCurrentAction: (action: { id: number; type: "delete"; name: string }) => void;
    setIsModalOpen: (open: boolean) => void;
  }) => (
    <button
      onClick={() => {
        setCurrentAction({ id: 42, type: "delete", name: "QA product" });
        setIsModalOpen(true);
      }}
    >
      Delete QA product
    </button>
  ),
}));

describe("product list actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(axios.get).mockImplementation(async (url) => ({
      data:
        url === "/api/categories/getAll"
          ? []
          : { data: [], pagination: { currentPage: 1, totalPages: 1 } },
    }));
  });
  afterEach(() => vi.useRealTimers());

  it("does not restore a stale search after the user clears the input", async () => {
    render(<ProductsPage />);
    await waitFor(() => expect(axios.get).toHaveBeenCalled());
    vi.useFakeTimers();
    fireEvent.change(screen.getByRole("textbox", { name: "جستجوی محصول" }), {
      target: { value: "router" },
    });
    fireEvent.change(screen.getByRole("textbox", { name: "جستجوی محصول" }), {
      target: { value: "" },
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(400);
    });

    expect(vi.mocked(axios.get).mock.calls.some(([url]) => String(url).includes("q=router"))).toBe(
      false
    );
  });

  it("keeps the catalogue filter summary visible while browsing results", async () => {
    render(<ProductsPage />);

    expect(await screen.findByRole("status", { name: "خلاصه فیلترهای محصولات" })).toHaveTextContent(
      "فیلتر فعالی اعمال نشده است."
    );
    expect(screen.getByTestId("new-product-button")).toHaveAccessibleName("محصول جدید");
  });

  it("can delete a product when its storage folder is already empty", async () => {
    vi.mocked(axios.delete).mockImplementation(async (url) => {
      if (url === "/api/s3/delete") throw { isAxiosError: true, response: { status: 404 } };
      return { status: 200 };
    });
    render(<ProductsPage />);
    await screen.findByRole("button", { name: "Delete QA product" });
    fireEvent.click(screen.getByRole("button", { name: "Delete QA product" }));
    fireEvent.click(screen.getByRole("button", { name: "تایید" }));

    await waitFor(() => expect(axios.delete).toHaveBeenCalledWith("/api/admin/products/42"));
  });
});
