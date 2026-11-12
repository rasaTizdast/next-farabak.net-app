import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockCookieStore, mockJwtVerify, mockPrisma } = vi.hoisted(() => ({
  mockCookieStore: new Map<string, string>(),
  mockJwtVerify: vi.fn(),
  mockPrisma: {
    invoice: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      deleteMany: vi.fn(),
    },
    invoice_Details: {
      create: vi.fn(),
      deleteMany: vi.fn(),
    },
  },
}));

vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => ({
    get: (name: string) => {
      const val = mockCookieStore.get(name);
      return val ? { value: val } : undefined;
    },
  })),
}));

vi.mock("jose", () => ({
  jwtVerify: (...args: unknown[]) => mockJwtVerify(...args),
}));

vi.mock("@/lib/prisma", () => ({ prisma: mockPrisma }));

vi.mock("uuid", () => ({
  v4: () => "test-uuid-1234-5678-9abc",
}));

import { GET, POST, PATCH } from "../route";

describe("GET /api/invoice", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCookieStore.clear();
  });

  it("returns 401 when no token", async () => {
    const res = await GET();
    expect(res.status).toBe(401);
  });

  it("returns invoices for authenticated user", async () => {
    mockCookieStore.set("accessToken", "token");
    mockJwtVerify.mockResolvedValue({ payload: { userId: 1 } });
    mockPrisma.invoice.findMany.mockResolvedValue([]);

    const res = await GET();
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(Array.isArray(json)).toBe(true);
  });

  it("returns 500 on error", async () => {
    mockCookieStore.set("accessToken", "token");
    mockJwtVerify.mockResolvedValue({ payload: { userId: 1 } });
    mockPrisma.invoice.findMany.mockRejectedValue(new Error("DB error"));

    const res = await GET();
    expect(res.status).toBe(500);
  });
});

describe("POST /api/invoice", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCookieStore.clear();
  });

  it("returns 400 when body is invalid", async () => {
    const req = new Request("http://localhost/api/invoice", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ Fullname: "Ali" }),
    });

    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns 401 when no token", async () => {
    const req = new Request("http://localhost/api/invoice", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        Fullname: "Ali",
        Phonenumber: "09121234567",
        TotalAmount: 100000,
        Products: [{ ProductId: 1, Quantity: 1, Price: 100000, Discount: 0 }],
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it("creates invoice successfully", async () => {
    mockCookieStore.set("accessToken", "token");
    mockJwtVerify.mockResolvedValue({ payload: { userId: 1 } });
    mockPrisma.invoice.findFirst.mockResolvedValue(null);
    mockPrisma.invoice.create.mockResolvedValue({ Invoiceid: 1 });
    mockPrisma.invoice_Details.create.mockResolvedValue({});

    const req = new Request("http://localhost/api/invoice", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        Fullname: "Ali Rezaei",
        Phonenumber: "09121234567",
        TotalAmount: 100000,
        Products: [{ ProductId: 1, Quantity: 2, Price: 100000, Discount: 0 }],
      }),
    });

    const res = await POST(req);
    expect(res.status).toBe(201);

    const json = await res.json();
    expect(json.message).toContain("موفقیت");
  });
});

describe("PATCH /api/invoice", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCookieStore.clear();
  });

  it("returns 401 when no token", async () => {
    const req = new Request("http://localhost/api/invoice", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ FactorGuid: "FARABAK-123" }),
    });

    const res = await PATCH(req);
    expect(res.status).toBe(401);
  });

  it("returns 404 when invoice not found", async () => {
    mockCookieStore.set("accessToken", "token");
    mockJwtVerify.mockResolvedValue({ payload: { userId: 1 } });
    mockPrisma.invoice.findFirst.mockResolvedValue(null);

    const req = new Request("http://localhost/api/invoice", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ FactorGuid: "FARABAK-NOTEXIST" }),
    });

    const res = await PATCH(req);
    expect(res.status).toBe(404);
  });

  it("updates invoice checked status", async () => {
    mockCookieStore.set("accessToken", "token");
    mockJwtVerify.mockResolvedValue({ payload: { userId: 1 } });
    mockPrisma.invoice.findFirst.mockResolvedValue({ Invoiceid: 1, FactorGuid: "FARABAK-123" });
    mockPrisma.invoice.update.mockResolvedValue({});

    const req = new Request("http://localhost/api/invoice", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ FactorGuid: "FARABAK-123" }),
    });

    const res = await PATCH(req);
    expect(res.status).toBe(200);
  });
});
