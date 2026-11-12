import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import AdminPageManager from "../page";

vi.mock("react-hot-toast", () => ({
  default: { success: vi.fn(), error: vi.fn() },
  Toaster: () => null,
}));
vi.mock("../componets/ui/ActivityEditor", () => ({ default: () => null }));
vi.mock("../componets/ui/BlogEditModal", () => ({ default: () => null }));
vi.mock("../componets/ui/ContactUsEditor", () => ({ default: () => null }));
vi.mock("../componets/ui/FaqEditor", () => ({ default: () => null }));
vi.mock("../componets/ui/LandingPage", () => ({ default: () => null }));
vi.mock("../componets/ui/MemberEditor", () => ({ default: () => null }));
vi.mock("../componets/ui/newPage/NewBlog", () => ({ default: () => null }));
vi.mock("../componets/ui/newPage/NewMember", () => ({ default: () => null }));
vi.mock("../componets/ui/newPage/NewProject", () => ({ default: () => null }));
vi.mock("../componets/ui/ProjectEditor", () => ({ default: () => null }));
vi.mock("../componets/ui/QrCodeModal", () => ({ default: () => null }));

const rows = {
  rowNames: [
    {
      name: "QA Blogs",
      pages: 1,
      link: "/support/blog",
      multiPage: true,
      editorType: "blog",
      newType: "newBlog",
    },
  ],
  subPages: {
    "/support/blog": [{ id: 42, name: "QA disposable article", link: "/support/blog/qa/article" }],
  },
};

describe("Admin page manager", () => {
  const fetchMock = vi.fn<typeof fetch>();
  beforeEach(() => {
    vi.resetAllMocks();
    fetchMock.mockResolvedValue(new Response(JSON.stringify(rows), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
  });
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("requires confirmation before deleting a page and cancellation leaves it intact", async () => {
    render(<AdminPageManager />);
    fireEvent.click(await screen.findByRole("button", { name: /باز کردن/ }));
    fireEvent.click(screen.getByRole("button", { name: "حذف صفحه" }));
    const dialog = screen.getByRole("alertdialog");
    expect(dialog).toHaveTextContent("QA disposable article");
    expect(fetchMock).toHaveBeenCalledTimes(1);
    fireEvent.click(within(dialog).getByRole("button", { name: "انصراف" }));
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("closes the confirmation on Escape and restores focus to the delete action", async () => {
    render(<AdminPageManager />);
    fireEvent.click(await screen.findByRole("button", { name: /باز کردن/ }));
    const deleteButton = screen.getByRole("button", { name: "حذف صفحه" });
    deleteButton.focus();
    fireEvent.click(deleteButton);
    expect(screen.getByRole("alertdialog")).toBeInTheDocument();

    fireEvent.keyDown(document, { key: "Escape" });

    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    expect(deleteButton).toHaveFocus();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("keeps deletion pending once and refreshes after success", async () => {
    let resolveDelete!: (response: Response) => void;
    fetchMock.mockImplementation(async (_url, init) =>
      init?.method === "DELETE"
        ? new Promise<Response>((resolve) => {
            resolveDelete = resolve;
          })
        : new Response(JSON.stringify(rows), { status: 200 })
    );
    render(<AdminPageManager />);
    fireEvent.click(await screen.findByRole("button", { name: /باز کردن/ }));
    fireEvent.click(screen.getByRole("button", { name: "حذف صفحه" }));
    const dialog = screen.getByRole("alertdialog");
    fireEvent.click(within(dialog).getByRole("button", { name: "حذف" }));
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.getByRole("alertdialog")).toBeInTheDocument();
    expect(within(dialog).getByRole("button", { name: "انصراف" })).toBeDisabled();
    expect(within(dialog).getByRole("button", { name: "در حال حذف..." })).toBeDisabled();
    expect(fetchMock).toHaveBeenCalledWith("/api/blogs/delete/42", { method: "DELETE" });
    await act(async () => {
      resolveDelete(new Response(JSON.stringify({ message: "Deleted" }), { status: 200 }));
    });
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it("shows load failure as a retryable error instead of an empty site", async () => {
    fetchMock.mockRejectedValueOnce(new Error("Network offline"));
    render(<AdminPageManager />);
    expect(await screen.findByRole("alert")).toBeVisible();
    expect(screen.queryByText("هیچ صفحه‌ای یافت نشد")).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "تلاش دوباره" }));
    expect(await screen.findByText("QA Blogs")).toBeVisible();
  });
});
