import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockPrisma } = vi.hoisted(() => ({
  mockPrisma: {
    warranty: { findFirst: vi.fn() },
  },
}));
vi.mock("@/lib/prisma", () => ({ prisma: mockPrisma }));

import { GET } from "../route";

function makeRequest() {
  return new Request("http://localhost/api/warranties/getByInvoiceDetail/1");
}

describe("GET /api/warranties/getByInvoiceDetail/[id]", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns warranty for valid invoice detail id", async () => {
    const mockWarranty = { warrantyid: 1, invoicedetailid: 1, warrantycode: "W-001" };
    mockPrisma.warranty.findFirst.mockResolvedValue(mockWarranty);

    const res = await GET(makeRequest(), { params: Promise.resolve({ id: "1" }) });
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.warranty).toEqual(mockWarranty);
    expect(mockPrisma.warranty.findFirst).toHaveBeenCalledWith({
      where: { invoicedetailid: 1 },
    });
  });

  it("returns null warranty when not found", async () => {
    mockPrisma.warranty.findFirst.mockResolvedValue(null);

    const res = await GET(makeRequest(), { params: Promise.resolve({ id: "999" }) });
    const json = await res.json();

    expect(json.warranty).toBeNull();
  });

  it("returns 400 for non-numeric id", async () => {
    const res = await GET(makeRequest(), { params: Promise.resolve({ id: "abc" }) });
    expect(res.status).toBe(400);

    const json = await res.json();
    expect(json.error).toBe("شناسه جزئیات فاکتور نامعتبر است");
  });

  it("returns 500 on prisma error", async () => {
    mockPrisma.warranty.findFirst.mockRejectedValue(new Error("DB error"));

    const res = await GET(makeRequest(), { params: Promise.resolve({ id: "1" }) });
    expect(res.status).toBe(500);
  });
});
