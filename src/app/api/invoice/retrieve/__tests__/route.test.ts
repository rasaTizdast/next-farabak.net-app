import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockVerifyInvoiceData } = vi.hoisted(() => ({
  mockVerifyInvoiceData: vi.fn(),
}));

vi.mock("@/utils/invoiceJwt", () => ({
  verifyInvoiceData: (...args: any[]) => mockVerifyInvoiceData(...args),
}));

import { GET } from "../route";

function makeGetRequest(cookieValue?: string) {
  const cookies = new Map<string, string>();
  if (cookieValue) {
    cookies.set("invoiceData", cookieValue);
  }

  return {
    cookies: {
      get: (name: string) => {
        const val = cookies.get(name);
        return val ? { value: val } : undefined;
      },
    },
    url: "http://localhost/api/invoice/retrieve",
  } as any;
}

describe("GET /api/invoice/retrieve", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 404 when no cookie exists", async () => {
    const req = makeGetRequest();
    const res = await GET(req);
    expect(res.status).toBe(404);
  });

  it("returns 400 when token verification fails", async () => {
    mockVerifyInvoiceData.mockResolvedValue(null);

    const req = makeGetRequest("invalid-token");
    const res = await GET(req);
    expect(res.status).toBe(400);
  });

  it("returns 200 with invoice data when valid", async () => {
    const invoiceData = {
      products: [{ ProductId: 1, ProductName: "Test", Quantity: 1 }],
      TotalAmount: 100000,
      timestamp: Date.now(),
    };
    mockVerifyInvoiceData.mockResolvedValue(invoiceData);

    const req = makeGetRequest("valid-token");
    const res = await GET(req);
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.data).toEqual(invoiceData);
  });

  it("returns 400 when invoice data is expired", async () => {
    const expiredData = {
      products: [],
      TotalAmount: 0,
      timestamp: Date.now() - 20 * 60 * 1000, // 20 minutes ago
    };
    mockVerifyInvoiceData.mockResolvedValue(expiredData);

    const req = makeGetRequest("expired-token");
    const res = await GET(req);
    expect(res.status).toBe(400);
  });

  it("returns 500 on unexpected error", async () => {
    mockVerifyInvoiceData.mockRejectedValue(new Error("unexpected"));

    const req = makeGetRequest("token");
    const res = await GET(req);
    expect(res.status).toBe(500);
  });
});
