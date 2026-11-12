import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import AdminPage from "./page";

const { fetchUsdToRialRate } = vi.hoisted(() => ({
  fetchUsdToRialRate: vi.fn<() => Promise<number | null>>(),
}));

vi.mock("@/helpers/Usd2RialRate", () => ({ fetchUsdToRialRate }));

const report = {
  invoiceCount: 0,
  productCount: { available: 0, unavailable: 0 },
  invoiceStatusCount: { checked: 0, unchecked: 0 },
};

beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => report }));
  fetchUsdToRialRate.mockResolvedValue(null);
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe("admin dashboard", () => {
  it("keeps the dashboard heading visible while report data is loading", () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() => new Promise(() => {}))
    );

    render(<AdminPage />);

    expect(screen.getByRole("heading", { level: 1, name: "داشبورد مدیریت" })).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("در حال بارگذاری اطلاعات");
  });

  it("renders empty report totals with valid zero progress and a settled exchange-rate state", async () => {
    render(<AdminPage />);

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "تعداد فاکتورها" })).toBeInTheDocument();
    });

    expect(screen.getByText("دریافت نرخ ناموفق بود")).toBeInTheDocument();
    expect(screen.getByText("موجود: 0")).toBeInTheDocument();
    expect(screen.getByText("ناموجود: 0")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "وضعیت فاکتورهای تایید شده" })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "وضعیت موجودی محصولات" })).toBeInTheDocument();
    expect(document.querySelector(".bg-primary.h-4")).toHaveStyle({ width: "0%" });
    expect(document.querySelector(".bg-secondary.h-4")).toHaveStyle({ width: "0%" });
  });

  it("links to the product and invoice management pages", async () => {
    render(<AdminPage />);

    expect(await screen.findByRole("link", { name: /مشاهده محصولات/ })).toHaveAttribute(
      "href",
      "/admin/products"
    );
    expect(screen.getByRole("link", { name: /مشاهده فاکتورها/ })).toHaveAttribute(
      "href",
      "/admin/invoices"
    );
  });
});
