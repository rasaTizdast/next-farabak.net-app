import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockPrisma } = vi.hoisted(() => ({
  mockPrisma: {
    address: { findFirst: vi.fn(), update: vi.fn() },
    emails: { findMany: vi.fn(), update: vi.fn() },
    phone_numbers: { findMany: vi.fn(), update: vi.fn() },
    $transaction: vi.fn(),
  },
}));

vi.mock("@/lib/prisma", () => ({ prisma: mockPrisma }));

import { GET, PUT } from "../route";

describe("GET /api/contact-us", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns contact info", async () => {
    mockPrisma.address.findFirst.mockResolvedValue({ id: 1, address: "Tehran" });
    mockPrisma.emails.findMany.mockResolvedValue([
      { id: 1, address: "info@test.com", title: "Info" },
    ]);
    mockPrisma.phone_numbers.findMany.mockResolvedValue([{ id: 1, number: "09121234567" }]);

    const res = await GET();
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.address).toBeDefined();
    expect(json.emails).toHaveLength(1);
    expect(json.phone_numbers).toHaveLength(1);
  });

  it("filters out empty emails and phones", async () => {
    mockPrisma.address.findFirst.mockResolvedValue({ id: 1, address: "Tehran" });
    mockPrisma.emails.findMany.mockResolvedValue([
      { id: 1, address: "valid@test.com", title: "Valid" },
      { id: 2, address: "", title: "Empty" },
    ]);
    mockPrisma.phone_numbers.findMany.mockResolvedValue([
      { id: 1, number: "09121234567" },
      { id: 2, number: "" },
    ]);

    const res = await GET();
    const json = await res.json();
    expect(json.emails).toHaveLength(1);
    expect(json.phone_numbers).toHaveLength(1);
  });

  it("returns 500 on error", async () => {
    mockPrisma.address.findFirst.mockRejectedValue(new Error("DB error"));

    const res = await GET();
    expect(res.status).toBe(500);
  });
});

describe("PUT /api/contact-us", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("updates contact info successfully", async () => {
    mockPrisma.$transaction.mockResolvedValue(undefined);

    const req = new Request("http://localhost/api/contact-us", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        address: { id: 1, address: "New Address", postal_code: "12345", alt_text: "Alt" },
        emails: [{ id: 1, title: "Info", address: "info@test.com" }],
        phone_numbers: [{ id: 1, number: "09121234567" }],
      }),
    });

    const res = await PUT(req as any);
    expect(res.status).toBe(200);
    expect(mockPrisma.$transaction).toHaveBeenCalled();
  });

  it("returns 500 on error", async () => {
    mockPrisma.$transaction.mockRejectedValue(new Error("DB error"));

    const req = new Request("http://localhost/api/contact-us", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });

    const res = await PUT(req as any);
    expect(res.status).toBe(500);
  });
});
