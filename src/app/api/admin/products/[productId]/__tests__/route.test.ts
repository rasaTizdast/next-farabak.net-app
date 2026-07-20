import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockCookieStore, mockJwtVerify, mockPrisma } = vi.hoisted(() => ({
  mockCookieStore: new Map<string, string>(),
  mockJwtVerify: vi.fn(),
  mockPrisma: {
    product: {
      findUnique: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    productOverview: { deleteMany: vi.fn() },
    details_ProductOverviewDetails: { deleteMany: vi.fn() },
    productSpecs: { deleteMany: vi.fn() },
    fAQs: { deleteMany: vi.fn() },
    $transaction: vi.fn(),
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
  jwtVerify: (...args: any[]) => mockJwtVerify(...args),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: mockPrisma,
}));

import { DELETE, PATCH } from "../route";

function makeRequest(method: string, body?: any) {
  return new Request(`http://localhost/api/admin/products/123`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
}

describe("DELETE /api/admin/products/[productId]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCookieStore.clear();
  });

  it("returns 401 when no token is provided", async () => {
    const req = makeRequest("DELETE");
    const res = await DELETE(req, { params: Promise.resolve({ productId: "123" }) });
    expect(res.status).toBe(401);
  });

  it("returns 401 when role is Branch", async () => {
    mockCookieStore.set("accessToken", "branch-token");
    mockJwtVerify.mockResolvedValue({
      payload: { userId: 2, username: "branch", role: "Branch" },
    });

    const req = makeRequest("DELETE");
    const res = await DELETE(req, { params: Promise.resolve({ productId: "123" }) });
    expect(res.status).toBe(401);
  });

  it("returns 404 when product does not exist", async () => {
    mockCookieStore.set("accessToken", "admin-token");
    mockJwtVerify.mockResolvedValue({
      payload: { userId: 1, username: "admin", role: "Admin" },
    });
    mockPrisma.product.findUnique.mockResolvedValue(null);

    const req = makeRequest("DELETE");
    const res = await DELETE(req, { params: Promise.resolve({ productId: "999" }) });
    expect(res.status).toBe(404);
  });

  it("deletes product successfully as Admin", async () => {
    mockCookieStore.set("accessToken", "admin-token");
    mockJwtVerify.mockResolvedValue({
      payload: { userId: 1, username: "admin", role: "Admin" },
    });
    mockPrisma.product.findUnique.mockResolvedValue({ ProductId: 123 });
    mockPrisma.$transaction.mockResolvedValue([]);

    const req = makeRequest("DELETE");
    const res = await DELETE(req, { params: Promise.resolve({ productId: "123" }) });
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.message).toContain("removed successfully");
  });
});

describe("PATCH /api/admin/products/[productId]", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCookieStore.clear();
  });

  it("returns 401 when no token is provided", async () => {
    const req = makeRequest("PATCH", { Name: "Updated" });
    const res = await PATCH(req, { params: Promise.resolve({ productId: "123" }) });
    expect(res.status).toBe(401);
  });

  it("returns 401 when role is Branch", async () => {
    mockCookieStore.set("accessToken", "branch-token");
    mockJwtVerify.mockResolvedValue({
      payload: { userId: 2, username: "branch", role: "Branch" },
    });

    const req = makeRequest("PATCH", { Name: "Updated" });
    const res = await PATCH(req, { params: Promise.resolve({ productId: "123" }) });
    expect(res.status).toBe(401);
  });

  it("returns 400 for invalid product ID", async () => {
    mockCookieStore.set("accessToken", "admin-token");
    mockJwtVerify.mockResolvedValue({
      payload: { userId: 1, username: "admin", role: "Admin" },
    });

    const req = makeRequest("PATCH", { Name: "Updated" });
    const res = await PATCH(req, { params: Promise.resolve({ productId: "abc" }) });
    expect(res.status).toBe(400);
  });

  it("returns 400 when no valid fields are provided", async () => {
    mockCookieStore.set("accessToken", "admin-token");
    mockJwtVerify.mockResolvedValue({
      payload: { userId: 1, username: "admin", role: "Admin" },
    });

    const req = makeRequest("PATCH", { invalidField: "test" });
    const res = await PATCH(req, { params: Promise.resolve({ productId: "123" }) });
    expect(res.status).toBe(400);
  });

  it("updates product successfully as Admin", async () => {
    mockCookieStore.set("accessToken", "admin-token");
    mockJwtVerify.mockResolvedValue({
      payload: { userId: 1, username: "admin", role: "Admin" },
    });
    mockPrisma.product.update.mockResolvedValue({ ProductId: 123, Name: "Updated Product" });

    const req = makeRequest("PATCH", { Name: "Updated Product" });
    const res = await PATCH(req, { params: Promise.resolve({ productId: "123" }) });
    expect(res.status).toBe(200);

    const json = await res.json();
    expect(json.Name).toBe("Updated Product");
  });

  it("filters out invalid fields", async () => {
    mockCookieStore.set("accessToken", "admin-token");
    mockJwtVerify.mockResolvedValue({
      payload: { userId: 1, username: "admin", role: "Admin" },
    });
    mockPrisma.product.update.mockResolvedValue({ ProductId: 123 });

    const req = makeRequest("PATCH", { Name: "Valid", hackedField: "bad" });
    await PATCH(req, { params: Promise.resolve({ productId: "123" }) });

    const updateCall = mockPrisma.product.update.mock.calls[0][0];
    expect(updateCall.data).toEqual({ Name: "Valid" });
    expect(updateCall.data.hackedField).toBeUndefined();
  });
});
