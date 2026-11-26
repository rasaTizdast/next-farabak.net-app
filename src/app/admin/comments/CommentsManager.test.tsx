import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import CommentsManager from "./CommentsManager";

const replace = vi.fn();
let search = "";
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace }),
  useSearchParams: () => new URLSearchParams(search),
}));
vi.mock("next/link", () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}));

const row = {
  id: 4,
  target: { type: "blog", id: 1, label: "مقاله", href: "/article" },
  author: { actorId: 9, displayName: "نام مستعار", presentation: "ALIAS" },
  body: "متن دیدگاه آزمایشی",
  status: "PENDING",
  createdAt: "2026-11-23T00:00:00Z",
  publishedAt: null,
  reviewerId: null,
  reviewedAt: null,
  reviewNote: null,
  parent: { id: 2, displayName: "کاربر", body: "دیدگاه اصلی", status: "APPROVED" },
};
const json = (data: unknown, ok = true) =>
  Promise.resolve({ ok, json: async () => data } as Response);

beforeEach(() => {
  search = "";
  replace.mockReset();
  vi.restoreAllMocks();
});

describe("moderation queue", () => {
  it("shows audit and parent context with a target link", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() => json({ comments: [row], nextCursor: null }))
    );
    render(<CommentsManager />);
    expect(await screen.findByText("متن دیدگاه آزمایشی")).toBeInTheDocument();
    expect(screen.getByText(/9/)).toBeInTheDocument();
    expect(screen.getByText(/دیدگاه اصلی/)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "مقاله" })).toHaveAttribute("href", "/article");
  });
  it("updates filters and pagination in the URL", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() => json({ comments: [row], nextCursor: 4 }))
    );
    render(<CommentsManager />);
    await screen.findByText("متن دیدگاه آزمایشی");
    fireEvent.change(screen.getByLabelText("وضعیت"), { target: { value: "APPROVED" } });
    expect(replace).toHaveBeenCalledWith("/admin/comments?status=APPROVED");
    fireEvent.click(screen.getByRole("button", { name: "صفحه بعد" }));
    expect(replace).toHaveBeenCalledWith("/admin/comments?cursor=4");
  });
  it("requires confirmation and reports decision failure without claiming success", async () => {
    const fetchMock = vi
      .fn()
      .mockImplementationOnce(() => json({ comments: [row], nextCursor: null }))
      .mockImplementationOnce(() => json({}, false));
    vi.stubGlobal("fetch", fetchMock);
    render(<CommentsManager />);
    fireEvent.click(await screen.findByRole("button", { name: "تأیید" }));
    expect(fetchMock).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole("button", { name: "تأیید انتشار" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("ثبت تصمیم انجام نشد");
    expect(screen.getByText("متن دیدگاه آزمایشی")).toBeInTheDocument();
  });
  it("keeps Shift+Tab inside the decision dialog when focus starts on its panel", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() => json({ comments: [row], nextCursor: null }))
    );
    render(<CommentsManager />);
    fireEvent.click(await screen.findByRole("button", { name: "تأیید" }));

    const dialog = screen.getByRole("dialog");
    const cancel = screen.getByRole("button", { name: "انصراف" });
    for (const element of dialog.querySelectorAll("textarea, button")) {
      Object.defineProperty(element, "offsetParent", { configurable: true, value: document.body });
    }

    expect(dialog).toHaveFocus();
    const event = new KeyboardEvent("keydown", {
      bubbles: true,
      cancelable: true,
      key: "Tab",
      shiftKey: true,
    });
    document.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(true);
    expect(cancel).toHaveFocus();
  });
  it("refreshes the queue after an approved decision", async () => {
    const fetchMock = vi
      .fn()
      .mockImplementationOnce(() => json({ comments: [row], nextCursor: null }))
      .mockImplementationOnce(() => json({ id: 4, status: "APPROVED" }))
      .mockImplementationOnce(() => json({ comments: [], nextCursor: null }));
    vi.stubGlobal("fetch", fetchMock);
    render(<CommentsManager />);
    fireEvent.click(await screen.findByRole("button", { name: "تأیید" }));
    fireEvent.click(screen.getByRole("button", { name: "تأیید انتشار" }));
    expect(await screen.findByText("دیدگاهی پیدا نشد.")).toBeInTheDocument();
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "/api/admin/comments/4",
      expect.objectContaining({
        method: "PATCH",
        body: JSON.stringify({ decision: "APPROVED" }),
      })
    );
  });
  it("requires a note before hiding an approved comment", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() => json({ comments: [{ ...row, status: "APPROVED" }], nextCursor: null }))
    );
    render(<CommentsManager />);
    fireEvent.click(await screen.findByRole("button", { name: "پنهان کردن" }));
    fireEvent.click(screen.getByRole("button", { name: "ثبت تصمیم" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("یادداشت");
  });
  it("shows loading, empty and request errors", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() => json({ comments: [], nextCursor: null }))
    );
    const view = render(<CommentsManager />);
    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(await screen.findByText("دیدگاهی پیدا نشد.")).toBeInTheDocument();
    view.unmount();
    vi.stubGlobal(
      "fetch",
      vi.fn(() => json({}, false))
    );
    render(<CommentsManager />);
    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent("دریافت دیدگاه‌ها انجام نشد")
    );
  });
});
