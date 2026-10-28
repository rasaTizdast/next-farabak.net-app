import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/link", () => ({
  default: ({ children, ...props }: React.ComponentProps<"a">) => <a {...props}>{children}</a>,
}));

import { ContactInquiryForm } from "./ContactInquiryForm";

describe("ContactInquiryForm", () => {
  it("keeps invalid feedback next to the fields and does not prepare a draft", () => {
    const openSpy = vi.spyOn(window, "open").mockImplementation(() => null);
    render(<ContactInquiryForm recipient="info@farabak.net" />);

    fireEvent.submit(screen.getByRole("form", { name: "فرم درخواست مشاوره" }));

    expect(
      screen
        .getAllByRole("alert")
        .map((alert) => alert.textContent)
        .join(" ")
    ).toContain("نام");
    expect(screen.getByLabelText("نام و نام خانوادگی")).toHaveAttribute("aria-invalid", "true");
    expect(openSpy).not.toHaveBeenCalled();
    openSpy.mockRestore();
  });

  it("prepares a mail draft after valid project-intake data", async () => {
    const openSpy = vi.spyOn(window, "open").mockImplementation(() => null);
    render(<ContactInquiryForm recipient="info@farabak.net" />);

    fireEvent.change(screen.getByLabelText("نام و نام خانوادگی"), {
      target: { value: "علی رضایی" },
    });
    fireEvent.change(screen.getByLabelText("شماره تماس"), { target: { value: "09121234567" } });
    fireEvent.change(screen.getByLabelText("شرح نیاز یا پروژه"), {
      target: { value: "برای تجهیز یک ورودی، به مشاوره انتخاب راهکار نیاز دارم." },
    });
    fireEvent.submit(screen.getByRole("form", { name: "فرم درخواست مشاوره" }));

    await waitFor(() => {
      expect(openSpy).toHaveBeenCalledWith(
        expect.stringContaining("mailto:info@farabak.net"),
        "_self"
      );
    });
    expect(screen.getByRole("status")).toHaveTextContent("برنامه ایمیل شما آماده شد");
    openSpy.mockRestore();
  });
});
