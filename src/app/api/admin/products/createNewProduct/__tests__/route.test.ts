import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockCookieStore, mockJwtVerify, mockPrisma } = vi.hoisted(() => ({
  mockCookieStore: new Map<string, string>(),
  mockJwtVerify: vi.fn(),
  mockPrisma: {
    product: {
      findFirst: vi.fn(),
      create: vi.fn(),
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
  jwtVerify: (...args: any[]) => mockJwtVerify(...args),
}));

vi.mock("@/lib/prisma", () => ({
  prisma: mockPrisma,
}));

import { POST } from "../route";

function makeRequest(body: any) {
  return new Request("http://localhost/api/admin/products/createNewProduct", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/admin/products/createNewProduct", () => {
  const validBody = {
    Type: "Test Product",
    Slug: "test-product-123",
    Description: "test keywords",
    CategoryId: 1,
    CategoryContentId: "10",
    Available: true,
    Price: "100000",
    Discount: "10000",
    Name: "Short description",
    SEO_Title: "SEO Title",
    SEO_Description: "SEO Description",
    productBlog: undefined,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockCookieStore.clear();
  });

  it("returns 401 when no token is provided", async () => {
    const req = makeRequest(validBody);
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it("returns 401 when role is not Admin", async () => {
    mockCookieStore.set("accessToken", "valid-token");
    mockJwtVerify.mockResolvedValue({
      payload: { userId: 1, username: "user", role: "Branch" },
    });

    const req = makeRequest(validBody);
    const res = await POST(req);
    expect(res.status).toBe(401);

    const json = await res.json();
    expect(json.message).toBe("Unauthorized");
  });

  it("returns 400 when required fields are missing", async () => {
    mockCookieStore.set("accessToken", "valid-token");
    mockJwtVerify.mockResolvedValue({
      payload: { userId: 1, username: "admin", role: "Admin" },
    });

    const req = makeRequest({ Type: "Product" });
    const res = await POST(req);
    expect(res.status).toBe(400);

    const json = await res.json();
    expect(json.error).toBe("Missing required fields");
  });

  it("returns 400 when product with same slug and type exists", async () => {
    mockCookieStore.set("accessToken", "valid-token");
    mockJwtVerify.mockResolvedValue({
      payload: { userId: 1, username: "admin", role: "Admin" },
    });
    mockPrisma.product.findFirst.mockResolvedValue({ ProductId: 1 });

    const req = makeRequest(validBody);
    const res = await POST(req);
    expect(res.status).toBe(400);

    const json = await res.json();
    expect(json.error).toContain("already exists");
  });

  it("creates product successfully with Admin role", async () => {
    mockCookieStore.set("accessToken", "valid-token");
    mockJwtVerify.mockResolvedValue({
      payload: { userId: 1, username: "admin", role: "Admin" },
    });
    mockPrisma.product.findFirst.mockResolvedValue(null);
    mockPrisma.product.create.mockResolvedValue({ ProductId: 999, ...validBody });

    const req = makeRequest(validBody);
    const res = await POST(req);
    expect(res.status).toBe(201);

    const json = await res.json();
    expect(json.ProductId).toBe(999);
    expect(mockPrisma.product.create).toHaveBeenCalledTimes(1);
  });

  it("uses productBlog default of empty string when not provided", async () => {
    mockCookieStore.set("accessToken", "valid-token");
    mockJwtVerify.mockResolvedValue({
      payload: { userId: 1, username: "admin", role: "Admin" },
    });
    mockPrisma.product.findFirst.mockResolvedValue(null);
    mockPrisma.product.create.mockResolvedValue({ ProductId: 1 });

    const bodyWithoutBlog = { ...validBody };
    delete bodyWithoutBlog.productBlog;
    const req = makeRequest(bodyWithoutBlog);
    await POST(req);

    const createCall = mockPrisma.product.create.mock.calls[0][0];
    expect(createCall.data.productBlog).toBe("");
  });
});
