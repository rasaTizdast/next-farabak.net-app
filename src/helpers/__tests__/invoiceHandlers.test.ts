import { describe, it, expect, vi, beforeEach } from "vitest";

import { addNewInvoice, getUserInvoices, checkUserInvoice } from "../invoiceHandlers";

const mockAxiosPost = vi.fn();
const mockAxiosGet = vi.fn();
const mockAxiosPatch = vi.fn();

const MockAxiosError = vi.hoisted(() => {
  return class extends Error {
    isAxiosError = true;
    response?: { status: number; data: { message: string } };
    constructor(msg: string, status?: number) {
      super(msg);
      this.isAxiosError = true;
      if (status) this.response = { status, data: { message: msg } };
    }
  };
});

vi.mock("axios", () => ({
  default: {
    post: (...args: any[]) => mockAxiosPost(...args),
    get: (...args: any[]) => mockAxiosGet(...args),
    patch: (...args: any[]) => mockAxiosPatch(...args),
    isAxiosError: (err: any) => err?.isAxiosError === true,
  },
  AxiosError: MockAxiosError,
}));

describe("invoiceHandlers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("addNewInvoice", () => {
    it("sends invoice data to API", async () => {
      mockAxiosPost.mockResolvedValue({ data: { id: 1 } });

      const invoice = {
        products: [{ ProductId: 1, Quantity: 2, Price: 100 }],
        TotalAmount: 2,
      };
      const user = {
        userId: "u1",
        firstName: "John",
        lastName: "Doe",
        phoneNumber: "09120000000",
      };

      const result = await addNewInvoice(invoice, user);

      expect(mockAxiosPost).toHaveBeenCalledWith("/api/invoice", {
        Fullname: "John Doe",
        Phonenumber: "09120000000",
        TotalAmount: 2,
        Products: invoice.products,
        UserId: "u1",
      });
      expect(result).toEqual({ id: 1 });
    });

    it("throws on API error", async () => {
      const axiosError = new Error("Bad Request");
      (axiosError as any).isAxiosError = true;
      (axiosError as any).response = { data: { message: "Invalid data" } };
      mockAxiosPost.mockRejectedValue(axiosError);

      await expect(addNewInvoice({ products: [], TotalAmount: 0 }, null)).rejects.toThrow(
        "Invalid data"
      );
    });
  });

  describe("getUserInvoices", () => {
    it("fetches invoices from API", async () => {
      mockAxiosGet.mockResolvedValue({ data: [{ id: 1, Invoice_Details: [] }] });

      const result = await getUserInvoices();

      expect(mockAxiosGet).toHaveBeenCalledWith("/api/invoice");
      expect(result).toEqual([{ id: 1, Invoice_Details: [] }]);
    });
  });

  describe("checkUserInvoice", () => {
    it("sends GUID to check invoice", async () => {
      mockAxiosPatch.mockResolvedValue({ data: { status: "confirmed" } });

      const result = await checkUserInvoice("guid-123");

      expect(mockAxiosPatch).toHaveBeenCalledWith("/api/invoice", {
        FactorGuid: "guid-123",
      });
      expect(result).toEqual({ status: "confirmed" });
    });
  });
});
