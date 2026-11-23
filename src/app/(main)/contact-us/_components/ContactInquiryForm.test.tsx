import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import toast from "react-hot-toast";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("react-hot-toast", () => ({
  default: { success: vi.fn(), error: vi.fn() },
  Toaster: () => null,
}));

import { ContactInquiryForm } from "./ContactInquiryForm";

const successMessage = "پیام شما ثبت شد. حداکثر تا ۲۴ ساعت آینده با شما تماس می‌گیریم.";

function fillValidForm() {
  fireEvent.change(screen.getByLabelText("نام و نام خانوادگی"), {
    target: { value: "علی رضایی" },
  });
  fireEvent.change(screen.getByLabelText("شماره تماس"), { target: { value: "٠٩١٢١٢٣٤٥٦٧" } });
  fireEvent.change(screen.getByLabelText("نوع پروژه یا تجهیز (اختیاری)"), {
    target: { value: "دوربین مداربسته" },
  });
  fireEvent.change(screen.getByLabelText("شرح نیاز یا پروژه"), {
    target: { value: "برای تجهیز یک ورودی، به مشاوره انتخاب راهکار نیاز دارم." },
  });
}

describe("ContactInquiryForm", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("keeps invalid feedback next to the fields and does not send a request", () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    render(<ContactInquiryForm />);

    fireEvent.submit(screen.getByRole("form", { name: "فرم درخواست مشاوره" }));

    expect(
      screen
        .getAllByRole("alert")
        .map((alert) => alert.textContent)
        .join(" ")
    ).toContain("نام");
    expect(screen.getByLabelText("نام و نام خانوادگی")).toHaveAttribute("aria-invalid", "true");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("clips the bot honeypot without positioning it offscreen", () => {
    const { container } = render(<ContactInquiryForm />);
    const honeypot = container.querySelector("#contact-website");

    expect(honeypot).not.toBeNull();
    expect(honeypot?.parentElement).toHaveClass("sr-only");
  });

  it("posts the form and clears it after the server accepts it", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 201 });
    vi.stubGlobal("fetch", fetchMock);
    render(<ContactInquiryForm />);
    fillValidForm();

    fireEvent.submit(screen.getByRole("form", { name: "فرم درخواست مشاوره" }));

    await waitFor(() => expect(toast.success).toHaveBeenCalledWith(successMessage));
    expect(fetchMock).toHaveBeenCalledWith("/api/contact-submissions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "علی رضایی",
        phone: "٠٩١٢١٢٣٤٥٦٧",
        project: "دوربین مداربسته",
        message: "برای تجهیز یک ورودی، به مشاوره انتخاب راهکار نیاز دارم.",
        website: "",
      }),
    });
    expect(screen.getByLabelText("نام و نام خانوادگی")).toHaveValue("");
    expect(screen.getByLabelText("شماره تماس")).toHaveValue("");
    expect(screen.getByLabelText("شرح نیاز یا پروژه")).toHaveValue("");
  });

  it("ignores repeated submits while one request is still pending", async () => {
    let resolveRequest!: (response: { ok: boolean; status: number }) => void;
    const fetchMock = vi.fn(
      () =>
        new Promise<{ ok: boolean; status: number }>((resolve) => {
          resolveRequest = resolve;
        })
    );
    vi.stubGlobal("fetch", fetchMock);
    render(<ContactInquiryForm />);
    fillValidForm();
    const form = screen.getByRole("form", { name: "فرم درخواست مشاوره" });

    fireEvent.submit(form);
    fireEvent.submit(form);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("button", { name: "در حال ارسال…" })).toBeDisabled();
    resolveRequest({ ok: true, status: 201 });
    await waitFor(() => expect(toast.success).toHaveBeenCalledOnce());
  });

  it.each([
    ["unexpected 200 response", { ok: true, status: 200 }],
    ["server rejection", { ok: false, status: 500 }],
    ["network failure", new Error("network unavailable")],
  ])("preserves the visitor's message after a %s", async (_case, result) => {
    const fetchMock = vi
      .fn()
      .mockImplementation(() =>
        result instanceof Error ? Promise.reject(result) : Promise.resolve(result)
      );
    vi.stubGlobal("fetch", fetchMock);
    render(<ContactInquiryForm />);
    fillValidForm();

    fireEvent.submit(screen.getByRole("form", { name: "فرم درخواست مشاوره" }));

    await waitFor(() => expect(toast.error).toHaveBeenCalled());
    expect(toast.success).not.toHaveBeenCalled();
    expect(screen.getByLabelText("نام و نام خانوادگی")).toHaveValue("علی رضایی");
    expect(screen.getByLabelText("شرح نیاز یا پروژه")).toHaveValue(
      "برای تجهیز یک ورودی، به مشاوره انتخاب راهکار نیاز دارم."
    );
  });
});
