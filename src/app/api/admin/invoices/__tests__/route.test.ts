import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockCookieStore, mockJwtVerify, mockPrisma } = vi.hoisted(() => ({
  mockCookieStore: new Map<string, string>(),
  mockJwtVerify: vi.fn(),
  mockPrisma: {
    invoice: {
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      deleteMany: vi.fn(),
    },
    invoice_Details: {
      deleteMany: vi.fn(),
    },
    $queryRaw: vi.fn(),
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

import { GET, POST, PATCH, DELETE } from "../route";

function makeRequest(method: string, body?: unknown, query?: string) {
  const url = query
    ? `http://localhost/api/admin/invoices?${query}`
    : "http://localhost/api/admin/invoices";
  return new Request(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
}

describe("GET /api/admin/invoices", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCookieStore.clear();
  });

  it("returns invoices list", async () => {
    mockPrisma.$queryRaw
      .mockResolvedValueOnce([{ Invoiceid: 1, Checked: true, Date: "1403-06-15T10:00:00" }])
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce([]);

    const res = await GET();
    expect(res.status).toBe(200);
  });

  it("returns 500 on error", async () => {
    mockPrisma.$queryRaw.mockRejectedValue(new Error("DB error"));

    const res = await GET();
    expect(res.status).toBe(500);
  });
});

describe("POST /api/admin/invoices", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCookieStore.clear();
  });

  it("returns 401 when no token", async () => {
    const res = await POST(
      makeRequest("POST", {
        branchId: 1,
        invoiceData: { Fullname: "Ali" },
      })
    );
    expect(res.status).toBe(401);
  });

  it("returns 400 when body is invalid", async () => {
    mockCookieStore.set("accessToken", "token");
    mockJwtVerify.mockResolvedValue({ payload: { role: "Admin", userId: 1 } });

    const res = await POST(makeRequest("POST", { branchId: 1 }));
    expect(res.status).toBe(400);
  });

  it("creates invoice successfully", async () => {
    mockCookieStore.set("accessToken", "token");
    mockJwtVerify.mockResolvedValue({ payload: { role: "Admin", userId: 1 } });
    mockPrisma.invoice.findFirst.mockResolvedValue(null);
    mockPrisma.invoice.create.mockResolvedValue({ Invoiceid: 1 });
    mockPrisma.$queryRaw.mockResolvedValue([{ Invoice_Details: 1 }]);

    const res = await POST(
      makeRequest("POST", {
        branchId: 1,
        invoiceData: {
          Fullname: "Ali",
          Phonenumber: "09121234567",
          TotalAmount: 100000,
          Date: "1403-06-15",
          UserId: 1,
          products: [{ ProductId: 1, quantity: 1, price: 100000, total_price: 100000 }],
        },
      })
    );
    expect(res.status).toBe(201);
  });

  it("returns 500 on error", async () => {
    mockCookieStore.set("accessToken", "token");
    mockJwtVerify.mockResolvedValue({ payload: { role: "Admin", userId: 1 } });
    mockPrisma.invoice.create.mockRejectedValue(new Error("DB error"));

    const res = await POST(
      makeRequest("POST", {
        branchId: 1,
        invoiceData: {
          Fullname: "Ali",
          Phonenumber: "09121234567",
          TotalAmount: 100000,
          Date: "1403-06-15",
          UserId: 1,
          products: [{ ProductId: 1, quantity: 1, price: 100000, total_price: 100000 }],
        },
      })
    );
    expect(res.status).toBe(500);
  });
});

describe("PATCH /api/admin/invoices", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCookieStore.clear();
  });

  it("returns 401 when no token", async () => {
    const res = await PATCH(makeRequest("PATCH", { checked: true }, "id=1"));
    expect(res.status).toBe(401);
  });

  it("returns 401 when role is not Admin or Branch", async () => {
    mockCookieStore.set("accessToken", "token");
    mockJwtVerify.mockResolvedValue({ payload: { role: "Public" } });

    const res = await PATCH(makeRequest("PATCH", { checked: true }, "id=1"));
    expect(res.status).toBe(401);
  });

  it("returns 400 when no invoice ID", async () => {
    mockCookieStore.set("accessToken", "token");
    mockJwtVerify.mockResolvedValue({ payload: { role: "Admin" } });

    const res = await PATCH(makeRequest("PATCH", { checked: true }));
    expect(res.status).toBe(400);
  });

  it("updates invoice checked status as Admin", async () => {
    mockCookieStore.set("accessToken", "token");
    mockJwtVerify.mockResolvedValue({ payload: { role: "Admin", userId: 1 } });
    mockPrisma.invoice.update.mockResolvedValue({ Invoiceid: 1, Checked: true });

    const res = await PATCH(makeRequest("PATCH", { checked: true }, "id=1"));
    expect(res.status).toBe(200);
  });
});

describe("DELETE /api/admin/invoices", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCookieStore.clear();
  });

  it("returns 401 when no token", async () => {
    const res = await DELETE(makeRequest("DELETE", undefined, "invoiceId=1"));
    expect(res.status).toBe(401);
  });

  it("returns 401 when role is not Admin", async () => {
    mockCookieStore.set("accessToken", "token");
    mockJwtVerify.mockResolvedValue({ payload: { role: "Branch" } });

    const res = await DELETE(makeRequest("DELETE", undefined, "invoiceId=1"));
    expect(res.status).toBe(401);
  });

  it("returns 400 when no invoiceId", async () => {
    mockCookieStore.set("accessToken", "token");
    mockJwtVerify.mockResolvedValue({ payload: { role: "Admin" } });

    const res = await DELETE(makeRequest("DELETE"));
    expect(res.status).toBe(400);
  });

  it("deletes invoice successfully", async () => {
    mockCookieStore.set("accessToken", "token");
    mockJwtVerify.mockResolvedValue({ payload: { role: "Admin" } });
    mockPrisma.invoice_Details.deleteMany.mockResolvedValue({});
    mockPrisma.invoice.delete.mockResolvedValue({});

    const res = await DELETE(makeRequest("DELETE", undefined, "invoiceId=1"));
    expect(res.status).toBe(200);
  });
});
