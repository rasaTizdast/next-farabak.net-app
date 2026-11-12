import { render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { getUserInvoices } = vi.hoisted(() => ({ getUserInvoices: vi.fn() }));

vi.mock("@/helpers/invoiceHandlers", () => ({ getUserInvoices }));
vi.mock("./components/ui/InvoiceDetails", () => ({
  default: ({ onClose }: { onClose: () => void }) => (
    <div role="dialog" aria-label="جزئیات فاکتور">
      <button type="button" onClick={onClose}>
        بستن
      </button>
    </div>
  ),
}));

import AllInvoices from "./page";

const invoice = {
  Fullname: "مریم احمدی",
  Phonenumber: "09120000000",
  Checked: true,
  FactorGuid: "FB-1001",
  Quantity: "1",
  TotalAmount: 1,
  Date: "2026-10-28T10:00:00",
  Invoiceid: 1,
  Invoice_Details: [],
};

describe("AllInvoices", () => {
  beforeEach(() => vi.clearAllMocks());

  it("renders labelled desktop data and a mobile-safe invoice card", async () => {
    getUserInvoices.mockResolvedValue([invoice]);
    render(<AllInvoices />);

    expect(await screen.findByRole("heading", { name: "فاکتورهای من" })).toBeVisible();
    expect(screen.getByRole("region", { name: "فاکتورهای ثبت شده" })).toBeVisible();
    expect(screen.getAllByText("FB-1001").length).toBeGreaterThan(0);
    expect(screen.getAllByText("تایید شده").length).toBeGreaterThan(0);
    expect(screen.getAllByRole("button", { name: "مشاهده فاکتور FB-1001" }).length).toBeGreaterThan(
      0
    );
  });

  it("shows an actionable empty state", async () => {
    getUserInvoices.mockResolvedValue([]);
    render(<AllInvoices />);

    await waitFor(() => expect(screen.getByRole("status")).toBeVisible());
    expect(screen.getByText("هنوز فاکتوری ثبت نکرده‌اید.")).toBeVisible();
    expect(screen.getByRole("link", { name: "شروع فاکتور جدید" })).toHaveAttribute(
      "href",
      "/products"
    );
  });
});
