import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ editMutate: vi.fn(), deleteS3Mutate: vi.fn() }));

vi.mock("@/hooks/useApiMutation", () => ({
  useApiMutation: (method: string) => ({
    mutate: method === "patch" ? mocks.editMutate : mocks.deleteS3Mutate,
  }),
}));
vi.mock("react-dropzone", () => ({
  useDropzone: () => ({
    getRootProps: () => ({}),
    getInputProps: () => ({ type: "file", "aria-label": "بنر" }),
    isDragActive: false,
    isDragReject: false,
  }),
}));
vi.mock("react-hot-toast", () => ({
  default: { success: vi.fn(), error: vi.fn() },
  toast: { success: vi.fn(), error: vi.fn() },
}));
vi.mock("../CategoryBlogEditor", () => ({
  default: ({ label, value }: { label: string; value: string }) => (
    <label>
      {label}
      <textarea aria-label={label} value={value} readOnly />
    </label>
  ),
}));

import type { Category } from "../../types/types";
import EditModal from "../EditModal";

const makeCategory = (
  id: number,
  name: string,
  available: boolean,
  keywords: string[]
): Category => ({
  CategoryID: id,
  Name: name,
  Available: available,
  Slug: `category-${id}`,
  Link: `/products/category-${id}`,
  Subcategories: [],
  TopBlog: `Top ${name}`,
  BottomBlog: `Bottom ${name}`,
  SEO_Details: {
    SEO_Title: `SEO ${name}`,
    SEO_Description: `Description ${name}`,
    SEO_Keywords: keywords,
  },
});

const createProps = (item: Category) => ({
  isOpen: true,
  item,
  onClose: vi.fn(),
  onChange: vi.fn(),
  refetchCategories: vi.fn(),
  setIsEditModalOpen: vi.fn(),
  setEditCategory: vi.fn(),
});

describe("EditModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.editMutate.mockResolvedValue({ success: true });
  });

  it("persists the selected availability value in the draft", () => {
    const props = createProps(makeCategory(1, "Category", true, []));
    render(<EditModal {...props} />);

    fireEvent.change(screen.getByLabelText("فعال"), { target: { value: "false" } });

    expect(props.onChange).toHaveBeenCalledWith({ Available: false });
  });

  it("blocks saving when the edited name contains unsupported characters", () => {
    const props = createProps(makeCategory(1, "Category", true, []));
    const { rerender } = render(<EditModal {...props} />);

    fireEvent.change(screen.getByLabelText("نام"), { target: { value: "Invalid@Name" } });
    expect(props.onChange).toHaveBeenCalledWith({ Name: "Invalid@Name" });
    rerender(<EditModal {...props} item={{ ...props.item, Name: "Invalid@Name" }} />);
    fireEvent.click(screen.getByRole("button", { name: "ذخیره تغییرات" }));

    expect(
      screen.getByText("نام باید حروف فارسی یا انگلیسی و حداکثر ۱۰۰۰ کاراکتر باشد.")
    ).toBeInTheDocument();
    expect(mocks.editMutate).not.toHaveBeenCalled();
  });

  it("loads the next category's SEO draft when switching between edit targets", async () => {
    const first = makeCategory(1, "First", true, ["first-keyword"]);
    const second = makeCategory(2, "Second", true, ["second-keyword"]);
    const props = createProps(first);
    const { rerender } = render(<EditModal {...props} />);

    rerender(<EditModal {...props} item={second} />);

    await waitFor(() => {
      expect(screen.getByRole("button", { name: "second-keyword" })).toBeInTheDocument();
    });
    expect(screen.queryByRole("button", { name: "first-keyword" })).not.toBeInTheDocument();
  });

  it("keeps the dialog open and blocks Escape while an update is pending", async () => {
    let resolveUpdate: (value: { success: boolean }) => void = () => {};
    mocks.editMutate.mockImplementation(() => new Promise((resolve) => (resolveUpdate = resolve)));
    const props = createProps(makeCategory(1, "Category", true, []));
    render(<EditModal {...props} />);

    fireEvent.click(screen.getByRole("button", { name: "ذخیره تغییرات" }));
    fireEvent.keyDown(document, { key: "Escape" });

    expect(props.onClose).not.toHaveBeenCalled();
    expect(screen.getByRole("dialog", { name: "ویرایش" })).toBeInTheDocument();

    resolveUpdate({ success: true });
    await waitFor(() => expect(props.setIsEditModalOpen).toHaveBeenCalledWith(false));
  });
});
