import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("axios", () => ({
  default: {
    get: vi.fn((url: string) =>
      Promise.resolve(
        url.includes("getProductType")
          ? { data: { productType: "محصول آزمایشی" } }
          : { data: { warranty: null } }
      )
    ),
  },
}));
vi.mock("html2canvas", () => ({ default: vi.fn() }));
vi.mock("jspdf", () => ({ default: vi.fn() }));
vi.mock("next/image", () => ({
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => (
    <img {...props} alt={props.alt ?? ""} />
  ),
}));
vi.mock("@/hooks/useModalA11y", () => ({ useModalA11y: () => ({ current: null }) }));

import InvoiceDetails from "./InvoiceDetails";

describe("InvoiceDetails", () => {
  it("renders an accessible detail dialog with a close action", async () => {
    render(
      <InvoiceDetails
        onClose={vi.fn()}
        invoice={{
          Fullname: "مریم احمدی",
          Phonenumber: "09120000000",
          Checked: true,
          FactorGuid: "FB-1001",
          Quantity: "1",
          TotalAmount: 1,
          Date: "2026-10-28T10:00:00",
          Invoiceid: 1,
          Invoice_Details: [
            {
              Invoiceid: "1",
              price: 100,
              ProductId: 7,
              quantity: 1,
              total_price: 100,
              Invoice_Details: 8,
            },
          ],
        }}
      />
    );

    expect(screen.getByRole("dialog", { name: "جزئیات فاکتور" })).toBeVisible();
    expect(screen.getAllByRole("button", { name: "بستن" })[0]).toBeVisible();
    await waitFor(() => expect(screen.queryByRole("status")).not.toBeInTheDocument());
  });
});
