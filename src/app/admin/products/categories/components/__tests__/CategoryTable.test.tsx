import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ deleteMutate: vi.fn() }));

vi.mock("@/hooks/useApiMutation", () => ({
  useApiMutation: () => ({ mutate: mocks.deleteMutate }),
}));

import type { Category } from "../../types/types";
import CategoryTable from "../CategoryTable";

const category: Category = {
  CategoryID: 42,
  Name: "QA category",
  Available: true,
  Slug: "qa-category",
  Link: "/products/qa-category",
  Subcategories: [],
  SEO_Details: { SEO_Title: "QA", SEO_Description: "Category", SEO_Keywords: [] },
};

describe("CategoryTable delete confirmation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.deleteMutate.mockResolvedValue({ success: true });
  });

  it("keeps a delete request pending until the exact category name is confirmed", async () => {
    const refetchCategories = vi.fn();
    render(
      <CategoryTable
        categories={[category]}
        isLoading={false}
        refetchCategories={refetchCategories}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "حذف" }));
    fireEvent.click(screen.getByRole("button", { name: "بله، حذف کن" }));
    expect(mocks.deleteMutate).not.toHaveBeenCalled();

    fireEvent.change(screen.getByLabelText("نام QA category را برای تأیید حذف وارد کنید"), {
      target: { value: "QA category" },
    });
    fireEvent.click(screen.getByRole("button", { name: "بله، حذف کن" }));

    await waitFor(() => {
      expect(mocks.deleteMutate).toHaveBeenCalledWith("/api/categories/delete", { categoryId: 42 });
      expect(refetchCategories).toHaveBeenCalledOnce();
    });
  });

  it("prevents duplicate deletes and Escape dismissal while deletion is pending", async () => {
    let resolveDelete: (value: { success: boolean }) => void = () => {};
    mocks.deleteMutate.mockImplementation(
      () => new Promise((resolve) => (resolveDelete = resolve))
    );
    render(<CategoryTable categories={[category]} isLoading={false} refetchCategories={vi.fn()} />);

    fireEvent.click(screen.getByRole("button", { name: "حذف" }));
    fireEvent.change(screen.getByLabelText("نام QA category را برای تأیید حذف وارد کنید"), {
      target: { value: "QA category" },
    });
    const confirm = screen.getByRole("button", { name: "بله، حذف کن" });
    fireEvent.click(confirm);
    fireEvent.click(confirm);
    fireEvent.keyDown(document, { key: "Escape" });

    expect(mocks.deleteMutate).toHaveBeenCalledOnce();
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    resolveDelete({ success: true });
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });
});

describe("CategoryTable loading states", () => {
  it("distinguishes an empty result from a failed request and offers retry", () => {
    const refetchCategories = vi.fn();
    const { rerender } = render(
      <CategoryTable categories={[]} isLoading={false} refetchCategories={refetchCategories} />
    );
    expect(screen.getByText("هنوز دسته‌بندی‌ای ایجاد نشده است.")).toBeInTheDocument();

    rerender(
      <CategoryTable
        categories={[]}
        isLoading={false}
        error="Unable to load categories"
        refetchCategories={refetchCategories}
      />
    );
    expect(screen.getByRole("alert")).toHaveTextContent("دریافت دسته‌بندی‌ها با خطا روبه‌رو شد.");
    fireEvent.click(screen.getByRole("button", { name: "تلاش دوباره" }));
    expect(refetchCategories).toHaveBeenCalledOnce();
  });
});
