import { NextRequest } from "next/server";
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/utils/invoiceJwt", () => ({
  signInvoiceData: vi.fn().mockResolvedValue("signed-token"),
}));

import { POST } from "../route";

function makeRequest(body: any) {
  return new NextRequest("http://localhost/api/invoice/save", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/invoice/save", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 400 when products array is missing", async () => {
    const res = await POST(makeRequest({ TotalAmount: 100000 }));
    expect(res.status).toBe(400);
  });

  it("returns 400 when products is not an array", async () => {
    const res = await POST(makeRequest({ products: "not-array", TotalAmount: 100000 }));
    expect(res.status).toBe(400);
  });

  it("saves invoice data and sets cookie", async () => {
    const data = {
      products: [{ ProductId: 1, ProductName: "Test", Quantity: 1, Price: 100000, Discount: 0 }],
      TotalAmount: 100000,
    };

    const res = await POST(makeRequest(data));
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.success).toBe(true);
    expect(res.headers.get("set-cookie")).toContain("invoiceData");
  });

  it("returns 500 on signing error", async () => {
    const { signInvoiceData } = await import("@/utils/invoiceJwt");
    vi.mocked(signInvoiceData).mockRejectedValueOnce(new Error("sign failed"));

    const res = await POST(makeRequest({
      products: [{ ProductId: 1, ProductName: "Test", Quantity: 1 }],
      TotalAmount: 100000,
    }));
    expect(res.status).toBe(500);
  });
});
