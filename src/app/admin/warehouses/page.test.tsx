import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import axios from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";

import WarehousesPage from "./page";

const { post, put, remove } = vi.hoisted(() => ({ post: vi.fn(), put: vi.fn(), remove: vi.fn() }));
vi.mock("axios", () => ({ default: { get: vi.fn() } }));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  useSearchParams: () => new URLSearchParams(),
}));
vi.mock("@/hooks/useApiMutation", () => ({
  useApiMutation: (method: string = "post") => ({
    mutate: method === "put" ? put : method === "delete" ? remove : post,
  }),
}));
vi.mock("@/hooks/useApiFetch", () => ({
  useApiFetch: () => ({ data: { data: [{ ProductId: 9, Type: "QA product" }] } }),
}));
vi.mock("@/components/ui/antd/AutoComplete", () => ({ AutoComplete: () => null }));
vi.mock("@/components/ui/antd/Input", () => ({ Input: (props: object) => <input {...props} /> }));
vi.mock("@/components/ui/antd/Button", () => ({
  Button: ({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
    <button {...props}>{children}</button>
  ),
}));
vi.mock("./components/WarehousesTable", () => ({
  default: ({
    items,
    onEdit,
    onDelete,
  }: {
    items: { warehouseid: number }[];
    onEdit: (item: object) => void;
    onDelete: (item: object) => void;
  }) => (
    <>
      {items.map((item) => (
        <div key={item.warehouseid}>
          <button onClick={() => onEdit(item)}>Edit QA</button>
          <button onClick={() => onDelete(item)}>Delete QA</button>
        </div>
      ))}
    </>
  ),
}));
vi.mock("./components/WarehouseFormModal", () => ({
  default: ({ open, onSubmit }: { open: boolean; onSubmit: () => void }) =>
    open ? <button onClick={onSubmit}>Save QA</button> : null,
}));
vi.mock("./components/ProductsModal", () => ({
  default: ({ allProducts }: { allProducts: unknown[] }) => (
    <span>Products: {allProducts.length}</span>
  ),
}));

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(axios.get).mockResolvedValue({
    data: { items: [{ warehouseid: 7, name: "QA warehouse", location: "QA location" }], total: 1 },
  });
  post.mockResolvedValue({ success: true });
  put.mockResolvedValue({ success: true });
});

describe("warehouse page mutations", () => {
  it("uses PUT when saving an existing warehouse", async () => {
    render(<WarehousesPage />);
    fireEvent.click(await screen.findByText("Edit QA"));
    fireEvent.click(screen.getByText("Save QA"));
    await waitFor(() =>
      expect(put).toHaveBeenCalledWith("/api/admin/warehouses/7", {
        name: "QA warehouse",
        location: "QA location",
      })
    );
    expect(post).not.toHaveBeenCalled();
  });

  it("passes products from the API data envelope to the product manager", async () => {
    render(<WarehousesPage />);
    await screen.findByText("Edit QA");
    expect(screen.getByText("Products: 1")).toBeInTheDocument();
  });

  it("does not announce successful deletion when the API fails", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    remove.mockResolvedValue(null);
    render(<WarehousesPage />);
    fireEvent.click(await screen.findByText("Delete QA"));
    await waitFor(() => expect(remove).toHaveBeenCalled());
    expect(screen.queryByText("انبار با موفقیت حذف شد")).not.toBeInTheDocument();
    expect(screen.getByText("خطا در حذف انبار")).toBeInTheDocument();
  });

  it("filters warehouses by the warehouse search input", async () => {
    render(<WarehousesPage />);
    fireEvent.change(screen.getByPlaceholderText("جستجو انبار یا محصول..."), {
      target: { value: "QA depot" },
    });
    await waitFor(() =>
      expect(axios.get).toHaveBeenCalledWith("/api/admin/warehouses", {
        params: { page: 1, limit: 20, q: "QA depot" },
      })
    );
  });
});
