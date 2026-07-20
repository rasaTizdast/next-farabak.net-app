import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockPrisma, mockJwtVerify, mockCookies, mockS3 } = vi.hoisted(() => ({
  mockPrisma: {
    master_ProductOverviewDetails: {
      create: vi.fn(),
      update: vi.fn(),
    },
  },
  mockJwtVerify: vi.fn(),
  mockCookies: vi.fn(),
  mockS3: {
    upload: vi.fn(),
  },
}));

vi.mock("@/lib/prisma", () => ({ prisma: mockPrisma }));
vi.mock("jose", () => ({ jwtVerify: mockJwtVerify }));
vi.mock("next/headers", () => ({ cookies: mockCookies }));
vi.mock("aws-sdk", () => ({
  S3: vi.fn().mockImplementation(function () {
    return { upload: mockS3.upload };
  }),
}));

import { POST } from "../route";

describe("POST /api/productOverviewDetails/create", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const validBody = {
    overviewDetails: [
      {
        title: "Feature 1",
        description: "Description 1",
        image: { base64: "aGVsbG8=", contentType: "image/png", fileName: "test.png" },
      },
    ],
  };

  it("should create overview details successfully", async () => {
    mockCookies.mockResolvedValue({ get: () => ({ value: "valid-token" }) });
    mockJwtVerify.mockResolvedValue({ payload: { role: "Admin" } });
    mockS3.upload.mockImplementation((_params: any, cb: any) => cb(null, { Location: "url" }));
    mockPrisma.master_ProductOverviewDetails.create.mockResolvedValue({ id: 1 });
    mockPrisma.master_ProductOverviewDetails.update.mockResolvedValue({ id: 1, ProductOverviewDetailsId: 1 });

    const req = new Request("http://localhost/api/productOverviewDetails/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(validBody),
    });

    const res = await POST(req as any);
    const body = await res.json();

    expect(res.status).toBe(201);
    expect(body.message).toBe("Overview details uploaded successfully");
    expect(body.count).toBe(1);
  });

  it("should return 401 when no token is provided", async () => {
    mockCookies.mockResolvedValue({ get: () => undefined });

    const req = new Request("http://localhost/api/productOverviewDetails/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(validBody),
    });

    const res = await POST(req as any);
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.message).toContain("Authorization token required");
  });

  it("should return 401 when user role is not Admin", async () => {
    mockCookies.mockResolvedValue({ get: () => ({ value: "token" }) });
    mockJwtVerify.mockResolvedValue({ payload: { role: "User" } });

    const req = new Request("http://localhost/api/productOverviewDetails/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(validBody),
    });

    const res = await POST(req as any);
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.message).toBe("Unauthorized");
  });

  it("should return 400 when overviewDetails is empty", async () => {
    mockCookies.mockResolvedValue({ get: () => ({ value: "token" }) });
    mockJwtVerify.mockResolvedValue({ payload: { role: "Admin" } });

    const req = new Request("http://localhost/api/productOverviewDetails/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ overviewDetails: [] }),
    });

    const res = await POST(req as any);
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toContain("Invalid or empty overview details");
  });

  it("should return 500 on error", async () => {
    mockCookies.mockResolvedValue({ get: () => ({ value: "token" }) });
    mockJwtVerify.mockRejectedValue(new Error("Invalid token"));

    const req = new Request("http://localhost/api/productOverviewDetails/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(validBody),
    });

    const res = await POST(req as any);
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body.error).toContain("Failed to process overview details");
  });
});
