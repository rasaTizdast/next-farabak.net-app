import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import axios from "axios";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { BlogForm } from "../BlogForm";

vi.mock("axios", () => ({
  default: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), put: vi.fn(), delete: vi.fn() },
}));
vi.mock("react-hot-toast", () => ({ default: { success: vi.fn(), error: vi.fn() } }));
// Keep form state and network hooks real; replace the browser editor engine only.
vi.mock("@/components/editor/TipTapEditor", () => ({
  TipTapEditor: ({ content, onChange }: { content: string; onChange: (v: string) => void }) => (
    <textarea
      aria-label="محتوای وبلاگ"
      value={content}
      onChange={(e) => onChange(e.target.value)}
    />
  ),
}));

const existingBlog = {
  blog: {
    title: "Existing blog",
    SEO_Title: "SEO title",
    slug: "existing-blog",
    author: "Author",
    SEO_description: "Description",
    image_URL: "https://cdn.example.test/cover.jpg",
    image_alt: "Cover",
    content: "<p>Existing content</p>",
  },
  categories: [{ id: 7, name: "Tech", slug: "tech" }],
};

async function fillCreateForm() {
  fireEvent.change(screen.getByLabelText("عنوان وبلاگ"), { target: { value: "QA Blog" } });
  fireEvent.change(screen.getByLabelText("نویسنده"), { target: { value: "QA" } });
  fireEvent.change(screen.getByLabelText("عنوان SEO"), { target: { value: "QA SEO" } });
  fireEvent.change(screen.getByLabelText("توضیحات SEO"), { target: { value: "QA description" } });
  fireEvent.change(screen.getByLabelText("متن جایگزین تصویر"), { target: { value: "QA cover" } });
  fireEvent.focus(screen.getByLabelText("جستجو یا افزودن دسته بندی"));
  fireEvent.click(await screen.findByRole("button", { name: "Tech" }));
}

describe("BlogForm", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.mocked(axios.get).mockImplementation(async (url) => ({
      status: 200,
      data: String(url).includes("getBlogData") ? existingBlog : existingBlog.categories,
    }));
    vi.mocked(axios.post).mockResolvedValue({ status: 200, data: { id: 42 } });
    vi.mocked(axios.patch).mockResolvedValue({ status: 200, data: { id: 42 } });
    vi.mocked(axios.put).mockResolvedValue({ status: 200, data: { id: 42 } });
    vi.stubGlobal(
      "URL",
      Object.assign(URL, {
        createObjectURL: vi.fn(() => "blob:qa-cover"),
        revokeObjectURL: vi.fn(),
      })
    );
  });
  afterEach(() => {
    cleanup();
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("keeps a manually chosen slug when the title changes", async () => {
    render(<BlogForm mode="create" onClose={vi.fn()} />);
    await screen.findByLabelText("عنوان وبلاگ");
    fireEvent.change(screen.getByLabelText("شناسه وبلاگ"), { target: { value: "custom-slug" } });
    fireEvent.change(screen.getByLabelText("عنوان وبلاگ"), { target: { value: "Updated title" } });
    expect(screen.getByLabelText("شناسه وبلاگ")).toHaveValue("custom-slug");
  });

  it("returns to metadata and updates the same created draft without losing content", async () => {
    render(<BlogForm mode="create" onClose={vi.fn()} />);
    await fillCreateForm();
    fireEvent.click(screen.getByRole("button", { name: "ادامه" }));
    fireEvent.change(await screen.findByLabelText("محتوای وبلاگ"), {
      target: { value: "<p>QA content</p>" },
    });
    fireEvent.click(screen.getByRole("button", { name: "بازگشت به مشخصات" }));
    fireEvent.change(screen.getByLabelText("عنوان وبلاگ"), { target: { value: "QA revised" } });
    fireEvent.click(screen.getByRole("button", { name: "ادامه" }));
    expect(await screen.findByLabelText("محتوای وبلاگ")).toHaveValue("<p>QA content</p>");
    expect(axios.post).toHaveBeenCalledTimes(1);
    expect(axios.patch).toHaveBeenCalledWith(
      "/api/blogs/update/42",
      expect.objectContaining({ title: "QA revised" })
    );
  });

  it("disables publish and close while a content save is pending", async () => {
    let resolveSave!: (value: unknown) => void;
    vi.mocked(axios.put).mockReturnValue(
      new Promise((resolve) => {
        resolveSave = resolve;
      })
    );
    const onClose = vi.fn();
    render(<BlogForm mode="edit" id={9} onClose={onClose} />);
    await screen.findByDisplayValue("Existing blog");
    fireEvent.click(screen.getByRole("button", { name: "ادامه" }));
    fireEvent.click(await screen.findByRole("button", { name: "ذخیره پیش‌نویس" }));
    expect(screen.getByRole("button", { name: "انتشار" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "بستن وبلاگ" })).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "انتشار" }));
    expect(axios.put).toHaveBeenCalledTimes(1);
    await act(async () => {
      resolveSave({ status: 200, data: { id: 9 } });
    });
    expect(onClose).toHaveBeenCalledOnce();
  });

  it("shows the metadata API error and allows retry without leaving the form", async () => {
    vi.mocked(axios.post).mockRejectedValueOnce({
      response: { data: { error: "Slug already exists" } },
    });
    render(<BlogForm mode="create" onClose={vi.fn()} />);
    await fillCreateForm();
    fireEvent.click(screen.getByRole("button", { name: "ادامه" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Slug already exists");
    expect(screen.getByRole("button", { name: "ادامه" })).toBeEnabled();
    fireEvent.click(screen.getByRole("button", { name: "ادامه" }));
    expect(await screen.findByLabelText("محتوای وبلاگ")).toBeVisible();
  });

  it("blocks blank editing after a fetch error and provides a working retry", async () => {
    let failed = false;
    vi.mocked(axios.get).mockImplementation(async (url) => {
      if (String(url).includes("getBlogData") && !failed) {
        failed = true;
        throw new Error("Could not load blog");
      }
      return {
        status: 200,
        data: String(url).includes("getBlogData") ? existingBlog : existingBlog.categories,
      };
    });
    render(<BlogForm mode="edit" id={9} onClose={vi.fn()} />);
    expect(await screen.findByRole("alert")).toHaveTextContent("Could not load blog");
    expect(screen.queryByRole("button", { name: "ادامه" })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "تلاش دوباره" }));
    expect(await screen.findByDisplayValue("Existing blog")).toBeVisible();
  });

  it("does not prepend the bucket URL to an absolute cover URL", async () => {
    vi.stubEnv("NEXT_PUBLIC_LIARA_BUCKET_URL", "https://bucket.example.test");
    render(<BlogForm mode="edit" id={9} onClose={vi.fn()} />);
    const preview = await screen.findByAltText("پیش‌نمایش");
    expect(decodeURIComponent(preview.getAttribute("src") ?? "")).toContain(
      "https://cdn.example.test/cover.jpg"
    );
    expect(decodeURIComponent(preview.getAttribute("src") ?? "")).not.toContain(
      "bucket.example.test"
    );
  });

  it("rejects an unsupported replacement without revoking the current cover preview", async () => {
    render(<BlogForm mode="create" onClose={vi.fn()} />);
    await screen.findByLabelText("عنوان وبلاگ");
    fireEvent.change(screen.getByLabelText("عنوان وبلاگ"), { target: { value: "QA" } });
    fireEvent.change(screen.getByLabelText("تصویر بلاگ"), {
      target: { files: [new File(["image"], "qa.png", { type: "image/png" })] },
    });
    fireEvent.change(screen.getByLabelText("تصویر بلاگ"), {
      target: { files: [new File(["pdf"], "qa.pdf", { type: "application/pdf" })] },
    });
    await waitFor(() => expect(screen.getByText(/فرمت تصویر باید/)).toBeVisible());
    expect(URL.createObjectURL).toHaveBeenCalledOnce();
    expect(URL.revokeObjectURL).not.toHaveBeenCalled();
    expect(screen.getByAltText("پیش‌نمایش")).toHaveAttribute("src", "blob:qa-cover");
  });
});
