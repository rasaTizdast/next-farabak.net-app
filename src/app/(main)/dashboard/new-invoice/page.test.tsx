import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, expect, it, vi } from "vitest";

import NewInvoicePage from "./page";

const { removeProductFromInvoice, updateProductQuantity } = vi.hoisted(() => ({
  removeProductFromInvoice: vi.fn(),
  updateProductQuantity: vi.fn(),
}));

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }) }));
vi.mock("react-hot-toast", () => ({
  default: { success: vi.fn(), error: vi.fn() },
  Toaster: () => null,
}));
vi.mock("@/context/InvoiceContext", () => ({
  useInvoice: () => ({
    invoice: {
      TotalAmount: 1,
      products: [
        {
          ProductId: 7,
          ProductName: "محصول آزمایشی",
          Price: 100,
          Discount: 0,
          Quantity: 1,
          minAmount: 1,
          maxAmount: 10,
        },
      ],
    },
    removeProductFromInvoice,
    updateProductQuantity,
    clearInvoice: vi.fn(),
  }),
}));
vi.mock("@/context/UserContext", () => ({ useUser: () => ({ user: null }) }));
vi.mock("@/helpers/invoiceHandlers", () => ({ addNewInvoice: vi.fn() }));

beforeEach(() => vi.clearAllMocks());

it("keeps a product when its quantity field is cleared and only removes it through the delete action", () => {
  render(<NewInvoicePage />);
  expect(screen.getByRole("list", { name: "مراحل ثبت فاکتور" })).toBeVisible();
  const quantity = screen.getAllByRole("spinbutton", { name: "تعداد محصول آزمایشی" })[0];
  fireEvent.change(quantity, { target: { value: "" } });
  fireEvent.change(quantity, { target: { value: "0" } });
  expect(removeProductFromInvoice).not.toHaveBeenCalled();

  fireEvent.click(screen.getAllByRole("button", { name: "حذف محصول" })[0]);
  expect(removeProductFromInvoice).toHaveBeenCalledWith(7);
});
