import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import ContactSubmissionsPage from "./page";

const sample = (id: number, message = `پیام ${id}`) => ({
  id,
  name: `کاربر ${id}`,
  phone: "09121234567",
  project: id === 2 ? "دوربین" : null,
  message,
  createdAt: "2026-11-23T08:00:00.000Z",
});

function jsonResponse(items: ReturnType<typeof sample>[], nextCursor: number | null = null) {
  return { ok: true, json: async () => ({ items, nextCursor }) };
}

describe("admin contact submissions inbox", () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("announces loading while the first inbox request is pending", () => {
    fetchMock.mockReturnValue(new Promise(() => {}));

    render(<ContactSubmissionsPage />);

    expect(screen.getByRole("status")).toHaveTextContent("در حال دریافت پیام‌ها");
  });

  it("shows the visitor details and complete message as plain text", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse([sample(9, "لطفاً <img src=x onerror=alert(1)> را بررسی کنید"), sample(2)])
    );

    render(<ContactSubmissionsPage />);

    expect(await screen.findByText("کاربر 9")).toBeInTheDocument();
    expect(screen.getAllByText("09121234567")).toHaveLength(2);
    expect(screen.getByText("دوربین")).toBeInTheDocument();
    expect(
      screen.getByText("لطفاً <img src=x onerror=alert(1)> را بررسی کنید")
    ).toBeInTheDocument();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    const inbox = screen.getByRole("list", { name: "پیام‌های دریافتی" });
    expect(inbox).toBeInTheDocument();
    expect(
      within(inbox)
        .getAllByRole("heading", { level: 2 })
        .map((heading) => heading.textContent)
    ).toEqual(["کاربر 9", "کاربر 2"]);
    expect(inbox.querySelector("time")).toHaveAttribute("datetime", "2026-11-23T08:00:00.000Z");
  });

  it("shows an empty state when there are no submissions", async () => {
    fetchMock.mockResolvedValue(jsonResponse([]));

    render(<ContactSubmissionsPage />);

    expect(await screen.findByText("هنوز پیامی دریافت نشده است.")).toBeInTheDocument();
  });

  it("lets the admin retry after the inbox request fails", async () => {
    fetchMock.mockRejectedValueOnce(new Error("network failure"));
    fetchMock.mockResolvedValueOnce(jsonResponse([sample(4)]));

    render(<ContactSubmissionsPage />);

    expect(await screen.findByRole("alert")).toHaveTextContent("دریافت پیام‌ها ناموفق بود");
    fireEvent.click(screen.getByRole("button", { name: "تلاش دوباره" }));

    expect(await screen.findByText("کاربر 4")).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("appends cursor pages without rendering a repeated submission twice", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse([sample(3), sample(2)], 2));
    fetchMock.mockResolvedValueOnce(jsonResponse([sample(2), sample(1)]));

    render(<ContactSubmissionsPage />);
    expect(await screen.findByText("کاربر 3")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "نمایش پیام‌های قدیمی‌تر" }));

    await waitFor(() => expect(screen.getAllByText("کاربر 2")).toHaveLength(1));
    expect(screen.getByText("کاربر 1")).toBeInTheDocument();
    expect(fetchMock).toHaveBeenNthCalledWith(2, "/api/admin/contact-submissions?cursor=2", {
      cache: "no-store",
    });
  });
});
